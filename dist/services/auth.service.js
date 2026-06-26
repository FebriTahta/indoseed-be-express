"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../repositories/user.repository");
const role_repository_1 = require("../repositories/role.repository");
const emailOtp_repository_1 = require("../repositories/emailOtp.repository");
const email_service_1 = require("./email.service");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};
exports.authService = {
    register: async (data) => {
        const { username, email, password } = data;
        const existingUser = await user_repository_1.userRepository.findByEmailOrUsername(email, username);
        if (existingUser) {
            if (existingUser.email === email && !existingUser.isEmailVerified) {
                const latestOtp = await emailOtp_repository_1.emailOtpRepository.findLatestOtpByUserId(existingUser.id);
                const now = new Date();
                if (latestOtp && latestOtp.expiresAt > now) {
                    const remainingMs = latestOtp.expiresAt.getTime() - now.getTime();
                    const remainingSeconds = Math.ceil(remainingMs / 1000);
                    const error = new Error(`Silakan kirimkan OTP ulang ke email tersebut dalam sisa waktu ${remainingSeconds} detik.`);
                    error.sisaWaktu = remainingSeconds;
                    throw error;
                }
                else {
                    const otp = generateOtp();
                    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
                    await emailOtp_repository_1.emailOtpRepository.create({
                        userId: existingUser.id,
                        otp,
                        expiresAt,
                    });
                    await (0, email_service_1.sendOtpEmail)(email, otp);
                    return existingUser;
                }
            }
            throw new Error('User with this email or username already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        let defaultRole = await role_repository_1.roleRepository.findByName('user');
        if (!defaultRole) {
            defaultRole = await role_repository_1.roleRepository.create('user');
        }
        const newUser = await user_repository_1.userRepository.create({
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
        await emailOtp_repository_1.emailOtpRepository.create({
            userId: newUser.id,
            otp,
            expiresAt,
        });
        await (0, email_service_1.sendOtpEmail)(email, otp);
        return newUser;
    },
    verifyOtp: async (userId, otp) => {
        const emailOtp = await emailOtp_repository_1.emailOtpRepository.findValidOtp(userId, otp);
        if (!emailOtp) {
            throw new Error('Invalid or expired OTP');
        }
        await user_repository_1.userRepository.updateEmailVerification(userId, true);
        // Optionally delete OTP after successful verification
        await emailOtp_repository_1.emailOtpRepository.deleteByUserId(userId);
        return true;
    },
    resendOtp: async (userId) => {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.isEmailVerified) {
            throw new Error('User email is already verified');
        }
        // Delete existing OTPs to prevent spam / clutter
        await emailOtp_repository_1.emailOtpRepository.deleteByUserId(userId);
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await emailOtp_repository_1.emailOtpRepository.create({
            userId: user.id,
            otp,
            expiresAt,
        });
        await (0, email_service_1.sendOtpEmail)(user.email, otp);
        return true;
    },
    login: async (data) => {
        const { username, password } = data;
        const user = await user_repository_1.userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        if (!user.isEmailVerified) {
            throw new Error('Email is not verified');
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            username: user.username,
            roles: user.roles.map((ur) => ur.role.name)
        }, JWT_SECRET, { expiresIn: '1d' });
        return { token, user };
    }
};
//# sourceMappingURL=auth.service.js.map