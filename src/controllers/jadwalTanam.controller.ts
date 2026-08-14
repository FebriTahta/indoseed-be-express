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

const resolveGreenhouseId = async (idOrCode: any): Promise<string | null> => {
  if (!idOrCode || typeof idOrCode !== 'string') return null;
  const trimmed = idOrCode.trim();
  if (!trimmed) return null;

  try {
    const byId = await prisma.greenhouse.findUnique({ where: { id: trimmed } });
    if (byId) return byId.id;
  } catch (e) {}

  try {
    const byKode = await prisma.greenhouse.findUnique({ where: { kodeLahan: trimmed } });
    if (byKode) return byKode.id;
  } catch (e) {}

  try {
    const byNama = await prisma.greenhouse.findFirst({ where: { namaLahan: trimmed } });
    if (byNama) return byNama.id;
  } catch (e) {}

  return null;
};

const resolveCommodityId = async (idOrCode: any): Promise<string | null> => {
  if (!idOrCode || typeof idOrCode !== 'string') return null;
  const trimmed = idOrCode.trim();
  if (!trimmed) return null;

  try {
    const byId = await prisma.commodity.findUnique({ where: { id: trimmed } });
    if (byId) return byId.id;
  } catch (e) {}

  try {
    const byKode = await prisma.commodity.findUnique({ where: { kodeKomoditas: trimmed } });
    if (byKode) return byKode.id;
  } catch (e) {}

  try {
    const byNama = await prisma.commodity.findFirst({ where: { namaKomoditas: trimmed } });
    if (byNama) return byNama.id;
  } catch (e) {}

  return null;
};

const resolveVarietyId = async (idOrCode: any): Promise<string | null> => {
  if (!idOrCode || typeof idOrCode !== 'string') return null;
  const trimmed = idOrCode.trim();
  if (!trimmed) return null;

  try {
    const byId = await prisma.variety.findUnique({ where: { id: trimmed } });
    if (byId) return byId.id;
  } catch (e) {}

  try {
    const byKode = await prisma.variety.findUnique({ where: { kodeVarietas: trimmed } });
    if (byKode) return byKode.id;
  } catch (e) {}

  try {
    const byNama = await prisma.variety.findFirst({ where: { namaVarietas: trimmed } });
    if (byNama) return byNama.id;
  } catch (e) {}

  return null;
};

export const createJadwalTanam = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body || {};

    let kodeJadwalTanam = body.kodeJadwalTanam;
    if (!kodeJadwalTanam || kodeJadwalTanam.includes('Auto')) {
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      kodeJadwalTanam = `JT-${dateStr}-${randomNum}`;
    }

    // Check duplicate code
    const existing = await jadwalTanamRepository.findByKode(kodeJadwalTanam);
    if (existing) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      kodeJadwalTanam = `${kodeJadwalTanam}-${randomNum}`;
    }

    const createdBy = req.user?.username || body.dibuatOleh || 'Admin';

    // Resolve FK IDs
    const greenhouseId = await resolveGreenhouseId(body.greenhouseId || body.idLahan || body.namaLahan);
    const commodityId = await resolveCommodityId(body.commodityId || body.komoditas || body.namaKomoditas);
    const varietyId = await resolveVarietyId(body.varietyId || body.varietas || body.namaVarietas);

    // Extract detail arrays if passed as stringified JSON or array
    const detailLahanRaw = parseJsonSafely(body.detailLahan || body.detailRencanaTanam);
    const personilRaw = parseJsonSafely(body.personil || body.personilList);
    const peralatanRaw = parseJsonSafely(body.peralatan || body.peralatanList);
    const dokumenRaw = parseJsonSafely(body.dokumen || body.dokumenList);

    const detailLahan = await Promise.all(
      detailLahanRaw.map(async (item: any) => {
        const ghId = await resolveGreenhouseId(item.greenhouseId || item.idLahan || item.lahan || item.namaLahan);
        return {
          greenhouseId: ghId,
          namaLahan: item.lahan || item.namaLahan || 'Lahan',
          luas: parseFloat(String(item.luas || '0').replace(',', '.')) || 0,
          tipeLahan: item.tipe || item.tipeLahan || 'Lahan Terbuka',
          irigasi: item.irigasi || null,
          sumberAir: item.sumberAir || null,
        };
      })
    );

    const personil = personilRaw.map((p: any) => ({
      nama: p.nama || p.namaPersonil || '',
      peran: p.peran || p.jabatan || 'Personil',
      kontak: p.kontak || p.noHp || null,
      tugas: p.tugas || p.keterangan || null,
    }));

    const peralatan = peralatanRaw.map((eq: any) => ({
      nama: eq.nama || eq.namaAlat || '',
      jenis: eq.jenis || eq.kategori || 'Peralatan',
      jumlah: parseInt(eq.jumlah, 10) || 1,
      satuan: eq.satuan || 'Unit',
      kondisi: eq.kondisi || 'Baik',
    }));

    const dokumen = dokumenRaw.map((doc: any) => ({
      nama: doc.name || doc.nama || 'Dokumen',
      fileUrl: doc.url || doc.fileUrl || '',
      fileSize: null,
      fileType: doc.type || doc.fileType || null,
    }));

    const newJadwalTanam = await jadwalTanamRepository.create({
      kodeJadwalTanam,
      periodeTanam: body.periodeTanam,
      periodeTanamMulai: parseDate(body.periodeTanamMulai || body.tanggalMulaiTanam),
      periodeTanamSelesai: parseDate(body.periodeTanamSelesai || body.perkiraanTanggalSelesai),
      musimTanam: body.musimTanam || 'Musim Kemarau',
      tujuanProduksi: body.tujuanProduksi || 'Benih Bersertifikat',
      tipeProduksi: body.tipeProduksi || 'FS (Foundation Seed)',
      statusJadwal: body.statusJadwal || 'Draft',
      penanggungJawab: body.penanggungJawab,
      deskripsi: body.deskripsi,

      greenhouseId,
      commodityId,
      varietyId,
      luasTanam: parseFloat(String(body.luasTanam || body.luasTotal || '0').replace(',', '.')) || 0,
      asalBenih: body.asalBenih,
      jumlahBenihDiperlukan: parseFloat(String(body.jumlahBenihDiperlukan || '0').replace(',', '.')) || 0,
      jarakTanam: body.jarakTanam || '25 cm x 25 cm',
      sistemTanam: body.sistemTanam || 'Jajar Legowo 4:1',
      targetProduksi: parseFloat(String(body.targetProduksi || '0').replace(',', '.')) || 0,
      standarKualitas: body.standarKualitas,
      perkecambahanMin: parseFloat(String(body.perkecambahan || body.perkecambahanMin || '0').replace(',', '.')) || 0,

      tanggalPersemaian: parseDate(body.tanggalPersemaian),
      tanggalTanam: parseDate(body.tanggalTanam),
      perkiraanPanen: parseDate(body.perkiraanPanen),
      siklusTanamHari: parseInt(body.siklusTanamHari, 10) || 0,
      metodeTanam: body.metodeTanam,
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

export const getJadwalTanams = async (req: Request, res: Response) => {
  try {
    const {
      search,
      statusJadwal,
      commodityId,
      varietyId,
      greenhouseId,
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
      greenhouseId: greenhouseId as string,
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
    if (body.periodeTanam) updatePayload.periodeTanam = body.periodeTanam;
    if (body.periodeTanamMulai) updatePayload.periodeTanamMulai = parseDate(body.periodeTanamMulai);
    if (body.periodeTanamSelesai) updatePayload.periodeTanamSelesai = parseDate(body.periodeTanamSelesai);
    if (body.musimTanam) updatePayload.musimTanam = body.musimTanam;
    if (body.tujuanProduksi) updatePayload.tujuanProduksi = body.tujuanProduksi;
    if (body.tipeProduksi) updatePayload.tipeProduksi = body.tipeProduksi;
    if (body.statusJadwal) updatePayload.statusJadwal = body.statusJadwal;
    if (body.penanggungJawab !== undefined) updatePayload.penanggungJawab = body.penanggungJawab;
    if (body.deskripsi !== undefined) updatePayload.deskripsi = body.deskripsi;

    if (body.greenhouseId || body.idLahan || body.namaLahan) {
      updatePayload.greenhouseId = await resolveGreenhouseId(body.greenhouseId || body.idLahan || body.namaLahan);
    }
    if (body.commodityId || body.komoditas || body.namaKomoditas) {
      updatePayload.commodityId = await resolveCommodityId(body.commodityId || body.komoditas || body.namaKomoditas);
    }
    if (body.varietyId || body.varietas || body.namaVarietas) {
      updatePayload.varietyId = await resolveVarietyId(body.varietyId || body.varietas || body.namaVarietas);
    }

    if (body.luasTanam !== undefined) updatePayload.luasTanam = parseFloat(String(body.luasTanam || '0').replace(',', '.')) || 0;
    if (body.asalBenih !== undefined) updatePayload.asalBenih = body.asalBenih;
    if (body.jumlahBenihDiperlukan !== undefined) updatePayload.jumlahBenihDiperlukan = parseFloat(String(body.jumlahBenihDiperlukan || '0').replace(',', '.')) || 0;
    if (body.jarakTanam !== undefined) updatePayload.jarakTanam = body.jarakTanam;
    if (body.sistemTanam !== undefined) updatePayload.sistemTanam = body.sistemTanam;

    if (body.tanggalPersemaian) updatePayload.tanggalPersemaian = parseDate(body.tanggalPersemaian);
    if (body.tanggalTanam) updatePayload.tanggalTanam = parseDate(body.tanggalTanam);
    if (body.perkiraanPanen) updatePayload.perkiraanPanen = parseDate(body.perkiraanPanen);
    if (body.siklusTanamHari !== undefined) updatePayload.siklusTanamHari = parseInt(body.siklusTanamHari, 10) || 0;
    if (body.metodeTanam !== undefined) updatePayload.metodeTanam = body.metodeTanam;
    if (body.kepadatanTanam !== undefined) updatePayload.kepadatanTanam = String(body.kepadatanTanam);
    if (body.irigasi !== undefined || body.sistemIrigasi !== undefined) updatePayload.irigasi = body.irigasi || body.sistemIrigasi;
    if (body.sumberAir !== undefined) updatePayload.sumberAir = body.sumberAir;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    if (body.detailLahan || body.detailRencanaTanam) {
      const detailLahanRaw = parseJsonSafely(body.detailLahan || body.detailRencanaTanam);
      updatePayload.detailLahan = await Promise.all(
        detailLahanRaw.map(async (item: any) => {
          const ghId = await resolveGreenhouseId(item.greenhouseId || item.idLahan || item.lahan || item.namaLahan);
          return {
            greenhouseId: ghId,
            namaLahan: item.lahan || item.namaLahan || 'Lahan',
            luas: parseFloat(String(item.luas || '0').replace(',', '.')) || 0,
            tipeLahan: item.tipe || item.tipeLahan || 'Lahan Terbuka',
            irigasi: item.irigasi || null,
            sumberAir: item.sumberAir || null,
          };
        })
      );
    }

    if (body.personil || body.personilList) {
      const personilRaw = parseJsonSafely(body.personil || body.personilList);
      updatePayload.personil = personilRaw.map((p: any) => ({
        nama: p.nama || p.namaPersonil || '',
        peran: p.peran || p.jabatan || 'Personil',
        kontak: p.kontak || p.noHp || null,
        tugas: p.tugas || p.keterangan || null,
      }));
    }

    if (body.peralatan || body.peralatanList) {
      const peralatanRaw = parseJsonSafely(body.peralatan || body.peralatanList);
      updatePayload.peralatan = peralatanRaw.map((eq: any) => ({
        nama: eq.nama || eq.namaAlat || '',
        jenis: eq.jenis || eq.kategori || 'Peralatan',
        jumlah: parseInt(eq.jumlah, 10) || 1,
        satuan: eq.satuan || 'Unit',
        kondisi: eq.kondisi || 'Baik',
      }));
    }

    if (body.dokumen || body.dokumenList) {
      const dokumenRaw = parseJsonSafely(body.dokumen || body.dokumenList);
      updatePayload.dokumen = dokumenRaw.map((doc: any) => ({
        nama: doc.name || doc.nama || 'Dokumen',
        fileUrl: doc.url || doc.fileUrl || '',
        fileSize: null,
        fileType: doc.type || doc.fileType || null,
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
      message: 'Internal server error',
    });
  }
};
