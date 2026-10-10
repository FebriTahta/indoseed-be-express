import { z } from 'zod';
import { PERMINTAAN_STATUS_LIST, QC_LOOKUP_KATEGORI_LIST, HASIL_AKHIR, HARI_PENGAMATAN } from '../constants/qc.constants';

// ---------- Helpers ----------

/** String opsional: '' / 'null' / 'undefined' dianggap kosong (umum dari form-data). */
const optionalString = z.preprocess(
  (v) => (v === '' || v === 'null' || v === 'undefined' ? null : v),
  z.string().trim().nullable().optional()
);

const requiredString = (label: string) => z.string({ error: `${label} wajib diisi` }).trim().min(1, `${label} wajib diisi`);

/** Field JSON yang dikirim sebagai string pada multipart/form-data. */
const jsonField = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => {
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }, schema);

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === null || v === undefined || v === 'null' ? null : Number(v)),
  z.number().finite().nullable().optional()
);

const optionalDate = z.preprocess(
  (v) => (v === '' || v === null || v === undefined || v === 'null' ? null : v),
  z.coerce.date().nullable().optional()
);

const pageQuery = {
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
};

// ---------- Lookup ----------

export const lookupQuerySchema = z.object({
  kategori: z.string().optional(),
  status: z.string().optional(),
});

export const lookupBodySchema = z.object({
  kategori: z.enum(QC_LOOKUP_KATEGORI_LIST as [string, ...string[]]),
  kode: requiredString('Kode'),
  nama: requiredString('Nama'),
  urutan: z.coerce.number().int().optional(),
  status: z.enum(['Aktif', 'Nonaktif']).optional(),
});

// ---------- Permintaan Pengujian ----------

const permintaanParameterInput = z.object({
  parameterId: requiredString('Parameter'),
  checked: z.boolean().optional(),
});

const permintaanBase = {
  tanggal: z.coerce.date({ error: 'Tanggal permintaan tidak valid' }),
  batchProduksiId: requiredString('Batch produksi'),
  jumlahSampel: z.coerce.number({ error: 'Jumlah sampel harus berupa angka' }).positive('Jumlah sampel harus lebih dari 0'),
  satuanSampel: requiredString('Satuan sampel'),
  metodeSampling: requiredString('Metode sampling'),
  pengambilSampelId: requiredString('Pengambil sampel'),
  pemohon: requiredString('Pemohon'),
  prioritas: requiredString('Prioritas'),
  catatan: optionalString,
  parameters: jsonField(
    z.array(permintaanParameterInput).min(1, 'Pilih minimal 1 parameter uji')
  ),
};

export const createPermintaanSchema = z.object(permintaanBase);
export const updatePermintaanSchema = z.object(permintaanBase);

export const permintaanListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(), // boleh lebih dari satu, dipisah koma
  periode: z.enum(['today', 'week', 'month']).optional().or(z.literal('')),
  startDate: optionalDate,
  endDate: optionalDate,
  komoditas: z.string().optional(),
  prioritas: z.string().optional(),
  petugasQcId: z.string().optional(),
  hasilAkhir: z.enum([HASIL_AKHIR.LULUS, HASIL_AKHIR.TIDAK_LULUS]).optional().or(z.literal('')),
  sortBy: z.enum(['updatedAt', 'createdAt', 'tanggal', 'noPermintaan', 'status', 'tanggalSampling', 'tanggalSelesaiUji']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  ...pageQuery,
});

export const summaryQuerySchema = z.object({
  startDate: optionalDate,
  endDate: optionalDate,
});

export const batchOptionsQuerySchema = z.object({
  excludePermintaanId: z.string().optional(),
});

export const rejectPermintaanSchema = z.object({
  alasan: requiredString('Alasan penolakan').min(3, 'Alasan penolakan minimal 3 karakter'),
});

export const approvePermintaanSchema = z.object({
  catatan: optionalString,
});

export const statusEnum = z.enum(PERMINTAAN_STATUS_LIST as [string, ...string[]]);

// ---------- Pemeriksaan & Hasil ----------

export const terimaSampelSchema = z.object({
  /** Diabaikan: petugas selalu penguji yang sedang login (dipertahankan untuk kompatibilitas klien). */
  petugasQcId: optionalString,
  laboratoriumId: optionalString,
  tanggalSampling: z.coerce.date({ error: 'Tanggal sampling tidak valid' }),
  kondisiSampel: requiredString('Kondisi sampel'),
  catatan: optionalString,
});

const optionalCount = (label: string) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined || v === 'null' ? null : Number(v)),
    z.number().int(`${label} harus bilangan bulat`).min(0, `${label} tidak boleh negatif`).nullable().optional()
  );

/** Rincian uji perkecambahan (daya berkecambah): jumlah benih per kategori kecambah. */
export const rincianHasilSchema = z
  .object({
    jumlahBenih: optionalCount('Jumlah benih diuji'),
    hariPengamatan: z.preprocess(
      (v) => (v === '' || v === null || v === undefined || v === 'null' ? null : Number(v)),
      z.number().int().min(HARI_PENGAMATAN.MIN).max(HARI_PENGAMATAN.MAX, `Hari pengamatan harus hari ke-${HARI_PENGAMATAN.MIN} s.d. ${HARI_PENGAMATAN.MAX}`).nullable().optional()
    ),
    benihNormal: optionalCount('Benih normal'),
    benihAbnormal: optionalCount('Benih abnormal'),
    benihMati: optionalCount('Benih mati'),
    benihKeras: optionalCount('Benih keras'),
  })
  .superRefine((r, ctx) => {
    const counts = [r.benihNormal, r.benihAbnormal, r.benihMati, r.benihKeras];
    const total = counts.reduce<number>((a, b) => a + (b ?? 0), 0);
    if (r.jumlahBenih === 0) {
      ctx.addIssue({ code: 'custom', path: ['jumlahBenih'], message: 'Jumlah benih diuji harus lebih dari 0' });
    } else if (r.jumlahBenih != null && total > r.jumlahBenih) {
      ctx.addIssue({ code: 'custom', path: ['jumlahBenih'], message: `Total benih (${total}) melebihi jumlah benih diuji (${r.jumlahBenih})` });
    } else if (r.jumlahBenih != null && counts.every((c) => c != null) && total !== r.jumlahBenih) {
      ctx.addIssue({ code: 'custom', path: ['jumlahBenih'], message: `Total benih normal, abnormal, mati, dan keras (${total}) harus sama dengan jumlah benih diuji (${r.jumlahBenih})` });
    }
  });

export const simpanHasilSchema = z.object({
  parameters: z
    .array(
      z.object({
        id: requiredString('ID parameter'),
        nilaiHasil: optionalNumber,
        hasilTeks: optionalString,
        statusHasil: z.enum([HASIL_AKHIR.LULUS, HASIL_AKHIR.TIDAK_LULUS]).nullable().optional(),
        catatanHasil: optionalString,
        rincianHasil: rincianHasilSchema.nullable().optional(),
      })
    )
    .default([]),
  catatanPengujian: optionalString,
});

export const reviewHasilSchema = z
  .object({
    keputusan: z.enum(['setujui', 'revisi']),
    catatan: optionalString,
  })
  .refine((v) => v.keputusan === 'setujui' || (v.catatan && v.catatan.length >= 3), {
    message: 'Catatan revisi wajib diisi (minimal 3 karakter)',
    path: ['catatan'],
  });

export const ujiUlangSchema = z.object({
  alasan: requiredString('Alasan pengujian ulang').refine((v) => v.length >= 3, 'Alasan minimal 3 karakter'),
});

export const dokumentasiBodySchema = z.object({
  keterangan: optionalString,
});

// ---------- Metode Uji ----------

const testParameterInput = z.object({
  id: optionalString,
  kode: optionalString,
  nama: requiredString('Nama parameter'),
  kategori: optionalString,
  satuan: optionalString,
  batasAcuan: optionalString,
  definisi: optionalString,
  keterangan: optionalString,
  status: z.enum(['Aktif', 'Nonaktif']).optional(),
});

const testMethodDokumenInput = z.object({
  namaFile: requiredString('Nama file'),
  fileUrl: requiredString('URL file'),
  tipeFile: optionalString,
  ukuran: optionalString,
});

export const testMethodSchema = z.object({
  kode: requiredString('Kode metode uji'),
  nama: requiredString('Nama metode uji'),
  jenisUji: requiredString('Jenis uji'),
  deskripsi: optionalString,
  status: z.enum(['Aktif', 'Nonaktif']).default('Aktif'),
  komoditas: optionalString,
  varietas: optionalString,
  tipe: optionalString,
  standarId: optionalString,
  documentId: optionalString,
  alatDigunakan: optionalString,
  versiMetode: optionalString,
  tanggalBerlaku: optionalDate,
  catatan: optionalString,
  testParameters: z.array(testParameterInput).optional(),
  dokumen: z.array(testMethodDokumenInput).optional(),
});

export const testMethodListQuerySchema = z.object({
  search: z.string().optional(),
  jenisUji: z.string().optional(),
  komoditas: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['kode', 'nama', 'status', 'jenisUji', 'komoditas', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreatePermintaanInput = z.infer<typeof createPermintaanSchema>;
export type PermintaanListQuery = z.infer<typeof permintaanListQuerySchema>;
export type TerimaSampelInput = z.infer<typeof terimaSampelSchema>;
export type SimpanHasilInput = z.infer<typeof simpanHasilSchema>;
export type RincianHasilInput = z.infer<typeof rincianHasilSchema>;
export type ReviewHasilInput = z.infer<typeof reviewHasilSchema>;
export type UjiUlangInput = z.infer<typeof ujiUlangSchema>;
export type TestMethodInput = z.infer<typeof testMethodSchema>;
export type LookupInput = z.infer<typeof lookupBodySchema>;
