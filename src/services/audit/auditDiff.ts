export interface AuditChange {
  field: string;
  label: string;
  sebelum: string | null;
  sesudah: string | null;
}

export type FieldLabels<T> = Partial<Record<keyof T & string, string>>;

const toText = (v: unknown): string | null => {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

/** Bandingkan field yang diberi label; hanya field yang berubah yang dikembalikan. */
export const diffFields = <T extends Record<string, unknown>>(
  before: Partial<T> | null | undefined,
  after: Partial<T> | null | undefined,
  labels: FieldLabels<T>
): AuditChange[] =>
  (Object.entries(labels) as [keyof T & string, string][])
    .map(([field, label]) => ({ field, label, sebelum: toText(before?.[field]), sesudah: toText(after?.[field]) }))
    .filter((c) => c.sebelum !== c.sesudah);

/** Kalimat ringkas untuk satu perubahan, mis. "Mengubah Kadar Air dari 12,5 menjadi 11,8". */
export const describeChange = (c: AuditChange) =>
  `Mengubah ${c.label} dari ${c.sebelum ?? '-'} menjadi ${c.sesudah ?? '-'}`;
