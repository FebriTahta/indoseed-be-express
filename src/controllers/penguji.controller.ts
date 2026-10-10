import { Request, Response } from 'express';
import { pengujiService as service } from '../services/qc/penguji.service';

export const PengujiController = {
  getAll: async (req: Request, res: Response) => {
    res.json({ success: true, ...(await service.list(req.validated!.query)) });
  },

  getStats: async (_req: Request, res: Response) => {
    res.json({ success: true, data: await service.stats() });
  },

  getById: async (req: Request, res: Response) => {
    res.json({ success: true, data: await service.getById(req.params.id as string) });
  },

  create: async (req: Request, res: Response) => {
    const data = await service.create(req.validated!.body);
    res.status(201).json({ success: true, data, message: 'Penguji dan akun user berhasil dibuat' });
  },

  update: async (req: Request, res: Response) => {
    const data = await service.update(req.params.id as string, req.validated!.body);
    res.json({ success: true, data, message: 'Data penguji berhasil diperbarui' });
  },

  delete: async (req: Request, res: Response) => {
    await service.delete(req.params.id as string);
    res.json({ success: true, message: 'Penguji berhasil dihapus' });
  },

  resetPassword: async (req: Request, res: Response) => {
    const data = await service.resetPassword(req.params.id as string);
    res.json({ success: true, data, message: 'Password sementara baru berhasil dibuat' });
  },
};
