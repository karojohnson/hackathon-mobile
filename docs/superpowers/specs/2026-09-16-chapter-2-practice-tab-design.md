# Chapter 2 — Practice Tab (gamified options/futures learning)

## Goal

Rebuild the Figma Make prototype ("tastytrade Practice Tab - Hackathon",
file `RXKywjCCEFTTBQIJH6aQpd`, page "tasty bites · 15 screens") as a fully
clickable second chapter of this repo's prototype, restyled onto our own
design tokens/components so Chapters 1 and 2 read as one product. Chapter 1
(onboarding + dashboard) is untouched.

## Source screen inventory

16 Figma frames, one pair duplicated (`05 Tier up` and `05b The drill` are
pixel-identical Duration-unlock content — the Figma page's own "15 screens"
label already accounts for this), so **15 distinct screens**, organized
into 3 named prototype flows:

**Flow 1 — main path** (`tasty bites · pick, brief, dial in, resolve,
graduate`):

| id | Figma name | Summary |
|---|---|---|
| `cold-start` | 01 Cold start | 4 ticker chips, each tagged with one axis; CTA "See what's coming" |
| `briefing` | 01b What's coming | Symbol's 30-day catalyst calendar + Signals list (only Direction unlocked) |
| `direction` | 01c Direction | 4-way thesis picker (rallies/sells off/flat/outsized move) |
| `dial-in` | 02 / 02a / 02c Dial in – Direction | Single-axis short put spread, payoff graph, 3-stop slider (50%/70%/90% POP) |
| `open-trades` | 03 Open trades | Streak counter, OPEN list, RESOLVED THIS WEEK list |
| `resolution` | 04 Resolution | Outcome breakdown per axis (only Direction axis was actually chosen; others auto-scored) |
| `payout` | 04b The payout | XP breakdown by axis, level progress, streak banner |

**Flow continuation — progressive unlock** ("IDENTIFY · DRILL · REWARD"):

| id | Figma name | Summary |
|---|---|---|
| `duration-unlock` | 05 Tier up **=** 05b The drill (merged) | Duration axis reveal: expiration picker, drill-down progress dots |
| `distance-drill` | (unlabeled mid-flow frame) | "WE THINK" thesis card, captured-so-far checklist, call-spread range slider |
| `dial-in-all-four` | 06 Dial in – all four tiers | Iron condor, all 4 axes unlocked, two-handle slider |
| `chain` | 06b The chain | Real options chain (expirations, PUTS table, bid/mid/ask) |
| `record` | 07 The record | 4-axis radar chart, per-axis tier labels, structures-earned grid |
| `earned` | 07b What this earned | Practice→real bridge: options-level upgrade, fee unlocks, certificates |
| `graduation` | 08 Graduation | "PRACTICE → LIVE": hit-rate summary, real-money version of the trade ticket |

## Scope for this pass

Build all 15 screens and their branches (confirmed: full fidelity, not a
trimmed demo), including the chain view and both alternate dial-slider
stops.

## Entry point

Add a 6th tab to `BottomNav` (`components/mobile/bottom-nav.tsx`), labeled
**"Practice"** — mirrors the Figma prototype's own "bites" tab. Selecting it
renders the whole Chapter 2 flow, entirely self-contained within that tab
(it does not reuse or repurpose the other 5 tabs).

## Architecture

- **`PracticeProvider`** (new, `components/providers/practice-provider.tsx`)
  — same shape as the existing `OnboardingProvider`: `useState` +
  `localStorage` persistence, mounted only inside the Practice tab's content
  (not at root), so Chapter 1 state/behavior is untouched.

  State: `currentScreen`, `symbol`, `chosenDirection`, `dialStop` (50/70/90),
  `unlockedAxes` (Direction always on; Duration/Distance/Volatility unlock
  progressively as the flow is completed), `xp`, `level`, `streak`,
  `resolvedTrades[]` (feeds "Your record" + "Open trades"),
  `structuresEarned[]`.

- **`lib/practice-flow.ts`** (new) — a plain-TS declarative screen graph:
  `Record<ScreenId, { component, ctas: { label, goTo: ScreenId |
  ((state) => ScreenId) }[] }>`. Every screen's forward/back targets live in
  this one file instead of being scattered across components — this is what
  makes the branching (and the `duration-unlock` screen being reachable from
  two different parent screens) auditable and testable in one place.

## New components (`components/practice/`)

- `payoff-chart.tsx` — the green step-function payoff diagram with
  breakeven marker(s). Genuinely new; nothing existing renders this shape.
- `dial-slider.tsx` — thin wrapper around shadcn's `Slider` (already
  supports multi-thumb/range) snapped to the 3 built stops.
- `axis-tag.tsx` — DIRECTION/DURATION/DISTANCE/VOLATILITY chips, locked vs.
  unlocked visual states.
- `stat-radar.tsx` — 4-axis radar chart for "Your record" (plain SVG, no
  new chart dependency).
- `practice-banner.tsx` — see **Background & banner** below.

Reused as-is: `financial-chart.tsx`, `kpi-card.tsx`, shadcn `Slider` /
`Progress` / `Tabs`, and the strike-list pattern from
`app/symbol/[symbol]/options/page.tsx` for the `chain` screen.

## Data

- **Symbols**: pulled from the existing `watchlist` in
  `data/mock-market-data.ts` — no fictional ZNTH/ARVO/KLTR/MERD tickers.
- **Options math**: extend `data/mock-options-data.ts` (already has
  `strikesFor`/`estimatePremium`) with a delta figure and a simple IV-rank
  number, rather than a parallel generator.
- **New `data/mock-practice-data.ts`**: per-symbol catalyst events (earnings
  date, implied move) and the static structures/certificates/fee-tier
  content that doesn't map to anything that exists yet.

## Background & banner

**Root cause of the Chapter-1 seam bug** (traced in `phone-frame.tsx` +
`globals.css`): the phone frame's scroll container reserves 56px (`pt-14`)
for the status bar as bare padding with no background of its own — whatever
shows through is the outer bezel's `bg-background` (pure black in dark
mode). A screen only avoids a visible seam if its own root bleeds its real
surface color up into that strip via the
`-mt-14 ... pt-14 ... min-h-[calc(100%+3.5rem)]` pattern (or is nested
inside another element that already does). `app/page.tsx` does this
correctly (plus `.dashboard-top-glow` for its blue gradient, which is
dashboard-exclusive).

**Rule for every Chapter 2 screen root:**
```
className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col pt-14"
```
Same flat `glass-sheet` tone bleeding behind the status bar on every Practice
screen, consistently — no gradient glow (that stays exclusive to onboarding
steps 1–3 and the dashboard).

**Practice banner**: a new `PracticeBanner` renders behind the existing
shared `<StatusBar />` (which already renders real clock/icons across all
screens — not duplicated), sized to cover the status-bar strip *plus* the
"PRACTICE · simulated, nothing here trades" row beneath it. Gold gradient
background (`--priority-gold-surface` → `--color-background-general-surface-sunken`),
1px bottom border (`rgba(244,244,244,0.12)`), 8px bottom-radius, gold text
(`--priority-gold`) — tokens that already exist in `globals.css` /
`docs/token-map.md`, sourced from the tasty_Native Figma file (node
`8:19202`). Practice screen content starts below this banner's total
height instead of the plain 56px.

**Opportunistic fix (approved)**: the same root-cause bug is already live
in three spots outside Chapter 2 — `app/symbol/[symbol]/page.tsx`'s
"not found" and "success" branches (no bleed at all), and its main "buy"
branch (uses mismatched `pt-16`/`min-h-full` instead of the matching
`pt-14`/`min-h-[calc(100%+3.5rem)]`, so the box falls short at the bottom).
`app/symbol/[symbol]/options/page.tsx` has no seam but never gets the
elevated `glass-sheet` tint (flat `bg-background` throughout — a tone gap,
not a seam). All four get the same corrected bleed classes as part of this
work.

## Testing

No unit tests, per project convention. `npm run typecheck` + `npm run lint`,
then manual click-through of all 15 screens via the dev server — including
both entry paths into `duration-unlock` and confirming unlocked axes/XP/
streak persist correctly across the resolve→payout→drill→graduate loop.

## Out of scope

- Persisting Chapter 2 state across a real reload beyond what
  `localStorage` gives for free (no backend).
- The "why now" tooltip chip and other micro-explainer overlays not
  captured by the traced flows — build a reasonable equivalent inline
  rather than reverse-engineering pixel-exact hover states.
