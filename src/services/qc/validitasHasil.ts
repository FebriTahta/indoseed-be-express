import { Prisma } from '@prisma/client';
import { HASIL_AKHIR, HASIL_STATUSES, PermintaanStatus } from '../../constants/qc.constants';

/**
 * Aturan kelengkapan hasil pengujian.
 * Sebuah parameter aktif dianggap SUDAH DIUJI bila memiliki nilai hasil (angka atau teks)
 * DAN status hasil (Lulus / Tidak Lulus). Pengujian hanya boleh disubmit / disetujui bila
 * semua parameter aktif sudah diuji. Hasil berstatus Menunggu Review / Selesai yang tidak
 * memenuhi aturan ini dinyatakan TIDAK VALID dan dapat diuji ulang.
 */

export type ParamHasil = {
  id: string;
  nama: string;
  checked: boolean;
  nilaiHasil: number | null;
  hasilTeks: string | null;
  statusHasil: string | null;
};

export const sudahDiuji = (p: Pick<ParamHasil, 'nilaiHasil' | 'hasilTeks' | 'statusHasil'>) =>
  Boolean(p.statusHasil) && (p.nilaiHasil !== null || Boolean(p.hasilTeks?.trim()));

export const parameterBelumDiuji = <T extends ParamHasil>(params: T[]) =>
  params.filter((p) => p.checked && !sudahDiuji(p));

/** Lengkap = ada minimal satu parameter aktif dan semuanya sudah diuji. */
export const hasilLengkap = (params: ParamHasil[]) =>
  params.some((p) => p.checked) && parameterBelumDiuji(params).length === 0;

/** Kesimpulan otomatis: null bila hasil belum lengkap. */
export const hitungHasilAkhir = (params: ParamHasil[]) => {
  if (!hasilLengkap(params)) return null;
  return params.some((p) => p.checked && p.statusHasil === HASIL_AKHIR.TIDAK_LULUS)
    ? HASIL_AKHIR.TIDAK_LULUS
    : HASIL_AKHIR.LULUS;
};

/** Pesan galat yang menyebut parameter mana yang belum diuji. */
export const pesanBelumLengkap = (params: ParamHasil[]) => {
  const belum = parameterBelumDiuji(params);
  return belum.length
    ? `Parameter belum diuji: ${belum.map((p) => p.nama).join(', ')}`
    : 'Belum ada parameter uji yang dipilih';
};

/** Tambahkan penanda validitas ke data permintaan agar frontend tidak menghitung ulang aturannya. */
export const withValiditas = <T extends { status: string; parameters: ParamHasil[] }>(item: T) => {
  const belum = parameterBelumDiuji(item.parameters);
  return {
    ...item,
    parameterBelumDiuji: belum.map((p) => ({ id: p.id, nama: p.nama })),
    hasilTidakValid: HASIL_STATUSES.includes(item.status as PermintaanStatus) && !hasilLengkap(item.parameters),
  };
};

/** Filter Prisma padanan `!hasilLengkap` (dipakai untuk menghitung hasil tidak valid). */
export const hasilTidakLengkapWhere: Prisma.PermintaanPengujianWhereInput = {
  OR: [
    { parameters: { none: { checked: true } } },
    {
      parameters: {
        some: {
          checked: true,
          OR: [{ statusHasil: null }, { nilaiHasil: null, OR: [{ hasilTeks: null }, { hasilTeks: '' }] }],
        },
      },
    },
  ],
};
