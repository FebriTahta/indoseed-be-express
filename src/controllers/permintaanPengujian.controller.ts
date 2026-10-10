import { Request, Response } from 'express';
import { permintaanPengujianService as service } from '../services/qc/permintaanPengujian.service';
import { getActor, uploadRequestFile } from '../utils/requestHelpers';

export const getPermintaanList = async (req: Request, res: Response) => {
  const result = await service.list(req.validated!.query);
  res.json({ success: true, ...result });
};

export const getPermintaanSummary = async (req: Request, res: Response) => {
  const data = await service.summary(req.validated!.query);
  res.json({ success: true, data });
};

export const getNextNumber = async (_req: Request, res: Response) => {
  const noPermintaan = await service.nextNumber();
  res.json({ success: true, data: { noPermintaan } });
};

export const getBatchOptions = async (req: Request, res: Response) => {
  const data = await service.batchOptions(req.validated!.query.excludePermintaanId);
  res.json({ success: true, data });
};

export const getPermintaanById = async (req: Request, res: Response) => {
  const data = await service.getById(req.params.id as string);
  res.json({ success: true, data });
};

export const createPermintaan = async (req: Request, res: Response) => {
  const uploaded = await uploadRequestFile(req, 'qc-permintaan');
  const data = await service.create(req.validated!.body, getActor(req), uploaded);
  res.status(201).json({ success: true, data });
};

export const updatePermintaan = async (req: Request, res: Response) => {
  const uploaded = await uploadRequestFile(req, 'qc-permintaan');
  const data = await service.update(req.params.id as string, req.validated!.body, getActor(req), uploaded);
  res.json({ success: true, data });
};

export const approvePermintaan = async (req: Request, res: Response) => {
  const data = await service.approve(req.params.id as string, getActor(req), req.validated!.body.catatan);
  res.json({ success: true, data, message: 'Permintaan pengujian disetujui' });
};

export const rejectPermintaan = async (req: Request, res: Response) => {
  const data = await service.reject(req.params.id as string, getActor(req), req.validated!.body.alasan);
  res.json({ success: true, data, message: 'Permintaan pengujian ditolak' });
};

export const deletePermintaan = async (req: Request, res: Response) => {
  await service.delete(req.params.id as string);
  res.json({ success: true, message: 'Permintaan pengujian berhasil dihapus' });
};
