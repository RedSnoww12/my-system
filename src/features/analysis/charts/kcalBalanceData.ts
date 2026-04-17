import type { LogByDate, WeightEntry } from '@/types';
import { formatShortDate } from '@/lib/date';
import { dayTotals } from '@/features/nutrition/totals';
import { targetForDate } from '../palier';

export const CALORIE_RANGES = [
  { label: '7j', value: 7 },
  { label: '14j', value: 14 },
  { label: '30j', value: 30 },
] as const;

export type CalorieRange = (typeof CALORIE_RANGES)[number]['value'];

function listDates(n: number, today: string): string[] {
  const out: string[] = [];
  const base = Date.parse(today);
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(base - i * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}

export interface CalorieSummary {
  avgKcal: number;
  avgTarget: number;
  deficit: number;
  overDays: number;
  underDays: number;
  trackedDays: number;
}

export type KcalBarStatus = 'empty' | 'over' | 'under';

export interface KcalChartPoint {
  label: string;
  kcal: number;
  target: number;
  status: KcalBarStatus;
}

export interface CalorieBalanceResult {
  points: KcalChartPoint[];
  summary: CalorieSummary;
}

interface BuildArgs {
  log: LogByDate;
  weights: readonly WeightEntry[];
  currentKcal: number;
  today: string;
  range: CalorieRange;
}

export function buildCalorieBalance({
  log,
  weights,
  currentKcal,
  today,
  range,
}: BuildArgs): CalorieBalanceResult {
  const dates = listDates(range, today);
  const totals = dates.map((d) => dayTotals(log, d));
  const dayTargets = dates.map((d) =>
    targetForDate(d, weights, currentKcal, today),
  );

  const points: KcalChartPoint[] = dates.map((date, i) => {
    const kcal = Math.round(totals[i].kcal);
    const target = dayTargets[i];
    let status: KcalBarStatus = 'under';
    if (kcal <= 0) status = 'empty';
    else if (kcal > target) status = 'over';
    return {
      label: formatShortDate(date),
      kcal,
      target,
      status,
    };
  });

  const tracked = totals
    .map((t, i) => ({ t, target: dayTargets[i] }))
    .filter((x) => x.t.kcal > 0);

  const avgKcal = tracked.length
    ? Math.round(tracked.reduce((s, x) => s + x.t.kcal, 0) / tracked.length)
    : 0;
  const avgTarget = tracked.length
    ? Math.round(tracked.reduce((s, x) => s + x.target, 0) / tracked.length)
    : currentKcal;
  const deficit = avgTarget - avgKcal;

  const summary: CalorieSummary = {
    avgKcal,
    avgTarget,
    deficit,
    overDays: tracked.filter((x) => x.t.kcal > x.target).length,
    underDays: tracked.filter((x) => x.t.kcal <= x.target).length,
    trackedDays: tracked.length,
  };

  return { points, summary };
}
