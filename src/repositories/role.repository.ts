import { prisma } from '../utils/prisma';

export const roleRepository = {
  findByName: async (name: string) => {
    return prisma.role.findFirst({ where: { name } });
  },

  create: async (name: string) => {
    return prisma.role.create({ data: { name } });
  },
};
