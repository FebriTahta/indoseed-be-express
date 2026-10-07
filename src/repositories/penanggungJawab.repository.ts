import { prisma } from '../utils/prisma';

export interface PenanggungJawabFilter {
  search?: string;
  peran?: string;
  areaModul?: string;
  lokasi?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreatePenanggungJawabData {
  kodePersonel?: string;
  nama: string;
  peran?: string;
  areaModul?: string;
  lokasi?: string;
  noHp?: string;
  email?: string;
  status?: string;
  tanggalMulai?: Date | string | null;
  tanggalSelesai?: Date | string | null;
  catatan?: string | null;
}

export interface UpdatePenanggungJawabData {
  kodePersonel?: string;
  nama?: string;
  peran?: string;
  areaModul?: string;
  lokasi?: string;
  noHp?: string;
  email?: string;
  status?: string;
  tanggalMulai?: Date | string | null;
  tanggalSelesai?: Date | string | null;
  catatan?: string | null;
}

export const penanggungJawabRepository = {
  getNextKode: async (): Promise<string> => {
    const latest = await prisma.penanggungJawab.findFirst({
      where: {
        kodePersonel: {
          startsWith: 'PJ-',
        },
      },
      orderBy: {
        kodePersonel: 'desc',
      },
    });

    if (!latest || !latest.kodePersonel) {
      return 'PJ-001';
    }

    const match = latest.kodePersonel.match(/PJ-(\d+)/);
    if (!match) return 'PJ-001';

    const nextNum = parseInt(match[1] || '0', 10) + 1;
    return `PJ-${String(nextNum).padStart(3, '0')}`;
  },

  create: async (data: CreatePenanggungJawabData) => {
    let kode = data.kodePersonel?.trim();
    if (!kode) {
      kode = await penanggungJawabRepository.getNextKode();
    }

    return prisma.penanggungJawab.create({
      data: {
        kodePersonel: kode,
        nama: data.nama.trim(),
        peran: data.peran || 'Penanggung Jawab',
        areaModul: data.areaModul || 'Produksi',
        lokasi: data.lokasi || 'Semua Lokasi',
        noHp: data.noHp?.trim() || null,
        email: data.email?.trim() || null,
        status: data.status || 'Aktif',
        tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) : null,
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        catatan: data.catatan?.trim() || null,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.penanggungJawab.findUnique({
      where: { id },
    });
  },

  update: async (id: string, data: UpdatePenanggungJawabData) => {
    const updatePayload: any = {};

    if (data.kodePersonel !== undefined) updatePayload.kodePersonel = data.kodePersonel?.trim() || null;
    if (data.nama !== undefined) updatePayload.nama = data.nama.trim();
    if (data.peran !== undefined) updatePayload.peran = data.peran;
    if (data.areaModul !== undefined) updatePayload.areaModul = data.areaModul;
    if (data.lokasi !== undefined) updatePayload.lokasi = data.lokasi;
    if (data.noHp !== undefined) updatePayload.noHp = data.noHp?.trim() || null;
    if (data.email !== undefined) updatePayload.email = data.email?.trim() || null;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.tanggalMulai !== undefined) updatePayload.tanggalMulai = data.tanggalMulai ? new Date(data.tanggalMulai) : null;
    if (data.tanggalSelesai !== undefined) updatePayload.tanggalSelesai = data.tanggalSelesai ? new Date(data.tanggalSelesai) : null;
    if (data.catatan !== undefined) updatePayload.catatan = data.catatan?.trim() || null;

    return prisma.penanggungJawab.update({
      where: { id },
      data: updatePayload,
    });
  },

  delete: async (id: string) => {
    return prisma.penanggungJawab.delete({
      where: { id },
    });
  },

  findAll: async (filters: PenanggungJawabFilter = {}) => {
    const {
      search,
      peran,
      areaModul,
      lokasi,
      status,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (status && status !== 'ALL' && status !== 'Semua') {
      where.status = status;
    }

    if (peran && peran !== 'ALL' && peran !== 'Semua') {
      where.peran = peran;
    }

    if (areaModul && areaModul !== 'ALL' && areaModul !== 'Semua') {
      where.areaModul = areaModul;
    }

    if (lokasi && lokasi !== 'ALL' && lokasi !== 'Semua') {
      where.lokasi = lokasi;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { nama: { contains: q } },
        { kodePersonel: { contains: q } },
        { peran: { contains: q } },
        { areaModul: { contains: q } },
        { lokasi: { contains: q } },
        { email: { contains: q } },
        { noHp: { contains: q } },
      ];
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [total, data] = await Promise.all([
      prisma.penanggungJawab.count({ where }),
      prisma.penanggungJawab.findMany({
        where,
        skip,
        take,
        orderBy: [
          { kodePersonel: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    return {
      data,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: Number(page),
        pageSize: take,
      },
    };
  },

  getStats: async () => {
    const [totalPersonel, kepalaProduksi, penanggungJawab, aktif, nonaktif] = await Promise.all([
      prisma.penanggungJawab.count(),
      prisma.penanggungJawab.count({ where: { peran: 'Kepala Produksi' } }),
      prisma.penanggungJawab.count({ where: { peran: 'Penanggung Jawab' } }),
      prisma.penanggungJawab.count({ where: { status: 'Aktif' } }),
      prisma.penanggungJawab.count({ where: { status: { in: ['Nonaktif', 'Tidak Aktif'] } } }),
    ]);

    return {
      totalPersonel,
      kepalaProduksi,
      penanggungJawab,
      aktif,
      nonaktif,
    };
  },
};
