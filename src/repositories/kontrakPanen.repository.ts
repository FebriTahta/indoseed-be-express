import { prisma } from '../utils/prisma';

export interface KontrakPanenFilter {
  search?: string;
  komoditas?: string;
  varietas?: string;
  tipePanenan?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const kontrakPanenRepository = {
  async findAll(filter: KontrakPanenFilter = {}) {
    const {
      search,
      komoditas,
      varietas,
      tipePanenan,
      status,
      page = 1,
      limit = 10,
    } = filter;

    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { noKontrak: { contains: q } },
        { komoditas: { contains: q } },
        { varietas: { contains: q } },
        { keterangan: { contains: q } },
      ];
    }

    if (komoditas && komoditas !== 'all' && komoditas !== 'Semua Komoditas') {
      where.komoditas = komoditas;
    }

    if (varietas && varietas !== 'all' && varietas !== 'Semua Varietas') {
      where.varietas = varietas;
    }

    if (tipePanenan && tipePanenan !== 'all' && tipePanenan !== 'Semua Tipe Panenan') {
      where.tipePanenan = tipePanenan;
    }

    if (status && status !== 'all' && status !== 'Semua Status') {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [items, total] = await Promise.all([
      (prisma as any).kontrakPanen.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          commodity: true,
          variety: true,
        },
      }),
      (prisma as any).kontrakPanen.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  },

  async findById(id: string) {
    return (prisma as any).kontrakPanen.findFirst({
      where: {
        OR: [{ id }, { noKontrak: id }],
      },
      include: {
        commodity: true,
        variety: true,
      },
    });
  },

  async getNextNoKontrak() {
    const year = new Date().getFullYear();
    const count = await (prisma as any).kontrakPanen.count();
    const nextNum = (count + 1).toString().padStart(3, '0');
    return `KTR-PNH-${year}-${nextNum}`;
  },

  async create(data: any) {
    if (!data.noKontrak) {
      data.noKontrak = await this.getNextNoKontrak();
    }

    // Try finding commodity / variety by name or id
    if (!data.commodityId && data.komoditas) {
      const comm = await prisma.commodity.findFirst({
        where: { namaKomoditas: { contains: data.komoditas } },
      });
      if (comm) data.commodityId = comm.id;
    }

    if (!data.varietyId && data.varietas) {
      const varItem = await prisma.variety.findFirst({
        where: { namaVarietas: { contains: data.varietas } },
      });
      if (varItem) data.varietyId = varItem.id;
    }

    const payload: any = {
      noKontrak: data.noKontrak,
      commodityId: data.commodityId || null,
      komoditas: data.komoditas || '',
      varietyId: data.varietyId || null,
      varietas: data.varietas || '',
      tipePanenan: data.tipePanenan || 'Glondong / Fresh',
      nilaiKontrak: Number(data.nilaiKontrak) || 0,
      feeKelompok: data.feeKelompok !== undefined && data.feeKelompok !== null && data.feeKelompok !== ''
        ? Number(data.feeKelompok)
        : 0,
      satuan: data.satuan || 'Kg',
      umurPanen: Number(data.umurPanen) || 0,
      periodeMulai: data.periodeMulai ? new Date(data.periodeMulai) : null,
      periodeSelesai: data.periodeSelesai ? new Date(data.periodeSelesai) : null,
      status: data.status || 'Aktif',
      keterangan: data.keterangan || null,
      dibuatOleh: data.dibuatOleh || 'Admin',
      diubahOleh: data.diubahOleh || 'Admin',
    };

    return (prisma as any).kontrakPanen.create({
      data: payload,
      include: {
        commodity: true,
        variety: true,
      },
    });
  },

  async update(id: string, data: any) {
    const existing = await (prisma as any).kontrakPanen.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`Data Kontrak Panen dengan id ${id} tidak ditemukan`);
    }

    const payload: any = {
      ...(data.noKontrak !== undefined && { noKontrak: data.noKontrak }),
      ...(data.commodityId !== undefined && { commodityId: data.commodityId || null }),
      ...(data.komoditas !== undefined && { komoditas: data.komoditas }),
      ...(data.varietyId !== undefined && { varietyId: data.varietyId || null }),
      ...(data.varietas !== undefined && { varietas: data.varietas }),
      ...(data.tipePanenan !== undefined && { tipePanenan: data.tipePanenan }),
      ...(data.nilaiKontrak !== undefined && { nilaiKontrak: Number(data.nilaiKontrak) || 0 }),
      ...(data.feeKelompok !== undefined && {
        feeKelompok: data.feeKelompok !== null && data.feeKelompok !== '' ? Number(data.feeKelompok) : 0,
      }),
      ...(data.satuan !== undefined && { satuan: data.satuan }),
      ...(data.umurPanen !== undefined && { umurPanen: Number(data.umurPanen) || 0 }),
      ...(data.periodeMulai !== undefined && {
        periodeMulai: data.periodeMulai ? new Date(data.periodeMulai) : null,
      }),
      ...(data.periodeSelesai !== undefined && {
        periodeSelesai: data.periodeSelesai ? new Date(data.periodeSelesai) : null,
      }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.keterangan !== undefined && { keterangan: data.keterangan }),
      ...(data.diubahOleh !== undefined && { diubahOleh: data.diubahOleh || 'Admin' }),
    };

    return (prisma as any).kontrakPanen.update({
      where: { id },
      data: payload,
      include: {
        commodity: true,
        variety: true,
      },
    });
  },

  async delete(id: string) {
    return (prisma as any).kontrakPanen.delete({
      where: { id },
    });
  },

  async getStats() {
    const [total, aktif, tidakAktif, draft] = await Promise.all([
      (prisma as any).kontrakPanen.count(),
      (prisma as any).kontrakPanen.count({ where: { status: 'Aktif' } }),
      (prisma as any).kontrakPanen.count({ where: { status: 'Tidak Aktif' } }),
      (prisma as any).kontrakPanen.count({ where: { status: 'Draft' } }),
    ]);

    return {
      total,
      aktif,
      tidakAktif,
      draft,
    };
  },

  async getHarvestTypesByVariety(varietyId?: string) {
    const where: any = { status: 'Aktif' };
    if (varietyId && varietyId !== 'all') {
      where.varietyId = varietyId;
    }
    return (prisma as any).harvestType.findMany({
      where,
      include: {
        prices: {
          orderBy: { createdAt: 'desc' },
        },
        variety: true,
      },
      orderBy: { nama: 'asc' },
    });
  },
};

