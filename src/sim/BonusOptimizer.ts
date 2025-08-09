import { days_to_target } from './Simulation';

export function min_bonus_for_target(
  days: number,
  target_hires: number,
  adoption_prob: (bonus: number) => number,
  eps = 1e-3
): number | null {
  if (days <= 0) throw new Error('days must be > 0');
  if (target_hires < 0) throw new Error('target_hires must be >= 0');

  const reached = (b: number) => {
    const p = adoption_prob(b);
    if (!isFinite(p) || p < 0) return false;
    return days_to_target(Math.min(1, p), target_hires, days) !== -1;
  };

  let low = 0, high = 10;
  let lastP = adoption_prob(high);
  // expand until reachable or p saturates (no further increase)
  while (!reached(high)) {
    high *= 2;
    const p = adoption_prob(high);
    if (Math.abs(p - lastP) < eps) return null; // unreachable even with more bonus
    lastP = p;
    if (high > 1e7) return null; // guardrail
  }

  while (high - low > 5) { // money space; coarse until rounding
    const mid = (low + high) / 2;
    if (reached(mid)) high = mid; else low = mid;
  }

  const roundedUpTo10 = Math.ceil(high / 10) * 10;
  return reached(roundedUpTo10) ? roundedUpTo10 : null;
}