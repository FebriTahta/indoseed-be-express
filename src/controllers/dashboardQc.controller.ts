import { Request, Response } from 'express';
import { dashboardQcService } from '../services/qc/dashboardQc.service';

export const getDashboardQc = async (req: Request, res: Response) => {
  res.json({ success: true, data: await dashboardQcService.get(req.validated!.query) });
};
