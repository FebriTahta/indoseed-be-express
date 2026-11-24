import { prisma } from '../utils/prisma';

export interface LokasiFilter {
  search?: string;
  tipeLokasi?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateLokasiData {
  kodeLokasi?: string;
  namaLokasi: string;
  tipeLokasi?: string;
  alamat?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  koordinat?: string | null;
  luasArea?: number | null;
  penanggungJawabUtama?: string | null;
  status?: string;
  keterangan?: string | null;
  dibuatOleh?: string;
}

export interface UpdateLokasiData {
  kodeLokasi?: string;
  namaLokasi?: string;
  tipeLokasi?: string;
  alamat?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  koordinat?: string | null;
  luasArea?: number | null;
  penanggungJawabUtama?: string | null;
  status?: string;
  keterangan?: string | null;
  diubahOleh?: string;
}

export const lokasiRepository = {
  getNextKode: async (): Promise<string> => {
    const latest = await prisma.lokasi.findFirst({
      where: {
        kodeLokasi: {
          startsWith: 'LOK-',
        },
      },
      orderBy: {
        kodeLokasi: 'desc',
      },
    });

    if (!latest || !latest.kodeLokasi) {
      return 'LOK-001';
    }

    const match = latest.kodeLokasi.match(/LOK-(\d+)/);
    if (!match) return 'LOK-001';

    const nextNum = parseInt(match[1] || '0', 10) + 1;
    return `LOK-${String(nextNum).padStart(3, '0')}`;
  },

  findAll: async (filter: LokasiFilter = {}) => {
    const {
      search,
      tipeLokasi,
      status,
      page = 1,
      pageSize = 10,
    } = filter;

    const where: any = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { kodeLokasi: { contains: q } },
        { namaLokasi: { contains: q } },
        { tipeLokasi: { contains: q } },
        { kota: { contains: q } },
        { provinsi: { contains: q } },
        { alamat: { contains: q } },
      ];
    }

    if (tipeLokasi && tipeLokasi !== 'Semua' && tipeLokasi !== 'all') {
      where.tipeLokasi = tipeLokasi;
    }

    if (status && status !== 'Semua' && status !== 'all') {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [items, total] = await Promise.all([
      prisma.lokasi.findMany({
        where,
        skip,
        take,
        orderBy: [{ kodeLokasi: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: { penanggungJawabs: true },
          },
        },
      }),
      prisma.lokasi.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    return {
      data: items,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: Number(page),
        pageSize: take,
      },
    };
  },

  findById: async (id: string) => {
    return prisma.lokasi.findUnique({
      where: { id },
      include: {
        penanggungJawabs: {
          select: {
            id: true,
            kodePersonel: true,
            nama: true,
            peran: true,
            areaModul: true,
            lokasi: true,
            status: true,
            noHp: true,
            email: true,
          },
        },
        _count: {
          select: { penanggungJawabs: true },
        },
      },
    });
  },

  findByKode: async (kodeLokasi: string) => {
    return prisma.lokasi.findUnique({
      where: { kodeLokasi },
    });
  },

  findByNama: async (namaLokasi: string) => {
    return prisma.lokasi.findFirst({
      where: {
        namaLokasi: {
          equals: namaLokasi.trim(),
        },
      },
    });
  },

  create: async (data: CreateLokasiData) => {
    let kode = data.kodeLokasi?.trim();
    if (!kode) {
      kode = await lokasiRepository.getNextKode();
    }

    return prisma.lokasi.create({
      data: {
        kodeLokasi: kode,
        namaLokasi: data.namaLokasi.trim(),
        tipeLokasi: data.tipeLokasi || 'Kebun / Lahan',
        alamat: data.alamat?.trim() || null,
        kota: data.kota?.trim() || null,
        provinsi: data.provinsi?.trim() || null,
        koordinat: data.koordinat?.trim() || null,
        luasArea: data.luasArea !== undefined && data.luasArea !== null ? Number(data.luasArea) : 0,
        penanggungJawabUtama: data.penanggungJawabUtama?.trim() || null,
        status: data.status || 'Aktif',
        keterangan: data.keterangan?.trim() || null,
        dibuatOleh: data.dibuatOleh || 'Admin',
        diubahOleh: data.dibuatOleh || 'Admin',
      },
      include: {
        _count: {
          select: { penanggungJawabs: true },
        },
      },
    });
  },

  update: async (id: string, data: UpdateLokasiData) => {
    const existing = await prisma.lokasi.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`Data lokasi dengan ID ${id} tidak ditemukan`);
    }

    const updated = await prisma.lokasi.update({
      where: { id },
      data: {
        kodeLokasi: data.kodeLokasi ? data.kodeLokasi.trim() : existing.kodeLokasi,
        namaLokasi: data.namaLokasi ? data.namaLokasi.trim() : existing.namaLokasi,
        tipeLokasi: data.tipeLokasi !== undefined ? data.tipeLokasi : existing.tipeLokasi,
        alamat: data.alamat !== undefined ? (data.alamat?.trim() || null) : existing.alamat,
        kota: data.kota !== undefined ? (data.kota?.trim() || null) : existing.kota,
        provinsi: data.provinsi !== undefined ? (data.provinsi?.trim() || null) : existing.provinsi,
        koordinat: data.koordinat !== undefined ? (data.koordinat?.trim() || null) : existing.koordinat,
        luasArea: data.luasArea !== undefined && data.luasArea !== null ? Number(data.luasArea) : existing.luasArea,
        penanggungJawabUtama: data.penanggungJawabUtama !== undefined ? (data.penanggungJawabUtama?.trim() || null) : existing.penanggungJawabUtama,
        status: data.status !== undefined ? data.status : existing.status,
        keterangan: data.keterangan !== undefined ? (data.keterangan?.trim() || null) : existing.keterangan,
        diubahOleh: data.diubahOleh || 'Admin',
      },
      include: {
        _count: {
          select: { penanggungJawabs: true },
        },
      },
    });

    // If namaLokasi changed, update string `lokasi` in penanggungJawab as well
    if (data.namaLokasi && data.namaLokasi.trim() !== existing.namaLokasi) {
      await prisma.penanggungJawab.updateMany({
        where: { lokasiId: id },
        data: { lokasi: data.namaLokasi.trim() },
      });
    }

    return updated;
  },

  delete: async (id: string) => {
    const existing = await prisma.lokasi.findUnique({
      where: { id },
      include: {
        _count: { select: { penanggungJawabs: true } },
      },
    });

    if (!existing) {
      throw new Error(`Data lokasi dengan ID ${id} tidak ditemukan`);
    }

    if (existing._count.penanggungJawabs > 0) {
      throw new Error(
        `Lokasi "${existing.namaLokasi}" tidak dapat dihapus karena masih digunakan oleh ${existing._count.penanggungJawabs} personel penanggung jawab.`
      );
    }

    return prisma.lokasi.delete({
      where: { id },
    });
  },

  getStats: async () => {
    const [totalLokasi, aktif, nonaktif, totalPersonelAssigned] = await Promise.all([
      prisma.lokasi.count(),
      prisma.lokasi.count({ where: { status: 'Aktif' } }),
      prisma.lokasi.count({ where: { status: { in: ['Nonaktif', 'Tidak Aktif'] } } }),
      prisma.penanggungJawab.count({ where: { lokasiId: { not: null } } }),
    ]);

    return {
      totalLokasi,
      aktif,
      nonaktif,
      totalPersonelAssigned,
    };
  },

  seedInitialIfEmpty: async () => {
    const count = await prisma.lokasi.count();
    if (count > 0) {
      // Sync any unlinked penanggungJawab to lokasi by name
      const locs = await prisma.lokasi.findMany();
      for (const l of locs) {
        await prisma.penanggungJawab.updateMany({
          where: {
            lokasi: l.namaLokasi,
            lokasiId: null,
          },
          data: {
            lokasiId: l.id,
          },
        });
      }
      return count;
    }

    const defaultLocations = [
      {
        kodeLokasi: 'LOK-001',
        namaLokasi: 'Semua Lokasi',
        tipeLokasi: 'Kantor & Operasional',
        alamat: 'Mencakup seluruh unit kerja dan penugasan lintas wilayah',
        kota: 'Nasional',
        provinsi: 'Lintas Wilayah',
        luasArea: 0,
        penanggungJawabUtama: 'Budi Santoso',
        status: 'Aktif',
        keterangan: 'Lokasi global untuk jajaran manajerial dan kepala divisi.',
      },
      {
        kodeLokasi: 'LOK-002',
        namaLokasi: 'Ngantang',
        tipeLokasi: 'Kebun / Lahan',
        alamat: 'Desa Kaumrejo, Kec. Ngantang',
        kota: 'Malang',
        provinsi: 'Jawa Timur',
        luasArea: 25.5,
        penanggungJawabUtama: 'Andi Wijaya',
        status: 'Aktif',
        keterangan: 'Kawasan perbanyakan benih jagung dan hortikultura dataran tinggi.',
      },
      {
        kodeLokasi: 'LOK-003',
        namaLokasi: 'Wajak',
        tipeLokasi: 'Kebun / Lahan',
        alamat: 'Desa Patoksari, Kec. Wajak',
        kota: 'Malang',
        provinsi: 'Jawa Timur',
        luasArea: 18.0,
        penanggungJawabUtama: 'Dedi Kurniawan',
        status: 'Aktif',
        keterangan: 'Area sentra pertanaman kemitraan benih padi varietas unggul.',
      },
      {
        kodeLokasi: 'LOK-004',
        namaLokasi: 'Lahan Terbuka Subang',
        tipeLokasi: 'Kebun / Lahan',
        alamat: 'Jl. Raya Subang - Pagaden KM 12',
        kota: 'Subang',
        provinsi: 'Jawa Barat',
        luasArea: 42.0,
        penanggungJawabUtama: 'Dewi Lestari',
        status: 'Aktif',
        keterangan: 'Lahan utama perbenihan padi sawah irigasi teknis.',
      },
      {
        kodeLokasi: 'LOK-005',
        namaLokasi: 'Greenhouse Lamongan',
        tipeLokasi: 'Greenhouse',
        alamat: 'Kompleks Agribisnis Babat',
        kota: 'Lamongan',
        provinsi: 'Jawa Timur',
        luasArea: 5.2,
        penanggungJawabUtama: 'Siti Rahma',
        status: 'Aktif',
        keterangan: 'Fasilitas greenhouse modern untuk pemuliaan dan benih hortikultura.',
      },
      {
        kodeLokasi: 'LOK-006',
        namaLokasi: 'Gudang Utama Kediri',
        tipeLokasi: 'Gudang & Fasilitas',
        alamat: 'Kawasan Pergudangan Ngasem',
        kota: 'Kediri',
        provinsi: 'Jawa Timur',
        luasArea: 8.5,
        penanggungJawabUtama: 'Agus Setiawan',
        status: 'Aktif',
        keterangan: 'Pusat penyimpanan cold storage benih bersih dan logistik kemasan.',
      },
    ];

    for (const item of defaultLocations) {
      const created = await prisma.lokasi.create({
        data: item,
      });

      // Link existing PenanggungJawab that has this location name
      await prisma.penanggungJawab.updateMany({
        where: {
          lokasi: created.namaLokasi,
          lokasiId: null,
        },
        data: {
          lokasiId: created.id,
        },
      });
    }

    return defaultLocations.length;
  },
};
