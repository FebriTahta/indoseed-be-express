import { z } from 'zod';
import { AUDIT_AKSI_LIST } from '../constants/audit.constants';

const optionalText = z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().optional());
const optionalDate = z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.date().optional());

export const auditFilterSchema = z.object({
  search: optionalText,
  username: optionalText,
  modul: optionalText,
  aksi: z.preprocess((v) => (v === '' ? undefined : v), z.enum(AUDIT_AKSI_LIST as [string, ...string[]]).optional()),
  entitas: optionalText,
  startDate: optionalDate,
  endDate: optionalDate,
});

export const auditListQuerySchema = auditFilterSchema.extend({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export type AuditFilter = z.infer<typeof auditFilterSchema>;
export type AuditListQuery = z.infer<typeof auditListQuerySchema>;
