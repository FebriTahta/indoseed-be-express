import { Request, Response } from 'express';
import { qcRepository } from '../repositories/qc.repository';

// -- Reference Standards --
export const getStandards = async (req: Request, res: Response) => {
  try {
    const hasDocuments = req.query.hasDocuments === 'true';
    const data = await qcRepository.findAllStandards(hasDocuments);
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getStandardById = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.findStandardById(req.params.id as string);
    if (!data) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createStandard = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.createStandard(req.body);
    res.status(201).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateStandard = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.updateStandard(req.params.id as string, req.body);
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteStandard = async (req: Request, res: Response) => {
  try {
    await qcRepository.deleteStandard(req.params.id as string);
    res.json({ status: 'success', message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// -- Test Methods --
export const getMethods = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.findAllMethods();
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getMethodById = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.findMethodById(req.params.id as string);
    if (!data) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createMethod = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.createMethod(req.body);
    res.status(201).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateMethod = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.updateMethod(req.params.id as string, req.body);
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteMethod = async (req: Request, res: Response) => {
  try {
    await qcRepository.deleteMethod(req.params.id as string);
    res.json({ status: 'success', message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// -- Test Parameters --
export const getParameters = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.findAllParameters();
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getParameterById = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.findParameterById(req.params.id as string);
    if (!data) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createParameter = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.createParameter(req.body);
    res.status(201).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateParameter = async (req: Request, res: Response) => {
  try {
    const data = await qcRepository.updateParameter(req.params.id as string, req.body);
    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteParameter = async (req: Request, res: Response) => {
  try {
    await qcRepository.deleteParameter(req.params.id as string);
    res.json({ status: 'success', message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
