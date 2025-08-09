import { ReferralNetwork } from '../src/graph/ReferralNetwork';

describe('ReferralNetwork - Part 1 & 2', () => {
  test('add & basic constraints', () => {
    const g = new ReferralNetwork();
    g.addUser('A'); g.addUser('B'); g.addUser('C');
    expect(g.addReferral('A', 'B')).toBe(true);
    expect(g.addReferral('A', 'A')).toBe(false); // self
    expect(g.addReferral('C', 'B')).toBe(false); // unique referrer
  });

  test('cycle prevention', () => {
    const g = new ReferralNetwork();
    g.addReferral('A', 'B');
    g.addReferral('B', 'C');
    expect(g.addReferral('C', 'A')).toBe(false); // would create cycle
  });

  test('reach & topK', () => {
    const g = new ReferralNetwork();
    g.addReferral('A', 'B');
    g.addReferral('A', 'C');
    g.addReferral('B', 'D');
    g.addReferral('C', 'E');
    expect(g.totalReach('A')).toBe(4);
    expect(g.totalReach('B')).toBe(1);
    const top = g.topReferrersByReach(2);
    expect(top[0].user).toBe('A');
    expect(top[0].reach).toBe(4);
  });
});