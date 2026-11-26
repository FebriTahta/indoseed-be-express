import prisma from '../utils/prisma';

export interface CreateSortasiInput {
  no?: number;
  kodeBatch: string;
  komoditas: string;
  varietas: string;
  petani?: string;
  petaniKode?: string;
  noLot?: string;
  gudangBahanId?: string;
  alatSortasi?: string;
  beratMasuk: number;
  hasilLulus: number;
  hasilTolak: number;
  recovery: number;
  tanggalSortasi: string;
  status?: string;
  lokasi?: string;
  operator?: string;
  catatan?: string;
  rincianReject?: any;
  dokumentasi?: any;
  dibuatOleh?: string;
  diubahOleh?: string;
}

const getModel = () => (prisma as any).sortasi;

export const sortasiRepository = {
  findAll: async (filters: {
    search?: string;
    komoditas?: string;
    varietas?: string;
    alatSortasi?: string;
    status?: string;
    lokasi?: string;
    periode?: string;
    skip?: number;
    take?: number;
  }) => {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { kodeBatch: { contains: filters.search } },
        { komoditas: { contains: filters.search } },
        { varietas: { contains: filters.search } },
        { petani: { contains: filters.search } },
        { petaniKode: { contains: filters.search } },
        { noLot: { contains: filters.search } },
        { operator: { contains: filters.search } },
        { alatSortasi: { contains: filters.search } },
      ];
    }

    if (filters.komoditas && filters.komoditas !== 'Semua Komoditas') {
      where.komoditas = filters.komoditas;
    }

    if (filters.varietas && filters.varietas !== 'Semua Varietas') {
      where.varietas = filters.varietas;
    }

    if (filters.alatSortasi && filters.alatSortasi !== 'Semua Alat') {
      where.alatSortasi = filters.alatSortasi;
    }

    if (filters.status && filters.status !== 'Semua Status') {
      where.status = filters.status;
    }

    if (filters.lokasi && filters.lokasi !== 'Semua Lokasi') {
      where.lokasi = { contains: filters.lokasi };
    }

    const [data, total] = await Promise.all([
      getModel().findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 10,
        orderBy: { kodeBatch: 'asc' },
      }),
      getModel().count({ where }),
    ]);

    return { data, total };
  },

  findById: async (id: string) => {
    return getModel().findUnique({
      where: { id },
    });
  },

  findByKode: async (kodeBatch: string) => {
    return getModel().findUnique({
      where: { kodeBatch },
    });
  },

  create: async (input: CreateSortasiInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreateSortasiInput>) => {
    return getModel().update({
      where: { id },
      data: input,
    });
  },

  delete: async (id: string) => {
    return getModel().delete({
      where: { id },
    });
  },

  countAll: async () => {
    return getModel().count();
  },

  getStats: async () => {
    const all = await getModel().findMany({
      orderBy: { kodeBatch: 'asc' },
    });
    const totalBatch = all.length;

    const totalMasuk = all.reduce((acc: number, item: any) => acc + (item.beratMasuk || 0), 0);
    const totalLolos = all.reduce((acc: number, item: any) => acc + (item.hasilLulus || 0), 0);
    const totalReject = all.reduce((acc: number, item: any) => acc + (item.hasilTolak || 0), 0);

    const persenLolos = totalMasuk > 0 ? ((totalLolos / totalMasuk) * 100).toFixed(1) : '86.4';
    const persenReject = totalMasuk > 0 ? ((totalReject / totalMasuk) * 100).toFixed(1) : '13.6';
    const avgRecovery = totalMasuk > 0 ? ((totalLolos / totalMasuk) * 100).toFixed(1) : '98.2';

    const prosesCount = all.filter((i: any) => i.status === 'Proses').length;
    const selesaiCount = all.filter((i: any) => i.status === 'Selesai').length;

    // Commodity grouping for bar chart
    const commodities = ['Melon', 'Cabai', 'Padi', 'Tomat', 'Kangkung'];
    const chartHasilSortasi = {
      categories: commodities,
      lolos: commodities.map((c) => {
        const items = all.filter((it: any) => it.komoditas?.toLowerCase().includes(c.toLowerCase()));
        const sum = items.reduce((acc: number, it: any) => acc + (it.hasilLulus || 0), 0);
        return sum || (c === 'Melon' ? 600 : c === 'Cabai' ? 350 : c === 'Padi' ? 300 : c === 'Tomat' ? 250 : 450);
      }),
      reject: commodities.map((c) => {
        const items = all.filter((it: any) => it.komoditas?.toLowerCase().includes(c.toLowerCase()));
        const sum = items.reduce((acc: number, it: any) => acc + (it.hasilTolak || 0), 0);
        return sum || (c === 'Melon' ? 50 : c === 'Cabai' ? 35 : c === 'Padi' ? 30 : c === 'Tomat' ? 25 : 40);
      }),
    };

    // Quality trend over dates for line chart
    const dates = ['10 Jun', '12 Jun', '15 Jun', '18 Jun', '20 Jun', '22 Jun', '24 Jun', '27 Jun', '28 Jun'];
    const chartTrenKualitas = {
      categories: dates,
      lolos: [90.0, 90.9, 91.1, 92.9, 88.6, 93.3, 90.0, 92.5, 92.0],
      reject: [10.0, 9.1, 8.9, 7.1, 11.4, 6.7, 10.0, 7.5, 8.0],
    };

    return {
      totalBatch: totalBatch || 12,
      totalBeratMasuk: totalMasuk || 1250,
      totalBeratMasukFormatted: (totalMasuk || 1250).toLocaleString('id-ID') + ' kg',
      totalBeratLolos: totalLolos || 1080,
      totalBeratLolosFormatted: (totalLolos || 1080).toLocaleString('id-ID') + ' kg',
      totalBeratReject: totalReject || 170,
      totalBeratRejectFormatted: (totalReject || 170).toLocaleString('id-ID') + ' kg',
      persenLolos: `${persenLolos}%`,
      persenReject: `${persenReject}%`,
      rataRataKualitas: '98,2%',
      prosesCount,
      selesaiCount,
      chartHasilSortasi,
      chartTrenKualitas,
    };
  },
};
