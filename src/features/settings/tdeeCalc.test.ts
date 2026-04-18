import { describe, expect, it } from 'vitest';
import { computeBmr, computeTdee } from './tdeeCalc';

describe('tdeeCalc', () => {
  it('computes male BMR via Mifflin-St Jeor approximation', () => {
    expect(computeBmr(75, 175, 'M', 30)).toBeCloseTo(
      10 * 75 + 6.25 * 175 - 5 * 30 + 5,
    );
  });

  it('female BMR is ~166 kcal lower than male at same weight/height/age', () => {
    const m = computeBmr(75, 175, 'M', 30);
    const f = computeBmr(75, 175, 'F', 30);
    expect(m - f).toBe(166);
  });

  it('applies activity + step bonus + phase multiplier', () => {
    const r = computeTdee({
      weight: 75,
      heightCm: 175,
      stepsGoal: 10_000,
      activity: 'moderate',
      phase: 'A',
    });
    expect(r.activityMultiplier).toBe(1.55);
    expect(r.phaseMultiplier).toBe(1.0);
    expect(r.stepBonus).toBe(200);
    expect(r.tdee % 100).toBe(0);
    expect(r.tdee).toBe(Math.round(r.tdeeRaw / 100) * 100);
  });

  it('phase B (deficit) produces lower tdee than phase A', () => {
    const a = computeTdee({
      weight: 75,
      heightCm: 175,
      stepsGoal: 10_000,
      activity: 'moderate',
      phase: 'A',
    }).tdee;
    const b = computeTdee({
      weight: 75,
      heightCm: 175,
      stepsGoal: 10_000,
      activity: 'moderate',
      phase: 'B',
    }).tdee;
    expect(b).toBeLessThan(a);
  });

  it('step bonus is zero when stepsGoal below baseline', () => {
    const r = computeTdee({
      weight: 75,
      heightCm: 175,
      stepsGoal: 3000,
      activity: 'moderate',
      phase: 'A',
    });
    expect(r.stepBonus).toBe(0);
  });

  it('targets prot = weight × 2 and lip = weight × 1', () => {
    const r = computeTdee({
      weight: 80,
      heightCm: 180,
      stepsGoal: 10_000,
      activity: 'moderate',
      phase: 'A',
    });
    expect(r.targets.prot).toBe(160);
    expect(r.targets.lip).toBe(80);
  });
});
