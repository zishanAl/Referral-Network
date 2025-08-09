import { ReferralNetwork } from '../graph/ReferralNetwork';

export function computeDownstreamSets(g: ReferralNetwork): Map<string, Set<string>> {
  const users = g.users();
  const memo = new Map<string, Set<string>>();

  const dfs = (u: string): Set<string> => {
    if (memo.has(u)) return memo.get(u)!;
    const s = new Set<string>();
    for (const v of g.getDirectReferrals(u)) {
      s.add(v);
      for (const w of dfs(v)) s.add(w);
    }
    memo.set(u, s);
    return s;
  };

  for (const u of users) dfs(u);
  return memo;
}

export function uniqueReachExpansion(
  g: ReferralNetwork,
  limit: number
): Array<{ user: string; marginalGain: number }> {
  const ds = computeDownstreamSets(g);
  const covered = new Set<string>();
  const picks: Array<{ user: string; marginalGain: number }> = [];

  for (let i = 0; i < limit; i++) {
    let bestU: string | null = null;
    let bestGain = -1;
    for (const [u, set] of ds) {
      let gain = 0;
      for (const x of set) if (!covered.has(x)) gain++;
      if (gain > bestGain) { bestGain = gain; bestU = u; }
    }
    if (!bestU || bestGain <= 0) break;
    picks.push({ user: bestU, marginalGain: bestGain });
    for (const x of ds.get(bestU)!) covered.add(x);
    ds.delete(bestU);
  }
  return picks;
}

export function flowCentrality(g: ReferralNetwork): Array<{ user: string; score: number }> {
  const users = g.users();
  const idx = new Map(users.map((u, i) => [u, i] as const));
  const n = users.length;
  const INF = 1e9;
  const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(INF));

  const bfs = (sIdx: number) => {
    const s = users[sIdx];
    const q: string[] = [s];
    dist[sIdx][sIdx] = 0;
    const seen = new Set([s]);
    while (q.length) {
      const x = q.shift()!;
      for (const y of g.getDirectReferrals(x)) {
        if (!seen.has(y)) {
          seen.add(y);
          dist[sIdx][idx.get(y)!] = dist[sIdx][idx.get(x)!] + 1;
          q.push(y);
        }
      }
    }
  };

  for (let i = 0; i < n; i++) bfs(i);

  const score = new Array<number>(n).fill(0);
  for (let si = 0; si < n; si++) {
    for (let ti = 0; ti < n; ti++) {
      if (si === ti || dist[si][ti] >= INF) continue;
      for (let vi = 0; vi < n; vi++) {
        if (vi === si || vi === ti) continue;
        if (dist[si][vi] < INF && dist[vi][ti] < INF && dist[si][vi] + dist[vi][ti] === dist[si][ti]) score[vi]++;
      }
    }
  }

  return users
    .map((u, i) => ({ user: u, score: score[i] }))
    .sort((a, b) => b.score - a.score || a.user.localeCompare(b.user));
}