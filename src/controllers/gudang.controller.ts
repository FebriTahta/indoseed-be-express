import { Request, Response } from 'express';
import { gudangRepository } from '../repositories/gudang.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createGudang = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeGudang,
      namaGudang,
      kategori,
      status = 'Aktif',
    } = req.body;

    // Validate required fields
    if (!kodeGudang || !namaGudang || !kategori) {
      return res.status(400).json({
        status: 'error',
        message: 'kode Gudang, nama Gudang, and kategori are required fields',
      });
    }

    // Check uniqueness of kodeGudang
    const existing = await gudangRepository.findByKodeGudang(kodeGudang);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Gudang dengan kode '${kodeGudang}' sudah terdaftar`,
      });
    }


    const createdBy = req.user?.username || 'Admin';

    const newPartner = await gudangRepository.create({
      kodeGudang,
      namaGudang,
      kategori,
      status,
      dibuatOleh: createdBy,
      diubahOleh: createdBy,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Gudang berhasil dibuat',
      data: newPartner,
    });
  } catch (error: any) {
    console.error('Error creating partner:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getGudang = async (req: Request, res: Response) => {
  try {
    const {
      search,
      kategori,
      status,
      kota,
      page,
      pageSize,
    } = req.query;

    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string) : 10;

    const result = await gudangRepository.findAll({
      search: search as string,
      kategori: kategori as string,
      status: status as string,
      page: isNaN(parsedPage) ? 1 : parsedPage,
      pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data gudang berhasil diambil',
      data: result.items,
      pagination: result.pagination,
      filters: {
        search: search || null,
        kategori: kategori || null,
        status: status || null,
        kota: kota || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching gudang:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getGudangById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const gudang = await gudangRepository.findById(id);

    if (!gudang) {
      return res.status(404).json({
        status: 'error',
        message: 'Data gudang tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail gudang berhasil diambil',
      data: gudang,
    });
  } catch (error: any) {
    console.error('Error fetching gudang by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateGudang = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await gudangRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data gudang tidak ditemukan',
      });
    }

    const {
      kodeGudang,
      namaGudang,
      kategori,
      status = 'Aktif',
    } = req.body;

    const updateData: any = {};

    // Validate uniqueness of new kodeGudang if updated
    if (kodeGudang !== undefined && kodeGudang !== existing.kodeGudang) {
      const codeCheck = await gudangRepository.findByKodeGudang(kodeGudang);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Gudang dengan kode '${kodeGudang}' sudah terdaftar`,
        });
      }
      updateData.kodeGudang = kodeGudang;
    }

    if (namaGudang !== undefined) updateData.namaGudang = namaGudang;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (status !== undefined) updateData.status = status;

    const updatedBy = req.user?.username || 'Admin';
    updateData.diubahOleh = updatedBy;


    const updated = await gudangRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Gudang berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating gudang:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteGudang = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await gudangRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data gudang tidak ditemukan',
      });
    }

    await gudangRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Gudang berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
