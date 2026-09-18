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
        orderBy: { noPerencanaan: 'asc' },
        include: {
          petaniDistribusi: {
            include: {
              partner: true,
              greenhouse: true,
            },
          },
          partner: true,
          greenhouse: true,
          commodity: true,
          variety: true,
        }
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
      },
      include: {
        petaniDistribusi: {
          include: {
            partner: true,
            greenhouse: true,
          },
        },
        partner: true,
        greenhouse: true,
        commodity: true,
        variety: true,
      }
    });
  },

  async create(data: any) {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      commodity: _commodity,
      variety: _variety,
      partner: _partner,
      greenhouse: _greenhouse,
      petaniDistribusi,
      produk: _produk,
      ...restData
    } = data;

    // calculate produksiTerpenuhi if target & aktual provided
    const target = Number(restData.targetProduksi) || 0;
    const aktual = Number(restData.aktualProduksi) || 0;
    const terpenuhi = target > 0 ? Number(((aktual / target) * 100).toFixed(1)) : 0;

    const createPayload: any = {
      ...restData,
      targetProduksi: target,
      aktualProduksi: aktual,
      produksiTerpenuhi: restData.produksiTerpenuhi !== undefined ? Number(restData.produksiTerpenuhi) : terpenuhi,
      targetLuasLahan: Number(restData.targetLuasLahan) || 0,
      lahanTersedia: Number(restData.lahanTersedia) || 0,
      realisasiTanam: Number(restData.realisasiTanam) || 0,
      kebutuhanBenih: Number(restData.kebutuhanBenih) || 0,
      estimasiHasilPerHa: Number(restData.estimasiHasilPerHa) || 0,
      periodeMulai: restData.periodeMulai ? new Date(restData.periodeMulai) : null,
      periodeSelesai: restData.periodeSelesai ? new Date(restData.periodeSelesai) : null,
    };

    if (Array.isArray(petaniDistribusi) && petaniDistribusi.length > 0) {
      createPayload.petaniDistribusi = {
        create: petaniDistribusi.map((p: any) => ({
          partnerId: p.partnerId || null,
          namaPetani: p.namaPetani,
          greenhouseId: p.greenhouseId || null,
          namaLahan: p.namaLahan || null,
          luasLahan: Number(p.luasLahan) || 0,
          targetProduksi: Number(p.targetProduksi) || 0,
          tanggalTanam: p.tanggalTanam ? new Date(p.tanggalTanam) : null,
          tanggalPanen: p.tanggalPanen ? new Date(p.tanggalPanen) : null,
          keterangan: p.keterangan || null,
        }))
      };
    }

    return prisma.perencanaanProduksi.create({
      data: createPayload,
      include: {
        petaniDistribusi: {
          include: {
            partner: true,
            greenhouse: true,
          },
        },
        partner: true,
        greenhouse: true,
        commodity: true,
        variety: true,
      }
    });
  },

  async update(id: string, data: any) {
    const existing = await prisma.perencanaanProduksi.findFirst({
      where: {
        OR: [{ id }, { noPerencanaan: id }]
      }
    });

    if (!existing) {
      throw new Error(`Data perencanaan produksi '${id}' tidak ditemukan`);
    }

    const targetId = existing.id;

    const {
      id: _id,
      noPerencanaan: _noPerencanaan,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      commodity: _commodity,
      variety: _variety,
      partner: _partner,
      greenhouse: _greenhouse,
      petaniDistribusi,
      produk: _produk,
      ...restData
    } = data;

    const target = restData.targetProduksi !== undefined ? Number(restData.targetProduksi) : undefined;
    const aktual = restData.aktualProduksi !== undefined ? Number(restData.aktualProduksi) : undefined;

    let terpenuhi = restData.produksiTerpenuhi !== undefined ? Number(restData.produksiTerpenuhi) : undefined;
    if (terpenuhi === undefined && target !== undefined && aktual !== undefined && target > 0) {
      terpenuhi = Number(((aktual / target) * 100).toFixed(1));
    }

    if (Array.isArray(petaniDistribusi)) {
      await prisma.perencanaanProduksiPetani.deleteMany({
        where: { perencanaanProduksiId: targetId }
      });
      if (petaniDistribusi.length > 0) {
        await prisma.perencanaanProduksiPetani.createMany({
          data: petaniDistribusi.map((p: any) => ({
            perencanaanProduksiId: targetId,
            partnerId: p.partnerId || null,
            namaPetani: p.namaPetani,
            greenhouseId: p.greenhouseId || null,
            namaLahan: p.namaLahan || null,
            luasLahan: Number(p.luasLahan) || 0,
            targetProduksi: Number(p.targetProduksi) || 0,
            tanggalTanam: p.tanggalTanam ? new Date(p.tanggalTanam) : null,
            tanggalPanen: p.tanggalPanen ? new Date(p.tanggalPanen) : null,
            keterangan: p.keterangan || null,
          }))
        });
      }
    }

    const updatePayload: any = {
      ...restData,
      ...(target !== undefined ? { targetProduksi: target } : {}),
      ...(aktual !== undefined ? { aktualProduksi: aktual } : {}),
      ...(terpenuhi !== undefined ? { produksiTerpenuhi: terpenuhi } : {}),
      ...(restData.targetLuasLahan !== undefined ? { targetLuasLahan: Number(restData.targetLuasLahan) } : {}),
      ...(restData.lahanTersedia !== undefined ? { lahanTersedia: Number(restData.lahanTersedia) } : {}),
      ...(restData.realisasiTanam !== undefined ? { realisasiTanam: Number(restData.realisasiTanam) } : {}),
      ...(restData.kebutuhanBenih !== undefined ? { kebutuhanBenih: Number(restData.kebutuhanBenih) } : {}),
      ...(restData.estimasiHasilPerHa !== undefined ? { estimasiHasilPerHa: Number(restData.estimasiHasilPerHa) } : {}),
      ...(restData.periodeMulai !== undefined
        ? { periodeMulai: restData.periodeMulai ? new Date(restData.periodeMulai) : null }
        : {}),
      ...(restData.periodeSelesai !== undefined
        ? { periodeSelesai: restData.periodeSelesai ? new Date(restData.periodeSelesai) : null }
        : {}),
    };

    return prisma.perencanaanProduksi.update({
      where: { id: targetId },
      data: updatePayload,
      include: {
        petaniDistribusi: {
          include: {
            partner: true,
            greenhouse: true,
          },
        },
        partner: true,
        greenhouse: true,
        commodity: true,
        variety: true,
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
