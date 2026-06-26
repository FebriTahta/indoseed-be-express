"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailOtpRepository = void 0;
const prisma_1 = require("../utils/prisma");
exports.emailOtpRepository = {
    create: async (data) => {
        return prisma_1.prisma.emailOtp.create({
            data,
        });
    },
    findValidOtp: async (userId, otp) => {
        return prisma_1.prisma.emailOtp.findFirst({
            where: {
                userId,
                otp,
                expiresAt: { gt: new Date() }, // Not expired
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    findLatestOtpByUserId: async (userId) => {
        return prisma_1.prisma.emailOtp.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    },
    deleteByUserId: async (userId) => {
        return prisma_1.prisma.emailOtp.deleteMany({
            where: { userId },
        });
    },
};
//# sourceMappingURL=emailOtp.repository.js.map