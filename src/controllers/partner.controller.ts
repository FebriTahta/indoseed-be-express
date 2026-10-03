import { Request, Response } from 'express';
import { partnerRepository } from '../repositories/partner.repository';
import { uploadFile, deleteFile } from '../utils/minio';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../utils/prisma';

export const createPartner = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodePetani,
      namaPetani,
      kelompokTani,
      komoditasUtama,
      commodityId,
      noKtp,
      noTelepon,
      email,
      alamat,
      luasLahan,
      pengalaman,
      tglBergabung,
      status = 'Aktif',
      namaBank,
      noRekening,
      atasNama,
      catatan,
      dokumen,
      lahanList,
    } = req.body;

    // Validate required fields
    if (!kodePetani || !namaPetani || !kelompokTani || !komoditasUtama) {
      return res.status(400).json({
        status: 'error',
        message: 'kodePetani, namaPetani, kelompokTani, and komoditasUtama are required fields',
      });
    }

    // Check uniqueness of kodePetani
    const existing = await partnerRepository.findByKodePetani(kodePetani);
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
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const createdBy = req.user?.username || 'Admin';

    const newPartner = await partnerRepository.create({
      kodePetani,
      namaPetani,
      kelompokTani,
      komoditasUtama,
      commodityId: commodityId || null,
      noKtp: noKtp || null,
      noTelepon: noTelepon || null,
      email: email || null,
      alamat: alamat || null,
      luasLahan: parsedLuas,
      pengalaman: parsedPengalaman,
      tglBergabung: dateBergabung,
      status,
      namaBank: namaBank || null,
      noRekening: noRekening || null,
      atasNama: atasNama || null,
      catatan: catatan || null,
      dokumen: typeof dokumen === 'object' ? JSON.stringify(dokumen) : (dokumen || null),
      dibuatOleh: createdBy,
      diubahOleh: createdBy,
      image: imageUrl,
    });

    // If lahanList is provided, insert them linked to this partner
    if (lahanList) {
      try {
        const parsedLahan = typeof lahanList === 'string' ? JSON.parse(lahanList) : lahanList;
        if (Array.isArray(parsedLahan)) {
          for (let i = 0; i < parsedLahan.length; i++) {
            const item = parsedLahan[i];
            const kodeLahan = item.kodeLahan || `${newPartner.kodePetani}-L${String(i + 1).padStart(2, '0')}`;
            await prisma.greenhouse.create({
              data: {
                kodeLahan,
                namaLahan: item.namaLahan || `Lahan ${i + 1}`,
                jenisLahan: item.jenisLahan || 'Lahan Terbuka',
                komoditasUtama: item.komoditas || item.komoditasUtama || null,
                commodityId: item.commodityId || null,
                varietas: item.varietas || null,
                varietyId: item.varietyId || null,
                lokasi: item.lokasi || newPartner.alamat || 'Lahan Mitra',
                luas: parseFloat(item.luas || 0),
                status: item.status || 'Aktif',
                koordinat: item.koordinat || null,
                detailLokasi: item.detailLokasi || null,
                image: item.image || item.fotoUrl || item.fotoLahan || null,
                keterangan: item.keterangan || (item.dokumenUrl ? JSON.stringify({ dokumenUrl: item.dokumenUrl, dokumenNama: item.dokumenNama, size: item.dokumenSize }) : null),
                petaniMitra: newPartner.namaPetani,
                partnerId: newPartner.id,
                dibuatOleh: createdBy,
              }
            });
          }
        }
      } catch (lahanErr) {
        console.error('Error inserting linked lahan:', lahanErr);
      }
    }

    return res.status(201).json({
      status: 'success',
      message: 'Petani Mitra berhasil dibuat',
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

export const getPartners = async (req: Request, res: Response) => {
  try {
    const {
      search,
      kelompokTani,
      status,
      komoditasUtama,
      commodityId,
      page,
      pageSize,
    } = req.query;

    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string) : 10;

    const result = await partnerRepository.findAll({
      search: search as string,
      kelompokTani: kelompokTani as string,
      status: status as string,
      komoditasUtama: komoditasUtama as string,
      commodityId: commodityId as string,
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
  } catch (error: any) {
    console.error('Error fetching partners:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const partner = await partnerRepository.findById(id);

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
  } catch (error: any) {
    console.error('Error fetching partner by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updatePartner = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await partnerRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data petani mitra tidak ditemukan',
      });
    }

    const {
      kodePetani,
      namaPetani,
      kelompokTani,
      komoditasUtama,
      commodityId,
      noKtp,
      noTelepon,
      email,
      alamat,
      luasLahan,
      pengalaman,
      tglBergabung,
      status,
      namaBank,
      noRekening,
      atasNama,
      catatan,
      dokumen,
    } = req.body;

    const updateData: any = {};

    // Validate uniqueness of new kodePetani if updated
    if (kodePetani !== undefined && kodePetani !== existing.kodePetani) {
      const codeCheck = await partnerRepository.findByKodePetani(kodePetani);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Petani Mitra dengan kode '${kodePetani}' sudah terdaftar`,
        });
      }
      updateData.kodePetani = kodePetani;
    }

    if (namaPetani !== undefined) updateData.namaPetani = namaPetani;
    if (kelompokTani !== undefined) updateData.kelompokTani = kelompokTani;
    if (komoditasUtama !== undefined) updateData.komoditasUtama = komoditasUtama;
    if (commodityId !== undefined) updateData.commodityId = commodityId || null;
    if (noKtp !== undefined) updateData.noKtp = noKtp || null;
    if (noTelepon !== undefined) updateData.noTelepon = noTelepon || null;
    if (email !== undefined) updateData.email = email || null;
    if (alamat !== undefined) updateData.alamat = alamat || null;
    if (status !== undefined) updateData.status = status;
    if (namaBank !== undefined) updateData.namaBank = namaBank || null;
    if (noRekening !== undefined) updateData.noRekening = noRekening || null;
    if (atasNama !== undefined) updateData.atasNama = atasNama || null;
    if (catatan !== undefined) updateData.catatan = catatan || null;
    if (dokumen !== undefined) updateData.dokumen = typeof dokumen === 'object' ? JSON.stringify(dokumen) : (dokumen || null);

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
        await deleteFile(existing.image);
      }
      // Upload new file
      updateData.image = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const updated = await partnerRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Petani Mitra berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating partner:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await partnerRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data petani mitra tidak ditemukan',
      });
    }

    // Delete image from MinIO if it existed
    if (existing.image) {
      await deleteFile(existing.image);
    }

    await partnerRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Petani Mitra berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting partner:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
