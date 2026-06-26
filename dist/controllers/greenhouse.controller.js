"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGreenhouse = exports.updateGreenhouse = exports.getGreenhouseById = exports.getGreenhouses = exports.createGreenhouse = void 0;
const greenhouse_repository_1 = require("../repositories/greenhouse.repository");
const minio_1 = require("../utils/minio");
const prisma_1 = require("../utils/prisma");
const createGreenhouse = async (req, res) => {
    try {
        const { kodeLahan, namaLahan, jenisLahan = 'Greenhouse', commodityId, varietyId, partnerId, komoditasColor = 'emerald', komoditasIcon = 'ri-leaf-line', lokasi, luas, status = 'Aktif', detailLokasi, koordinat, keterangan, } = req.body;
        // Validate required fields
        if (!kodeLahan || !namaLahan || !commodityId || !lokasi || luas === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'kodeLahan, namaLahan, commodityId, lokasi, and luas are required fields',
            });
        }
        // Check uniqueness of kodeLahan
        const existing = await greenhouse_repository_1.greenhouseRepository.findByKodeLahan(kodeLahan);
        if (existing) {
            return res.status(400).json({
                status: 'error',
                message: `Lahan dengan kode '${kodeLahan}' sudah terdaftar`,
            });
        }
        // Parse luas as float
        const parsedLuas = parseFloat(luas);
        if (isNaN(parsedLuas)) {
            return res.status(400).json({
                status: 'error',
                message: 'luas harus berupa angka/decimal',
            });
        }
        // Validate relations
        const commodity = await prisma_1.prisma.commodity.findUnique({ where: { id: commodityId } });
        if (!commodity) {
            return res.status(400).json({
                status: 'error',
                message: 'Komoditas tidak ditemukan',
            });
        }
        let varietyName = '';
        if (varietyId) {
            const variety = await prisma_1.prisma.variety.findUnique({ where: { id: varietyId } });
            if (!variety) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Varietas tidak ditemukan',
                });
            }
            if (variety.commodityId !== commodityId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Varietas tidak cocok dengan komoditas yang dipilih',
                });
            }
            varietyName = variety.namaVarietas;
        }
        let partnerName = '';
        if (partnerId) {
            const partner = await prisma_1.prisma.partner.findUnique({ where: { id: partnerId } });
            if (!partner) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Petani mitra tidak ditemukan',
                });
            }
            partnerName = partner.namaPetani;
        }
        // Upload image to MinIO if present
        let imageUrl = null;
        if (req.file) {
            imageUrl = await (0, minio_1.uploadFile)(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const createdBy = req.user?.username || 'Admin';
        const newGreenhouse = await greenhouse_repository_1.greenhouseRepository.create({
            kodeLahan,
            namaLahan,
            jenisLahan,
            commodityId,
            varietyId: varietyId || null,
            partnerId: partnerId || null,
            komoditasUtama: commodity.namaKomoditas,
            komoditasColor,
            komoditasIcon,
            lokasi,
            luas: parsedLuas,
            status,
            detailLokasi,
            koordinat,
            petaniMitra: partnerName || null,
            dibuatOleh: createdBy,
            keterangan,
            image: imageUrl,
        });
        return res.status(201).json({
            status: 'success',
            message: 'Greenhouse berhasil dibuat',
            data: newGreenhouse,
        });
    }
    catch (error) {
        console.error('Error creating greenhouse:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.createGreenhouse = createGreenhouse;
const getGreenhouses = async (req, res) => {
    try {
        const { search, jenisLahan, status, komoditasUtama, commodityId, varietyId, partnerId, lokasi, page, pageSize, } = req.query;
        const parsedPage = page ? parseInt(page) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize) : 10;
        const result = await greenhouse_repository_1.greenhouseRepository.findAll({
            search: search,
            jenisLahan: jenisLahan,
            status: status,
            komoditasUtama: komoditasUtama,
            commodityId: commodityId,
            varietyId: varietyId,
            partnerId: partnerId,
            lokasi: lokasi,
            page: isNaN(parsedPage) ? 1 : parsedPage,
            pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Data lahan berhasil diambil',
            data: result.items,
            pagination: result.pagination,
            filters: {
                search: search || null,
                jenisLahan: jenisLahan || null,
                status: status || null,
                komoditasUtama: komoditasUtama || null,
                commodityId: commodityId || null,
                varietyId: varietyId || null,
                partnerId: partnerId || null,
                lokasi: lokasi || null,
            },
        });
    }
    catch (error) {
        console.error('Error fetching greenhouses:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.getGreenhouses = getGreenhouses;
const getGreenhouseById = async (req, res) => {
    try {
        const id = req.params.id;
        const greenhouse = await greenhouse_repository_1.greenhouseRepository.findById(id);
        if (!greenhouse) {
            return res.status(404).json({
                status: 'error',
                message: 'Data greenhouse tidak ditemukan',
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Detail greenhouse berhasil diambil',
            data: greenhouse,
        });
    }
    catch (error) {
        console.error('Error fetching greenhouse by id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.getGreenhouseById = getGreenhouseById;
const updateGreenhouse = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await greenhouse_repository_1.greenhouseRepository.findById(id);
        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Data greenhouse tidak ditemukan',
            });
        }
        const { kodeLahan, namaLahan, jenisLahan, commodityId, varietyId, partnerId, komoditasColor, komoditasIcon, lokasi, luas, status, detailLokasi, koordinat, keterangan, } = req.body;
        const updateData = {};
        // Validate uniqueness of new kodeLahan if updated
        if (kodeLahan !== undefined && kodeLahan !== existing.kodeLahan) {
            const codeCheck = await greenhouse_repository_1.greenhouseRepository.findByKodeLahan(kodeLahan);
            if (codeCheck) {
                return res.status(400).json({
                    status: 'error',
                    message: `Lahan dengan kode '${kodeLahan}' sudah terdaftar`,
                });
            }
            updateData.kodeLahan = kodeLahan;
        }
        if (namaLahan !== undefined)
            updateData.namaLahan = namaLahan;
        if (jenisLahan !== undefined)
            updateData.jenisLahan = jenisLahan;
        if (komoditasColor !== undefined)
            updateData.komoditasColor = komoditasColor;
        if (komoditasIcon !== undefined)
            updateData.komoditasIcon = komoditasIcon;
        if (lokasi !== undefined)
            updateData.lokasi = lokasi;
        if (status !== undefined)
            updateData.status = status;
        if (detailLokasi !== undefined)
            updateData.detailLokasi = detailLokasi;
        if (koordinat !== undefined)
            updateData.koordinat = koordinat;
        if (keterangan !== undefined)
            updateData.keterangan = keterangan;
        // Validate relations if updated
        if (commodityId !== undefined) {
            if (commodityId) {
                const commodity = await prisma_1.prisma.commodity.findUnique({ where: { id: commodityId } });
                if (!commodity) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Komoditas tidak ditemukan',
                    });
                }
                updateData.commodityId = commodityId;
                updateData.komoditasUtama = commodity.namaKomoditas;
            }
            else {
                updateData.commodityId = null;
                updateData.komoditasUtama = '';
            }
        }
        if (varietyId !== undefined) {
            if (varietyId) {
                const targetCommodityId = commodityId !== undefined ? commodityId : existing.commodityId;
                const variety = await prisma_1.prisma.variety.findUnique({ where: { id: varietyId } });
                if (!variety) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Varietas tidak ditemukan',
                    });
                }
                if (targetCommodityId && variety.commodityId !== targetCommodityId) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Varietas tidak cocok dengan komoditas yang dipilih',
                    });
                }
                updateData.varietyId = varietyId;
            }
            else {
                updateData.varietyId = null;
            }
        }
        if (partnerId !== undefined) {
            if (partnerId) {
                const partner = await prisma_1.prisma.partner.findUnique({ where: { id: partnerId } });
                if (!partner) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Petani mitra tidak ditemukan',
                    });
                }
                updateData.partnerId = partnerId;
                updateData.petaniMitra = partner.namaPetani;
            }
            else {
                updateData.partnerId = null;
                updateData.petaniMitra = null;
            }
        }
        if (luas !== undefined) {
            const parsedLuas = parseFloat(luas);
            if (isNaN(parsedLuas)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'luas harus berupa angka/decimal',
                });
            }
            updateData.luas = parsedLuas;
        }
        // Handle Image Upload logic
        if (req.file) {
            // Delete old file if it existed
            if (existing.image) {
                await (0, minio_1.deleteFile)(existing.image);
            }
            // Upload new file
            updateData.image = await (0, minio_1.uploadFile)(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const updated = await greenhouse_repository_1.greenhouseRepository.update(id, updateData);
        return res.status(200).json({
            status: 'success',
            message: 'Greenhouse berhasil diperbarui',
            data: updated,
        });
    }
    catch (error) {
        console.error('Error updating greenhouse:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.updateGreenhouse = updateGreenhouse;
const deleteGreenhouse = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await greenhouse_repository_1.greenhouseRepository.findById(id);
        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Data greenhouse tidak ditemukan',
            });
        }
        // Delete image from MinIO if it existed
        if (existing.image) {
            await (0, minio_1.deleteFile)(existing.image);
        }
        await greenhouse_repository_1.greenhouseRepository.delete(id);
        return res.status(200).json({
            status: 'success',
            message: 'Greenhouse berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deleting greenhouse:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.deleteGreenhouse = deleteGreenhouse;
//# sourceMappingURL=greenhouse.controller.js.map