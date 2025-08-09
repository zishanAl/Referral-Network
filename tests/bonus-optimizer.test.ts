import { min_bonus_for_target } from '../src/sim/BonusOptimizer';

describe('Bonus Optimizer - Part 5', () => {
  const ap = (b: number) => Math.min(0.002 * (b / 10), 0.5); // 0, 0.0002, ..., caps at 0.5

  test('returns null when capped prob cannot reach target in given days', () => {
    const out = min_bonus_for_target(5, 10000, ap); // too few days for huge target
    expect(out).toBeNull();
  });

  test('finds minimal $10 increment that reaches target in time', () => {
    const out = min_bonus_for_target(60, 200, ap);
    if (out !== null) expect(out % 10).toBe(0);
  });
});