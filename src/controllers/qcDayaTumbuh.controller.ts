import { Request, Response } from 'express';
import { qcDayaTumbuhRepository } from '../repositories/qcDayaTumbuh.repository';

export const getDayaTumbuh = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      commodityId: req.query.commodityId as string,
      varietyId: req.query.varietyId as string,
    };
    const data = await qcDayaTumbuhRepository.findAll(filters);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDayaTumbuhById = async (req: Request, res: Response) => {
  try {
    const data = await qcDayaTumbuhRepository.findById(req.params.id as string);
    if (!data) return res.status(404).json({ success: false, message: 'Data not found' });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDayaTumbuh = async (req: Request, res: Response) => {
  try {
    const data = await qcDayaTumbuhRepository.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDayaTumbuh = async (req: Request, res: Response) => {
  try {
    const data = await qcDayaTumbuhRepository.update(req.params.id as string, req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDayaTumbuh = async (req: Request, res: Response) => {
  try {
    await qcDayaTumbuhRepository.delete(req.params.id as string);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
