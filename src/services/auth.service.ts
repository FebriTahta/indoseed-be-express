import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { emailOtpRepository } from '../repositories/emailOtp.repository';
import { sendOtpEmail } from './email.service';
import prisma from '../utils/prisma';
import { RequestUser } from '../utils/requestContext';
import { badRequest, forbidden, notFound } from '../utils/httpError';
import { ROLES } from '../constants/roles.constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
/** Sesi "login sebagai" sengaja dibuat lebih singkat dari sesi normal. */
const IMPERSONATION_TTL = '2h';

type UserWithRoles = { id: string; username: string; roles: { role: { name: string } }[] };

const roleNames = (user: UserWithRoles) => user.roles.map((ur) => ur.role.name);

const signToken = (user: UserWithRoles, impersonatedBy?: RequestUser['impersonatedBy']) =>
  jwt.sign(
    { userId: user.id, username: user.username, roles: roleNames(user), ...(impersonatedBy ? { impersonatedBy } : {}) },
    JWT_SECRET,
    { expiresIn: impersonatedBy ? IMPERSONATION_TTL : '1d' }
  );

/** Akun penguji yang dinonaktifkan tidak boleh masuk, baik langsung maupun lewat "login sebagai". */
const assertPengujiAktif = async (userId: string) => {
  const penguji = await prisma.penguji.findUnique({ where: { userId }, select: { status: true } });
  if (penguji && penguji.status !== 'Aktif') throw forbidden('Akun penguji ini sedang nonaktif');
};

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

export const authService = {
  register: async (data: RegisterInput) => {
    const { username, email, password } = data;

    const existingUser = await userRepository.findByEmailOrUsername(email, username);
    if (existingUser) {
      if (existingUser.email === email && !existingUser.isEmailVerified) {
        const latestOtp = await emailOtpRepository.findLatestOtpByUserId(existingUser.id);
        const now = new Date();

        if (latestOtp && latestOtp.expiresAt > now) {
          const remainingMs = latestOtp.expiresAt.getTime() - now.getTime();
          const remainingSeconds = Math.ceil(remainingMs / 1000);
          
          const error: any = new Error(`Silakan kirimkan OTP ulang ke email tersebut dalam sisa waktu ${remainingSeconds} detik.`);
          error.sisaWaktu = remainingSeconds;
          throw error;
        } else {
          const otp = generateOtp();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

          await emailOtpRepository.create({
            userId: existingUser.id,
            otp,
            expiresAt,
          });

          await sendOtpEmail(email, otp);

          return existingUser;
        }
      }
      throw new Error('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let defaultRole = await roleRepository.findByName('user');
    if (!defaultRole) {
      defaultRole = await roleRepository.create('user');
    }

    const newUser = await userRepository.create({
      username,
      email,
      password: hashedPassword,
      defaultRoleId: defaultRole.id,
      roles: {
        create: {
          roleId: defaultRole.id,
        },
      },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await emailOtpRepository.create({
      userId: newUser.id,
      otp,
      expiresAt,
    });

    await sendOtpEmail(email, otp);

    return newUser;
  },

  verifyOtp: async (userId: string, otp: string) => {
    const emailOtp = await emailOtpRepository.findValidOtp(userId, otp);

    if (!emailOtp) {
      throw new Error('Invalid or expired OTP');
    }

    await userRepository.updateEmailVerification(userId, true);

    // Optionally delete OTP after successful verification
    await emailOtpRepository.deleteByUserId(userId);

    return true;
  },

  resendOtp: async (userId: string) => {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('User email is already verified');
    }

    // Delete existing OTPs to prevent spam / clutter
    await emailOtpRepository.deleteByUserId(userId);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await emailOtpRepository.create({
      userId: user.id,
      otp,
      expiresAt,
    });

    await sendOtpEmail(user.email, otp);

    return true;
  },

  login: async (data: LoginInput) => {
    const { username, password } = data;

    const user = await userRepository.findByUsernameOrEmail(username);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new Error('Email is not verified');
    }

    await assertPengujiAktif(user.id);

    return { token: signToken(user), user };
  },

  /** Profil user yang sedang login (beserta profil penguji bila ada). */
  me: async (current: RequestUser) => {
    const user = await prisma.user.findUnique({
      where: { id: current.userId },
      select: {
        id: true,
        username: true,
        email: true,
        roles: { select: { role: { select: { name: true } } } },
        penguji: {
          select: { id: true, kodePenguji: true, nama: true, foto: true, status: true, laboratoriumId: true, laboratorium: { select: { namaLaboratorium: true } } },
        },
      },
    });
    if (!user) throw notFound('User tidak ditemukan');
    return { ...user, roles: roleNames(user), impersonatedBy: current.impersonatedBy ?? null };
  },

  /** Superadmin masuk sebagai user lain untuk membantu / menguji alur kerjanya. */
  impersonate: async (actor: RequestUser, targetUserId: string) => {
    if (actor.impersonatedBy) throw badRequest('Kembali ke akun superadmin terlebih dahulu sebelum login sebagai user lain');
    if (actor.userId === targetUserId) throw badRequest('Tidak dapat login sebagai akun sendiri');

    const target = await prisma.user.findUnique({ where: { id: targetUserId }, include: { roles: { include: { role: true } } } });
    if (!target) throw notFound('User tidak ditemukan');
    if (roleNames(target).includes(ROLES.SUPERADMIN)) throw forbidden('Tidak dapat login sebagai sesama superadmin');
    if (!target.isEmailVerified) throw badRequest('Akun user belum terverifikasi');
    await assertPengujiAktif(target.id);

    const token = signToken(target, { userId: actor.userId, username: actor.username });
    return { token, user: { id: target.id, username: target.username, roles: roleNames(target) } };
  },
};
