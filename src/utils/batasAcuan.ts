import { HASIL_AKHIR } from '../constants/qc.constants';

export type BatasOperator = '<=' | '>=' | '<' | '>' | '=' | 'range';

export interface ParsedBatas {
  operator: BatasOperator;
  min?: number;
  max?: number;
  value?: number;
}

const toNumber = (raw: string | undefined): number | undefined => {
  if (!raw) return undefined;
  const n = Number(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};

const NUMBER = '(-?\\d+(?:[.,]\\d+)?)';

/**
 * Mengurai string batas acuan dari master parameter, contoh:
 * "≥ 80", ">= 80 %", "≤ 12.0", "< 2", "= 0", "6.0 - 7.5".
 * Mengembalikan null bila tidak dapat dievaluasi secara numerik.
 */
export const parseBatasAcuan = (batas?: string | null): ParsedBatas | null => {
  if (!batas) return null;
  const str = batas.trim();

  const range = str.match(new RegExp(`^${NUMBER}\\s*[-–]\\s*${NUMBER}`));
  if (range) {
    const min = toNumber(range[1]);
    const max = toNumber(range[2]);
    if (min !== undefined && max !== undefined) return { operator: 'range', min, max };
  }

  const op = str.match(new RegExp(`^(≥|>=|≤|<=|<|>|=)\\s*${NUMBER}`));
  if (op) {
    const value = toNumber(op[2]);
    if (value === undefined) return null;
    const symbol = op[1];
    const operator: BatasOperator =
      symbol === '≥' || symbol === '>=' ? '>=' : symbol === '≤' || symbol === '<=' ? '<=' : (symbol as BatasOperator);
    return { operator, value };
  }

  return null;
};

/** Mengevaluasi nilai hasil terhadap batas acuan. null = tidak dapat dievaluasi otomatis. */
export const evaluateHasil = (nilai: number | null | undefined, batas?: string | null): string | null => {
  if (nilai === null || nilai === undefined || !Number.isFinite(nilai)) return null;
  const parsed = parseBatasAcuan(batas);
  if (!parsed) return null;

  let lulus: boolean;
  switch (parsed.operator) {
    case 'range':
      lulus = nilai >= (parsed.min as number) && nilai <= (parsed.max as number);
      break;
    case '>=':
      lulus = nilai >= (parsed.value as number);
      break;
    case '<=':
      lulus = nilai <= (parsed.value as number);
      break;
    case '>':
      lulus = nilai > (parsed.value as number);
      break;
    case '<':
      lulus = nilai < (parsed.value as number);
      break;
    case '=':
      lulus = nilai === parsed.value;
      break;
    default:
      return null;
  }
  return lulus ? HASIL_AKHIR.LULUS : HASIL_AKHIR.TIDAK_LULUS;
};
