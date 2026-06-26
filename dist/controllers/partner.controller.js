"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePartner = exports.updatePartner = exports.getPartnerById = exports.getPartners = exports.createPartner = void 0;
const partner_repository_1 = require("../repositories/partner.repository");
const minio_1 = require("../utils/minio");
const createPartner = async (req, res) => {
    try {
        const { kodePetani, namaPetani, kelompokTani, komoditasUtama, noKtp, noTelepon, alamat, luasLahan, pengalaman, tglBergabung, status = 'Aktif', } = req.body;
        // Validate required fields
        if (!kodePetani || !namaPetani || !kelompokTani || !komoditasUtama) {
            return res.status(400).json({
                status: 'error',
                message: 'kodePetani, namaPetani, kelompokTani, and komoditasUtama are required fields',
            });
        }
        // Check uniqueness of kodePetani
        const existing = await partner_repository_1.partnerRepository.findByKodePetani(kodePetani);
        if (existing) {
            return res.status(400).json({
                status: 'error',
                message: `Petani Mitra dengan kode '${kodePetani}' sudah terdaftar`,
            });
        }
        // Parse luasLahan
        let parsedLuas = 0.0;
        if (luasLahan !== undefined && luasLahan !== '') {
            parsedLuas = parseFloat(luasLahan);
            if (isNaN(parsedLuas)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'luasLahan harus berupa angka/decimal',
                });
            }
        }
        // Parse pengalaman
        let parsedPengalaman = 0;
        if (pengalaman !== undefined && pengalaman !== '') {
            parsedPengalaman = parseInt(pengalaman);
            if (isNaN(parsedPengalaman)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'pengalaman harus berupa angka bulat',
                });
            }
        }
        // Parse tglBergabung
        let dateBergabung = new Date();
        if (tglBergabung) {
            dateBergabung = new Date(tglBergabung);
            if (isNaN(dateBergabung.getTime())) {
                return res.status(400).json({
                    status: 'error',
                    message: 'tglBergabung format tanggal tidak valid',
                });
            }
        }
        // Upload image to MinIO if present
        let imageUrl = null;
        if (req.file) {
            imageUrl = await (0, minio_1.uploadFile)(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const createdBy = req.user?.username || 'Admin';
        const newPartner = await partner_repository_1.partnerRepository.create({
            kodePetani,
            namaPetani,
            kelompokTani,
            komoditasUtama,
            noKtp: noKtp || null,
            noTelepon: noTelepon || null,
            alamat: alamat || null,
            luasLahan: parsedLuas,
            pengalaman: parsedPengalaman,
            tglBergabung: dateBergabung,
            status,
            dibuatOleh: createdBy,
            diubahOleh: createdBy,
            image: imageUrl,
        });
        return res.status(201).json({
            status: 'success',
            message: 'Petani Mitra berhasil dibuat',
            data: newPartner,
        });
    }
    catch (error) {
        console.error('Error creating partner:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.createPartner = createPartner;
const getPartners = async (req, res) => {
    try {
        const { search, kelompokTani, status, komoditasUtama, page, pageSize, } = req.query;
        const parsedPage = page ? parseInt(page) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize) : 10;
        const result = await partner_repository_1.partnerRepository.findAll({
            search: search,
            kelompokTani: kelompokTani,
            status: status,
            komoditasUtama: komoditasUtama,
            page: isNaN(parsedPage) ? 1 : parsedPage,
            pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Data petani mitra berhasil diambil',
            data: result.items,
            pagination: result.pagination,
            filters: {
                search: search || null,
                kelompokTani: kelompokTani || null,
                status: status || null,
                komoditasUtama: komoditasUtama || null,
            },
        });
    }
    catch (error) {
        console.error('Error fetching partners:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.getPartners = getPartners;
const getPartnerById = async (req, res) => {
    try {
        const id = req.params.id;
        const partner = await partner_repository_1.partnerRepository.findById(id);
        if (!partner) {
            return res.status(404).json({
                status: 'error',
                message: 'Data petani mitra tidak ditemukan',
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Detail petani mitra berhasil diambil',
            data: partner,
        });
    }
    catch (error) {
        console.error('Error fetching partner by id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.getPartnerById = getPartnerById;
const updatePartner = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await partner_repository_1.partnerRepository.findById(id);
        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Data petani mitra tidak ditemukan',
            });
        }
        const { kodePetani, namaPetani, kelompokTani, komoditasUtama, noKtp, noTelepon, alamat, luasLahan, pengalaman, tglBergabung, status, } = req.body;
        const updateData = {};
        // Validate uniqueness of new kodePetani if updated
        if (kodePetani !== undefined && kodePetani !== existing.kodePetani) {
            const codeCheck = await partner_repository_1.partnerRepository.findByKodePetani(kodePetani);
            if (codeCheck) {
                return res.status(400).json({
                    status: 'error',
                    message: `Petani Mitra dengan kode '${kodePetani}' sudah terdaftar`,
                });
            }
            updateData.kodePetani = kodePetani;
        }
        if (namaPetani !== undefined)
            updateData.namaPetani = namaPetani;
        if (kelompokTani !== undefined)
            updateData.kelompokTani = kelompokTani;
        if (komoditasUtama !== undefined)
            updateData.komoditasUtama = komoditasUtama;
        if (noKtp !== undefined)
            updateData.noKtp = noKtp || null;
        if (noTelepon !== undefined)
            updateData.noTelepon = noTelepon || null;
        if (alamat !== undefined)
            updateData.alamat = alamat || null;
        if (status !== undefined)
            updateData.status = status;
        if (luasLahan !== undefined) {
            const parsedLuas = parseFloat(luasLahan);
            if (isNaN(parsedLuas)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'luasLahan harus berupa angka/decimal',
                });
            }
            updateData.luasLahan = parsedLuas;
        }
        if (pengalaman !== undefined) {
            const parsedPengalaman = parseInt(pengalaman);
            if (isNaN(parsedPengalaman)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'pengalaman harus berupa angka bulat',
                });
            }
            updateData.pengalaman = parsedPengalaman;
        }
        if (tglBergabung !== undefined) {
            const dateBergabung = new Date(tglBergabung);
            if (isNaN(dateBergabung.getTime())) {
                return res.status(400).json({
                    status: 'error',
                    message: 'tglBergabung format tanggal tidak valid',
                });
            }
            updateData.tglBergabung = dateBergabung;
        }
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
        const updated = await partner_repository_1.partnerRepository.update(id, updateData);
        return res.status(200).json({
            status: 'success',
            message: 'Petani Mitra berhasil diperbarui',
            data: updated,
        });
    }
    catch (error) {
        console.error('Error updating partner:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.updatePartner = updatePartner;
const deletePartner = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await partner_repository_1.partnerRepository.findById(id);
        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Data petani mitra tidak ditemukan',
            });
        }
        // Delete image from MinIO if it existed
        if (existing.image) {
            await (0, minio_1.deleteFile)(existing.image);
        }
        await partner_repository_1.partnerRepository.delete(id);
        return res.status(200).json({
            status: 'success',
            message: 'Petani Mitra berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deleting partner:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
exports.deletePartner = deletePartner;
//# sourceMappingURL=partner.controller.js.map