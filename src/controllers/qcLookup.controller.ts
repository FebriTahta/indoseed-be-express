import { Request, Response } from 'express';
import { qcLookupRepository } from '../repositories/qcLookup.repository';
import { qcLookupService } from '../services/qc/qcLookup.service';
import {
  PERMINTAAN_STATUS_LIST,
  PEMERIKSAAN_STATUSES,
  HASIL_STATUSES,
  EDITABLE_STATUSES,
  HASIL_AKHIR,
  REKOMENDASI_DEFAULT,
} from '../constants/qc.constants';
import { notFound } from '../utils/httpError';

export const getLookups = async (req: Request, res: Response) => {
  const { kategori, status } = req.validated!.query!;
  const data = await qcLookupService.getGrouped(kategori, status || 'Aktif');
  res.json({ success: true, data });
};

export const createLookup = async (req: Request, res: Response) => {
  const data = await qcLookupRepository.create(req.validated!.body);
  res.status(201).json({ success: true, data });
};

export const updateLookup = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!(await qcLookupRepository.findById(id))) throw notFound('Data lookup tidak ditemukan');
  const data = await qcLookupRepository.update(id, req.validated!.body);
  res.json({ success: true, data });
};

export const deleteLookup = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!(await qcLookupRepository.findById(id))) throw notFound('Data lookup tidak ditemukan');
  await qcLookupRepository.delete(id);
  res.json({ success: true, message: 'Data lookup berhasil dihapus' });
};

/** Metadata alur status QC yang dipakai frontend (tanpa hardcode di client). */
export const getMeta = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      statuses: PERMINTAAN_STATUS_LIST,
      pemeriksaanStatuses: PEMERIKSAAN_STATUSES,
      hasilStatuses: HASIL_STATUSES,
      editableStatuses: EDITABLE_STATUSES,
      hasilAkhir: Object.values(HASIL_AKHIR),
      rekomendasiDefault: REKOMENDASI_DEFAULT,
    },
  });
};
