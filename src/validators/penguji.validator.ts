import { z } from 'zod';

export const PENGUJI_STATUS = ['Aktif', 'Nonaktif'] as const;

const emptyToNull = (v: unknown) => (v === '' || v === 'null' || v === undefined ? null : v);
const optionalText = (max = 191) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());
const optionalDate = z.preprocess(emptyToNull, z.coerce.date().nullable().optional());
const requiredText = (label: string, max = 191) =>
  z.string({ error: `${label} wajib diisi` }).trim().min(1, `${label} wajib diisi`).max(max, `${label} maksimal ${max} karakter`);

const sertifikasiSchema = z.object({
  namaSertifikasi: requiredText('Jenis sertifikasi'),
  nomorSertifikat: optionalText(),
  tanggalSertifikat: optionalDate,
  lampiranUrl: optionalText(2000),
});

export const pengujiBodySchema = z
  .object({
    kodePenguji: optionalText(50),
    nama: requiredText('Nama lengkap'),
    email: z.string({ error: 'Email wajib diisi' }).trim().toLowerCase().email('Format email tidak valid'),
    noTelepon: z.preprocess(
      emptyToNull,
      z.string().trim().regex(/^[0-9+\-\s()]{6,20}$/, 'Nomor telepon tidak valid').nullable().optional()
    ),
    laboratoriumId: requiredText('Laboratorium'),
    metodeUjiIds: z.array(z.string().min(1)).min(1, 'Pilih minimal satu metode uji'),
    tanggalBergabung: z.coerce.date({ error: 'Tanggal bergabung wajib diisi' }),
    berlakuHingga: optionalDate,
    status: z.enum(PENGUJI_STATUS),
    keterangan: optionalText(200),
    foto: optionalText(2000),
    sertifikasi: sertifikasiSchema.nullable().optional(),
  })
  .refine((v) => !v.berlakuHingga || v.berlakuHingga >= v.tanggalBergabung, {
    message: 'Berlaku hingga tidak boleh sebelum tanggal bergabung',
    path: ['berlakuHingga'],
  });

export const pengujiListQuerySchema = z.object({
  search: z.preprocess(emptyToNull, z.string().trim().nullable().optional()),
  status: z.preprocess(emptyToNull, z.enum(PENGUJI_STATUS).nullable().optional()),
  laboratoriumId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  testMethodId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(500).optional(),
  /** Alias lama untuk `pageSize`. */
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export type PengujiInput = z.infer<typeof pengujiBodySchema>;
export type PengujiListQuery = z.infer<typeof pengujiListQuerySchema>;
