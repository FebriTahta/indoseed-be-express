import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { emailOtpRepository } from '../repositories/emailOtp.repository';
import { sendOtpEmail } from './email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

export const authService = {
  register: async (data: any) => {
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

  login: async (data: any) => {
    const { username, password } = data;

    const user = await userRepository.findByUsername(username);

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

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        roles: user.roles.map((ur: any) => ur.role.name) 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { token, user };
  }
};
