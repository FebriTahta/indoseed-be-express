/**
 * Status alur Permintaan → Pemeriksaan → Hasil Pengujian.
 * Ini adalah state machine domain (bukan data master), sehingga didefinisikan di kode
 * dan diekspos ke frontend melalui endpoint `GET /api/qc/meta`.
 */
export const PERMINTAAN_STATUS = {
  MENUNGGU_PERSETUJUAN: 'Menunggu Persetujuan',
  SAMPLING: 'Sampling',
  DALAM_PENGUJIAN: 'Dalam Pengujian',
  MENUNGGU_REVIEW: 'Menunggu Review',
  SELESAI: 'Selesai',
  DITOLAK: 'Ditolak',
} as const;

export type PermintaanStatus = (typeof PERMINTAAN_STATUS)[keyof typeof PERMINTAAN_STATUS];

export const PERMINTAAN_STATUS_LIST: PermintaanStatus[] = Object.values(PERMINTAAN_STATUS);

/** Status yang sudah masuk tahap pemeriksaan (permintaan sudah disetujui). */
export const PEMERIKSAAN_STATUSES: PermintaanStatus[] = [
  PERMINTAAN_STATUS.SAMPLING,
  PERMINTAAN_STATUS.DALAM_PENGUJIAN,
  PERMINTAAN_STATUS.MENUNGGU_REVIEW,
  PERMINTAAN_STATUS.SELESAI,
];

/** Status yang sudah memiliki hasil pengujian. */
export const HASIL_STATUSES: PermintaanStatus[] = [
  PERMINTAAN_STATUS.MENUNGGU_REVIEW,
  PERMINTAAN_STATUS.SELESAI,
];

/**
 * Status di mana data permintaan masih boleh diubah / dihapus:
 * selama sampel belum diterima lab (belum ada nomor pengujian).
 */
export const EDITABLE_STATUSES: PermintaanStatus[] = [
  PERMINTAAN_STATUS.MENUNGGU_PERSETUJUAN,
  PERMINTAAN_STATUS.SAMPLING,
  PERMINTAAN_STATUS.DITOLAK,
];

export const HASIL_AKHIR = {
  LULUS: 'Lulus',
  TIDAK_LULUS: 'Tidak Lulus',
} as const;

/** Rekomendasi default (kode di lookup REKOMENDASI) yang diturunkan dari kesimpulan pengujian. */
export const REKOMENDASI_DEFAULT: Record<string, string> = {
  [HASIL_AKHIR.LULUS]: 'Lanjut Proses',
  [HASIL_AKHIR.TIDAK_LULUS]: 'Pengujian Ulang',
};

export const rekomendasiDari = (hasilAkhir: string | null) => (hasilAkhir ? REKOMENDASI_DEFAULT[hasilAkhir] ?? null : null);

export const DOKUMEN_KATEGORI = {
  PERMINTAAN: 'Permintaan',
  DOKUMENTASI: 'Dokumentasi',
} as const;

/** Kategori data master pilihan (tabel `qc_lookups`). */
export const QC_LOOKUP_KATEGORI = {
  JENIS_UJI: 'JENIS_UJI',
  TIPE_BENIH: 'TIPE_BENIH',
  SATUAN_PARAMETER: 'SATUAN_PARAMETER',
  KATEGORI_PARAMETER: 'KATEGORI_PARAMETER',
  SATUAN_SAMPEL: 'SATUAN_SAMPEL',
  METODE_SAMPLING: 'METODE_SAMPLING',
  PEMOHON: 'PEMOHON',
  PRIORITAS: 'PRIORITAS',
  KONDISI_SAMPEL: 'KONDISI_SAMPEL',
  REKOMENDASI: 'REKOMENDASI',
  /** Nama parameter yang termasuk uji perkecambahan (menampilkan kartu Detail Parameter). */
  PARAMETER_PERKECAMBAHAN: 'PARAMETER_PERKECAMBAHAN',
} as const;

export const QC_LOOKUP_KATEGORI_LIST = Object.values(QC_LOOKUP_KATEGORI);

/** Prefix penomoran dokumen QC. */
export const QC_NUMBER_PREFIX = {
  PERMINTAAN: 'RQ-QC',
  PENGUJIAN: 'TST-QC',
  SAMPEL: 'SMP',
} as const;
