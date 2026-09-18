import { Request, Response } from 'express';
import { jadwalTanamRepository } from '../repositories/jadwalTanam.repository';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../utils/prisma';

const parseDate = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'string') {
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]!, 10);
        const month = parseInt(parts[1]!, 10) - 1;
        const year = parseInt(parts[2]!, 10);
        return new Date(year, month, day);
      }
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const parseJsonSafely = (val: any) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(val) ? val : [];
};

export const getJadwalTanamStats = async (req: Request, res: Response) => {
  try {
    const stats = await jadwalTanamRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching Jadwal Tanam stats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getNextKodeJadwalTanam = async (req: Request, res: Response) => {
  try {
    const nextCode = await jadwalTanamRepository.getNextKodeJadwalTanam();
    return res.status(200).json({
      status: 'success',
      data: { nextKodeJadwalTanam: nextCode },
    });
  } catch (error: any) {
    console.error('Error getting next kode jadwal tanam:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getJadwalTanams = async (req: Request, res: Response) => {
  try {
    const {
      search,
      statusJadwal,
      commodityId,
      varietyId,
      partnerId,
      namaPetani,
      greenhouseId,
      periodeTanam,
      musimTanam,
      page,
      pageSize,
    } = req.query;

    const parsedPage = page ? parseInt(page as string, 10) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string, 10) : 10;

    const result = await jadwalTanamRepository.findAll({
      search: search as string,
      statusJadwal: statusJadwal as string,
      commodityId: commodityId as string,
      varietyId: varietyId as string,
      partnerId: partnerId as string,
      namaPetani: namaPetani as string,
      greenhouseId: greenhouseId as string,
      periodeTanam: periodeTanam as string,
      musimTanam: musimTanam as string,
      page: isNaN(parsedPage) ? 1 : parsedPage,
      pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data Jadwal Tanam berhasil diambil',
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching Jadwal Tanam list:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getJadwalTanamById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let item = await jadwalTanamRepository.findById(id);
    if (!item) {
      item = await jadwalTanamRepository.findByKode(id);
    }
    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Jadwal Tanam tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Jadwal Tanam detail:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const createJadwalTanam = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body || {};

    let kodeJadwalTanam = body.kodeJadwalTanam;
    if (!kodeJadwalTanam || kodeJadwalTanam.includes('Auto') || kodeJadwalTanam.trim() === '') {
      kodeJadwalTanam = await jadwalTanamRepository.getNextKodeJadwalTanam();
    } else {
      const existing = await jadwalTanamRepository.findByKode(kodeJadwalTanam);
      if (existing) {
        kodeJadwalTanam = await jadwalTanamRepository.getNextKodeJadwalTanam();
      }
    }

    const createdBy = req.user?.username || body.dibuatOleh || 'Admin';

    // Auto resolve relations
    let partnerId = body.partnerId || null;
    let namaPetani = body.namaPetani || null;
    let kodePetani = body.kodePetani || null;

    if (partnerId) {
      const p = await prisma.partner.findUnique({ where: { id: partnerId } });
      if (p) {
        namaPetani = p.namaPetani;
        kodePetani = p.kodePetani;
      }
    } else if (namaPetani) {
      const p = await prisma.partner.findFirst({
        where: { namaPetani: { contains: namaPetani } },
      });
      if (p) {
        partnerId = p.id;
        kodePetani = p.kodePetani;
      }
    }

    let commodityId = body.commodityId || null;
    let komoditas = body.komoditas || null;
    if (commodityId) {
      const c = await prisma.commodity.findUnique({ where: { id: commodityId } });
      if (c) komoditas = c.namaKomoditas;
    } else if (komoditas) {
      const c = await prisma.commodity.findFirst({
        where: { namaKomoditas: { contains: komoditas } },
      });
      if (c) commodityId = c.id;
    }

    let varietyId = body.varietyId || null;
    let varietas = body.varietas || null;
    if (varietyId) {
      const v = await prisma.variety.findUnique({ where: { id: varietyId } });
      if (v) varietas = v.namaVarietas;
    } else if (varietas) {
      const v = await prisma.variety.findFirst({
        where: { namaVarietas: { contains: varietas } },
      });
      if (v) varietyId = v.id;
    }

    // Detail Lahan Array
    const detailLahanRaw = parseJsonSafely(body.detailLahan || body.detailRencanaTanam);
    const detailLahan = detailLahanRaw.map((dl: any) => ({
      namaLahan: dl.namaLahan || dl.lahan || 'Lahan',
      kodeLahan: dl.kodeLahan || null,
      greenhouseId: dl.greenhouseId || null,
      luas: parseFloat(String(dl.luas || '0').replace(',', '.')) || 0,
      tipeLahan: dl.tipeLahan || dl.tipe || 'Lahan Terbuka',
      irigasi: dl.irigasi || null,
      sumberAir: dl.sumberAir || null,
      komoditasVarietas: dl.komoditasVarietas || `${komoditas || ''} / ${varietas || ''}`.trim(),
      rencanaTanam: parseDate(dl.rencanaTanam || body.tanggalTanam),
      estimasiPanen: parseDate(dl.estimasiPanen || body.perkiraanPanen),
      targetProduksi: parseFloat(String(dl.targetProduksi || '0').replace(',', '.')) || 0,
      statusLahan: dl.statusLahan || 'Siap Tanam',
      keterangan: dl.keterangan || null,
    }));

    const personilRaw = parseJsonSafely(body.personil || body.personilList);
    const personil = personilRaw.map((p: any) => ({
      nama: p.nama || p.namaPersonil || '',
      peran: p.peran || p.jabatan || 'Personil',
      kontak: p.kontak || p.noHp || null,
      tugas: p.tugas || p.keterangan || null,
    }));

    const peralatanRaw = parseJsonSafely(body.peralatan || body.peralatanList);
    const peralatan = peralatanRaw.map((eq: any) => ({
      nama: eq.nama || eq.namaAlat || '',
      jenis: eq.jenis || eq.kategori || 'Peralatan',
      jumlah: parseInt(eq.jumlah, 10) || 1,
      satuan: eq.satuan || 'Unit',
      kondisi: eq.kondisi || 'Baik',
    }));

    const dokumenRaw = parseJsonSafely(body.dokumen || body.dokumenList);
    const dokumen = dokumenRaw.map((doc: any) => ({
      nama: doc.name || doc.nama || 'Dokumen',
      fileUrl: doc.url || doc.fileUrl || '',
      fileSize: null,
      fileType: doc.type || doc.fileType || null,
    }));

    const newJadwalTanam = await jadwalTanamRepository.create({
      kodeJadwalTanam,
      perencanaanProduksiId: body.perencanaanProduksiId || null,
      partnerId,
      namaPetani,
      kodePetani,
      komoditas,
      varietas,
      periodeTanam: body.periodeTanam,
      periodeTanamMulai: parseDate(body.periodeTanamMulai || body.tanggalTanam),
      periodeTanamSelesai: parseDate(body.periodeTanamSelesai || body.perkiraanPanen),
      musimTanam: body.musimTanam || 'Musim Kemarau',
      tujuanProduksi: body.tujuanProduksi || 'Benih Bersertifikat',
      tipeProduksi: body.tipeProduksi || 'FS (Foundation Seed)',
      statusJadwal: body.statusJadwal || 'Dalam Proses',
      penanggungJawab: body.penanggungJawab || createdBy,
      deskripsi: body.deskripsi || null,
      keterangan: body.keterangan || '-',

      greenhouseId: body.greenhouseId || null,
      commodityId,
      varietyId,
      luasTanam: parseFloat(String(body.luasTanam || '0').replace(',', '.')) || 0,
      asalBenih: body.asalBenih || null,
      jumlahBenihDiperlukan: parseFloat(String(body.jumlahBenihDiperlukan || '0').replace(',', '.')) || 0,
      jarakTanam: body.jarakTanam || '25 cm x 25 cm',
      sistemTanam: body.sistemTanam || 'Jajar Legowo 4:1',
      targetProduksi: parseFloat(String(body.targetProduksi || '0').replace(',', '.')) || 0,
      estimasiHasilPerHa: parseFloat(String(body.estimasiHasilPerHa || '0').replace(',', '.')) || 0,
      standarKualitas: body.standarKualitas || null,
      perkecambahanMin: parseFloat(String(body.perkecambahanMin || '0').replace(',', '.')) || 0,

      tanggalPersemaian: parseDate(body.tanggalPersemaian),
      tanggalTanam: parseDate(body.tanggalTanam),
      perkiraanPanen: parseDate(body.perkiraanPanen),
      siklusTanamHari: parseInt(body.siklusTanamHari, 10) || 0,
      metodeTanam: body.metodeTanam || 'Pindah Tanam',
      kepadatanTanam: body.kepadatanTanam ? String(body.kepadatanTanam) : null,
      irigasi: body.irigasi || body.sistemIrigasi,
      sumberAir: body.sumberAir,
      catatan: body.catatan,

      dibuatOleh: createdBy,
      diubahOleh: createdBy,

      detailLahan,
      personil,
      peralatan,
      dokumen,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Jadwal Tanam berhasil dibuat',
      data: newJadwalTanam,
    });
  } catch (error: any) {
    console.error('Error creating Jadwal Tanam:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateJadwalTanam = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let existing = await jadwalTanamRepository.findById(id);
    if (!existing) {
      existing = await jadwalTanamRepository.findByKode(id);
    }
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Jadwal Tanam tidak ditemukan',
      });
    }

    const body = req.body || {};
    const updatedBy = req.user?.username || 'Admin';

    const updatePayload: any = {
      diubahOleh: updatedBy,
    };

    if (body.kodeJadwalTanam) updatePayload.kodeJadwalTanam = body.kodeJadwalTanam;
    if (body.perencanaanProduksiId !== undefined) updatePayload.perencanaanProduksiId = body.perencanaanProduksiId || null;
    if (body.partnerId !== undefined) {
      updatePayload.partnerId = body.partnerId || null;
      if (body.partnerId) {
        const p = await prisma.partner.findUnique({ where: { id: body.partnerId } });
        if (p) {
          updatePayload.namaPetani = p.namaPetani;
          updatePayload.kodePetani = p.kodePetani;
        }
      }
    }
    if (body.namaPetani !== undefined) updatePayload.namaPetani = body.namaPetani;
    if (body.kodePetani !== undefined) updatePayload.kodePetani = body.kodePetani;
    if (body.komoditas !== undefined) updatePayload.komoditas = body.komoditas;
    if (body.varietas !== undefined) updatePayload.varietas = body.varietas;
    if (body.commodityId !== undefined) updatePayload.commodityId = body.commodityId || null;
    if (body.varietyId !== undefined) updatePayload.varietyId = body.varietyId || null;
    if (body.greenhouseId !== undefined) updatePayload.greenhouseId = body.greenhouseId || null;

    if (body.periodeTanam !== undefined) updatePayload.periodeTanam = body.periodeTanam;
    if (body.periodeTanamMulai !== undefined) updatePayload.periodeTanamMulai = parseDate(body.periodeTanamMulai);
    if (body.periodeTanamSelesai !== undefined) updatePayload.periodeTanamSelesai = parseDate(body.periodeTanamSelesai);
    if (body.musimTanam !== undefined) updatePayload.musimTanam = body.musimTanam;
    if (body.tujuanProduksi !== undefined) updatePayload.tujuanProduksi = body.tujuanProduksi;
    if (body.tipeProduksi !== undefined) updatePayload.tipeProduksi = body.tipeProduksi;
    if (body.statusJadwal !== undefined) updatePayload.statusJadwal = body.statusJadwal;
    if (body.penanggungJawab !== undefined) updatePayload.penanggungJawab = body.penanggungJawab;
    if (body.deskripsi !== undefined) updatePayload.deskripsi = body.deskripsi;
    if (body.keterangan !== undefined) updatePayload.keterangan = body.keterangan;

    if (body.luasTanam !== undefined) updatePayload.luasTanam = parseFloat(String(body.luasTanam || '0').replace(',', '.')) || 0;
    if (body.asalBenih !== undefined) updatePayload.asalBenih = body.asalBenih;
    if (body.jumlahBenihDiperlukan !== undefined) updatePayload.jumlahBenihDiperlukan = parseFloat(String(body.jumlahBenihDiperlukan || '0').replace(',', '.')) || 0;
    if (body.jarakTanam !== undefined) updatePayload.jarakTanam = body.jarakTanam;
    if (body.sistemTanam !== undefined) updatePayload.sistemTanam = body.sistemTanam;
    if (body.targetProduksi !== undefined) updatePayload.targetProduksi = parseFloat(String(body.targetProduksi || '0').replace(',', '.')) || 0;
    if (body.estimasiHasilPerHa !== undefined) updatePayload.estimasiHasilPerHa = parseFloat(String(body.estimasiHasilPerHa || '0').replace(',', '.')) || 0;
    if (body.standarKualitas !== undefined) updatePayload.standarKualitas = body.standarKualitas;
    if (body.perkecambahanMin !== undefined) updatePayload.perkecambahanMin = parseFloat(String(body.perkecambahanMin || '0').replace(',', '.')) || 0;

    if (body.tanggalPersemaian !== undefined) updatePayload.tanggalPersemaian = parseDate(body.tanggalPersemaian);
    if (body.tanggalTanam !== undefined) updatePayload.tanggalTanam = parseDate(body.tanggalTanam);
    if (body.perkiraanPanen !== undefined) updatePayload.perkiraanPanen = parseDate(body.perkiraanPanen);
    if (body.siklusTanamHari !== undefined) updatePayload.siklusTanamHari = parseInt(body.siklusTanamHari, 10) || 0;
    if (body.metodeTanam !== undefined) updatePayload.metodeTanam = body.metodeTanam;
    if (body.kepadatanTanam !== undefined) updatePayload.kepadatanTanam = body.kepadatanTanam ? String(body.kepadatanTanam) : null;
    if (body.irigasi !== undefined) updatePayload.irigasi = body.irigasi;
    if (body.sumberAir !== undefined) updatePayload.sumberAir = body.sumberAir;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    if (body.detailLahan !== undefined || body.detailRencanaTanam !== undefined) {
      const detailLahanRaw = parseJsonSafely(body.detailLahan || body.detailRencanaTanam);
      updatePayload.detailLahan = detailLahanRaw.map((dl: any) => ({
        namaLahan: dl.namaLahan || dl.lahan || 'Lahan',
        kodeLahan: dl.kodeLahan || null,
        greenhouseId: dl.greenhouseId || null,
        luas: parseFloat(String(dl.luas || '0').replace(',', '.')) || 0,
        tipeLahan: dl.tipeLahan || dl.tipe || 'Lahan Terbuka',
        irigasi: dl.irigasi || null,
        sumberAir: dl.sumberAir || null,
        komoditasVarietas: dl.komoditasVarietas || `${body.komoditas || existing.komoditas || ''} / ${body.varietas || existing.varietas || ''}`.trim(),
        rencanaTanam: parseDate(dl.rencanaTanam || body.tanggalTanam || existing.tanggalTanam),
        estimasiPanen: parseDate(dl.estimasiPanen || body.perkiraanPanen || existing.perkiraanPanen),
        targetProduksi: parseFloat(String(dl.targetProduksi || '0').replace(',', '.')) || 0,
        statusLahan: dl.statusLahan || 'Siap Tanam',
        keterangan: dl.keterangan || null,
      }));
    }

    const updated = await jadwalTanamRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Jadwal Tanam berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Jadwal Tanam:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateJadwalTanamStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id || '');
    const { statusJadwal, keterangan } = req.body;

    if (!statusJadwal) {
      return res.status(400).json({
        status: 'error',
        message: 'Status jadwal wajib diisi',
      });
    }

    let existing = await jadwalTanamRepository.findById(id);
    if (!existing) {
      existing = await jadwalTanamRepository.findByKode(id);
    }
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Jadwal Tanam tidak ditemukan',
      });
    }

    const updatedBy = req.user?.username || 'Admin';
    const updated = await jadwalTanamRepository.updateStatus(existing.id, statusJadwal, keterangan, updatedBy);

    return res.status(200).json({
      status: 'success',
      message: `Status jadwal tanam berhasil diubah menjadi ${statusJadwal}`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating status Jadwal Tanam:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteJadwalTanam = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let existing = await jadwalTanamRepository.findById(id);
    if (!existing) {
      existing = await jadwalTanamRepository.findByKode(id);
    }
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Jadwal Tanam tidak ditemukan',
      });
    }

    await jadwalTanamRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Jadwal Tanam berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Jadwal Tanam:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};
