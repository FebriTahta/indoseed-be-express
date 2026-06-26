import { prisma } from '../utils/prisma';

export const emailOtpRepository = {
  create: async (data: any) => {
    return prisma.emailOtp.create({
      data,
    });
  },

  findValidOtp: async (userId: string, otp: string) => {
    return prisma.emailOtp.findFirst({
      where: {
        userId,
        otp,
        expiresAt: { gt: new Date() }, // Not expired
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findLatestOtpByUserId: async (userId: string) => {
    return prisma.emailOtp.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  deleteByUserId: async (userId: string) => {
    return prisma.emailOtp.deleteMany({
      where: { userId },
    });
  },
};
