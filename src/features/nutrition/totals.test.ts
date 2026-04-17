import { describe, expect, it } from 'vitest';
import { computeStreak, dayTotals, groupByMeal, sumDayMacros } from './totals';
import type { LogByDate, MealEntry } from '@/types';

function mkEntry(partial: Partial<MealEntry>): MealEntry {
  return {
    id: Date.now() + Math.random(),
    food: 'Food',
    qty: 100,
    kcal: 100,
    p: 10,
    g: 15,
    l: 3,
    f: 2,
    meal: 0,
    ...partial,
  };
}

describe('totals', () => {
  describe('sumDayMacros', () => {
    it('returns zeroed macros for undefined or empty input', () => {
      const empty = { kcal: 0, p: 0, g: 0, l: 0, f: 0 };
      expect(sumDayMacros(undefined)).toEqual(empty);
      expect(sumDayMacros([])).toEqual(empty);
    });

    it('sums multiple entries', () => {
      const entries = [
        mkEntry({ kcal: 100, p: 10, g: 15, l: 3, f: 2 }),
        mkEntry({ kcal: 250, p: 25, g: 20, l: 8, f: 4 }),
      ];
      const total = sumDayMacros(entries);
      expect(total).toEqual({ kcal: 350, p: 35, g: 35, l: 11, f: 6 });
    });

    it('handles missing fiber gracefully', () => {
      const entries = [mkEntry({ f: undefined, kcal: 100 })];
      expect(sumDayMacros(entries).f).toBe(0);
    });
  });

  describe('dayTotals', () => {
    it('reads from log by date', () => {
      const log: LogByDate = {
        '2026-04-17': [mkEntry({ kcal: 500 })],
      };
      expect(dayTotals(log, '2026-04-17').kcal).toBe(500);
      expect(dayTotals(log, '2026-04-16').kcal).toBe(0);
    });
  });

  describe('groupByMeal', () => {
    it('groups entries by meal slot', () => {
      const entries = [
        mkEntry({ meal: 0 }),
        mkEntry({ meal: 1 }),
        mkEntry({ meal: 1 }),
        mkEntry({ meal: 3 }),
      ];
      const grouped = groupByMeal(entries);
      expect(grouped[0]).toHaveLength(1);
      expect(grouped[1]).toHaveLength(2);
      expect(grouped[3]).toHaveLength(1);
      expect(grouped[2]).toBeUndefined();
    });
  });

  describe('computeStreak', () => {
    it('returns 0 when no log on today', () => {
      const log: LogByDate = {};
      expect(computeStreak(log, '2026-04-17')).toBe(0);
    });

    it('counts consecutive days up to a break', () => {
      const log: LogByDate = {
        '2026-04-17': [mkEntry({})],
        '2026-04-16': [mkEntry({})],
        '2026-04-15': [mkEntry({})],
        '2026-04-13': [mkEntry({})],
      };
      expect(computeStreak(log, '2026-04-17')).toBe(3);
    });

    it('does not break on today being empty (grace period)', () => {
      const log: LogByDate = {
        '2026-04-17': [],
        '2026-04-16': [mkEntry({})],
      };
      expect(computeStreak(log, '2026-04-17')).toBe(1);
    });
  });
});
