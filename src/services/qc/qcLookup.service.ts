import { qcLookupRepository } from '../../repositories/qcLookup.repository';
import { badRequest } from '../../utils/httpError';

export const qcLookupService = {
  /** Mengelompokkan lookup per kategori: `{ JENIS_UJI: [...], SATUAN_SAMPEL: [...] }`. */
  getGrouped: async (kategori?: string, status = 'Aktif') => {
    const kategoriList = kategori
      ? kategori.split(',').map((k) => k.trim()).filter(Boolean)
      : undefined;
    const rows = await qcLookupRepository.findAll({ kategori: kategoriList, status });
    return rows.reduce<Record<string, typeof rows>>((acc, row) => {
      (acc[row.kategori] ||= []).push(row);
      return acc;
    }, {});
  },

  /** Memastikan nilai yang dikirim client terdaftar & aktif di master lookup. */
  assertValid: async (kategori: string, kode: string, label: string) => {
    const row = await qcLookupRepository.findByKode(kategori, kode);
    if (!row || row.status !== 'Aktif') {
      throw badRequest(`${label} "${kode}" tidak terdaftar di master data QC`);
    }
    return row;
  },
};
