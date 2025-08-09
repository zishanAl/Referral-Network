export type Series = number[];

export function simulate(p: number, days: number): Series {
  if (p < 0 || p > 1) throw new Error('p must be in [0,1]');
  if (days < 0) throw new Error('days must be >= 0');

  const C = Array(11).fill(0); // capacities 1..10 (ignore 0)
  C[10] = 100; // initial active referrers

  const out: number[] = [];
  let cumulative = 0;

  for (let d = 0; d < days; d++) {
    const A = C.slice(1).reduce((a, b) => a + b, 0);
    const r = p * A; // expected successes today

    const next = Array(11).fill(0);
    for (let k = 1; k <= 9; k++) next[k] = (1 - p) * C[k] + p * C[k + 1];
    next[10] = (1 - p) * C[10] + r; // new hires start with full capacity

    for (let k = 1; k <= 10; k++) C[k] = next[k];

    cumulative += r;
    out.push(cumulative);
  }
  return out;
}

export function days_to_target(p: number, target_total: number, maxDays = 3650): number {
  if (p < 0 || p > 1) throw new Error('p must be in [0,1]');
  if (target_total < 0) throw new Error('target_total must be >= 0');

  const C = Array(11).fill(0);
  C[10] = 100;
  let cumulative = 0;

  for (let d = 1; d <= maxDays; d++) {
    const A = C.slice(1).reduce((a, b) => a + b, 0);
    const r = p * A;

    const next = Array(11).fill(0);
    for (let k = 1; k <= 9; k++) next[k] = (1 - p) * C[k] + p * C[k + 1];
    next[10] = (1 - p) * C[10] + r;

    for (let k = 1; k <= 10; k++) C[k] = next[k];

    cumulative += r;
    if (cumulative + 1e-9 >= target_total) return d;
  }
  return -1;
}