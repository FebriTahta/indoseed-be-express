import { Request, Response } from 'express';
import { customerRepository } from '../repositories/customer.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeCust,
      namaCust,
      kategori,
      NPWP,
      pic,
      kota,
      alamat,
      postalCode,
      noTelepon,
      email,
      isTop,
      credit_limit,
      remaining_limit,
      tglBergabung,
      status = 'Aktif',
    } = req.body;

    // Validate required fields
    if (!kodeCust || !namaCust || !kategori) {
      return res.status(400).json({
        status: 'error',
        message: 'kode Customer, nama Customer, and kategori are required fields',
      });
    }

    // Check uniqueness of kodeCust
    const existing = await customerRepository.findBykodeCust(kodeCust);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Customer dengan kode '${kodeCust}' sudah terdaftar`,
      });
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

    const createdBy = req.user?.username || 'Admin';

    const newPartner = await customerRepository.create({
      kodeCust,
      namaCust,
      kategori,
      NPWP: NPWP || null,
      pic: pic || null,
      email: email || null,
      isTop: (isTop == 'true') ? true : false || false,
      noTelepon: noTelepon || null,
      alamat: alamat || null,
      kota: kota || null,
      kodePos: postalCode || null,
      tglBergabung: dateBergabung,
      status,
      limitKredit: Number(credit_limit) || 0,
      remainKredit: Number(remaining_limit) || 0,
      dibuatOleh: createdBy,
      diubahOleh: createdBy,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Customer berhasil dibuat',
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

export const getCustomers = async (req: Request, res: Response) => {
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

    const result = await customerRepository.findAll({
      search: search as string,
      kategori: kategori as string,
      status: status as string,
      kota: kota as string,
      page: isNaN(parsedPage) ? 1 : parsedPage,
      pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data customer berhasil diambil',
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
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const customer = await customerRepository.findById(id);

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Data customer tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail customer berhasil diambil',
      data: customer,
    });
  } catch (error: any) {
    console.error('Error fetching customer by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await customerRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data customer tidak ditemukan',
      });
    }

    const {
      kodeCust,
      namaCust,
      kategori,
      NPWP,
      pic,
      kota,
      alamat,
      postalCode,
      noTelepon,
      email,
      isTop,
      credit_limit,
      remaining_limit,
      tglBergabung,
      status = 'Aktif',
    } = req.body;

    const updateData: any = {};

    // Validate uniqueness of new kodeCust if updated
    if (kodeCust !== undefined && kodeCust !== existing.kodeCust) {
      const codeCheck = await customerRepository.findBykodeCust(kodeCust);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Customer dengan kode '${kodeCust}' sudah terdaftar`,
        });
      }
      updateData.kodeCust = kodeCust;
    }

    if (namaCust !== undefined) updateData.namaCust = namaCust;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (NPWP !== undefined) updateData.NPWP = NPWP;
    if (pic !== undefined) updateData.pic = pic;
    if (kota !== undefined) updateData.kota = kota;
    if (alamat !== undefined) updateData.alamat = alamat || null;
    if (postalCode !== undefined) updateData.postalCode = postalCode || null;
    if (noTelepon !== undefined) updateData.noTelepon = noTelepon || null;
    if (email !== undefined) updateData.email = email || null;
    if (isTop !== undefined) updateData.isTop = isTop;
    if (credit_limit !== undefined) updateData.credit_limit = credit_limit;
    if (remaining_limit !== undefined) updateData.remaining_limit = remaining_limit;
    if (status !== undefined) updateData.status = status;

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


    const updated = await customerRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Customer berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await customerRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data customer tidak ditemukan',
      });
    }

    await customerRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Customer berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
