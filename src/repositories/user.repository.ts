import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface CreateUserInput extends Prisma.UserUncheckedCreateInput {}

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

  create: async (data: CreateUserInput) => {
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

  findAllUsersWithRoles: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        defaultRole: {
          select: {
            id: true,
            name: true,
          }
        },
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });
  },
};