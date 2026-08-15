import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface JadwalTanamFilter {
  search?: string;
  statusJadwal?: string;
  commodityId?: string;
  varietyId?: string;
  greenhouseId?: string;
  musimTanam?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateJadwalTanamInput {
  kodeJadwalTanam: string;
  periodeTanam?: string;
  periodeTanamMulai?: Date | null;
  periodeTanamSelesai?: Date | null;
  musimTanam?: string;
  tujuanProduksi?: string;
  tipeProduksi?: string;
  statusJadwal?: string;
  penanggungJawab?: string;
  deskripsi?: string;

  greenhouseId?: string | null | undefined;
  commodityId?: string | null | undefined;
  varietyId?: string | null | undefined;
  luasTanam?: number;
  asalBenih?: string;
  jumlahBenihDiperlukan?: number;
  jarakTanam?: string;
  sistemTanam?: string;
  targetProduksi?: number;
  standarKualitas?: string;
  perkecambahanMin?: number;

  tanggalPersemaian?: Date | null;
  tanggalTanam?: Date | null;
  perkiraanPanen?: Date | null;
  siklusTanamHari?: number;
  metodeTanam?: string;
  kepadatanTanam?: string | null | undefined;
  irigasi?: string;
  sumberAir?: string;
  catatan?: string;

  dibuatOleh?: string;
  diubahOleh?: string;

  detailLahan?: Array<{
    greenhouseId?: string;
    namaLahan: string;
    luas: number;
    tipeLahan?: string;
    irigasi?: string;
    sumberAir?: string;
  }>;

  personil?: Array<{
    nama: string;
    peran: string;
    kontak?: string;
    tugas?: string;
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
    fileSize?: string;
    fileType?: string;
  }>;
}

const getModel = () => {
  const model = (prisma as any).jadwalTanam;
  if (!model) {
    throw new Error("Model 'jadwalTanam' not found on Prisma Client. Please restart the backend dev server.");
  }
  return model;
};

export const jadwalTanamRepository = {
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
          create: detailLahan,
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
        detailLahan: true,
        personil: true,
        peralatan: true,
        dokumen: true,
      },
    });
  },

  findById: async (id: string) => {
    return getModel().findUnique({
      where: { id },
      include: {
        greenhouse: true,
        commodity: true,
        variety: true,
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
        detailLahan: true,
        personil: true,
        peralatan: true,
        dokumen: true,
      },
    });
  },

  update: async (id: string, input: Partial<CreateJadwalTanamInput>) => {
    const { detailLahan, personil, peralatan, dokumen, ...mainData } = input;

    if (detailLahan !== undefined && (prisma as any).jadwalTanamDetail) {
      await (prisma as any).jadwalTanamDetail.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    }
    if (personil !== undefined && (prisma as any).jadwalTanamPersonil) {
      await (prisma as any).jadwalTanamPersonil.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    }
    if (peralatan !== undefined && (prisma as any).jadwalTanamPeralatan) {
      await (prisma as any).jadwalTanamPeralatan.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    }
    if (dokumen !== undefined && (prisma as any).jadwalTanamDokumen) {
      await (prisma as any).jadwalTanamDokumen.deleteMany({ where: { jadwalTanamId: id } }).catch(() => {});
    }

    return getModel().update({
      where: { id },
      data: {
        ...mainData,
        detailLahan: (detailLahan && detailLahan.length > 0) ? { create: detailLahan } : undefined,
        personil: (personil && personil.length > 0) ? { create: personil } : undefined,
        peralatan: (peralatan && peralatan.length > 0) ? { create: peralatan } : undefined,
        dokumen: (dokumen && dokumen.length > 0) ? { create: dokumen } : undefined,
      },
      include: {
        greenhouse: true,
        commodity: true,
        variety: true,
        detailLahan: true,
        personil: true,
        peralatan: true,
        dokumen: true,
      },
    });
  },

  delete: async (id: string) => {
    return getModel().delete({
      where: { id },
    });
  },

  findAll: async (filters: JadwalTanamFilter) => {
    const {
      search,
      statusJadwal,
      commodityId,
      varietyId,
      greenhouseId,
      musimTanam,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (statusJadwal) where.statusJadwal = statusJadwal;
    if (commodityId) where.commodityId = commodityId;
    if (varietyId) where.varietyId = varietyId;
    if (greenhouseId) where.greenhouseId = greenhouseId;
    if (musimTanam) where.musimTanam = musimTanam;

    if (search) {
      where.OR = [
        { kodeJadwalTanam: { contains: search } },
        { penanggungJawab: { contains: search } },
        { deskripsi: { contains: search } },
      ];
    }

    const total = await getModel().count({ where });
    const items = await getModel().findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        greenhouse: true,
        commodity: true,
        variety: true,
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
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },
};
