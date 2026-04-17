import type { LogByDate } from '@/types';
import { formatShortDate } from '@/lib/date';
import { dayTotals } from '@/features/nutrition/totals';
import { MACRO_COLORS } from './chartDefaults';

export const MACRO_RANGES = [
  { label: '7j', value: 7 },
  { label: '14j', value: 14 },
  { label: '30j', value: 30 },
] as const;

export type MacroRange = (typeof MACRO_RANGES)[number]['value'];

export interface MacroAverages {
  p: number;
  g: number;
  l: number;
  pPct: number;
  gPct: number;
  lPct: number;
}

export interface MacroDonutSlice {
  key: 'p' | 'g' | 'l';
  label: string;
  value: number;
  color: string;
}

export interface MacroDonutResult {
  slices: MacroDonutSlice[];
  averages: MacroAverages;
}

export interface ProteinChartPoint {
  label: string;
  protein: number;
  target: number;
}

export interface ProteinChartResult {
  points: ProteinChartPoint[];
}

function listDates(n: number, today: string): string[] {
  const out: string[] = [];
  const base = Date.parse(today);
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(base - i * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}

interface MacroDonutArgs {
  log: LogByDate;
  today: string;
  range: MacroRange;
}

export function buildMacroDonut({
  log,
  today,
  range,
}: MacroDonutArgs): MacroDonutResult {
  const dates = listDates(range, today);
  const tracked = dates.map((d) => dayTotals(log, d)).filter((t) => t.kcal > 0);

  const pAvg = tracked.length
    ? tracked.reduce((s, t) => s + t.p, 0) / tracked.length
    : 0;
  const gAvg = tracked.length
    ? tracked.reduce((s, t) => s + t.g, 0) / tracked.length
    : 0;
  const lAvg = tracked.length
    ? tracked.reduce((s, t) => s + t.l, 0) / tracked.length
    : 0;

  const total = pAvg + gAvg + lAvg;
  const pct = (v: number): number =>
    total > 0 ? Math.round((v / total) * 100) : 0;

  const averages: MacroAverages = {
    p: Math.round(pAvg),
    g: Math.round(gAvg),
    l: Math.round(lAvg),
    pPct: pct(pAvg),
    gPct: pct(gAvg),
    lPct: pct(lAvg),
  };

  const slices: MacroDonutSlice[] = [
    { key: 'p', label: 'Prot', value: averages.p, color: MACRO_COLORS.p },
    { key: 'g', label: 'Gluc', value: averages.g, color: MACRO_COLORS.g },
    { key: 'l', label: 'Lip', value: averages.l, color: MACRO_COLORS.l },
  ];

  return { averages, slices };
}

interface ProteinArgs {
  log: LogByDate;
  today: string;
  targetProtein: number;
}

export function buildProteinChart({
  log,
  today,
  targetProtein,
}: ProteinArgs): ProteinChartResult {
  const dates = listDates(7, today);
  const totals = dates.map((d) => dayTotals(log, d));
  return {
    points: dates.map((date, i) => ({
      label: formatShortDate(date),
      protein: Math.round(totals[i].p),
      target: targetProtein,
    })),
  };
}
