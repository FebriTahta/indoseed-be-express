"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commodityRepository = void 0;
const prisma_1 = require("../utils/prisma");
exports.commodityRepository = {
    create: async (data) => {
        return prisma_1.prisma.commodity.create({
            data,
        });
    },
    findById: async (id) => {
        return prisma_1.prisma.commodity.findUnique({
            where: { id },
        });
    },
    findByKodeKomoditas: async (kodeKomoditas) => {
        return prisma_1.prisma.commodity.findUnique({
            where: { kodeKomoditas },
        });
    },
    update: async (id, data) => {
        return prisma_1.prisma.commodity.update({
            where: { id },
            data,
        });
    },
    delete: async (id) => {
        return prisma_1.prisma.commodity.delete({
            where: { id },
        });
    },
    findAll: async (filters) => {
        const { search, kategori, status, page = 1, pageSize = 10, } = filters;
        const where = {};
        if (kategori) {
            where.kategori = kategori;
        }
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { namaKomoditas: { contains: search } },
                { kodeKomoditas: { contains: search } },
                { deskripsi: { contains: search } },
            ];
        }
        const skip = (page - 1) * pageSize;
        const [items, totalItems] = await Promise.all([
            prisma_1.prisma.commodity.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.commodity.count({ where }),
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
//# sourceMappingURL=commodity.repository.js.map