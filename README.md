# Mercor Challenge — Referral Network

### Language & Setup
- **Language:** TypeScript
- **Node.js Version:** >= 20.x
- **Package Manager:** npm
- **Test Framework:** Jest (with ts-jest, ESM support)
- **Compiler:** TypeScript 5.x

### Installation
```bash
# Install dependencies
npm install

# Build the project (outputs to /dist)
npm run build
```

### Running Tests
```bash
# Run the entire test suite once
npm test
```

**Approximate Time Spent:-** 12 hours 

## Design Choices
### Part 1 — Core Data Structure

**Goal:** Store users and directed referral links while enforcing: (1) no self‑referrals, (2) a user has exactly one referrer, (3) the graph remains acyclic.

**Data model:**
- children: Map<string, Set<string>> — adjacency list of direct referrals (outgoing edges).
- parent: Map<string, string> — maps a candidate → their unique referrer (incoming edge).
- Users are added lazily (ensureUser) so lookups are always defined.

**API surface:**
- addUser(u): void — idempotent user creation.
- addReferral(referrer, candidate): boolean — returns true on success; false if any rule is violated (self, duplicate/second referrer, cycle).
- getDirectReferrals(u): string[] — immediate children of u.
- users(): string[] — all known user IDs.
- Design note: Returning boolean (instead of throwing) keeps the API simple for batch/ETL style inserts and mirrors the “reject operation” wording in the prompt.

**Why this design:**
- Adjacency list is cache‑friendly and efficient for traversals and direct queries.
- parent map gives constant‑time enforcement of the “unique referrer” rule.
- The BFS reachability guard is simple and correct; it avoids heavy machinery (e.g., dynamic topo‑order maintenance).

**Complexity Analysis:**
- addReferral: O(V + E) in worst case (cycle check BFS).
- getDirectReferrals: O(out-degree).
- Space: O(V + E) for adjacency + parent map.


### Part 2 — Reach Calculation

- Direct Reach: Obtained directly from adjacency list.
- Total Reach: Uses BFS to traverse downstream referrals, avoiding duplicates via a seen set.
- Top-k Referrers: Sorts all users by total reach in descending order; ties are broken alphabetically.

**Reasoning:**
- BFS is chosen over DFS here for clarity and predictable memory usage when calculating total reach.

**Complexity Analysis:**
- totalReach: O(V + E) BFS over downstream nodes.
- topReferrersByReach: O(V * (V + E)) in worst case due to BFS per user.

### Part 3 — Influencer Metrics

**Unique Reach Expansion:**
- Precomputes full downstream sets for each user.
- Greedy selection: pick the user who adds the most new candidates to a covered set until the limit is reached.
- Use case: Selecting a small team of referrers to maximize unique audience coverage with minimal overlap.

**Flow Centrality:**
- Computes all-pairs shortest paths using BFS from each node.
- Scores a user when it lies on a shortest path between two others.
- Includes safety checks to avoid counting unreachable paths.
- Use case: Identifying “broker” users who bridge different parts of the network, critical for network connectivity.

**Comparison of Metrics:**
- Reach: Best when maximizing raw influence volume (e.g., growth dashboards).
- Unique Reach Expansion: Best when minimizing redundancy in campaigns.
- Flow Centrality: Best when targeting structurally important connectors.

**Complexity Analysis:**
- Unique Reach Expansion: O(V * (V + E)) for downstream set precomputation + O(limit * V) for greedy selection.
- BFS from each node: O(V * (V + E))
- Triple nested loop: O(V³) worst case (acceptable for small networks, prioritizes clarity).

### Part 4 — Network Growth Simulation

- Cohort-based model with 10 capacity levels per user.
- Initial state: 100 active referrers (full capacity).
- Each day, active users make successful referrals with probability p.
- New hires start with full capacity; referrers are retired when capacity reaches zero.

**Functions:**
- simulate(p, days): Returns cumulative expected referrals per day.
- days_to_target(p, target): Finds the minimum days to reach a target.

**Reasoning:**
- A cohort-based deterministic expected-value model avoids the randomness of Monte Carlo simulations while remaining O(days) in complexity.

**Complexity Analysis:**
- simulate: O(days) with small constant factor (10 capacity levels).
- days_to_target: O(days).

### Part 5 — Referral Bonus Optimization

- min_bonus_for_target(days, target_hires, adoption_prob, eps)
- Uses exponential search to find an upper bound.
- Binary search within that range to find the smallest bonus (rounded up to $10) meeting the target.
- adoption_prob is a monotonic function mapping bonus → probability.

**Reasoning:**
- Binary search ensures minimal bonus is found efficiently. The exponential search prevents guessing the range.

**Complexity Analysis:**
- min_bonus_for_target: O(log B * days), where B is the bonus search space size.

## Project Structure
```bash
mercor-referral/
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.jest.json
├── jest.config.ts
├── src/
│   ├── graph/
│   │   └── ReferralNetwork.ts
│   ├── analytics/
│   │   └── Influencers.ts
│   ├── sim/
│   │   ├── Simulation.ts
│   │   └── BonusOptimizer.ts
│   └── index.ts
└── tests/
    ├── referral-network.test.ts
    ├── influencers.test.ts
    ├── simulation.test.ts
    └── bonus-optimizer.test.ts

```

#### During development, AI assistance and Online Documentation was used for:
- Suggesting boilerplate TypeScript and Jest configurations.
- Debugging type, syntax, and configuration issues.
- Exploring standard algorithms and relevant library documentation.
- Brainstorming architecture and data structure approaches.
- Validating the correctness of logic through test case discussions.
