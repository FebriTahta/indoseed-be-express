/**
 * Seed master pilihan (dropdown) modul QC ke tabel `qc_lookups`.
 * Idempoten: aman dijalankan berulang (upsert berdasarkan kategori + kode).
 *
 *   npm run seed:qc-lookup
 */
import prisma from '../src/utils/prisma';
import { QC_LOOKUP_KATEGORI as K } from '../src/constants/qc.constants';

const data: Record<string, [kode: string, nama: string][]> = {
  [K.JENIS_UJI]: [
    ['Fisik', 'Fisik'],
    ['Visual', 'Visual'],
    ['Fisiologi', 'Fisiologi'],
    ['Biologis', 'Biologis'],
    ['Kimia', 'Kimia'],
  ],
  [K.TIPE_BENIH]: [
    ['Semua Tipe', 'Semua Tipe'],
    ['Inbred', 'Inbred'],
    ['Hibrida', 'Hibrida'],
  ],
  [K.KATEGORI_PARAMETER]: [
    ['Fisik', 'Fisik'],
    ['Fisiologis', 'Fisiologis'],
    ['Kesehatan', 'Kesehatan'],
    ['Kimia', 'Kimia'],
    ['Visual', 'Visual'],
  ],
  [K.SATUAN_PARAMETER]: [
    ['%', '%'],
    ['gram', 'gram'],
    ['kg', 'kg'],
    ['mg/kg', 'mg/kg'],
    ['butir', 'butir'],
    ['buah', 'buah'],
    ['hari', 'hari'],
    ['-', '- (Tanpa Satuan)'],
  ],
  [K.SATUAN_SAMPEL]: [
    ['gram', 'gram'],
    ['kg', 'kg'],
    ['butir', 'butir'],
  ],
  [K.METODE_SAMPLING]: [
    ['sop', 'Sesuai SOP Sampling ISTA'],
    ['random', 'Sampling Acak Terstratifikasi'],
    ['composite', 'Sampling Komposit'],
  ],
  [K.PEMOHON]: [
    ['produksi', 'Produksi'],
    ['gudang', 'Gudang'],
    ['rnd', 'R & D'],
  ],
  [K.PRIORITAS]: [
    ['normal', 'Normal'],
    ['urgent', 'Urgent'],
  ],
  [K.KONDISI_SAMPEL]: [
    ['Baik', 'Baik'],
    ['Cukup', 'Cukup'],
    ['Rusak', 'Rusak'],
  ],
  [K.PARAMETER_PERKECAMBAHAN]: [
    ['Daya Berkecambah', 'Daya Berkecambah'],
    ['Daya Tumbuh', 'Daya Tumbuh'],
  ],
  [K.REKOMENDASI]: [
    ['Lanjut Proses', 'Lanjut Proses'],
    ['Pengujian Ulang', 'Pengujian Ulang'],
    ['Reproses', 'Reproses'],
    ['Tolak Batch', 'Tolak Batch'],
  ],
};

export async function seedQcLookup() {
  let total = 0;
  for (const [kategori, rows] of Object.entries(data)) {
    for (const [idx, [kode, nama]] of rows.entries()) {
      await prisma.qcLookup.upsert({
        where: { kategori_kode: { kategori, kode } },
        update: {},
        create: { kategori, kode, nama, urutan: idx + 1 },
      });
      total++;
    }
  }
  console.log(`✔ ${total} data master lookup QC tersedia`);
}

if (require.main === module) {
  seedQcLookup()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
