import { Request, Response } from 'express';
import { pemeriksaanPengujianService as service } from '../services/qc/pemeriksaanPengujian.service';
import { getActor, uploadRequestFile } from '../utils/requestHelpers';
import { badRequest } from '../utils/httpError';

// ---------- Pemeriksaan ----------

export const getPemeriksaanList = async (req: Request, res: Response) => {
  const result = await service.list(req.validated!.query);
  res.json({ success: true, ...result });
};

export const getPemeriksaanSummary = async (req: Request, res: Response) => {
  const data = await service.summary(req.validated!.query);
  res.json({ success: true, data });
};

export const getPemeriksaanById = async (req: Request, res: Response) => {
  const data = await service.getDetail(req.params.id as string);
  res.json({ success: true, data });
};

export const terimaSampel = async (req: Request, res: Response) => {
  const data = await service.terimaSampel(req.params.id as string, req.validated!.body, getActor(req));
  res.json({ success: true, data, message: 'Sampel diterima, pengujian dimulai' });
};

export const simpanHasil = async (req: Request, res: Response) => {
  const data = await service.simpanHasil(req.params.id as string, req.validated!.body, getActor(req));
  res.json({ success: true, data, message: 'Hasil pengujian tersimpan' });
};

export const submitReview = async (req: Request, res: Response) => {
  const data = await service.submitReview(req.params.id as string, getActor(req));
  res.json({ success: true, data, message: 'Hasil pengujian dikirim untuk review' });
};

export const reviewHasil = async (req: Request, res: Response) => {
  const data = await service.review(req.params.id as string, req.validated!.body, getActor(req));
  res.json({ success: true, data });
};

export const ujiUlang = async (req: Request, res: Response) => {
  const data = await service.ujiUlang(req.params.id as string, req.validated!.body, getActor(req));
  res.json({ success: true, data, message: 'Pengujian dikembalikan untuk diuji ulang' });
};

export const uploadDokumentasi = async (req: Request, res: Response) => {
  const uploaded = await uploadRequestFile(req, 'qc-pemeriksaan');
  if (!uploaded) throw badRequest('File dokumentasi wajib diunggah');
  const data = await service.addDokumentasi(
    req.params.id as string,
    uploaded,
    req.validated!.body.keterangan,
    getActor(req)
  );
  res.status(201).json({ success: true, data });
};

export const deleteDokumentasi = async (req: Request, res: Response) => {
  await service.deleteDokumentasi(req.params.id as string, req.params.dokumenId as string);
  res.json({ success: true, message: 'Dokumentasi berhasil dihapus' });
};

// ---------- Hasil Pengujian ----------

export const getHasilList = async (req: Request, res: Response) => {
  const result = await service.listHasil(req.validated!.query);
  res.json({ success: true, ...result });
};

export const getHasilSummary = async (req: Request, res: Response) => {
  const data = await service.summaryHasil(req.validated!.query);
  res.json({ success: true, data });
};
