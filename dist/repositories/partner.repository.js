"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerRepository = void 0;
const prisma_1 = require("../utils/prisma");
exports.partnerRepository = {
    create: async (data) => {
        return prisma_1.prisma.partner.create({
            data,
        });
    },
    findById: async (id) => {
        return prisma_1.prisma.partner.findUnique({
            where: { id },
        });
    },
    findByKodePetani: async (kodePetani) => {
        return prisma_1.prisma.partner.findUnique({
            where: { kodePetani },
        });
    },
    update: async (id, data) => {
        return prisma_1.prisma.partner.update({
            where: { id },
            data,
        });
    },
    delete: async (id) => {
        return prisma_1.prisma.partner.delete({
            where: { id },
        });
    },
    findAll: async (filters) => {
        const { search, kelompokTani, status, komoditasUtama, page = 1, pageSize = 10, } = filters;
        const where = {};
        if (kelompokTani) {
            where.kelompokTani = kelompokTani;
        }
        if (status) {
            where.status = status;
        }
        if (komoditasUtama) {
            where.komoditasUtama = komoditasUtama;
        }
        if (search) {
            where.OR = [
                { namaPetani: { contains: search } },
                { kodePetani: { contains: search } },
                { kelompokTani: { contains: search } },
            ];
        }
        const skip = (page - 1) * pageSize;
        const [items, totalItems] = await Promise.all([
            prisma_1.prisma.partner.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.partner.count({ where }),
        ]);
        const totalPages = Math.ceil(totalItems / pageSize);
        return {
            items,
            pagination: {
                currentPage: page,
                pageSize,
                totalItems,
                totalPages,
            },
        };
    },
};
//# sourceMappingURL=partner.repository.js.map