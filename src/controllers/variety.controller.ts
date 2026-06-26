import { Request, Response } from 'express';
import { varietyRepository } from '../repositories/variety.repository';
import { uploadFile, deleteFile } from '../utils/minio';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createVariety = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeVarietas,
      namaVarietas,
      commodityId,
      asalPemulia,
      tahunRilis,
      deskripsi,
      umurTanam,
      tinggiTanaman,
      bentukBiji,
      warnaGabah,
      potensiHasil,
      anjuranDataran,
      status = 'Aktif',
    } = req.body;

    // Validate required fields
    if (!kodeVarietas || !namaVarietas || !commodityId) {
      return res.status(400).json({
        status: 'error',
        message: 'kodeVarietas, namaVarietas, and commodityId are required fields',
      });
    }

    // Check uniqueness of kodeVarietas
    const existing = await varietyRepository.findByKodeVarietas(kodeVarietas);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Varietas dengan kode '${kodeVarietas}' sudah terdaftar`,
      });
    }

    // Upload image to MinIO if present
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const createdBy = req.user?.username || 'Admin';

    const parsedTahunRilis = tahunRilis ? parseInt(tahunRilis as string) : null;

    const newVariety = await varietyRepository.create({
      kodeVarietas,
      namaVarietas,
      commodityId,
      asalPemulia,
      tahunRilis: isNaN(parsedTahunRilis as number) ? null : parsedTahunRilis,
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
  } catch (error: any) {
    console.error('Error creating variety:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getVarieties = async (req: Request, res: Response) => {
  try {
    const {
      search,
      commodityId,
      status,
      page,
      pageSize,
    } = req.query;

    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string) : 10;

    const result = await varietyRepository.findAll({
      search: search as string,
      commodityId: commodityId as string,
      status: status as string,
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
  } catch (error: any) {
    console.error('Error fetching varieties:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getVarietyById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const variety = await varietyRepository.findById(id);

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
  } catch (error: any) {
    console.error('Error fetching variety by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateVariety = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await varietyRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data varietas tidak ditemukan',
      });
    }

    const {
      kodeVarietas,
      namaVarietas,
      commodityId,
      asalPemulia,
      tahunRilis,
      deskripsi,
      umurTanam,
      tinggiTanaman,
      bentukBiji,
      warnaGabah,
      potensiHasil,
      anjuranDataran,
      status,
    } = req.body;

    const updateData: any = {};

    // Validate uniqueness of new kodeVarietas if updated
    if (kodeVarietas !== undefined && kodeVarietas !== existing.kodeVarietas) {
      const codeCheck = await varietyRepository.findByKodeVarietas(kodeVarietas);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Varietas dengan kode '${kodeVarietas}' sudah terdaftar`,
        });
      }
      updateData.kodeVarietas = kodeVarietas;
    }

    if (namaVarietas !== undefined) updateData.namaVarietas = namaVarietas;
    if (commodityId !== undefined) updateData.commodityId = commodityId;
    if (asalPemulia !== undefined) updateData.asalPemulia = asalPemulia;
    if (tahunRilis !== undefined) {
      const parsedTahunRilis = tahunRilis ? parseInt(tahunRilis as string) : null;
      updateData.tahunRilis = isNaN(parsedTahunRilis as number) ? null : parsedTahunRilis;
    }
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (umurTanam !== undefined) updateData.umurTanam = umurTanam;
    if (tinggiTanaman !== undefined) updateData.tinggiTanaman = tinggiTanaman;
    if (bentukBiji !== undefined) updateData.bentukBiji = bentukBiji;
    if (warnaGabah !== undefined) updateData.warnaGabah = warnaGabah;
    if (potensiHasil !== undefined) updateData.potensiHasil = potensiHasil;
    if (anjuranDataran !== undefined) updateData.anjuranDataran = anjuranDataran;
    if (status !== undefined) updateData.status = status;

    const updatedBy = req.user?.username || 'Admin';
    updateData.diubahOleh = updatedBy;

    // Handle Image Upload logic
    if (req.file) {
      // Delete old file if it existed
      if (existing.image) {
        await deleteFile(existing.image);
      }
      // Upload new file
      updateData.image = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const updated = await varietyRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Varietas berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating variety:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteVariety = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await varietyRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data varietas tidak ditemukan',
      });
    }

    // Delete image from MinIO if it existed
    if (existing.image) {
      await deleteFile(existing.image);
    }

    await varietyRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Varietas berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting variety:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
