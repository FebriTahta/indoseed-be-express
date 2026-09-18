import { Request, Response } from 'express';
import { panenRepository } from '../repositories/panen.repository';
import prisma from '../utils/prisma';

export const getPanens = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      status,
      jenisHasil,
      petani,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Auto-seed if empty
    const totalCount = await panenRepository.countAll();
    if (totalCount === 0) {
      await seedInitialPanens();
    }

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      status: status ? String(status) : undefined,
      jenisHasil: jenisHasil ? String(jenisHasil) : undefined,
      petani: petani ? String(petani) : undefined,
      startDate: startDate ? new Date(String(startDate)) : undefined,
      endDate: endDate ? new Date(String(endDate)) : undefined,
      skip,
      take,
    };

    const { data, total } = await panenRepository.findAll(filters);
    const stats = await panenRepository.getStats();

    return res.status(200).json({
      status: 'success',
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getPanenById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id ? String(req.params.id) : '';
    let item = await panenRepository.findById(id);
    if (!item) {
      item = await panenRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data panen tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Panen by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getPanenStats = async (req: Request, res: Response) => {
  try {
    const stats = await panenRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching Panen stats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getRingkasanKomoditas = async (req: Request, res: Response) => {
  try {
    const ringkasan = await panenRepository.getRingkasanKomoditas();
    return res.status(200).json({
      status: 'success',
      data: ringkasan,
    });
  } catch (error: any) {
    console.error('Error fetching Ringkasan Komoditas:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getChartHasilPanen = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '7_hari';
    const chartData = await panenRepository.getChartData(period);
    return res.status(200).json({
      status: 'success',
      data: chartData,
    });
  } catch (error: any) {
    console.error('Error fetching Chart Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getEligibleJadwalTanam = async (req: Request, res: Response) => {
  try {
    const eligibleJadwals = await panenRepository.findEligibleJadwalTanam();
    return res.status(200).json({
      status: 'success',
      data: eligibleJadwals,
      total: eligibleJadwals.length,
    });
  } catch (error: any) {
    console.error('Error fetching Eligible Jadwal Tanam:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getNextPanenCode = async (req: Request, res: Response) => {
  try {
    const nextCode = await panenRepository.getNextKodePanen();
    return res.status(200).json({
      status: 'success',
      kodePanen: nextCode,
    });
  } catch (error: any) {
    console.error('Error generating next code:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createPanen = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const kodePanen = body.kodePanen || (await panenRepository.getNextKodePanen());

    const created = await panenRepository.create({
      kodePanen,
      jadwalTanamId: body.jadwalTanamId || undefined,
      kodeJadwalTanam: body.kodeJadwalTanam || undefined,
      kesiapanPanenId: body.kesiapanPanenId || undefined,
      commodityId: body.commodityId || undefined,
      varietyId: body.varietyId || undefined,
      kesiapanLahanId: body.kesiapanLahanId || undefined,
      jenisHasil: body.jenisHasil || 'Glondong / Buah',
      komoditas: body.komoditas || 'Melon',
      varietas: body.varietas || 'Melon Tere F1',
      petani: body.petani || 'Budi Santoso',
      petaniKode: body.petaniKode || 'BTN-001',
      lahan: body.lahan || 'LHN-001 / Blok 01',
      blokLahan: body.blokLahan || 'Blok 01',
      rencanaPanen: body.rencanaPanen ? new Date(body.rencanaPanen) : new Date(),
      tanggalPanen: body.tanggalPanen ? new Date(body.tanggalPanen) : new Date(),
      luasHa: parseFloat(String(body.luasHa || 1.0).replace(',', '.')),
      perkiraanHasil: parseFloat(String(body.perkiraanHasil || 1500).replace(',', '.')),
      produksiKg: parseFloat(String(body.produksiKg || body.beratNetto || 1480).replace(',', '.')),
      jumlahBuah: parseInt(String(body.jumlahBuah || 0), 10),
      beratBruto: parseFloat(String(body.beratBruto || 1520).replace(',', '.')),
      beratNetto: parseFloat(String(body.beratNetto || 1480).replace(',', '.')),
      kondisiHasil: body.kondisiHasil || 'Baik',
      statusPengolahan: body.statusPengolahan || 'Menunggu Pengolahan',
      status: body.status || 'Selesai',
      penanggungJawab: body.penanggungJawab || 'Admin Produksi',
      metodePanen: body.metodePanen || 'Manual / Mesin',
      catatan: body.catatan || '',
      dokumentasi: body.dokumentasi || [
        '/images/pemeriksaan/field-1.jpg',
        '/images/pemeriksaan/field-2.jpg',
        '/images/pemeriksaan/field-3.jpg',
        '/images/pemeriksaan/field-4.jpg',
      ],
      dibuatOleh: 'Admin Produksi',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data panen berhasil disimpan',
      data: created,
    });
  } catch (error: any) {
    console.error('Error creating Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updatePanen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    let existing = await panenRepository.findById(id);
    if (!existing) {
      existing = await panenRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data panen tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = { ...body };

    if (body.tanggalPanen) updatePayload.tanggalPanen = new Date(body.tanggalPanen);
    if (body.rencanaPanen) updatePayload.rencanaPanen = new Date(body.rencanaPanen);
    if (body.luasHa !== undefined) updatePayload.luasHa = parseFloat(String(body.luasHa).replace(',', '.'));
    if (body.produksiKg !== undefined) updatePayload.produksiKg = parseFloat(String(body.produksiKg).replace(',', '.'));
    if (body.beratNetto !== undefined) updatePayload.beratNetto = parseFloat(String(body.beratNetto).replace(',', '.'));
    if (body.beratBruto !== undefined) updatePayload.beratBruto = parseFloat(String(body.beratBruto).replace(',', '.'));

    const updated = await panenRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data panen berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deletePanen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    let existing = await panenRepository.findById(id);
    if (!existing) {
      existing = await panenRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data panen tidak ditemukan',
      });
    }

    await panenRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data panen berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

// Seed initial reference items matching user's image
const seedInitialPanens = async () => {
  const initialData = [
    {
      kodePanen: 'PN-2026-06-0018',
      kodeJadwalTanam: 'JT-2026-0018',
      petani: 'Budi Santoso',
      petaniKode: 'BTN-001',
      lahan: 'LHN-001 / Blok 01',
      blokLahan: 'Blok 01',
      jenisHasil: 'Glondong / Buah',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      rencanaPanen: new Date('2026-09-30'),
      tanggalPanen: new Date('2026-09-28'),
      luasHa: 1.00,
      perkiraanHasil: 1500,
      produksiKg: 1480,
      jumlahBuah: 1520,
      beratBruto: 1520,
      beratNetto: 1480,
      kondisiHasil: 'Baik',
      status: 'Selesai',
      statusPengolahan: 'Menunggu Pengolahan',
      catatan: 'Kondisi tanaman sehat dan hasil panen sesuai standar.',
      penanggungJawab: 'Admin Produksi',
      dokumentasi: [
        '/images/pemeriksaan/field-1.jpg',
        '/images/pemeriksaan/field-2.jpg',
        '/images/pemeriksaan/field-3.jpg',
        '/images/pemeriksaan/field-4.jpg',
      ],
    },
    {
      kodePanen: 'PN-2026-06-0017',
      kodeJadwalTanam: 'JT-2026-0017',
      petani: 'Siti Rahayu',
      petaniKode: 'SRN-002',
      lahan: 'LHN-002 / Blok 02',
      blokLahan: 'Blok 02',
      jenisHasil: 'OC / Benih',
      komoditas: 'Cabai',
      varietas: 'Cabai Keriting',
      rencanaPanen: new Date('2026-11-01'),
      tanggalPanen: new Date('2026-11-01'),
      luasHa: 1.20,
      perkiraanHasil: 2000,
      produksiKg: 0,
      jumlahBuah: 0,
      beratBruto: 0,
      beratNetto: 0,
      kondisiHasil: 'Baik',
      status: 'Dalam Proses',
      statusPengolahan: 'Belum Diproses',
      catatan: 'Tanaman dalam masa pematangan buah akhir.',
      penanggungJawab: 'Siti Rahayu',
    },
    {
      kodePanen: 'PN-2026-06-0016',
      kodeJadwalTanam: 'JT-2026-0016',
      petani: 'Agus Setiawan',
      petaniKode: 'AGS-003',
      lahan: 'LHN-003 / Blok Utara',
      blokLahan: 'Blok Utara',
      jenisHasil: 'Glondong / Buah',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      rencanaPanen: new Date('2026-10-04'),
      tanggalPanen: new Date('2026-10-04'),
      luasHa: 2.00,
      perkiraanHasil: 3500,
      produksiKg: 0,
      jumlahBuah: 0,
      beratBruto: 0,
      beratNetto: 0,
      kondisiHasil: 'Baik',
      status: 'Dalam Proses',
      statusPengolahan: 'Belum Diproses',
      catatan: 'Padi mulai menguning rata.',
      penanggungJawab: 'Agus Setiawan',
    },
    {
      kodePanen: 'PN-2026-06-0015',
      kodeJadwalTanam: 'JT-2026-0015',
      petani: 'Dewi Lestari',
      petaniKode: 'DLR-004',
      lahan: 'LHN-004 / Blok 02',
      blokLahan: 'Blok 02',
      jenisHasil: 'Glondong / Buah',
      komoditas: 'Tomat',
      varietas: 'Grand Rapids',
      rencanaPanen: new Date('2026-10-08'),
      tanggalPanen: new Date('2026-10-07'),
      luasHa: 1.50,
      perkiraanHasil: 2000,
      produksiKg: 1950,
      jumlahBuah: 3200,
      beratBruto: 2000,
      beratNetto: 1950,
      kondisiHasil: 'Baik',
      status: 'Selesai',
      statusPengolahan: 'Selesai',
      catatan: 'Hasil panen tomat merah segar dan seragam.',
      penanggungJawab: 'Dewi Lestari',
      dokumentasi: [
        '/images/pemeriksaan/field-1.jpg',
        '/images/pemeriksaan/field-2.jpg',
      ],
    },
    {
      kodePanen: 'PN-2026-06-0014',
      kodeJadwalTanam: 'JT-2026-0014',
      petani: 'Budi Santoso',
      petaniKode: 'BTN-001',
      lahan: 'LHN-005 / Blok 03',
      blokLahan: 'Blok 03',
      jenisHasil: 'Glondong / Buah',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      rencanaPanen: new Date('2026-10-10'),
      tanggalPanen: new Date('2026-10-10'),
      luasHa: 1.80,
      perkiraanHasil: 2500,
      produksiKg: 0,
      jumlahBuah: 0,
      beratBruto: 0,
      beratNetto: 0,
      kondisiHasil: 'Cukup',
      status: 'Tertunda',
      statusPengolahan: 'Belum Diproses',
      catatan: 'Curah hujan tinggi, panen ditunda 3 hari untuk menjaga kualitas buah.',
      penanggungJawab: 'Budi Santoso',
    },
    {
      kodePanen: 'PN-2026-06-0013',
      kodeJadwalTanam: 'JT-2026-0013',
      petani: 'Rini Wulandari',
      petaniKode: 'RW-005',
      lahan: 'LHN-006 / Blok 06',
      blokLahan: 'Blok 06',
      jenisHasil: 'OC / Benih',
      komoditas: 'Cabai',
      varietas: 'Cabai Rawit',
      rencanaPanen: new Date('2026-11-12'),
      tanggalPanen: new Date('2026-11-12'),
      luasHa: 1.00,
      perkiraanHasil: 1500,
      produksiKg: 0,
      jumlahBuah: 0,
      beratBruto: 0,
      beratNetto: 0,
      kondisiHasil: 'Baik',
      status: 'Dalam Proses',
      statusPengolahan: 'Belum Diproses',
      catatan: 'Cabai rawit fase generatif.',
      penanggungJawab: 'Rini Wulandari',
    },
    {
      kodePanen: 'PN-2026-06-0012',
      kodeJadwalTanam: 'JT-2026-0012',
      petani: 'Endang Sulastri',
      petaniKode: 'ENS-007',
      lahan: 'LHN-007 / Blok 07',
      blokLahan: 'Blok 07',
      jenisHasil: 'Glondong / Buah',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      rencanaPanen: new Date('2026-10-20'),
      tanggalPanen: new Date('2026-10-20'),
      luasHa: 2.50,
      perkiraanHasil: 4000,
      produksiKg: 0,
      jumlahBuah: 0,
      beratBruto: 0,
      beratNetto: 0,
      kondisiHasil: 'Baik',
      status: 'Dalam Proses',
      statusPengolahan: 'Belum Diproses',
      catatan: 'Monitoring pengisian bulir padi.',
      penanggungJawab: 'Endang Sulastri',
    },
    {
      kodePanen: 'PN-2026-06-0011',
      kodeJadwalTanam: 'JT-2026-0011',
      petani: 'Slamet Riyadi',
      petaniKode: 'SRM-008',
      lahan: 'LHN-008 / Blok 08',
      blokLahan: 'Blok 08',
      jenisHasil: 'Glondong / Buah',
      komoditas: 'Kangkung',
      varietas: 'Bima',
      rencanaPanen: new Date('2026-10-25'),
      tanggalPanen: new Date('2026-10-25'),
      luasHa: 0.80,
      perkiraanHasil: 1200,
      produksiKg: 0,
      jumlahBuah: 0,
      beratBruto: 0,
      beratNetto: 0,
      kondisiHasil: 'Baik',
      status: 'Menunggu',
      statusPengolahan: 'Belum Diproses',
      catatan: 'Menunggu kesiapan vegetatif akhir.',
      penanggungJawab: 'Slamet Riyadi',
    },
    {
      kodePanen: 'PN-2026-06-0010',
      kodeJadwalTanam: 'JT-2026-0010',
      petani: 'Budi Santoso',
      petaniKode: 'BTN-001',
      lahan: 'LHN-001 / Blok 02',
      blokLahan: 'Blok 02',
      jenisHasil: 'Glondong / Buah',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      rencanaPanen: new Date('2026-09-20'),
      tanggalPanen: new Date('2026-09-18'),
      luasHa: 1.20,
      perkiraanHasil: 2000,
      produksiKg: 2000,
      jumlahBuah: 1980,
      beratBruto: 2050,
      beratNetto: 2000,
      kondisiHasil: 'Sangat Baik',
      status: 'Selesai',
      statusPengolahan: 'Selesai',
      catatan: 'Kualitas buah manis Brix 14+.',
      penanggungJawab: 'Budi Santoso',
    },
    {
      kodePanen: 'PN-2026-06-0009',
      kodeJadwalTanam: 'JT-2026-0009',
      petani: 'Agus Setiawan',
      petaniKode: 'AGS-003',
      lahan: 'LHN-003 / Blok Selatan',
      blokLahan: 'Blok Selatan',
      jenisHasil: 'OC / Benih',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      rencanaPanen: new Date('2026-09-22'),
      tanggalPanen: new Date('2026-09-21'),
      luasHa: 2.00,
      perkiraanHasil: 3100,
      produksiKg: 3100,
      jumlahBuah: 0,
      beratBruto: 3200,
      beratNetto: 3100,
      kondisiHasil: 'Baik',
      status: 'Selesai',
      statusPengolahan: 'Selesai',
      catatan: 'Hasil panen benih padi lolos sortasi awal.',
      penanggungJawab: 'Agus Setiawan',
    },
    {
      kodePanen: 'PN-2026-06-0008',
      kodeJadwalTanam: 'JT-2026-0008',
      petani: 'Siti Rahayu',
      petaniKode: 'SRN-002',
      lahan: 'LHN-002 / Blok 01',
      blokLahan: 'Blok 01',
      jenisHasil: 'OC / Benih',
      komoditas: 'Cabai',
      varietas: 'Cabai Keriting',
      rencanaPanen: new Date('2026-09-25'),
      tanggalPanen: new Date('2026-09-24'),
      luasHa: 1.00,
      perkiraanHasil: 1950,
      produksiKg: 1950,
      jumlahBuah: 0,
      beratBruto: 2000,
      beratNetto: 1950,
      kondisiHasil: 'Baik',
      status: 'Selesai',
      statusPengolahan: 'Selesai',
      catatan: 'Biji cabai kualitas super.',
      penanggungJawab: 'Siti Rahayu',
    },
    {
      kodePanen: 'PN-2026-06-0007',
      kodeJadwalTanam: 'JT-2026-0007',
      petani: 'Slamet Riyadi',
      petaniKode: 'SRM-008',
      lahan: 'LHN-008 / Blok 01',
      blokLahan: 'Blok 01',
      jenisHasil: 'Glondong / Buah',
      komoditas: 'Kangkung',
      varietas: 'Bima',
      rencanaPanen: new Date('2026-09-26'),
      tanggalPanen: new Date('2026-09-25'),
      luasHa: 0.80,
      perkiraanHasil: 1200,
      produksiKg: 1200,
      jumlahBuah: 0,
      beratBruto: 1220,
      beratNetto: 1200,
      kondisiHasil: 'Baik',
      status: 'Selesai',
      statusPengolahan: 'Selesai',
      catatan: 'Panen sayur segar.',
      penanggungJawab: 'Slamet Riyadi',
    },
  ];

  for (const item of initialData) {
    await panenRepository.create(item);
  }
};
