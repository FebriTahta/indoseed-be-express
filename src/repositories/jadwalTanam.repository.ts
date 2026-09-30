import { prisma } from '../utils/prisma';

export interface JadwalTanamFilter {
  search?: string;
  statusJadwal?: string;
  commodityId?: string;
  varietyId?: string;
  partnerId?: string;
  namaPetani?: string;
  greenhouseId?: string;
  periodeTanam?: string;
  musimTanam?: string;
  penanggungJawab?: string;
  page?: number;
  pageSize?: number;
}

export interface DetailLahanInput {
  greenhouseId?: string | null;
  namaLahan: string;
  kodeLahan?: string | null;
  luas: number;
  tipeLahan?: string | null;
  irigasi?: string | null;
  sumberAir?: string | null;
  komoditasVarietas?: string | null;
  rencanaTanam?: Date | null;
  estimasiPanen?: Date | null;
  targetProduksi?: number | null;
  statusLahan?: string | null;
  keterangan?: string | null;
}

export interface CreateJadwalTanamInput {
  kodeJadwalTanam: string;
  perencanaanProduksiId?: string | null;
  partnerId?: string | null;
  namaPetani?: string | null;
  kodePetani?: string | null;
  komoditas?: string | null;
  varietas?: string | null;
  periodeTanam?: string | null;
  periodeTanamMulai?: Date | null;
  periodeTanamSelesai?: Date | null;
  musimTanam?: string | null;
  tujuanProduksi?: string | null;
  tipeProduksi?: string | null;
  statusJadwal?: string;
  penanggungJawab?: string | null;
  deskripsi?: string | null;
  keterangan?: string | null;

  greenhouseId?: string | null;
  commodityId?: string | null;
  varietyId?: string | null;
  luasTanam?: number;
  asalBenih?: string | null;
  jumlahBenihDiperlukan?: number;
  jarakTanam?: string | null;
  sistemTanam?: string | null;
  targetProduksi?: number;
  estimasiHasilPerHa?: number;
  standarKualitas?: string | null;
  perkecambahanMin?: number | null;

  tanggalPersemaian?: Date | null;
  tanggalTanam?: Date | null;
  perkiraanPanen?: Date | null;
  siklusTanamHari?: number;
  metodeTanam?: string | null;
  kepadatanTanam?: string | null;
  irigasi?: string | null;
  sumberAir?: string | null;
  catatan?: string | null;

  dibuatOleh?: string | null;
  diubahOleh?: string | null;

  detailLahan?: DetailLahanInput[];
  personil?: Array<{
    nama: string;
    peran: string;
    kontak?: string | null;
    tugas?: string | null;
  }>;
  peralatan?: Array<{
    nama: string;
    jenis: string;
    jumlah?: number;
    satuan?: string;
    kondisi?: string;
  }>;
  dokumen?: Array<{
    nama: string;
    fileUrl: string;
    fileSize?: string | null;
    fileType?: string | null;
  }>;
}

const getModel = () => (prisma as any).jadwalTanam;

export const jadwalTanamRepository = {
  getNextKodeJadwalTanam: async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `JT-${year}-${month}-`;

    const latest = await getModel().findFirst({
      where: {
        kodeJadwalTanam: {
          startsWith: prefix,
        },
      },
      orderBy: { kodeJadwalTanam: 'desc' },
    });

    if (latest && latest.kodeJadwalTanam) {
      const parts = latest.kodeJadwalTanam.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        return `${prefix}${String(lastSeq + 1).padStart(4, '0')}`;
      }
    }

    const totalCount = await getModel().count();
    return `${prefix}${String(totalCount + 1).padStart(4, '0')}`;
  },

  getStats: async () => {
    const [total, dalamProses, disetujui, revisi, ditolak] = await Promise.all([
      getModel().count(),
      getModel().count({ where: { statusJadwal: 'Dalam Proses' } }),
      getModel().count({ where: { statusJadwal: 'Disetujui' } }),
      getModel().count({ where: { statusJadwal: 'Revisi' } }),
      getModel().count({ where: { statusJadwal: 'Ditolak' } }),
    ]);

    return {
      total,
      dalamProses,
      disetujui,
      revisi,
      ditolak,
      trends: {
        total: '+2 dari bulan lalu',
        dalamProses: '+1 dari bulan lalu',
        disetujui: '+2 dari bulan lalu',
        revisi: '+1 dari bulan lalu',
        ditolak: '-0 dari bulan lalu',
      },
    };
  },

  create: async (input: CreateJadwalTanamInput) => {
    const {
      detailLahan,
      personil,
      peralatan,
      dokumen,
      ...mainData
    } = input;

    return getModel().create({
      data: {
        ...mainData,
        detailLahan: detailLahan && detailLahan.length > 0 ? {
          create: detailLahan.map((dl) => ({
            namaLahan: dl.namaLahan,
            kodeLahan: dl.kodeLahan,
            greenhouseId: dl.greenhouseId,
            luas: dl.luas || 0,
            tipeLahan: dl.tipeLahan || 'Lahan Terbuka',
            irigasi: dl.irigasi,
            sumberAir: dl.sumberAir,
            komoditasVarietas: dl.komoditasVarietas,
            rencanaTanam: dl.rencanaTanam,
            estimasiPanen: dl.estimasiPanen,
            targetProduksi: dl.targetProduksi || 0,
            statusLahan: dl.statusLahan || 'Siap Tanam',
            keterangan: dl.keterangan,
          })),
        } : undefined,
        personil: personil && personil.length > 0 ? {
          create: personil,
        } : undefined,
        peralatan: peralatan && peralatan.length > 0 ? {
          create: peralatan,
        } : undefined,
        dokumen: dokumen && dokumen.length > 0 ? {
          create: dokumen,
        } : undefined,
      },
      include: {
        greenhouse: true,
        commodity: true,
        variety: true,
        partner: true,
        perencanaanProduksi: true,
        detailLahan: true,
        personil: true,
        peralatan: true,
        dokumen: true,
      },
    });
  },

  findById: async (id: string) => {
    return getModel().findFirst({
      where: {
        OR: [{ id }, { kodeJadwalTanam: id }],
      },
      include: {
        greenhouse: true,
        commodity: true,
        variety: true,
        partner: true,
        perencanaanProduksi: true,
        detailLahan: true,
        personil: true,
        peralatan: true,
        dokumen: true,
      },
    });
  },

  findByKode: async (kodeJadwalTanam: string) => {
    return getModel().findUnique({
      where: { kodeJadwalTanam },
      include: {
        greenhouse: true,
        commodity: true,
        variety: true,
        partner: true,
        perencanaanProduksi: true,
        detailLahan: true,
        personil: true,
        peralatan: true,
        dokumen: true,
      },
    });
  },

  update: async (id: string, input: Partial<CreateJadwalTanamInput>) => {
    const {
      detailLahan,
      personil,
      peralatan,
      dokumen,
      ...mainData
    } = input;

    if (detailLahan !== undefined) {
      await (prisma as any).jadwalTanamDetail.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    }
    if (personil !== undefined) {
      await (prisma as any).jadwalTanamPersonil.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    }
    if (peralatan !== undefined) {
      await (prisma as any).jadwalTanamPeralatan.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    }
    if (dokumen !== undefined) {
      await (prisma as any).jadwalTanamDokumen.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    }

    return getModel().update({
      where: { id },
      data: {
        ...mainData,
        detailLahan: detailLahan && detailLahan.length > 0 ? {
          create: detailLahan.map((dl) => ({
            namaLahan: dl.namaLahan,
            kodeLahan: dl.kodeLahan,
            greenhouseId: dl.greenhouseId,
            luas: dl.luas || 0,
            tipeLahan: dl.tipeLahan || 'Lahan Terbuka',
            irigasi: dl.irigasi,
            sumberAir: dl.sumberAir,
            komoditasVarietas: dl.komoditasVarietas,
            rencanaTanam: dl.rencanaTanam,
            estimasiPanen: dl.estimasiPanen,
            targetProduksi: dl.targetProduksi || 0,
            statusLahan: dl.statusLahan || 'Siap Tanam',
            keterangan: dl.keterangan,
          })),
        } : undefined,
        personil: personil && personil.length > 0 ? {
          create: personil,
        } : undefined,
        peralatan: peralatan && peralatan.length > 0 ? {
          create: peralatan,
        } : undefined,
        dokumen: dokumen && dokumen.length > 0 ? {
          create: dokumen,
        } : undefined,
      },
      include: {
        greenhouse: true,
        commodity: true,
        variety: true,
        partner: true,
        perencanaanProduksi: true,
        detailLahan: true,
        personil: true,
        peralatan: true,
        dokumen: true,
      },
    });
  },

  updateStatus: async (id: string, statusJadwal: string, keterangan?: string, diubahOleh?: string) => {
    return getModel().update({
      where: { id },
      data: {
        statusJadwal,
        ...(keterangan !== undefined ? { keterangan } : {}),
        diubahOleh: diubahOleh || 'Admin',
      },
    });
  },

  delete: async (id: string) => {
    await (prisma as any).jadwalTanamDetail.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    await (prisma as any).jadwalTanamPersonil.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    await (prisma as any).jadwalTanamPeralatan.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    await (prisma as any).jadwalTanamDokumen.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    return getModel().delete({ where: { id } });
  },

  findAll: async (filters: JadwalTanamFilter) => {
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
      penanggungJawab,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (penanggungJawab && penanggungJawab !== 'all' && penanggungJawab !== 'Semua Penanggung Jawab') {
      where.penanggungJawab = { contains: penanggungJawab };
    }
    if (statusJadwal && statusJadwal !== 'all' && statusJadwal !== 'Semua Status' && statusJadwal !== 'Semua status') {
      where.statusJadwal = statusJadwal;
    }
    if (commodityId && commodityId !== 'all' && commodityId !== 'Semua Komoditas') {
      where.OR = [
        { commodityId },
        { komoditas: { contains: commodityId } }
      ];
    }
    if (varietyId && varietyId !== 'all' && varietyId !== 'Semua Varietas') {
      where.varietyId = varietyId;
    }
    if (partnerId && partnerId !== 'all' && partnerId !== 'Semua Petani') {
      where.partnerId = partnerId;
    }
    if (namaPetani && namaPetani !== 'all' && namaPetani !== 'Semua Petani') {
      where.namaPetani = { contains: namaPetani };
    }
    if (greenhouseId && greenhouseId !== 'all') {
      where.greenhouseId = greenhouseId;
    }
    if (musimTanam && musimTanam !== 'all') {
      where.musimTanam = musimTanam;
    }
    if (periodeTanam && periodeTanam !== 'all' && periodeTanam !== 'Pilih periode') {
      where.periodeTanam = { contains: periodeTanam };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { kodeJadwalTanam: { contains: q } },
        { namaPetani: { contains: q } },
        { kodePetani: { contains: q } },
        { komoditas: { contains: q } },
        { varietas: { contains: q } },
        { keterangan: { contains: q } },
        { penanggungJawab: { contains: q } },
        { deskripsi: { contains: q } },
      ];
    }

    const total = await getModel().count({ where });
    const items = await getModel().findMany({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: { updatedAt: 'desc' },
      include: {
        greenhouse: true,
        commodity: true,
        variety: true,
        partner: true,
        perencanaanProduksi: true,
        detailLahan: true,
        personil: true,
        peralatan: true,
        dokumen: true,
      },
    });

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)) || 1,
      },
    };
  },
};
