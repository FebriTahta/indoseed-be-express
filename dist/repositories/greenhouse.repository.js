"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greenhouseRepository = void 0;
const prisma_1 = require("../utils/prisma");
exports.greenhouseRepository = {
    create: async (data) => {
        return prisma_1.prisma.greenhouse.create({
            data,
            include: {
                commodity: true,
                variety: true,
                partner: true,
            },
        });
    },
    findById: async (id) => {
        return prisma_1.prisma.greenhouse.findUnique({
            where: { id },
            include: {
                commodity: true,
                variety: true,
                partner: true,
            },
        });
    },
    findByKodeLahan: async (kodeLahan) => {
        return prisma_1.prisma.greenhouse.findUnique({
            where: { kodeLahan },
            include: {
                commodity: true,
                variety: true,
                partner: true,
            },
        });
    },
    update: async (id, data) => {
        return prisma_1.prisma.greenhouse.update({
            where: { id },
            data,
            include: {
                commodity: true,
                variety: true,
                partner: true,
            },
        });
    },
    delete: async (id) => {
        return prisma_1.prisma.greenhouse.delete({
            where: { id },
        });
    },
    findAll: async (filters) => {
        const { search, jenisLahan, status, komoditasUtama, commodityId, varietyId, partnerId, lokasi, page = 1, pageSize = 10, } = filters;
        const where = {};
        if (jenisLahan) {
            where.jenisLahan = jenisLahan;
        }
        if (status) {
            where.status = status;
        }
        if (commodityId) {
            where.commodityId = commodityId;
        }
        else if (komoditasUtama) {
            where.komoditasUtama = komoditasUtama;
        }
        if (varietyId) {
            where.varietyId = varietyId;
        }
        if (partnerId) {
            where.partnerId = partnerId;
        }
        if (lokasi) {
            where.lokasi = lokasi;
        }
        if (search) {
            where.OR = [
                { namaLahan: { contains: search } },
                { kodeLahan: { contains: search } },
                { petaniMitra: { contains: search } },
            ];
        }
        const skip = (page - 1) * pageSize;
        const [items, totalItems] = await Promise.all([
            prisma_1.prisma.greenhouse.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    commodity: true,
                    variety: true,
                    partner: true,
                },
            }),
            prisma_1.prisma.greenhouse.count({ where }),
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
//# sourceMappingURL=greenhouse.repository.js.map