import { prisma } from '../utils/prisma';

export interface KelompokTaniFilter {
  search?: string;
  lokasi?: string;
  komoditasUtama?: string;
  status?: string;
  penanggungJawabId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateKelompokTaniData {
  kodeKelompok?: string;
  namaKelompok: string;
  ketua: string;
  noHpKetua?: string | null;
  tahunBerdiri?: string | null;
  lokasi: string;
  desa?: string | null;
  kecamatan?: string | null;
  kabupaten?: string | null;
  komoditasUtama: string;
  commodityId?: string | null;
  jumlahAnggota?: number;
  deskripsi?: string | null;
  status?: string;
  penanggungJawabId?: string | null;
  dibuatOleh?: string;
}

export interface UpdateKelompokTaniData {
  kodeKelompok?: string;
  namaKelompok?: string;
  ketua?: string;
  noHpKetua?: string | null;
  tahunBerdiri?: string | null;
  lokasi?: string;
  desa?: string | null;
  kecamatan?: string | null;
  kabupaten?: string | null;
  komoditasUtama?: string;
  commodityId?: string | null;
  jumlahAnggota?: number;
  deskripsi?: string | null;
  status?: string;
  penanggungJawabId?: string | null;
  diubahOleh?: string;
}

export const kelompokTaniRepository = {
  getNextKode: async (): Promise<string> => {
    const latest = await prisma.kelompokTani.findFirst({
      where: {
        kodeKelompok: {
          startsWith: 'KT-',
        },
      },
      orderBy: {
        kodeKelompok: 'desc',
      },
    });

    if (!latest || !latest.kodeKelompok) {
      return 'KT-001';
    }

    const match = latest.kodeKelompok.match(/KT-(\d+)/);
    if (!match) return 'KT-001';

    const nextNum = parseInt(match[1] || '0', 10) + 1;
    return `KT-${String(nextNum).padStart(3, '0')}`;
  },

  create: async (data: CreateKelompokTaniData) => {
    let kode = data.kodeKelompok?.trim();
    if (!kode) {
      kode = await kelompokTaniRepository.getNextKode();
    }

    return prisma.kelompokTani.create({
      data: {
        kodeKelompok: kode,
        namaKelompok: data.namaKelompok.trim(),
        ketua: data.ketua.trim(),
        noHpKetua: data.noHpKetua?.trim() || null,
        tahunBerdiri: data.tahunBerdiri?.trim() || null,
        lokasi: data.lokasi.trim(),
        desa: data.desa?.trim() || null,
        kecamatan: data.kecamatan?.trim() || null,
        kabupaten: data.kabupaten?.trim() || null,
        komoditasUtama: data.komoditasUtama.trim(),
        commodityId: data.commodityId || null,
        jumlahAnggota: Number(data.jumlahAnggota) || 0,
        deskripsi: data.deskripsi?.trim() || null,
        status: data.status || 'Aktif',
        penanggungJawabId: data.penanggungJawabId || null,
        dibuatOleh: data.dibuatOleh || 'Admin',
      },
      include: {
        penanggungJawab: true,
        commodity: true,
        partners: {
          select: {
            id: true,
            kodePetani: true,
            namaPetani: true,
            status: true,
            noTelepon: true,
          },
        },
      },
    });
  },

  findById: async (id: string) => {
    return prisma.kelompokTani.findUnique({
      where: { id },
      include: {
        penanggungJawab: true,
        commodity: true,
        partners: {
          select: {
            id: true,
            kodePetani: true,
            namaPetani: true,
            status: true,
            noTelepon: true,
            alamat: true,
          },
        },
      },
    });
  },

  findByKode: async (kodeKelompok: string) => {
    return prisma.kelompokTani.findUnique({
      where: { kodeKelompok },
    });
  },

  update: async (id: string, data: UpdateKelompokTaniData) => {
    const updatePayload: any = {};

    if (data.kodeKelompok !== undefined) updatePayload.kodeKelompok = data.kodeKelompok?.trim() || null;
    if (data.namaKelompok !== undefined) updatePayload.namaKelompok = data.namaKelompok.trim();
    if (data.ketua !== undefined) updatePayload.ketua = data.ketua.trim();
    if (data.noHpKetua !== undefined) updatePayload.noHpKetua = data.noHpKetua?.trim() || null;
    if (data.tahunBerdiri !== undefined) updatePayload.tahunBerdiri = data.tahunBerdiri?.trim() || null;
    if (data.lokasi !== undefined) updatePayload.lokasi = data.lokasi.trim();
    if (data.desa !== undefined) updatePayload.desa = data.desa?.trim() || null;
    if (data.kecamatan !== undefined) updatePayload.kecamatan = data.kecamatan?.trim() || null;
    if (data.kabupaten !== undefined) updatePayload.kabupaten = data.kabupaten?.trim() || null;
    if (data.komoditasUtama !== undefined) updatePayload.komoditasUtama = data.komoditasUtama.trim();
    if (data.commodityId !== undefined) updatePayload.commodityId = data.commodityId || null;
    if (data.jumlahAnggota !== undefined) updatePayload.jumlahAnggota = Number(data.jumlahAnggota) || 0;
    if (data.deskripsi !== undefined) updatePayload.deskripsi = data.deskripsi?.trim() || null;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.penanggungJawabId !== undefined) updatePayload.penanggungJawabId = data.penanggungJawabId || null;
    if (data.diubahOleh !== undefined) updatePayload.diubahOleh = data.diubahOleh;

    return prisma.kelompokTani.update({
      where: { id },
      data: updatePayload,
      include: {
        penanggungJawab: true,
        commodity: true,
        partners: {
          select: {
            id: true,
            kodePetani: true,
            namaPetani: true,
            status: true,
            noTelepon: true,
          },
        },
      },
    });
  },

  delete: async (id: string) => {
    return prisma.kelompokTani.delete({
      where: { id },
    });
  },

  findAll: async (filters: KelompokTaniFilter = {}) => {
    const {
      search,
      lokasi,
      komoditasUtama,
      status,
      penanggungJawabId,
      page = 1,
      pageSize = 10,
    } = filters;

    const andConditions: any[] = [];

    if (status && status !== 'ALL' && status !== 'Semua' && status !== 'Semua Status') {
      andConditions.push({ status });
    }

    if (lokasi && lokasi !== 'ALL' && lokasi !== 'Semua' && lokasi !== 'Semua Lokasi') {
      andConditions.push({
        OR: [
          { lokasi: { contains: lokasi } },
          { desa: { contains: lokasi } },
          { kecamatan: { contains: lokasi } },
          { kabupaten: { contains: lokasi } },
        ],
      });
    }

    if (komoditasUtama && komoditasUtama !== 'ALL' && komoditasUtama !== 'Semua' && komoditasUtama !== 'Semua Komoditas') {
      andConditions.push({
        komoditasUtama: { contains: komoditasUtama },
      });
    }

    if (penanggungJawabId && penanggungJawabId !== 'ALL' && penanggungJawabId !== 'Semua') {
      andConditions.push({ penanggungJawabId });
    }

    if (search && search.trim()) {
      const q = search.trim();
      andConditions.push({
        OR: [
          { namaKelompok: { contains: q } },
          { kodeKelompok: { contains: q } },
          { ketua: { contains: q } },
          { lokasi: { contains: q } },
          { desa: { contains: q } },
          { kecamatan: { contains: q } },
          { kabupaten: { contains: q } },
          { komoditasUtama: { contains: q } },
        ],
      });
    }

    const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [total, data] = await Promise.all([
      prisma.kelompokTani.count({ where }),
      prisma.kelompokTani.findMany({
        where,
        skip,
        take,
        orderBy: [
          { kodeKelompok: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          penanggungJawab: true,
          commodity: true,
          _count: {
            select: { partners: true },
          },
          partners: {
            take: 5,
            select: {
              id: true,
              kodePetani: true,
              namaPetani: true,
              status: true,
              noTelepon: true,
            },
          },
        },
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
    const all = await prisma.kelompokTani.findMany({
      select: {
        id: true,
        lokasi: true,
        jumlahAnggota: true,
        komoditasUtama: true,
        status: true,
        _count: {
          select: { partners: true },
        },
      },
    });

    const totalKelompok = all.length;
    let totalAnggota = 0;
    let statusAktifCount = 0;
    const komoditasCountMap: Record<string, number> = {};
    const lokasiSet = new Set<string>();

    for (const item of all) {
      if (item.lokasi) {
        lokasiSet.add(item.lokasi);
      }
      const count = item.jumlahAnggota > 0 ? item.jumlahAnggota : item._count.partners;
      totalAnggota += count;

      if (item.status === 'Aktif') {
        statusAktifCount += 1;
      }

      if (item.komoditasUtama) {
        const parts = item.komoditasUtama.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
        for (const p of parts) {
          komoditasCountMap[p] = (komoditasCountMap[p] || 0) + 1;
        }
      }
    }

    const sortedKomoditas = Object.keys(komoditasCountMap).sort(
      (a, b) => (komoditasCountMap[b] || 0) - (komoditasCountMap[a] || 0)
    );
    const topKomoditas = sortedKomoditas.slice(0, 3).join(', ') || 'Melon, Cabai, Semangka';

    return {
      totalKelompok,
      totalAnggota,
      komoditasUtama: topKomoditas,
      statusAktifCount,
      totalCount: totalKelompok,
      allLokasi: Array.from(lokasiSet),
      allKomoditas: sortedKomoditas,
    };
  },
};
