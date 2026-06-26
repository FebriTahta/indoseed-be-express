"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariety = exports.updateVariety = exports.getVarietyById = exports.getVarieties = exports.createVariety = void 0;
const variety_repository_1 = require("../repositories/variety.repository");
const minio_1 = require("../utils/minio");
const createVariety = async (req, res) => {
    try {
        const { kodeVarietas, namaVarietas, commodityId, asalPemulia, tahunRilis, deskripsi, umurTanam, tinggiTanaman, bentukBiji, warnaGabah, potensiHasil, anjuranDataran, status = 'Aktif', } = req.body;
        // Validate required fields
        if (!kodeVarietas || !namaVarietas || !commodityId) {
            return res.status(400).json({
                status: 'error',
                message: 'kodeVarietas, namaVarietas, and commodityId are required fields',
            });
        }
        // Check uniqueness of kodeVarietas
        const existing = await variety_repository_1.varietyRepository.findByKodeVarietas(kodeVarietas);
        if (existing) {
            return res.status(400).json({
                status: 'error',
                message: `Varietas dengan kode '${kodeVarietas}' sudah terdaftar`,
            });
        }
        // Upload image to MinIO if present
        let imageUrl = null;
        if (req.file) {
            imageUrl = await (0, minio_1.uploadFile)(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const createdBy = req.user?.username || 'Admin';
        const parsedTahunRilis = tahunRilis ? parseInt(tahunRilis) : null;
        const newVariety = await variety_repository_1.varietyRepository.create({
            kodeVarietas,
            namaVarietas,
            commodityId,
            asalPemulia,
            tahunRilis: isNaN(parsedTahunRilis) ? null : parsedTahunRilis,
            deskripsi,
            umurTanam,
            tinggiTanaman,
            bentukBiji,
            warnaGabah,
            potensiHasil,
            anjuranDataran,
            status,
            dibuatOleh: createdBy,
            diubahOleh: createdBy,
            image: imageUrl,
        });
        return res.status(201).json({
            status: 'success',
            message: 'Varietas berhasil dibuat',
            data: newVariety,
        });
    }
    catch (error) {
        console.error('Error creating variety:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.createVariety = createVariety;
const getVarieties = async (req, res) => {
    try {
        const { search, commodityId, status, page, pageSize, } = req.query;
        const parsedPage = page ? parseInt(page) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize) : 10;
        const result = await variety_repository_1.varietyRepository.findAll({
            search: search,
            commodityId: commodityId,
            status: status,
            page: isNaN(parsedPage) ? 1 : parsedPage,
            pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Data varietas berhasil diambil',
            data: result.items,
            pagination: result.pagination,
            filters: {
                search: search || null,
                commodityId: commodityId || null,
                status: status || null,
            },
        });
    }
    catch (error) {
        console.error('Error fetching varieties:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.getVarieties = getVarieties;
const getVarietyById = async (req, res) => {
    try {
        const id = req.params.id;
        const variety = await variety_repository_1.varietyRepository.findById(id);
        if (!variety) {
            return res.status(404).json({
                status: 'error',
                message: 'Data varietas tidak ditemukan',
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Detail varietas berhasil diambil',
            data: variety,
        });
    }
    catch (error) {
        console.error('Error fetching variety by id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.getVarietyById = getVarietyById;
const updateVariety = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await variety_repository_1.varietyRepository.findById(id);
        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Data varietas tidak ditemukan',
            });
        }
        const { kodeVarietas, namaVarietas, commodityId, asalPemulia, tahunRilis, deskripsi, umurTanam, tinggiTanaman, bentukBiji, warnaGabah, potensiHasil, anjuranDataran, status, } = req.body;
        const updateData = {};
        // Validate uniqueness of new kodeVarietas if updated
        if (kodeVarietas !== undefined && kodeVarietas !== existing.kodeVarietas) {
            const codeCheck = await variety_repository_1.varietyRepository.findByKodeVarietas(kodeVarietas);
            if (codeCheck) {
                return res.status(400).json({
                    status: 'error',
                    message: `Varietas dengan kode '${kodeVarietas}' sudah terdaftar`,
                });
            }
            updateData.kodeVarietas = kodeVarietas;
        }
        if (namaVarietas !== undefined)
            updateData.namaVarietas = namaVarietas;
        if (commodityId !== undefined)
            updateData.commodityId = commodityId;
        if (asalPemulia !== undefined)
            updateData.asalPemulia = asalPemulia;
        if (tahunRilis !== undefined) {
            const parsedTahunRilis = tahunRilis ? parseInt(tahunRilis) : null;
            updateData.tahunRilis = isNaN(parsedTahunRilis) ? null : parsedTahunRilis;
        }
        if (deskripsi !== undefined)
            updateData.deskripsi = deskripsi;
        if (umurTanam !== undefined)
            updateData.umurTanam = umurTanam;
        if (tinggiTanaman !== undefined)
            updateData.tinggiTanaman = tinggiTanaman;
        if (bentukBiji !== undefined)
            updateData.bentukBiji = bentukBiji;
        if (warnaGabah !== undefined)
            updateData.warnaGabah = warnaGabah;
        if (potensiHasil !== undefined)
            updateData.potensiHasil = potensiHasil;
        if (anjuranDataran !== undefined)
            updateData.anjuranDataran = anjuranDataran;
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
        const updated = await variety_repository_1.varietyRepository.update(id, updateData);
        return res.status(200).json({
            status: 'success',
            message: 'Varietas berhasil diperbarui',
            data: updated,
        });
    }
    catch (error) {
        console.error('Error updating variety:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.updateVariety = updateVariety;
const deleteVariety = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await variety_repository_1.varietyRepository.findById(id);
        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Data varietas tidak ditemukan',
            });
        }
        // Delete image from MinIO if it existed
        if (existing.image) {
            await (0, minio_1.deleteFile)(existing.image);
        }
        await variety_repository_1.varietyRepository.delete(id);
        return res.status(200).json({
            status: 'success',
            message: 'Varietas berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deleting variety:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.deleteVariety = deleteVariety;
//# sourceMappingURL=variety.controller.js.map