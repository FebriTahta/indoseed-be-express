import { Request, Response } from 'express';
import { penanggungJawabRepository } from '../repositories/penanggungJawab.repository';

export const getPenanggungJawab = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, search, status } = req.query;

    const result = await penanggungJawabRepository.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
    });

    return res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('getPenanggungJawab error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil data penanggung jawab',
    });
  }
};

export const getPenanggungJawabById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await penanggungJawabRepository.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Penanggung jawab tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('getPenanggungJawabById error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil detail penanggung jawab',
    });
  }
};

export const createPenanggungJawab = async (req: Request, res: Response) => {
  try {
    const { nama, status = 'Aktif' } = req.body;

    if (!nama || typeof nama !== 'string' || !nama.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama penanggung jawab wajib diisi',
      });
    }

    const newItem = await penanggungJawabRepository.create({
      nama: nama.trim(),
      status: status || 'Aktif',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Penanggung jawab berhasil ditambahkan',
      data: newItem,
    });
  } catch (error: any) {
    console.error('createPenanggungJawab error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menambahkan penanggung jawab',
    });
  }
};

export const updatePenanggungJawab = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nama, status } = req.body;

    const existing = await penanggungJawabRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Penanggung jawab tidak ditemukan',
      });
    }

    const updateData: { nama?: string; status?: string } = {};
    if (nama !== undefined) {
      if (!nama || typeof nama !== 'string' || !nama.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Nama penanggung jawab tidak boleh kosong',
        });
      }
      updateData.nama = nama.trim();
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updated = await penanggungJawabRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Penanggung jawab berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('updatePenanggungJawab error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal memperbarui penanggung jawab',
    });
  }
};

export const deletePenanggungJawab = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await penanggungJawabRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Penanggung jawab tidak ditemukan',
      });
    }

    await penanggungJawabRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Penanggung jawab berhasil dihapus',
    });
  } catch (error: any) {
    console.error('deletePenanggungJawab error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menghapus penanggung jawab',
    });
  }
};
