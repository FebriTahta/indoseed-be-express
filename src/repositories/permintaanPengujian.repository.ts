import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export interface PermintaanFilterOptions {
  search?: string;
  status?: string;
  periode?: string;
  startDate?: string;
  endDate?: string;
  komoditas?: string;
  prioritas?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const permintaanPengujianRepository = {
  findAll: async (filters: PermintaanFilterOptions = {}) => {
    const where: Prisma.PermintaanPengujianWhereInput = {};

    // Search query across number, batch, commodity, variety, and farmer
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.trim();
      where.OR = [
        { noPermintaan: { contains: q } },
        { kodeBatch: { contains: q } },
        { komoditas: { contains: q } },
        { varietas: { contains: q } },
        { petani: { contains: q } },
        { pemohon: { contains: q } },
        { pengambilSampel: { contains: q } },
      ];
    }

    // Status filter
    if (filters.status && filters.status.trim() !== '') {
      const st = filters.status.trim();
      // Allow matching frontend simple keys or full status names
      if (st.toLowerCase() === 'menunggu' || st.toLowerCase() === 'menunggu_persetujuan') {
        where.status = 'Menunggu Persetujuan';
      } else if (st.toLowerCase() === 'sampling') {
        where.status = 'Sampling';
      } else if (st.toLowerCase() === 'dalam_pengujian' || st.toLowerCase() === 'pengujian') {
        where.status = 'Dalam Pengujian';
      } else if (st.toLowerCase() === 'menunggu_review' || st.toLowerCase() === 'review') {
        where.status = 'Menunggu Review';
      } else if (st.toLowerCase() === 'selesai') {
        where.status = 'Selesai';
      } else if (st.toLowerCase() === 'ditolak') {
        where.status = 'Ditolak';
      } else {
        where.status = { contains: st };
      }
    }

    // Commodity filter
    if (filters.komoditas && filters.komoditas.trim() !== '') {
      where.komoditas = { contains: filters.komoditas.trim() };
    }

    // Priority filter
    if (filters.prioritas && filters.prioritas.trim() !== '') {
      where.prioritas = { equals: filters.prioritas.trim().toLowerCase() };
    }

    // Period filter
    const now = new Date();
    if (filters.periode) {
      if (filters.periode === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        where.tanggal = { gte: startOfDay, lte: endOfDay };
      } else if (filters.periode === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.tanggal = { gte: sevenDaysAgo };
      } else if (filters.periode === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        where.tanggal = { gte: startOfMonth };
      }
    }

    // Custom date range filter
    if (filters.startDate || filters.endDate) {
      where.tanggal = where.tanggal || {};
      if (filters.startDate) {
        where.tanggal = { ...(where.tanggal as any), gte: new Date(filters.startDate) };
      }
      if (filters.endDate) {
        where.tanggal = { ...(where.tanggal as any), lte: new Date(filters.endDate) };
      }
    }

    const page = Number(filters.page) || 1;
    const pageSize = Number(filters.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const total = await prisma.permintaanPengujian.count({ where });

    const validSortFields = ['updatedAt', 'createdAt', 'tanggal', 'noPermintaan', 'status'];
    const sortBy = filters.sortBy && validSortFields.includes(filters.sortBy) ? filters.sortBy : 'updatedAt';
    const sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';

    const items = await prisma.permintaanPengujian.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        parameters: {
          orderBy: { createdAt: 'asc' },
        },
        dokumen: true,
        batchProduksi: true,
      },
    });

    return {
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  },

  findById: async (id: string) => {
    return prisma.permintaanPengujian.findFirst({
      where: {
        OR: [{ id }, { noPermintaan: id }],
      },
      include: {
        parameters: {
          orderBy: { createdAt: 'asc' },
        },
        dokumen: true,
        batchProduksi: true,
      },
    });
  },

  getSummary: async (filters: { startDate?: string; endDate?: string } = {}) => {
    const where: Prisma.PermintaanPengujianWhereInput = {};
    if (filters.startDate || filters.endDate) {
      where.tanggal = {};
      if (filters.startDate) where.tanggal.gte = new Date(filters.startDate);
      if (filters.endDate) where.tanggal.lte = new Date(filters.endDate);
    }

    const [
      total,
      menungguPersetujuan,
      sampling,
      dalamPengujian,
      menungguReview,
      selesai,
      ditolak,
    ] = await Promise.all([
      prisma.permintaanPengujian.count({ where }),
      prisma.permintaanPengujian.count({
        where: { ...where, status: 'Menunggu Persetujuan' },
      }),
      prisma.permintaanPengujian.count({
        where: { ...where, status: 'Sampling' },
      }),
      prisma.permintaanPengujian.count({
        where: { ...where, status: 'Dalam Pengujian' },
      }),
      prisma.permintaanPengujian.count({
        where: { ...where, status: 'Menunggu Review' },
      }),
      prisma.permintaanPengujian.count({
        where: { ...where, status: 'Selesai' },
      }),
      prisma.permintaanPengujian.count({
        where: { ...where, status: 'Ditolak' },
      }),
    ]);

    return {
      total,
      menungguPersetujuan,
      sampling,
      dalamPengujian,
      menungguReview,
      selesai,
      ditolak,
    };
  },

  generateNextNumber: async (): Promise<string> => {
    const currentYear = new Date().getFullYear();
    const prefix = `RQ-QC-${currentYear}-`;

    const latest = await prisma.permintaanPengujian.findFirst({
      where: {
        noPermintaan: { startsWith: prefix },
      },
      orderBy: { noPermintaan: 'desc' },
      select: { noPermintaan: true },
    });

    let nextSeq = 1;
    if (latest && latest.noPermintaan) {
      const parts = latest.noPermintaan.split('-');
      const lastNumStr = parts[parts.length - 1];
      if (lastNumStr) {
        const parsed = parseInt(lastNumStr, 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      }
    }

    return `${prefix}${String(nextSeq).padStart(5, '0')}`;
  },

  create: async (data: any) => {
    const { parameters, dokumen, ...headerData } = data;

    // Auto-generate number if not provided
    if (!headerData.noPermintaan || headerData.noPermintaan.trim() === '') {
      headerData.noPermintaan = await permintaanPengujianRepository.generateNextNumber();
    }

    // Try linking to BatchProduksi if batchProduksiId not set but kodeBatch is provided
    if (!headerData.batchProduksiId && headerData.kodeBatch) {
      const match = await prisma.batchProduksi.findUnique({
        where: { kodeBatch: headerData.kodeBatch },
      });
      if (match) {
        headerData.batchProduksiId = match.id;
      }
    }

    // Convert date string if string
    if (headerData.tanggal && typeof headerData.tanggal === 'string') {
      headerData.tanggal = new Date(headerData.tanggal);
    }
    if (headerData.jumlahSampel !== undefined) {
      headerData.jumlahSampel = Number(headerData.jumlahSampel) || 0;
    }

    return prisma.$transaction(async (tx) => {
      const created = await tx.permintaanPengujian.create({
        data: headerData,
      });

      if (Array.isArray(parameters) && parameters.length > 0) {
        for (const p of parameters) {
          await tx.permintaanPengujianParameter.create({
            data: {
              permintaanId: created.id,
              parameterId: p.parameterId || null,
              kode: p.kode || 'P-UNKNOWN',
              nama: p.nama || p.parameter || 'Parameter',
              kategori: p.kategori || null,
              metodeId: p.metodeId || null,
              metode: p.metode || null,
              metodeKode: p.metodeKode || null,
              metodeNama: p.metodeNama || null,
              standar: p.standar || null,
              satuan: p.satuan || null,
              checked: p.checked !== undefined ? Boolean(p.checked) : true,
              definisi: p.definisi || null,
              keterangan: p.keterangan || null,
              isCustom: Boolean(p.isCustom),
            },
          });
        }
      }

      if (Array.isArray(dokumen) && dokumen.length > 0) {
        for (const d of dokumen) {
          await tx.permintaanPengujianDokumen.create({
            data: {
              permintaanId: created.id,
              namaFile: d.namaFile || d.fileName || 'Dokumen',
              fileUrl: d.fileUrl || d.url || '',
              tipeFile: d.tipeFile || d.type || null,
              ukuran: d.ukuran || d.size || null,
            },
          });
        }
      }

      return tx.permintaanPengujian.findUnique({
        where: { id: created.id },
        include: {
          parameters: true,
          dokumen: true,
          batchProduksi: true,
        },
      });
    });
  },

  update: async (id: string, data: any) => {
    const { parameters, dokumen, ...headerData } = data;

    // Convert date if present
    if (headerData.tanggal && typeof headerData.tanggal === 'string') {
      headerData.tanggal = new Date(headerData.tanggal);
    }
    if (headerData.jumlahSampel !== undefined) {
      headerData.jumlahSampel = Number(headerData.jumlahSampel) || 0;
    }

    // Try linking to BatchProduksi if kodeBatch changed
    if (!headerData.batchProduksiId && headerData.kodeBatch) {
      const match = await prisma.batchProduksi.findUnique({
        where: { kodeBatch: headerData.kodeBatch },
      });
      if (match) {
        headerData.batchProduksiId = match.id;
      }
    }

    return prisma.$transaction(async (tx) => {
      // Find existing
      const existing = await tx.permintaanPengujian.findFirst({
        where: { OR: [{ id }, { noPermintaan: id }] },
      });

      if (!existing) {
        throw new Error('Permintaan pengujian tidak ditemukan');
      }

      const updated = await tx.permintaanPengujian.update({
        where: { id: existing.id },
        data: headerData,
      });

      // Update parameters if array is provided
      if (Array.isArray(parameters)) {
        await tx.permintaanPengujianParameter.deleteMany({
          where: { permintaanId: existing.id },
        });

        for (const p of parameters) {
          await tx.permintaanPengujianParameter.create({
            data: {
              permintaanId: existing.id,
              parameterId: p.parameterId || null,
              kode: p.kode || 'P-UNKNOWN',
              nama: p.nama || p.parameter || 'Parameter',
              kategori: p.kategori || null,
              metodeId: p.metodeId || null,
              metode: p.metode || null,
              metodeKode: p.metodeKode || null,
              metodeNama: p.metodeNama || null,
              standar: p.standar || null,
              satuan: p.satuan || null,
              checked: p.checked !== undefined ? Boolean(p.checked) : true,
              definisi: p.definisi || null,
              keterangan: p.keterangan || null,
              isCustom: Boolean(p.isCustom),
            },
          });
        }
      }

      // Add new documents if provided
      if (Array.isArray(dokumen) && dokumen.length > 0) {
        for (const d of dokumen) {
          await tx.permintaanPengujianDokumen.create({
            data: {
              permintaanId: existing.id,
              namaFile: d.namaFile || d.fileName || 'Dokumen',
              fileUrl: d.fileUrl || d.url || '',
              tipeFile: d.tipeFile || d.type || null,
              ukuran: d.ukuran || d.size || null,
            },
          });
        }
      }

      return tx.permintaanPengujian.findUnique({
        where: { id: existing.id },
        include: {
          parameters: true,
          dokumen: true,
          batchProduksi: true,
        },
      });
    });
  },

  updateStatus: async (id: string, status: string, diubahOleh: string = 'Admin') => {
    const existing = await prisma.permintaanPengujian.findFirst({
      where: { OR: [{ id }, { noPermintaan: id }] },
    });
    if (!existing) {
      throw new Error('Permintaan pengujian tidak ditemukan');
    }

    return prisma.permintaanPengujian.update({
      where: { id: existing.id },
      data: {
        status,
        diubahOleh,
      },
      include: {
        parameters: true,
        dokumen: true,
      },
    });
  },

  delete: async (id: string) => {
    const existing = await prisma.permintaanPengujian.findFirst({
      where: { OR: [{ id }, { noPermintaan: id }] },
    });
    if (!existing) {
      throw new Error('Permintaan pengujian tidak ditemukan');
    }

    return prisma.permintaanPengujian.delete({
      where: { id: existing.id },
    });
  },
};
