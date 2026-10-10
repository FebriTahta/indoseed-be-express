import { Request, Response } from 'express';
import { auditTrailService as service } from '../services/audit/auditTrail.service';

export const getAuditList = async (req: Request, res: Response) => {
  const result = await service.list(req.validated!.query);
  res.json({ success: true, ...result });
};

export const getAuditSummary = async (_req: Request, res: Response) => {
  res.json({ success: true, data: await service.summary() });
};

export const getAuditOptions = async (_req: Request, res: Response) => {
  res.json({ success: true, data: await service.options() });
};

export const getAuditById = async (req: Request, res: Response) => {
  res.json({ success: true, data: await service.getById(req.params.id as string) });
};

export const exportAuditCsv = async (req: Request, res: Response) => {
  const csv = await service.exportCsv(req.validated!.query);
  const tanggal = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="audit-trail-${tanggal}.csv"`);
  res.send(csv);
};
