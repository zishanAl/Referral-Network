import { simulate, days_to_target } from '../src/sim/Simulation';

describe('Simulation - Part 4', () => {
  test('p = 0 yields flat series', () => {
    expect(simulate(0, 5)).toEqual([0, 0, 0, 0, 0]);
  });

  test('series increases for p>0', () => {
    const s = simulate(0.1, 5);
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThanOrEqual(s[i - 1]);
  });

  test('days_to_target returns -1 if unreachable within bound days', () => {
    const d = days_to_target(0, 10, 30);
    expect(d).toBe(-1);
  });
});