import { prisma } from '../utils/prisma';

export interface FindPersetujuanProduksiParams {
  search?: string;
  jenis?: string;
  pengaju?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export class PersetujuanProduksiRepository {
  /**
   * Auto-sync: Pastikan semua Jadwal Tanam yang berstatus "Disetujui"
   * memiliki record di Persetujuan Produksi dengan status awal "Proses".
   */
  async syncFromJadwalTanam() {
    const approvedJadwals = await prisma.jadwalTanam.findMany({
      where: {
        statusJadwal: 'Disetujui',
      },
      include: {
        detailLahan: true,
        partner: true,
        commodity: true,
        variety: true,
        perencanaanProduksi: true,
      },
    });

    for (const item of approvedJadwals) {
      const existing = await prisma.persetujuanProduksi.findFirst({
        where: {
          OR: [
            { jadwalTanamId: item.id },
            { noPengajuan: item.kodeJadwalTanam },
          ],
        },
      });

      if (!existing) {
        const isRevisi =
          (item.keterangan && item.keterangan.toLowerCase().includes('revisi')) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes('revisi'));

        const jenis = isRevisi ? 'Revisi Jadwal Tanam' : 'Jadwal Tanam';
        const komoditas = item.komoditas || item.commodity?.namaKomoditas || 'Komoditas';
        const varietas = item.varietas || item.variety?.namaVarietas || 'Varietas';
        const judul = `${komoditas} - ${varietas}`;
        const pengaju = item.penanggungJawab || item.dibuatOleh || 'Petugas Produksi';
        const namaPetani = item.namaPetani || item.partner?.namaPetani || 'Petani Mitra';
        const namaLahan = item.detailLahan?.[0]?.namaLahan || 'Lahan A';
        const luasTanam = item.luasTanam || item.detailLahan?.[0]?.luas || 1.0;

        const dataSebelumnya = {
          tanggalTanam: item.tanggalTanam || item.periodeTanamMulai || '2026-10-10',
          estimasiPanen: item.perkiraanPanen || item.periodeTanamSelesai || '2026-11-20',
          luasTanam: luasTanam,
          petani: namaPetani,
          lahan: namaLahan,
        };

        const dataPengajuan = {
          tanggalTanam: item.tanggalTanam || item.periodeTanamMulai || '2026-10-14',
          estimasiPanen: item.perkiraanPanen || item.periodeTanamSelesai || '2026-11-24',
          luasTanam: luasTanam,
          petani: namaPetani,
          lahan: namaLahan,
        };

        const riwayatFlow = [
          {
            step: 1,
            title: 'Pengajuan Revisi',
            role: pengaju,
            name: pengaju,
            tanggal: item.createdAt,
            catatan: 'Mengajukan revisi jadwal tanam.',
            status: 'Selesai',
          },
          {
            step: 2,
            title: 'Verifikasi',
            role: 'Supervisor Produksi',
            name: 'Supervisor Produksi',
            tanggal: item.updatedAt,
            catatan: 'Data telah diverifikasi, menunggu persetujuan.',
            status: 'Selesai',
          },
          {
            step: 3,
            title: 'Persetujuan',
            role: 'Manager Produksi',
            name: 'Manager Produksi',
            tanggal: null,
            catatan: 'Menunggu keputusan persetujuan.',
            status: 'Menunggu',
          },
        ];

        await prisma.persetujuanProduksi.create({
          data: {
            noPengajuan: item.kodeJadwalTanam,
            jadwalTanamId: item.id,
            jenis,
            judul,
            pengaju,
            tanggalPengajuan: item.createdAt,
            status: 'Proses', // Sesuai instruksi: saat muncul disini akan berstatus proses
            alasanRevisi:
              item.keterangan && item.keterangan !== '-'
                ? item.keterangan
                : 'Kondisi lahan belum siap untuk ditanami.',
            lampiranFile: 'foto_lahan_belum_siap.jpg',
            lampiranSize: '2.4 MB',
            dataSebelumnya,
            dataPengajuan,
            riwayatFlow,
          },
        });
      }
    }
  }

  /**
   * Get list of approvals with search & filter.
   * Hanya menampilkan data dari Jadwal Tanam yang berstatus "Disetujui".
   */
  async findAll(params: FindPersetujuanProduksiParams) {
    await this.syncFromJadwalTanam();

    const {
      search,
      jenis,
      pengaju,
      status,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = params;

    // Ambil semua ID Jadwal Tanam yang berstatus "Disetujui"
    const approvedJadwals = await prisma.jadwalTanam.findMany({
      where: { statusJadwal: 'Disetujui' },
      select: { id: true },
    });
    const approvedIds = approvedJadwals.map((j) => j.id);

    const where: any = {
      jadwalTanamId: { in: approvedIds },
    };

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { noPengajuan: { contains: q } },
        { judul: { contains: q } },
        { pengaju: { contains: q } },
        { alasanRevisi: { contains: q } },
      ];
    }

    if (jenis && jenis !== 'all' && jenis !== 'Semua Jenis') {
      where.jenis = jenis;
    }

    if (pengaju && pengaju !== 'all' && pengaju !== 'Semua Pengaju') {
      where.pengaju = { contains: pengaju };
    }

    if (status && status !== 'all' && status !== 'Semua') {
      if (status === 'Menunggu' || status === 'Proses') {
        where.status = 'Proses';
      } else {
        where.status = status;
      }
    }

    if (startDate || endDate) {
      where.tanggalPengajuan = {};
      if (startDate) {
        where.tanggalPengajuan.gte = new Date(startDate);
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        where.tanggalPengajuan.lte = e;
      }
    }

    const total = await prisma.persetujuanProduksi.count({ where });
    const skip = (page - 1) * pageSize;

    const items = await prisma.persetujuanProduksi.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
      include: {
        jadwalTanam: {
          include: {
            detailLahan: true,
            partner: true,
            commodity: true,
            variety: true,
          },
        },
      },
    });

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Get stats KPI: Menunggu, Disetujui, Ditolak, Total.
   */
  async getStats() {
    await this.syncFromJadwalTanam();

    const approvedJadwals = await prisma.jadwalTanam.findMany({
      where: { statusJadwal: 'Disetujui' },
      select: { id: true },
    });
    const approvedIds = approvedJadwals.map((j) => j.id);

    const baseWhere = {
      jadwalTanamId: { in: approvedIds },
    };

    const [menunggu, disetujui, ditolak, total] = await Promise.all([
      prisma.persetujuanProduksi.count({
        where: { ...baseWhere, status: 'Proses' },
      }),
      prisma.persetujuanProduksi.count({
        where: { ...baseWhere, status: 'Disetujui' },
      }),
      prisma.persetujuanProduksi.count({
        where: { ...baseWhere, status: 'Ditolak' },
      }),
      prisma.persetujuanProduksi.count({
        where: baseWhere,
      }),
    ]);

    return {
      menunggu,
      disetujui,
      ditolak,
      total,
    };
  }

  /**
   * Find single record by ID or NoPengajuan
   */
  async findById(id: string) {
    let item = await prisma.persetujuanProduksi.findUnique({
      where: { id },
      include: {
        jadwalTanam: {
          include: {
            detailLahan: true,
            partner: true,
            commodity: true,
            variety: true,
          },
        },
      },
    });

    if (!item) {
      item = await prisma.persetujuanProduksi.findUnique({
        where: { noPengajuan: id },
        include: {
          jadwalTanam: {
            include: {
              detailLahan: true,
              partner: true,
              commodity: true,
              variety: true,
            },
          },
        },
      });
    }

    return item;
  }

  /**
   * Setujui Pengajuan
   */
  async approve(id: string, reviewerName: string = 'Manager Produksi', catatan?: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Data pengajuan tidak ditemukan');
    }

    let updatedFlow = Array.isArray(existing.riwayatFlow)
      ? [...(existing.riwayatFlow as any[])]
      : [];

    // Perbarui step 3 (Persetujuan)
    const now = new Date();
    if (updatedFlow.length >= 3) {
      updatedFlow[2] = {
        ...updatedFlow[2],
        name: reviewerName,
        tanggal: now,
        status: 'Disetujui',
        catatan: catatan || 'Disetujui oleh Manager Produksi.',
      };
    } else {
      updatedFlow.push({
        step: 3,
        title: 'Persetujuan',
        role: 'Manager Produksi',
        name: reviewerName,
        tanggal: now,
        catatan: catatan || 'Disetujui oleh Manager Produksi.',
        status: 'Disetujui',
      });
    }

    const updated = await prisma.persetujuanProduksi.update({
      where: { id: existing.id },
      data: {
        status: 'Disetujui',
        disetujuiOleh: reviewerName,
        tanggalPersetujuan: now,
        catatanReview: catatan || 'Pengajuan telah disetujui.',
        riwayatFlow: updatedFlow,
      },
      include: {
        jadwalTanam: {
          include: {
            detailLahan: true,
            partner: true,
            commodity: true,
            variety: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Tolak Pengajuan
   */
  async reject(id: string, reviewerName: string = 'Manager Produksi', alasan: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Data pengajuan tidak ditemukan');
    }

    let updatedFlow = Array.isArray(existing.riwayatFlow)
      ? [...(existing.riwayatFlow as any[])]
      : [];

    const now = new Date();
    if (updatedFlow.length >= 3) {
      updatedFlow[2] = {
        ...updatedFlow[2],
        name: reviewerName,
        tanggal: now,
        status: 'Ditolak',
        catatan: alasan || 'Pengajuan ditolak.',
      };
    } else {
      updatedFlow.push({
        step: 3,
        title: 'Persetujuan',
        role: 'Manager Produksi',
        name: reviewerName,
        tanggal: now,
        catatan: alasan || 'Pengajuan ditolak.',
        status: 'Ditolak',
      });
    }

    const updated = await prisma.persetujuanProduksi.update({
      where: { id: existing.id },
      data: {
        status: 'Ditolak',
        disetujuiOleh: reviewerName,
        tanggalPersetujuan: now,
        catatanReview: alasan,
        riwayatFlow: updatedFlow,
      },
      include: {
        jadwalTanam: {
          include: {
            detailLahan: true,
            partner: true,
            commodity: true,
            variety: true,
          },
        },
      },
    });

    return updated;
  }
}

export const persetujuanProduksiRepository = new PersetujuanProduksiRepository();
