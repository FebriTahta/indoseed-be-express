import { Request, Response } from 'express';
import { qcTestRepository } from '../repositories/qcTest.repository';

export const getQcTests = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      jenisUji: req.query.jenisUji as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      commodityId: req.query.commodityId as string,
      varietyId: req.query.varietyId as string,
      testMethodId: req.query.testMethodId as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
    };
    const result = await qcTestRepository.findAll(filters);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQcTestById = async (req: Request, res: Response) => {
  try {
    const data = await qcTestRepository.findById(req.params.id as string);
    if (!data) return res.status(404).json({ success: false, message: 'Data not found' });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQcTestSummary = async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      commodityId: req.query.commodityId as string,
      varietyId: req.query.varietyId as string,
      jenisUji: req.query.jenisUji as string,
      lokasiLab: req.query.lokasiLab as string,
      status: req.query.status as string,
    };
    const summary = await qcTestRepository.getDashboardSummary(filters);
    res.json({ success: true, ...summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createQcTest = async (req: Request, res: Response) => {
  try {
    const data = await qcTestRepository.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Batch ini sudah diuji menggunakan metode uji tersebut.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateQcTest = async (req: Request, res: Response) => {
  try {
    const data = await qcTestRepository.update(req.params.id as string, req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Batch ini sudah diuji menggunakan metode uji tersebut.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQcTest = async (req: Request, res: Response) => {
  try {
    await qcTestRepository.delete(req.params.id as string);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
