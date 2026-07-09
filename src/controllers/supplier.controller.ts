import { Request, Response } from 'express';
import { supplierRepository } from '../repositories/supplier.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeSupplier,
      namaSupplier,
      kategori,
      status = 'Aktif',
    } = req.body;

    // Validate required fields
    if (!kodeSupplier || !namaSupplier || !kategori) {
      return res.status(400).json({
        status: 'error',
        message: 'kode Supplier, nama Supplier, and kategori are required fields',
      });
    }

    // Check uniqueness of kodeSupplier
    const existing = await supplierRepository.findByKodeSupplier(kodeSupplier);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Supplier dengan kode '${kodeSupplier}' sudah terdaftar`,
      });
    }


    const createdBy = req.user?.username || 'Admin';

    const newPartner = await supplierRepository.create({
      kodeSupplier,
      namaSupplier,
      kategori,
      status,
      dibuatOleh: createdBy,
      diubahOleh: createdBy,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Supplier berhasil dibuat',
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

export const getSuppliers = async (req: Request, res: Response) => {
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

    const result = await supplierRepository.findAll({
      search: search as string,
      kategori: kategori as string,
      status: status as string,
      page: isNaN(parsedPage) ? 1 : parsedPage,
      pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data supplier berhasil diambil',
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
    console.error('Error fetching supplier:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Data supplier tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail supplier berhasil diambil',
      data: supplier,
    });
  } catch (error: any) {
    console.error('Error fetching supplier by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await supplierRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data supplier tidak ditemukan',
      });
    }

    const {
      kodeSupplier,
      namaSupplier,
      kategori,
      status = 'Aktif',
    } = req.body;

    const updateData: any = {};

    // Validate uniqueness of new kodeSupplier if updated
    if (kodeSupplier !== undefined && kodeSupplier !== existing.kodeSupplier) {
      const codeCheck = await supplierRepository.findByKodeSupplier(kodeSupplier);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Supplier dengan kode '${kodeSupplier}' sudah terdaftar`,
        });
      }
      updateData.kodeSupplier = kodeSupplier;
    }

    if (namaSupplier !== undefined) updateData.namaSupplier = namaSupplier;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (status !== undefined) updateData.status = status;

    const updatedBy = req.user?.username || 'Admin';
    updateData.diubahOleh = updatedBy;


    const updated = await supplierRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Supplier berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await supplierRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data supplier tidak ditemukan',
      });
    }

    await supplierRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Supplier berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
