import { Request, Response } from 'express';
import { laboratoriumRepository } from '../repositories/laboratorium.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createLaboratorium = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeLaboratorium,
      namaLaboratorium,
      deskripsi,
      alamat,
      telepon,
      nomorAkreditasi,
      lembagaAkreditasi,
      tanggalAkreditasi,
      tanggalBerlakuAkreditasi,
      ruangLingkupPengujian,
      status = 'Aktif',
    } = req.body;

    if (!kodeLaboratorium || !namaLaboratorium) {
      return res.status(400).json({
        status: 'error',
        message: 'kode Laboratorium and nama Laboratorium are required fields',
      });
    }

    const existing = await laboratoriumRepository.findByKodeLaboratorium(kodeLaboratorium);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Laboratorium dengan kode '${kodeLaboratorium}' sudah terdaftar`,
      });
    }

    const newLab = await laboratoriumRepository.create({
      kodeLaboratorium,
      namaLaboratorium,
      deskripsi,
      alamat,
      telepon,
      nomorAkreditasi,
      lembagaAkreditasi,
      tanggalAkreditasi: tanggalAkreditasi ? new Date(tanggalAkreditasi) : null,
      tanggalBerlakuAkreditasi: tanggalBerlakuAkreditasi ? new Date(tanggalBerlakuAkreditasi) : null,
      ruangLingkupPengujian,
      status,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Laboratorium berhasil dibuat',
      data: newLab,
    });
  } catch (error: any) {
    console.error('Error creating laboratorium:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getLaboratoriumList = async (req: Request, res: Response) => {
  try {
    const { search, status, page, pageSize } = req.query;

    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string) : 10;

    const result = await laboratoriumRepository.findAll({
      search: search as string,
      status: status as string,
      page: isNaN(parsedPage) ? 1 : parsedPage,
      pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data laboratorium berhasil diambil',
      data: result.items,
      pagination: result.pagination,
      filters: { search: search || null, status: status || null },
    });
  } catch (error: any) {
    console.error('Error fetching laboratorium:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getLaboratoriums = async (req: Request, res: Response) => {
  try {
    const result = await laboratoriumRepository.findAllUnpaginated();
    return res.status(200).json({
      status: 'success',
      message: 'Data laboratorium berhasil diambil',
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching laboratorium:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getLaboratoriumById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const lab = await laboratoriumRepository.findById(id);

    if (!lab) {
      return res.status(404).json({
        status: 'error',
        message: 'Data laboratorium tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail laboratorium berhasil diambil',
      data: lab,
    });
  } catch (error: any) {
    console.error('Error fetching lab by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateLaboratorium = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await laboratoriumRepository.findByKodeLaboratorium(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data laboratorium tidak ditemukan',
      });
    }

    const {
      kodeLaboratorium,
      namaLaboratorium,
      deskripsi,
      alamat,
      telepon,
      nomorAkreditasi,
      lembagaAkreditasi,
      tanggalAkreditasi,
      tanggalBerlakuAkreditasi,
      ruangLingkupPengujian,
      status,
    } = req.body;

    const updateData: any = {};

    if (kodeLaboratorium !== undefined && kodeLaboratorium !== existing.kodeLaboratorium) {
      const codeCheck = await laboratoriumRepository.findByKodeLaboratorium(kodeLaboratorium);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Laboratorium dengan kode '${kodeLaboratorium}' sudah terdaftar`,
        });
      }
      updateData.kodeLaboratorium = kodeLaboratorium;
    }

    if (namaLaboratorium !== undefined) updateData.namaLaboratorium = namaLaboratorium;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (telepon !== undefined) updateData.telepon = telepon;
    if (nomorAkreditasi !== undefined) updateData.nomorAkreditasi = nomorAkreditasi;
    if (lembagaAkreditasi !== undefined) updateData.lembagaAkreditasi = lembagaAkreditasi;
    if (tanggalAkreditasi !== undefined) updateData.tanggalAkreditasi = tanggalAkreditasi ? new Date(tanggalAkreditasi) : null;
    if (tanggalBerlakuAkreditasi !== undefined) updateData.tanggalBerlakuAkreditasi = tanggalBerlakuAkreditasi ? new Date(tanggalBerlakuAkreditasi) : null;
    if (ruangLingkupPengujian !== undefined) updateData.ruangLingkupPengujian = ruangLingkupPengujian;
    if (status !== undefined) updateData.status = status;

    const updated = await laboratoriumRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Laboratorium berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating lab:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteLaboratorium = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await laboratoriumRepository.findByKodeLaboratorium(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data laboratorium tidak ditemukan',
      });
    }

    await laboratoriumRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Laboratorium berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting lab:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
