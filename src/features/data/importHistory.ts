import type { MealEntry, WeightEntry, Workout } from '@/types';

export interface ImportEntry {
  date: string;
  weight?: number;
  targetKcal?: number;
  realKcal?: number;
  steps?: number;
  workout?: boolean;
}

export interface ImportStores {
  weights: readonly WeightEntry[];
  log: Readonly<Record<string, readonly MealEntry[]>>;
  steps: Readonly<Record<string, number>>;
  workouts: readonly Workout[];
}

export interface ImportContext {
  currentKcal: number;
}

export interface ImportPatch {
  weights: WeightEntry[];
  log: Record<string, MealEntry[]>;
  steps: Record<string, number>;
  workouts: Workout[];
  summary: {
    total: number;
    weight: number;
    kcal: number;
    steps: number;
    workouts: number;
    overwrittenDates: number;
  };
}

const IMPORT_FOOD_LABEL = 'Import historique';
const IMPORT_WORKOUT_TYPE = 'Import';
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface ParseResult {
  entries: ImportEntry[] | null;
  error: string | null;
}

export function parseImportJson(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { entries: null, error: 'JSON vide' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { entries: null, error: `JSON invalide: ${(e as Error).message}` };
  }

  if (!Array.isArray(parsed)) {
    return { entries: null, error: 'Le JSON doit être un tableau' };
  }

  const entries: ImportEntry[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const raw = parsed[i] as Record<string, unknown>;
    if (!raw || typeof raw !== 'object') {
      return { entries: null, error: `Entrée ${i + 1} invalide` };
    }
    const date = raw.date;
    if (typeof date !== 'string' || !ISO_RE.test(date)) {
      return {
        entries: null,
        error: `Entrée ${i + 1}: date doit être ISO (AAAA-MM-JJ)`,
      };
    }

    const entry: ImportEntry = { date };

    if (raw.weight != null) {
      if (typeof raw.weight !== 'number' || !Number.isFinite(raw.weight)) {
        return { entries: null, error: `Entrée ${i + 1}: weight invalide` };
      }
      entry.weight = raw.weight;
    }
    if (raw.targetKcal != null) {
      if (
        typeof raw.targetKcal !== 'number' ||
        !Number.isFinite(raw.targetKcal)
      ) {
        return {
          entries: null,
          error: `Entrée ${i + 1}: targetKcal invalide`,
        };
      }
      entry.targetKcal = Math.round(raw.targetKcal);
    }
    if (raw.realKcal != null) {
      if (typeof raw.realKcal !== 'number' || !Number.isFinite(raw.realKcal)) {
        return { entries: null, error: `Entrée ${i + 1}: realKcal invalide` };
      }
      entry.realKcal = Math.round(raw.realKcal);
    }
    if (raw.steps != null) {
      if (typeof raw.steps !== 'number' || !Number.isFinite(raw.steps)) {
        return { entries: null, error: `Entrée ${i + 1}: steps invalide` };
      }
      entry.steps = Math.max(0, Math.round(raw.steps));
    }
    if (raw.workout != null) {
      if (typeof raw.workout !== 'boolean') {
        return {
          entries: null,
          error: `Entrée ${i + 1}: workout doit être un booléen`,
        };
      }
      entry.workout = raw.workout;
    }

    entries.push(entry);
  }

  return { entries, error: null };
}

export function buildImportPatch(
  entries: ImportEntry[],
  stores: ImportStores,
  ctx: ImportContext,
): ImportPatch {
  const weightByDate = new Map(stores.weights.map((w) => [w.date, w]));
  const log: Record<string, MealEntry[]> = {};
  for (const [d, v] of Object.entries(stores.log)) log[d] = [...v];
  const steps: Record<string, number> = { ...stores.steps };
  const workouts = [...stores.workouts];

  const importedDates = new Set<string>();
  const overwrittenDates = new Set<string>();
  let weightCount = 0;
  let kcalCount = 0;
  let stepsCount = 0;
  let workoutCount = 0;

  let synthIdSeed = Date.now();

  for (const entry of entries) {
    importedDates.add(entry.date);
    let dateOverwritten = false;

    if (entry.weight != null) {
      if (weightByDate.has(entry.date)) dateOverwritten = true;
      const existing = weightByDate.get(entry.date);
      weightByDate.set(entry.date, {
        date: entry.date,
        w: +entry.weight.toFixed(1),
        tgKcal: entry.targetKcal ?? existing?.tgKcal ?? ctx.currentKcal,
        phase: existing?.phase,
      });
      weightCount++;
    } else if (entry.targetKcal != null && weightByDate.has(entry.date)) {
      const existing = weightByDate.get(entry.date)!;
      weightByDate.set(entry.date, { ...existing, tgKcal: entry.targetKcal });
    }

    if (entry.realKcal != null) {
      if (log[entry.date]) dateOverwritten = true;
      log[entry.date] = [
        {
          id: ++synthIdSeed,
          food: IMPORT_FOOD_LABEL,
          qty: 1,
          kcal: entry.realKcal,
          p: 0,
          g: 0,
          l: 0,
          f: 0,
          meal: 0,
        },
      ];
      kcalCount++;
    }

    if (entry.steps != null) {
      if (steps[entry.date] != null) dateOverwritten = true;
      steps[entry.date] = entry.steps;
      stepsCount++;
    }

    if (entry.workout != null) {
      const hasExisting = workouts.some((w) => w.date === entry.date);
      if (hasExisting) dateOverwritten = true;
      for (let i = workouts.length - 1; i >= 0; i--) {
        if (workouts[i].date === entry.date) workouts.splice(i, 1);
      }
      if (entry.workout) {
        workouts.push({
          id: ++synthIdSeed,
          date: entry.date,
          type: IMPORT_WORKOUT_TYPE,
          dur: 0,
        });
        workoutCount++;
      }
    }

    if (dateOverwritten) overwrittenDates.add(entry.date);
  }

  const sortedWeights = Array.from(weightByDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  workouts.sort((a, b) => a.date.localeCompare(b.date));

  return {
    weights: sortedWeights,
    log,
    steps,
    workouts,
    summary: {
      total: importedDates.size,
      weight: weightCount,
      kcal: kcalCount,
      steps: stepsCount,
      workouts: workoutCount,
      overwrittenDates: overwrittenDates.size,
    },
  };
}
