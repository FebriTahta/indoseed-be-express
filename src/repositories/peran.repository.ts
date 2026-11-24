import { prisma } from '../utils/prisma';

export interface PeranFilter {
  search?: string;
  kategori?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreatePeranData {
  kodePeran?: string;
  namaPeran: string;
  kategori?: string;
  deskripsi?: string | null;
  status?: string;
  dibuatOleh?: string;
}

export interface UpdatePeranData {
  kodePeran?: string;
  namaPeran?: string;
  kategori?: string;
  deskripsi?: string | null;
  status?: string;
  diubahOleh?: string;
}

export const peranRepository = {
  getNextKode: async (): Promise<string> => {
    const latest = await prisma.peran.findFirst({
      where: {
        kodePeran: {
          startsWith: 'PRN-',
        },
      },
      orderBy: {
        kodePeran: 'desc',
      },
    });

    if (!latest || !latest.kodePeran) {
      return 'PRN-001';
    }

    const match = latest.kodePeran.match(/PRN-(\d+)/);
    if (!match) return 'PRN-001';

    const nextNum = parseInt(match[1] || '0', 10) + 1;
    return `PRN-${String(nextNum).padStart(3, '0')}`;
  },

  findAll: async (filter: PeranFilter = {}) => {
    const {
      search,
      kategori,
      status,
      page = 1,
      pageSize = 10,
    } = filter;

    const where: any = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { kodePeran: { contains: q } },
        { namaPeran: { contains: q } },
        { deskripsi: { contains: q } },
        { kategori: { contains: q } },
      ];
    }

    if (kategori && kategori !== 'Semua' && kategori !== 'all') {
      where.kategori = kategori;
    }

    if (status && status !== 'Semua' && status !== 'all') {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [items, total] = await Promise.all([
      prisma.peran.findMany({
        where,
        skip,
        take,
        orderBy: [{ kodePeran: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: { penanggungJawabs: true },
          },
        },
      }),
      prisma.peran.count({ where }),
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
    return prisma.peran.findUnique({
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

  findByKode: async (kodePeran: string) => {
    return prisma.peran.findUnique({
      where: { kodePeran },
    });
  },

  findByNama: async (namaPeran: string) => {
    return prisma.peran.findFirst({
      where: {
        namaPeran: {
          equals: namaPeran.trim(),
        },
      },
    });
  },

  create: async (data: CreatePeranData) => {
    let kode = data.kodePeran?.trim();
    if (!kode) {
      kode = await peranRepository.getNextKode();
    }

    return prisma.peran.create({
      data: {
        kodePeran: kode,
        namaPeran: data.namaPeran.trim(),
        kategori: data.kategori || 'Operasional',
        deskripsi: data.deskripsi?.trim() || null,
        status: data.status || 'Aktif',
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

  update: async (id: string, data: UpdatePeranData) => {
    const existing = await prisma.peran.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`Data peran dengan ID ${id} tidak ditemukan`);
    }

    const updated = await prisma.peran.update({
      where: { id },
      data: {
        kodePeran: data.kodePeran ? data.kodePeran.trim() : existing.kodePeran,
        namaPeran: data.namaPeran ? data.namaPeran.trim() : existing.namaPeran,
        kategori: data.kategori !== undefined ? data.kategori : existing.kategori,
        deskripsi: data.deskripsi !== undefined ? (data.deskripsi?.trim() || null) : existing.deskripsi,
        status: data.status !== undefined ? data.status : existing.status,
        diubahOleh: data.diubahOleh || 'Admin',
      },
      include: {
        _count: {
          select: { penanggungJawabs: true },
        },
      },
    });

    // If namaPeran changed, update string `peran` in penanggungJawab as well
    if (data.namaPeran && data.namaPeran.trim() !== existing.namaPeran) {
      await prisma.penanggungJawab.updateMany({
        where: { peranId: id },
        data: { peran: data.namaPeran.trim() },
      });
    }

    return updated;
  },

  delete: async (id: string) => {
    const existing = await prisma.peran.findUnique({
      where: { id },
      include: {
        _count: { select: { penanggungJawabs: true } },
      },
    });

    if (!existing) {
      throw new Error(`Data peran dengan ID ${id} tidak ditemukan`);
    }

    if (existing._count.penanggungJawabs > 0) {
      throw new Error(
        `Peran "${existing.namaPeran}" tidak dapat dihapus karena masih digunakan oleh ${existing._count.penanggungJawabs} personel penanggung jawab.`
      );
    }

    return prisma.peran.delete({
      where: { id },
    });
  },

  getStats: async () => {
    const [totalPeran, aktif, nonaktif, totalPersonelAssigned] = await Promise.all([
      prisma.peran.count(),
      prisma.peran.count({ where: { status: 'Aktif' } }),
      prisma.peran.count({ where: { status: { in: ['Nonaktif', 'Tidak Aktif'] } } }),
      prisma.penanggungJawab.count({ where: { peranId: { not: null } } }),
    ]);

    return {
      totalPeran,
      aktif,
      nonaktif,
      totalPersonelAssigned,
    };
  },

  seedInitialIfEmpty: async () => {
    const count = await prisma.peran.count();
    if (count > 0) {
      // Sync any unlinked penanggungJawab to roles by name
      const roles = await prisma.peran.findMany();
      for (const r of roles) {
        await prisma.penanggungJawab.updateMany({
          where: {
            peran: r.namaPeran,
            peranId: null,
          },
          data: {
            peranId: r.id,
          },
        });
      }
      return count;
    }

    const defaultRoles = [
      {
        kodePeran: 'PRN-001',
        namaPeran: 'Kepala Produksi',
        kategori: 'Manajerial',
        deskripsi: 'Bertanggung jawab atas seluruh perencanaan, supervisi, dan eksekusi kegiatan produksi benih.',
        status: 'Aktif',
      },
      {
        kodePeran: 'PRN-002',
        namaPeran: 'Penanggung Jawab',
        kategori: 'Operasional',
        deskripsi: 'Bertanggung jawab pada area/modul tertentu di fasilitas penangkaran dan greenhouse.',
        status: 'Aktif',
      },
      {
        kodePeran: 'PRN-003',
        namaPeran: 'Koordinator Lapangan',
        kategori: 'Operasional',
        deskripsi: 'Mengkoordinasikan jadwal tanam, petani mitra, dan kegiatan harian di petak lahan.',
        status: 'Aktif',
      },
      {
        kodePeran: 'PRN-004',
        namaPeran: 'Staff QC',
        kategori: 'Quality Control',
        deskripsi: 'Melakukan inspeksi mutu lapangan, roguing, pengujian benih, dan verifikasi sertifikasi.',
        status: 'Aktif',
      },
      {
        kodePeran: 'PRN-005',
        namaPeran: 'Admin Gudang & Inventory',
        kategori: 'Logistik',
        deskripsi: 'Mengelola penerimaan, penyimpanan, monitoring kondisi suhu/RH gudang, dan pencatatan stok.',
        status: 'Aktif',
      },
      {
        kodePeran: 'PRN-006',
        namaPeran: 'Operator Processing & Sortasi',
        kategori: 'Operasional',
        deskripsi: 'Menjalankan proses penanganan pasca panen, perontokan, sortasi, pengeringan, dan perlakuan benih.',
        status: 'Aktif',
      },
    ];

    for (const item of defaultRoles) {
      const created = await prisma.peran.create({
        data: item,
      });

      // Link existing PenanggungJawab that has this role name
      await prisma.penanggungJawab.updateMany({
        where: {
          peran: created.namaPeran,
          peranId: null,
        },
        data: {
          peranId: created.id,
        },
      });
    }

    return defaultRoles.length;
  },
};
