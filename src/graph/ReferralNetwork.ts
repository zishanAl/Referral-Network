export class ReferralNetwork {
  private children: Map<string, Set<string>> = new Map();
  private parent: Map<string, string> = new Map();

  private ensureUser(u: string) {
    if (!this.children.has(u)) this.children.set(u, new Set());
  }

  addUser(u: string) {
    this.ensureUser(u);
  }

  users(): string[] {
    const s = new Set<string>(this.children.keys());
    for (const [c, p] of this.parent) { s.add(c); s.add(p); }
    return [...s];
  }

  addReferral(referrer: string, candidate: string): boolean {
    if (referrer === candidate) return false; // no self
    this.ensureUser(referrer);
    this.ensureUser(candidate);

    if (this.parent.has(candidate)) return false; // unique referrer

    // prevent cycle: candidate ->* referrer ?
    if (this.reachable(candidate, referrer)) return false;

    this.children.get(referrer)!.add(candidate);
    this.parent.set(candidate, referrer);
    return true;
  }

  getDirectReferrals(u: string): string[] {
    return [...(this.children.get(u) ?? new Set())];
  }

  totalReach(u: string): number {
    const q = [...(this.children.get(u) ?? [])];
    const seen = new Set<string>();
    while (q.length) {
      const x = q.shift()!;
      if (seen.has(x)) continue;
      seen.add(x);
      for (const y of this.children.get(x) ?? []) q.push(y);
    }
    return seen.size;
  }

  topReferrersByReach(k: number): Array<{ user: string; reach: number }> {
    const users = this.users();
    const scores = users.map(u => ({ user: u, reach: this.totalReach(u) }));
    scores.sort((a, b) => b.reach - a.reach || a.user.localeCompare(b.user));
    return scores.slice(0, k);
  }

  private reachable(src: string, target: string): boolean {
    if (src === target) return true;
    const q: string[] = [src];
    const seen = new Set([src]);
    while (q.length) {
      const x = q.shift()!;
      for (const y of this.children.get(x) ?? []) {
        if (y === target) return true;
        if (!seen.has(y)) { seen.add(y); q.push(y); }
      }
    }
    return false;
  }
}