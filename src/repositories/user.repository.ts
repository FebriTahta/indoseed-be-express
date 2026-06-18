import { prisma } from '../utils/prisma';

export const userRepository = {
  findByEmailOrUsername: async (email: string, username: string) => {
    return prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
  },

  findByUsername: async (username: string) => {
    return prisma.user.findUnique({
      where: { username },
      include: { roles: { include: { role: true } } },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  },

  create: async (data: any) => {
    return prisma.user.create({
      data,
    });
  },

  updateEmailVerification: async (id: string, isEmailVerified: boolean) => {
    return prisma.user.update({
      where: { id },
      data: { isEmailVerified },
    });
  },
};
