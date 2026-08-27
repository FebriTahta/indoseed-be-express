import { Request, Response } from 'express';
import { PengujiRepository } from '../repositories/penguji.repository';

export const PengujiController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const { status, laboratoriumId, testMethodId, search, page, limit } = req.query;
      
      const parsedPage = page ? parseInt(page as string) : 1;
      const parsedLimit = limit ? parseInt(limit as string) : 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const result = await PengujiRepository.findAll({
        status: status as string,
        laboratoriumId: laboratoriumId as string,
        testMethodId: testMethodId as string,
        search: search as string,
        limit: parsedLimit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(result.total / parsedLimit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getStats: async (req: Request, res: Response) => {
    try {
      const stats = await PengujiRepository.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const penguji = await PengujiRepository.findById(req.params.id);
      if (!penguji) {
        return res.status(404).json({ success: false, message: 'Penguji not found' });
      }
      res.status(200).json({ success: true, data: penguji });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const penguji = await PengujiRepository.create(req.body);
      res.status(201).json({ success: true, data: penguji });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const penguji = await PengujiRepository.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: penguji });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await PengujiRepository.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Penguji deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
