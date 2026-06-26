"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommodity = exports.updateCommodity = exports.getCommodityById = exports.getCommodities = exports.createCommodity = void 0;
const commodity_repository_1 = require("../repositories/commodity.repository");
const minio_1 = require("../utils/minio");
const createCommodity = async (req, res) => {
    try {
        const { kodeKomoditas, namaKomoditas, kategori, deskripsi, status = 'Aktif', } = req.body;
        // Validate required fields
        if (!kodeKomoditas || !namaKomoditas || !kategori) {
            return res.status(400).json({
                status: 'error',
                message: 'kodeKomoditas, namaKomoditas, and kategori are required fields',
            });
        }
        // Check uniqueness of kodeKomoditas
        const existing = await commodity_repository_1.commodityRepository.findByKodeKomoditas(kodeKomoditas);
        if (existing) {
            return res.status(400).json({
                status: 'error',
                message: `Komoditas dengan kode '${kodeKomoditas}' sudah terdaftar`,
            });
        }
        // Upload image to MinIO if present
        let imageUrl = null;
        if (req.file) {
            imageUrl = await (0, minio_1.uploadFile)(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const createdBy = req.user?.username || 'Admin';
        const newCommodity = await commodity_repository_1.commodityRepository.create({
            kodeKomoditas,
            namaKomoditas,
            kategori,
            deskripsi,
            status,
            dibuatOleh: createdBy,
            diubahOleh: createdBy,
            image: imageUrl,
        });
        return res.status(201).json({
            status: 'success',
            message: 'Komoditas berhasil dibuat',
            data: newCommodity,
        });
    }
    catch (error) {
        console.error('Error creating commodity:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.createCommodity = createCommodity;
const getCommodities = async (req, res) => {
    try {
        const { search, kategori, status, page, pageSize, } = req.query;
        const parsedPage = page ? parseInt(page) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize) : 10;
        const result = await commodity_repository_1.commodityRepository.findAll({
            search: search,
            kategori: kategori,
            status: status,
            page: isNaN(parsedPage) ? 1 : parsedPage,
            pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Data komoditas berhasil diambil',
            data: result.items,
            pagination: result.pagination,
            filters: {
                search: search || null,
                kategori: kategori || null,
                status: status || null,
            },
        });
    }
    catch (error) {
        console.error('Error fetching commodities:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.getCommodities = getCommodities;
const getCommodityById = async (req, res) => {
    try {
        const id = req.params.id;
        const commodity = await commodity_repository_1.commodityRepository.findById(id);
        if (!commodity) {
            return res.status(404).json({
                status: 'error',
                message: 'Data komoditas tidak ditemukan',
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Detail komoditas berhasil diambil',
            data: commodity,
        });
    }
    catch (error) {
        console.error('Error fetching commodity by id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.getCommodityById = getCommodityById;
const updateCommodity = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await commodity_repository_1.commodityRepository.findById(id);
        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Data komoditas tidak ditemukan',
            });
        }
        const { kodeKomoditas, namaKomoditas, kategori, deskripsi, status, } = req.body;
        const updateData = {};
        // Validate uniqueness of new kodeKomoditas if updated
        if (kodeKomoditas !== undefined && kodeKomoditas !== existing.kodeKomoditas) {
            const codeCheck = await commodity_repository_1.commodityRepository.findByKodeKomoditas(kodeKomoditas);
            if (codeCheck) {
                return res.status(400).json({
                    status: 'error',
                    message: `Komoditas dengan kode '${kodeKomoditas}' sudah terdaftar`,
                });
            }
            updateData.kodeKomoditas = kodeKomoditas;
        }
        if (namaKomoditas !== undefined)
            updateData.namaKomoditas = namaKomoditas;
        if (kategori !== undefined)
            updateData.kategori = kategori;
        if (deskripsi !== undefined)
            updateData.deskripsi = deskripsi;
        if (status !== undefined)
            updateData.status = status;
        const updatedBy = req.user?.username || 'Admin';
        updateData.diubahOleh = updatedBy;
        // Handle Image Upload logic
        if (req.file) {
            // Delete old file if it existed
            if (existing.image) {
                await (0, minio_1.deleteFile)(existing.image);
            }
            // Upload new file
            updateData.image = await (0, minio_1.uploadFile)(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const updated = await commodity_repository_1.commodityRepository.update(id, updateData);
        return res.status(200).json({
            status: 'success',
            message: 'Komoditas berhasil diperbarui',
            data: updated,
        });
    }
    catch (error) {
        console.error('Error updating commodity:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.updateCommodity = updateCommodity;
const deleteCommodity = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await commodity_repository_1.commodityRepository.findById(id);
        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Data komoditas tidak ditemukan',
            });
        }
        // Delete image from MinIO if it existed
        if (existing.image) {
            await (0, minio_1.deleteFile)(existing.image);
        }
        await commodity_repository_1.commodityRepository.delete(id);
        return res.status(200).json({
            status: 'success',
            message: 'Komoditas berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deleting commodity:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.deleteCommodity = deleteCommodity;
//# sourceMappingURL=commodity.controller.js.map