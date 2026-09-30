import { Request, Response } from 'express';
import { greenhouseRepository } from '../repositories/greenhouse.repository';
import { uploadFile, deleteFile } from '../utils/minio';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../utils/prisma';

export const createGreenhouse = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeLahan,
      namaLahan,
      jenisLahan = 'Greenhouse',
      commodityId,
      partnerId,
      varietas,
      varietyId,
      komoditasColor = 'emerald',
      komoditasIcon = 'ri-leaf-line',
      lokasi,
      luas,
      status = 'Aktif',
      detailLokasi,
      koordinat,
      keterangan,
    } = req.body;

    // Validate required fields (commodityId is optional)
    if (!kodeLahan || !namaLahan || luas === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'kodeLahan, namaLahan, and luas are required fields',
      });
    }

    // Check uniqueness of kodeLahan
    const existing = await greenhouseRepository.findByKodeLahan(kodeLahan);
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

    // Validate commodity relation if provided
    let komoditasName: string | null = null;
    if (commodityId) {
      const commodity = await prisma.commodity.findUnique({ where: { id: commodityId } });
      if (commodity) {
        komoditasName = commodity.namaKomoditas;
      }
    }

    let partnerName = '';
    if (partnerId) {
      const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
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
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const createdBy = req.user?.username || 'Admin';

    const newGreenhouse = await greenhouseRepository.create({
      kodeLahan,
      namaLahan,
      jenisLahan,
      commodityId: commodityId || null,
      partnerId: partnerId || null,
      komoditasUtama: komoditasName || null,
      komoditasColor,
      komoditasIcon,
      varietas: varietas || null,
      varietyId: varietyId || null,
      lokasi: lokasi || detailLokasi || 'Lahan Mitra',
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
  } catch (error: any) {
    console.error('Error creating greenhouse:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getGreenhouses = async (req: Request, res: Response) => {
  try {
    const {
      search,
      jenisLahan,
      status,
      komoditasUtama,
      commodityId,
      partnerId,
      lokasi,
      page,
      pageSize,
    } = req.query;

    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string) : 10;

    const result = await greenhouseRepository.findAll({
      search: search as string,
      jenisLahan: jenisLahan as string,
      status: status as string,
      komoditasUtama: komoditasUtama as string,
      commodityId: commodityId as string,
      partnerId: partnerId as string,
      lokasi: lokasi as string,
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
        partnerId: partnerId || null,
        lokasi: lokasi || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching greenhouses:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getGreenhouseById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const greenhouse = await greenhouseRepository.findById(id);

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
  } catch (error: any) {
    console.error('Error fetching greenhouse by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateGreenhouse = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await greenhouseRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data greenhouse tidak ditemukan',
      });
    }

    const {
      kodeLahan,
      namaLahan,
      jenisLahan,
      commodityId,
      partnerId,
      komoditasColor,
      komoditasIcon,
      lokasi,
      luas,
      status,
      detailLokasi,
      koordinat,
      keterangan,
      varietas,
      varietyId,
    } = req.body;

    const updateData: any = {};

    // Validate uniqueness of new kodeLahan if updated
    if (kodeLahan !== undefined && kodeLahan !== existing.kodeLahan) {
      const codeCheck = await greenhouseRepository.findByKodeLahan(kodeLahan);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Lahan dengan kode '${kodeLahan}' sudah terdaftar`,
        });
      }
      updateData.kodeLahan = kodeLahan;
    }

    if (namaLahan !== undefined) updateData.namaLahan = namaLahan;
    if (jenisLahan !== undefined) updateData.jenisLahan = jenisLahan;
    if (komoditasColor !== undefined) updateData.komoditasColor = komoditasColor;
    if (komoditasIcon !== undefined) updateData.komoditasIcon = komoditasIcon;
    if (lokasi !== undefined) updateData.lokasi = lokasi;
    if (status !== undefined) updateData.status = status;
    if (detailLokasi !== undefined) updateData.detailLokasi = detailLokasi;
    if (koordinat !== undefined) updateData.koordinat = koordinat;
    if (keterangan !== undefined) updateData.keterangan = keterangan;
    if (varietas !== undefined) updateData.varietas = varietas || null;
    if (varietyId !== undefined) updateData.varietyId = varietyId || null;

    // Validate relations if updated
    if (commodityId !== undefined) {
      if (commodityId) {
        const commodity = await prisma.commodity.findUnique({ where: { id: commodityId } });
        if (!commodity) {
          return res.status(400).json({
            status: 'error',
            message: 'Komoditas tidak ditemukan',
          });
        }
        updateData.commodityId = commodityId;
        updateData.komoditasUtama = commodity.namaKomoditas;
      } else {
        updateData.commodityId = null;
        updateData.komoditasUtama = '';
      }
    }



    if (partnerId !== undefined) {
      if (partnerId) {
        const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
        if (!partner) {
          return res.status(400).json({
            status: 'error',
            message: 'Petani mitra tidak ditemukan',
          });
        }
        updateData.partnerId = partnerId;
        updateData.petaniMitra = partner.namaPetani;
      } else {
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
        await deleteFile(existing.image);
      }
      // Upload new file
      updateData.image = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const updated = await greenhouseRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Greenhouse berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating greenhouse:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteGreenhouse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await greenhouseRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data greenhouse tidak ditemukan',
      });
    }

    // Delete image from MinIO if it existed
    if (existing.image) {
      await deleteFile(existing.image);
    }

    await greenhouseRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Greenhouse berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting greenhouse:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
