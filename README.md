# Mercor Challenge — Referral Network

## Language & Setup
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

# Run tests in watch mode (optional)
npm run test:watch
```

## Design Choices
### Part 1 — Core Data Structure

- The referral network is represented as a Directed Acyclic Graph (DAG) using:
- children: Map<string, Set<string>> — adjacency list storing direct referrals.
- parent: Map<string, string> — quick lookup to enforce the “unique referrer” rule.

**Why this design:**

- Adjacency list gives O(1) direct referral lookups and efficient BFS/DFS traversal.
- Parent map allows constant-time checks for whether a candidate already has a referrer.
- Cycle prevention is handled by a reachability check (reachable()), ensuring acyclicity before adding edges.
- Adding and querying users remain efficient even as the network grows.

### Part 2 — Reach Calculation

- Direct Reach: Obtained directly from adjacency list.
- Total Reach: Uses BFS to traverse downstream referrals, avoiding duplicates via a seen set.
- Top-k Referrers: Sorts all users by total reach in descending order; ties are broken alphabetically.

**Reasoning:**
BFS is chosen over DFS here for clarity and predictable memory usage when calculating total reach.

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

### Part 5 — Referral Bonus Optimization

- min_bonus_for_target(days, target_hires, adoption_prob, eps)
- Uses exponential search to find an upper bound.
- Binary search within that range to find the smallest bonus (rounded up to $10) meeting the target.
- adoption_prob is a monotonic function mapping bonus → probability.

**Reasoning:**
- Binary search ensures minimal bonus is found efficiently. The exponential search prevents guessing the range.

## Complexity Analysis
### Part 1

- addReferral: O(V + E) in worst case (cycle check BFS).
- getDirectReferrals: O(out-degree).
- Space: O(V + E) for adjacency + parent map.

### Part 2

- totalReach: O(V + E) BFS over downstream nodes.
- topReferrersByReach: O(V * (V + E)) in worst case due to BFS per user.

### Part 3

- Unique Reach Expansion: O(V * (V + E)) for downstream set precomputation + O(limit * V) for greedy selection.

**Flow Centrality:**

- BFS from each node: O(V * (V + E))
- Triple nested loop: O(V³) worst case (acceptable for small networks, prioritizes clarity).

### Part 4

- simulate: O(days) with small constant factor (10 capacity levels).
- days_to_target: O(days).

### Part 5

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

## AI Usage Note

#### During development, AI assistance (ChatGPT) was used for:
- Brainstorming architecture and data structure approaches.
- Suggesting boilerplate TypeScript + Jest configurations.
- Debugging type and configuration issues.