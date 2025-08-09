// tests/influencers.test.ts
import { ReferralNetwork } from '../src/graph/ReferralNetwork';
import { uniqueReachExpansion, flowCentrality } from '../src/analytics/Influencers';

describe('Influencers - Part 3', () => {
  const setup = () => {
    const g = new ReferralNetwork();
    g.addReferral('A', 'B');
    g.addReferral('B', 'D');   // path A → B → D
    g.addReferral('A', 'C');
    // give C its own candidate so it can be a broker
    expect(g.addReferral('C', 'E')).toBe(true); // <--- this is the line you were asking about
    g.addUser('Z');            // isolated node
    return g;
  };

  test('unique reach expansion picks A first', () => {
    const g = setup();
    const picks = uniqueReachExpansion(g, 2);
    expect(picks[0].user).toBe('A');
    expect(picks[0].marginalGain).toBeGreaterThan(0);
  });

  test('flow centrality ranks B/C as brokers', () => {
    const g = setup();
    const ranked = flowCentrality(g);
    const topUsers = ranked.map(r => r.user).slice(0, 2).sort();
    expect(topUsers).toEqual(['B', 'C']);
  });
});
