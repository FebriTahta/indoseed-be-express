"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const prisma_1 = require("../utils/prisma");
exports.userRepository = {
    findByEmailOrUsername: async (email, username) => {
        return prisma_1.prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
    },
    findByUsername: async (username) => {
        return prisma_1.prisma.user.findUnique({
            where: { username },
            include: { roles: { include: { role: true } } },
        });
    },
    findById: async (id) => {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: { roles: { include: { role: true } } },
        });
    },
    create: async (data) => {
        return prisma_1.prisma.user.create({
            data,
        });
    },
    updateEmailVerification: async (id, isEmailVerified) => {
        return prisma_1.prisma.user.update({
            where: { id },
            data: { isEmailVerified },
        });
    },
    findAllUsersWithRoles: async () => {
        return prisma_1.prisma.user.findMany({
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
//# sourceMappingURL=user.repository.js.map