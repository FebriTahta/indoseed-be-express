import { Request, Response } from 'express';
import { qcKadarAirRepository } from '../repositories/qcKadarAir.repository';

export const getKadarAir = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      commodityId: req.query.commodityId as string,
      varietyId: req.query.varietyId as string,
      testMethodId: req.query.testMethodId as string,
    };
    const data = await qcKadarAirRepository.findAll(filters);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getKadarAirById = async (req: Request, res: Response) => {
  try {
    const data = await qcKadarAirRepository.findById(req.params.id as string);
    if (!data) return res.status(404).json({ success: false, message: 'Data not found' });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createKadarAir = async (req: Request, res: Response) => {
  try {
    const data = await qcKadarAirRepository.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateKadarAir = async (req: Request, res: Response) => {
  try {
    const data = await qcKadarAirRepository.update(req.params.id as string, req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteKadarAir = async (req: Request, res: Response) => {
  try {
    await qcKadarAirRepository.delete(req.params.id as string);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
