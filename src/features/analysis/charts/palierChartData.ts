import type { Palier, WeightEntry } from '@/types';
import { formatShortDate } from '@/lib/date';
import { linReg, type LinRegPoint } from '../trend';

const MS_PER_DAY = 86_400_000;

export interface PalierChartPoint {
  label: string;
  weight: number;
  regression: number;
}

export interface PalierChartResult {
  points: PalierChartPoint[];
  rate: number;
  r2: number;
  sampleCount: number;
}

export function selectPalierWeights(
  weights: readonly WeightEntry[],
  palier: Palier,
): WeightEntry[] {
  return weights.filter(
    (e) =>
      e.date >= palier.startDate &&
      (typeof e.tgKcal !== 'number' || e.tgKcal === palier.kcal) &&
      (typeof e.phase !== 'string' || e.phase === palier.phase),
  );
}

interface BuildArgs {
  weights: readonly WeightEntry[];
  palier: Palier;
}

export function buildPalierChartData({
  weights,
  palier,
}: BuildArgs): PalierChartResult | null {
  const slice = selectPalierWeights(weights, palier);
  if (slice.length < 2) return null;

  const t0 = Date.parse(slice[0].date);
  const regPoints: LinRegPoint[] = slice.map((pt) => ({
    x: (Date.parse(pt.date) - t0) / MS_PER_DAY,
    y: pt.w,
  }));
  const lr = linReg(regPoints);

  const points: PalierChartPoint[] = slice.map((pt, i) => ({
    label: formatShortDate(pt.date),
    weight: pt.w,
    regression: +(lr.slope * regPoints[i].x + lr.intercept).toFixed(2),
  }));

  return {
    rate: +(lr.slope * 7).toFixed(2),
    r2: +lr.r2.toFixed(2),
    sampleCount: slice.length,
    points,
  };
}
