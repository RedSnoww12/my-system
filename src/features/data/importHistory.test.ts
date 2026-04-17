import { describe, expect, it } from 'vitest';
import { buildImportPatch, parseImportJson } from './importHistory';
import type { MealEntry, WeightEntry, Workout } from '@/types';

describe('parseImportJson', () => {
  it('rejects non-array', () => {
    const { entries, error } = parseImportJson('{}');
    expect(entries).toBeNull();
    expect(error).toMatch(/tableau/);
  });

  it('rejects invalid date format', () => {
    const { entries, error } = parseImportJson(
      JSON.stringify([{ date: '17-04-2026', weight: 70 }]),
    );
    expect(entries).toBeNull();
    expect(error).toMatch(/ISO/);
  });

  it('accepts minimal entry', () => {
    const { entries, error } = parseImportJson(
      JSON.stringify([{ date: '2026-04-17', weight: 74.3 }]),
    );
    expect(error).toBeNull();
    expect(entries).toHaveLength(1);
    expect(entries?.[0].weight).toBe(74.3);
  });

  it('accepts workout boolean', () => {
    const { entries } = parseImportJson(
      JSON.stringify([{ date: '2026-04-17', workout: true }]),
    );
    expect(entries?.[0].workout).toBe(true);
  });

  it('rejects non-numeric weight', () => {
    const { error } = parseImportJson(
      JSON.stringify([{ date: '2026-04-17', weight: 'foo' }]),
    );
    expect(error).toMatch(/weight/);
  });
});

describe('buildImportPatch', () => {
  const empty = {
    weights: [] as WeightEntry[],
    log: {} as Record<string, MealEntry[]>,
    steps: {} as Record<string, number>,
    workouts: [] as Workout[],
  };

  it('inserts a new weight entry', () => {
    const patch = buildImportPatch(
      [{ date: '2026-04-17', weight: 74.3, targetKcal: 2000 }],
      empty,
      { currentKcal: 2100 },
    );
    expect(patch.weights).toHaveLength(1);
    expect(patch.weights[0]).toMatchObject({
      date: '2026-04-17',
      w: 74.3,
      tgKcal: 2000,
    });
    expect(patch.summary.weight).toBe(1);
    expect(patch.summary.overwrittenDates).toBe(0);
  });

  it('overwrites existing weight for the same date', () => {
    const patch = buildImportPatch(
      [{ date: '2026-04-17', weight: 74.3 }],
      { ...empty, weights: [{ date: '2026-04-17', w: 80, phase: 'C' }] },
      { currentKcal: 2100 },
    );
    expect(patch.weights[0].w).toBe(74.3);
    expect(patch.weights[0].phase).toBe('C');
    expect(patch.summary.overwrittenDates).toBe(1);
  });

  it('replaces day log with synthetic kcal entry', () => {
    const patch = buildImportPatch(
      [{ date: '2026-04-17', realKcal: 1850 }],
      empty,
      { currentKcal: 2100 },
    );
    expect(patch.log['2026-04-17']).toHaveLength(1);
    expect(patch.log['2026-04-17'][0].kcal).toBe(1850);
    expect(patch.log['2026-04-17'][0].food).toBe('Import historique');
  });

  it('sets steps even when 0', () => {
    const patch = buildImportPatch([{ date: '2026-04-17', steps: 0 }], empty, {
      currentKcal: 2100,
    });
    expect(patch.steps['2026-04-17']).toBe(0);
    expect(patch.summary.steps).toBe(1);
  });

  it('adds synthetic workout when true', () => {
    const patch = buildImportPatch(
      [{ date: '2026-04-17', workout: true }],
      empty,
      { currentKcal: 2100 },
    );
    expect(patch.workouts).toHaveLength(1);
    expect(patch.workouts[0].type).toBe('Import');
  });

  it('clears workouts for that date when workout is false', () => {
    const existing: Workout = {
      id: 1,
      date: '2026-04-17',
      type: 'Run',
      dur: 30,
    };
    const patch = buildImportPatch(
      [{ date: '2026-04-17', workout: false }],
      { ...empty, workouts: [existing] },
      { currentKcal: 2100 },
    );
    expect(patch.workouts).toHaveLength(0);
    expect(patch.summary.overwrittenDates).toBe(1);
  });
});
