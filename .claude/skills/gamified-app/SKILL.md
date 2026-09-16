---
name: gamified-app
description: Reward-system design for this prototype. Use when adding or changing XP, levels, streaks, badges, achievements, missions, quests, unlocks, tiers, progress meters, or any "what did I earn" surface. Covers the existing practice/Bites economy in practice-provider.tsx and the rules for extending it without breaking it.
---

# Gamified App

The reward layer for a beginner options trader. This prototype already has a
working economy. Your first job is almost never to invent one: it is to find
where the existing model already answers the question and extend it.

For visual direction (palette, type, layout personality) defer to the global
`frontend-design` skill. This skill governs the *system*: what is earned, when,
why, and what it costs the learner to get it.

## The one rule

**Every reward maps to a real trading competence.** A badge exists because the
learner demonstrated something a trader actually needs. XP is paid for a correct
call on an axis, not for showing up. If you cannot name the skill a reward
certifies, cut the reward.

This is what separates the concept from a habit tracker with a streak counter
bolted on. The learner should be able to read their trophy case as a resume.

## The existing economy (source of truth)

Read [`components/providers/practice-provider.tsx`](../../../components/providers/practice-provider.tsx)
before changing anything. The live model:

| Concept | Where it lives | Current shape |
|---|---|---|
| XP | `PracticeState.xp` | Resets each level. `xp % XP_PER_LEVEL` after a resolve. |
| Level | `PracticeState.level` | `XP_PER_LEVEL = 3000`. Starts at 7 so the learner is mid-journey, not empty. |
| Streak | `PracticeState.streak` | Starts at 6. A `loss` outcome zeroes it. Anything else increments. |
| Unlocks | `PracticeState.unlockedAxes` | Starts `["direction"]`. `unlockAxis()` is additive and idempotent. |
| Trophy case | `PracticeState.structuresEarned` | Named structures: put-spread, call-spread, iron-condor, straddle. |
| Ledger | `PracticeState.resolvedTrades` | Every resolved trade, with per-axis `xp` and `correct`. |

Per-axis payouts are in [`lib/practice-flow.ts`](../../../lib/practice-flow.ts):
`AXIS_XP` pays direction/duration/distance 20 and volatility 30. Volatility is
worth more because it is the last tier unlocked. **Keep that asymmetry.** A flat
payout table tells the learner every axis is equally hard, which is false.

`resolveTrade()` is the single write path for XP, level, and streak. Do not
mutate those three anywhere else.

### The four axes are the skill tree

Direction, duration, distance, volatility (`AXIS_LABEL` / `AXIS_SUBLABEL`). They
map to delta, theta, strike selection, and vega. This is the spine of the whole
concept: the learner unlocks a real Greek each tier. New rewards should hang off
this tree rather than starting a second, parallel one.

## Extending the system

### Adding a badge or achievement

1. Name the competence first, in trader language, then name the badge.
2. Derive it from `resolvedTrades` where you can. A badge computed from the
   ledger needs no new state and cannot desync.
3. Only add a `PracticeState` field if the badge genuinely cannot be derived
   (for example, something time-based the ledger does not record).
4. If you add or rename a field, bump the version suffix on
   `PRACTICE_STORAGE_KEY`. A stale session will hydrate over your new field and
   produce nonsense. The comment block above that constant records why each
   previous bump happened: add a line for yours in the same style.
5. Add the reveal to the relevant screen, then read the `game-feel` skill to
   choreograph it. A badge that appears with no ceremony is not a badge.

### Adding a mission or quest

Missions are directed practice, not chores. A good one names the gap:
"You have never been right on volatility. Three trades, volatility only."

- Source the gap from `resolvedTrades` per-axis `correct` history.
- One active mission at a time on a mobile screen. A quest list is a backlog,
  and a backlog is a to-do app.
- Missions pay XP through `resolveTrade()` like everything else.

### Adding a tier or unlock

Unlocks must gate something the learner can *see* is better, not just more.
`duration-unlock` works because the payout screen already showed them the trade
they could not yet express. Show the locked thing before you unlock it.

## Progress display

- **Level bar**: `xp` over `XP_PER_LEVEL`. Always show the absolute remainder
  too ("90 XP to the jade lizard"), because a bar alone does not tell the
  learner what it buys. That reward hook is in `data/mock-practice-data.ts`.
- **Streak**: show the milestone it counts toward, not the raw number alone.
- **Radar**: [`components/practice/stat-radar.tsx`](../../../components/practice/stat-radar.tsx)
  is the per-axis competence view. Prefer it over four separate meters.
- **Locked state**: render locked axes as present-but-dim chips, never hidden.
  `data/mock-practice-data.ts` has a comment on why one unlocked chip beside
  three locked ones reads as a ladder. Hiding them removes the ladder.

## Styling

Use the bridged semantic tokens only. See [`docs/token-map.md`](../../../docs/token-map.md).

- Earned, correct, positive: `--positive`
- Missed, broken streak: `--negative`
- Pending, at-risk: `--warning`
- Rarity or tier accents: `--priority-gold`, `--priority-blue`, `--priority-red`
  and their `-surface` tints, which already exist for SignalBanner
- Primary action: the ink-button `--primary` pair, not a brand color

Do not introduce a new hex for "XP purple" or "legendary orange". The token map
documents why this system has no official brand button color, and inventing one
breaks both themes. Numerals use `.type-mono` so a counting XP figure does not
reflow while it animates.

## Anti-patterns

- Points with no named competence behind them
- A second currency alongside XP (gems, coins, tickets)
- Streak pressure framed as loss ("Don't lose your streak!"). This is a
  brokerage. Loss-aversion mechanics next to real money mechanics is the wrong
  lesson, and the resolution screen already teaches that losses are survivable.
- Leaderboards against other users. The comparison that matters is against the
  learner's own prior record.
- Rewards for volume of trades placed. Never incentivize trading frequency in a
  product where trading frequency costs the user money.
- A level number with no ceiling story. Level 7 of what, toward what?
