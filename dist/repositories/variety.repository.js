"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.varietyRepository = void 0;
const prisma_1 = require("../utils/prisma");
exports.varietyRepository = {
    create: async (data) => {
        return prisma_1.prisma.variety.create({
            data,
            include: {
                commodity: true,
            },
        });
    },
    findById: async (id) => {
        return prisma_1.prisma.variety.findUnique({
            where: { id },
            include: {
                commodity: true,
            },
        });
    },
    findByKodeVarietas: async (kodeVarietas) => {
        return prisma_1.prisma.variety.findUnique({
            where: { kodeVarietas },
            include: {
                commodity: true,
            },
        });
    },
    update: async (id, data) => {
        return prisma_1.prisma.variety.update({
            where: { id },
            data,
            include: {
                commodity: true,
            },
        });
    },
    delete: async (id) => {
        return prisma_1.prisma.variety.delete({
            where: { id },
        });
    },
    findAll: async (filters) => {
        const { search, commodityId, status, page = 1, pageSize = 10, } = filters;
        const where = {};
        if (commodityId) {
            where.commodityId = commodityId;
        }
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { namaVarietas: { contains: search } },
                { kodeVarietas: { contains: search } },
                { asalPemulia: { contains: search } },
                {
                    commodity: {
                        namaKomoditas: { contains: search },
                    },
                },
            ];
        }
        const skip = (page - 1) * pageSize;
        const [items, totalItems] = await Promise.all([
            prisma_1.prisma.variety.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    commodity: true,
                },
            }),
            prisma_1.prisma.variety.count({ where }),
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
//# sourceMappingURL=variety.repository.js.map