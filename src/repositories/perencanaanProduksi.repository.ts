import { prisma } from '../utils/prisma';

export interface PerencanaanProduksiFilter {
  search?: string;
  periode?: string;
  status?: string;
  komoditas?: string;
  varietas?: string;
  namaPetani?: string;
  page?: number;
  limit?: number;
}

export const perencanaanProduksiRepository = {
  async findAll(filter: PerencanaanProduksiFilter = {}) {
    const {
      search,
      periode,
      status,
      komoditas,
      varietas,
      namaPetani,
      page = 1,
      limit = 10
    } = filter;

    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { noPerencanaan: { contains: q } },
        { komoditas: { contains: q } },
        { varietas: { contains: q } },
        { namaPetani: { contains: q } },
      ];
    }

    if (periode && periode !== 'all' && periode !== 'Semua Periode') {
      where.periode = { contains: periode };
    }

    if (status && status !== 'all' && status !== 'Semua Status' && status !== 'Semua status') {
      where.status = status;
    }

    if (komoditas && komoditas !== 'all' && komoditas !== 'Semua Komoditas' && komoditas !== 'Semua komoditas') {
      where.komoditas = komoditas;
    }

    if (varietas && varietas !== 'all' && varietas !== 'Semua Varietas' && varietas !== 'Semua varietas') {
      where.varietas = varietas;
    }

    if (namaPetani && namaPetani !== 'all' && namaPetani !== 'Semua Petani' && namaPetani !== 'Semua petani') {
      where.namaPetani = { contains: namaPetani };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [items, total] = await Promise.all([
      prisma.perencanaanProduksi.findMany({
        where,
        skip,
        take,
        orderBy: { noPerencanaan: 'asc' }
      }),
      prisma.perencanaanProduksi.count({ where })
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    };
  },

  async findById(id: string) {
    return prisma.perencanaanProduksi.findFirst({
      where: {
        OR: [{ id }, { noPerencanaan: id }]
      }
    });
  },

  async create(data: any) {
    // calculate produksiTerpenuhi if target & aktual provided
    const target = Number(data.targetProduksi) || 0;
    const aktual = Number(data.aktualProduksi) || 0;
    const terpenuhi = target > 0 ? Number(((aktual / target) * 100).toFixed(1)) : 0;

    return prisma.perencanaanProduksi.create({
      data: {
        ...data,
        targetProduksi: target,
        aktualProduksi: aktual,
        produksiTerpenuhi: data.produksiTerpenuhi !== undefined ? Number(data.produksiTerpenuhi) : terpenuhi,
        targetLuasLahan: Number(data.targetLuasLahan) || 0,
        lahanTersedia: Number(data.lahanTersedia) || 0,
        realisasiTanam: Number(data.realisasiTanam) || 0,
        kebutuhanBenih: Number(data.kebutuhanBenih) || 0,
        estimasiHasilPerHa: Number(data.estimasiHasilPerHa) || 0,
      }
    });
  },

  async update(id: string, data: any) {
    const target = data.targetProduksi !== undefined ? Number(data.targetProduksi) : undefined;
    const aktual = data.aktualProduksi !== undefined ? Number(data.aktualProduksi) : undefined;

    let terpenuhi = data.produksiTerpenuhi !== undefined ? Number(data.produksiTerpenuhi) : undefined;
    if (terpenuhi === undefined && target !== undefined && aktual !== undefined && target > 0) {
      terpenuhi = Number(((aktual / target) * 100).toFixed(1));
    }

    return prisma.perencanaanProduksi.update({
      where: { id },
      data: {
        ...data,
        ...(target !== undefined ? { targetProduksi: target } : {}),
        ...(aktual !== undefined ? { aktualProduksi: aktual } : {}),
        ...(terpenuhi !== undefined ? { produksiTerpenuhi: terpenuhi } : {}),
        ...(data.targetLuasLahan !== undefined ? { targetLuasLahan: Number(data.targetLuasLahan) } : {}),
        ...(data.lahanTersedia !== undefined ? { lahanTersedia: Number(data.lahanTersedia) } : {}),
        ...(data.realisasiTanam !== undefined ? { realisasiTanam: Number(data.realisasiTanam) } : {}),
        ...(data.kebutuhanBenih !== undefined ? { kebutuhanBenih: Number(data.kebutuhanBenih) } : {}),
        ...(data.estimasiHasilPerHa !== undefined ? { estimasiHasilPerHa: Number(data.estimasiHasilPerHa) } : {}),
      }
    });
  },

  async delete(id: string) {
    return prisma.perencanaanProduksi.delete({
      where: { id }
    });
  },

  async getStats() {
    const all = await prisma.perencanaanProduksi.findMany();
    const totalRencana = all.length;
    const totalTargetProduksi = all.reduce((sum, x) => sum + (x.targetProduksi || 0), 0);
    const totalAktualProduksi = all.reduce((sum, x) => sum + (x.aktualProduksi || 0), 0);
    const totalKebutuhanBenih = all.reduce((sum, x) => sum + (x.kebutuhanBenih || 0), 0);
    const totalLuasLahan = all.reduce((sum, x) => sum + (x.targetLuasLahan || 0), 0);

    // Distinct farmers
    const farmers = new Set(all.map((x) => x.namaPetani).filter(Boolean));
    const jumlahPetani = farmers.size;

    return {
      totalRencana,
      totalTargetProduksi,
      totalAktualProduksi,
      totalKebutuhanBenih,
      totalLuasLahan,
      jumlahPetani: jumlahPetani || 8,
      persenTerpenuhiRataRata: totalTargetProduksi > 0 ? Number(((totalAktualProduksi / totalTargetProduksi) * 100).toFixed(1)) : 0
    };
  }
};
