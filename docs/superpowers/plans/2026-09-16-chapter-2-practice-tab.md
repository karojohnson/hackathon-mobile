# Chapter 2 — Practice Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Figma Make "tastytrade Practice Tab" prototype (15 screens, progressive axis-unlock game loop) as a fully clickable 6th tab in this app, restyled onto our own tokens/components, with the phone-frame status-bar background seam bug fixed everywhere it appears.

**Architecture:** A `PracticeProvider` (React context + `useState` + `localStorage`, mirrors the existing `OnboardingProvider`) holds all Practice-domain state. A declarative `lib/practice-flow.ts` lists the 14 screen components in canonical order and maps each screen to its footer CTA(s) — this is the single file that shows the whole flow's wiring. Each screen is a small presentational component; `PracticeTab` switches between them and renders the shared footer/CTA row; `PracticeShell` provides the shared background-bleed + practice banner + persistent bottom nav wrapper every screen renders inside.

**Tech Stack:** Next.js App Router, React, Tailwind v4, shadcn/Base UI components (`Slider`, `Progress`, `Button`, `Badge`), no test runner (project has none — verification is `typecheck`/`lint`/manual dev-server check, per existing convention).

**Spec:** `docs/superpowers/specs/2026-09-16-chapter-2-practice-tab-design.md`

## Global Constraints

- No unit tests — this repo has no test runner configured. Every task's "verify" step is `npm run typecheck && npm run lint`, plus a manual check in the running dev server.
- Reuse existing components/tokens before creating new ones (project convention — see root `CLAUDE.md`).
- Dark-mode-only visual verification is sufficient (this prototype is dark-theme-first; don't spend time on light mode).
- Real watchlist symbols only (`data/mock-market-data.ts`) — no fictional ZNTH/ARVO/KLTR/MERD tickers.
- Every Practice screen's root uses the exact background-bleed pattern: `glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col pt-24` (this lives once, in `PracticeShell` — no other file repeats it).
- Blue gradient glow (`.dashboard-top-glow` / `.quiz-top-glow`) stays exclusive to onboarding steps 1–3 and the dashboard. Practice screens never use it.

## Implementation note (simplification vs. spec)

The spec described a "declarative screen graph" with per-CTA navigation targets, and flagged `duration-unlock` as reachable from two different parent screens. Building this, two simplifications were made (both preserve the spec's intent, documented here so they don't look like silent drift):

1. **One canonical sequence, not a branching graph.** All 14 screens chain linearly (`cold-start → briefing → direction → dial-in → open-trades → resolution → payout → duration-unlock → distance-drill → dial-in-all-four → chain → record → earned → graduation`), with `graduation` looping back to either `cold-start` or `open-trades`. This still uses every screen and preserves the taught progression; it just means `duration-unlock` has one parent (`payout`) instead of two, since the original's second entry path was a duplicate of the exact same content reached a different way.
2. **Footer CTA config is data-only** (label + target screen id); the handful of side effects (unlocking an axis, resolving a trade) live in one small `switch`-shaped block in `practice-tab.tsx`, not as functions inside the config — keeps the config auditable as plain data while keeping side effects in exactly one place.

---

## File structure

**New:**
- `components/providers/practice-provider.tsx` — state + context
- `lib/practice-flow.ts` — screen order, footer CTA config, resolution-scoring helper
- `data/mock-practice-data.ts` — catalyst events, structures, certificates, fee unlocks
- `components/practice/practice-banner.tsx`
- `components/practice/practice-shell.tsx`
- `components/practice/axis-tag.tsx`
- `components/practice/ticker-chip.tsx`
- `components/practice/payoff-chart.tsx`
- `components/practice/dial-slider.tsx`
- `components/practice/stat-radar.tsx`
- `components/practice/practice-tab.tsx`
- `components/practice/screens/cold-start.tsx`
- `components/practice/screens/briefing.tsx`
- `components/practice/screens/direction.tsx`
- `components/practice/screens/dial-in.tsx`
- `components/practice/screens/open-trades.tsx`
- `components/practice/screens/resolution.tsx`
- `components/practice/screens/payout.tsx`
- `components/practice/screens/duration-unlock.tsx`
- `components/practice/screens/distance-drill.tsx`
- `components/practice/screens/dial-in-all-four.tsx`
- `components/practice/screens/chain.tsx`
- `components/practice/screens/record.tsx`
- `components/practice/screens/earned.tsx`
- `components/practice/screens/graduation.tsx`

**Modified:**
- `data/mock-options-data.ts` — add delta + spread/condor helpers
- `components/mobile/bottom-nav.tsx` — controlled `activeIndex`/`onActiveChange`, add "Practice" item
- `app/page.tsx` — lift tab state, conditionally render Practice tab
- `lib/icons.ts` — add `Lock`, `Unlock`, `TrendingDown`, `ExternalLink`, `Award`
- `app/symbol/[symbol]/page.tsx` — fix background-seam bug (3 spots)
- `app/symbol/[symbol]/options/page.tsx` — fix background-seam bug (2 spots)

---

### Task 1: Fix the existing background-seam bug

**Files:**
- Modify: `app/symbol/[symbol]/page.tsx:60`, `:103`, `:116`
- Modify: `app/symbol/[symbol]/options/page.tsx:47`, `:87`

**Interfaces:** None — pure className fixes, no behavior/prop changes.

- [ ] **Step 1: Fix the "not found" branch in the symbol page**

In `app/symbol/[symbol]/page.tsx`, line 60, change:
```tsx
      <div className="glass-sheet flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
```
to:
```tsx
      <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col items-center justify-center gap-4 px-6 pt-14 text-center">
```

- [ ] **Step 2: Fix the "success" branch in the symbol page**

Line 103, change:
```tsx
      <div className="glass-sheet flex min-h-full flex-col">
```
to:
```tsx
      <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col pt-14">
```

- [ ] **Step 3: Fix the main "buy" branch's height mismatch in the symbol page**

Line 116 currently reads (this one already bleeds correctly — `pt-16` is intentional extra room for the `StepProgress` bar — only `min-h-full` is wrong, since the `-mt-14` cancellation is a constant 3.5rem regardless of the element's own top padding):
```tsx
    <div className="glass-sheet -mt-14 relative flex min-h-full flex-col gap-5 px-4 pt-16">
```
Change `min-h-full` to `min-h-[calc(100%+3.5rem)]`:
```tsx
    <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col gap-5 px-4 pt-16">
```

- [ ] **Step 4: Fix the "not found" branch in the options page**

In `app/symbol/[symbol]/options/page.tsx`, line 47, change:
```tsx
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
```
to:
```tsx
      <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col items-center justify-center gap-4 px-6 pt-14 text-center">
```

- [ ] **Step 5: Fix the main render in the options page**

Line 87, change:
```tsx
    <div className="flex min-h-full flex-col gap-5 px-4 pt-8">
```
to:
```tsx
    <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col gap-5 px-4 pt-14">
```
(This drops the old one-off `pt-8` in favor of the standard `pt-14` bleed offset used everywhere else — the extra 32px of top padding this page had wasn't accounting for the status bar at all, it was just incidental.)

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both pass with no new errors.

Then start the dev server (`npm run dev`) and visually check, in the browser at 390px width: `/symbol/AAPL` (main buy screen — background should now be one consistent shade from the very top edge, no black strip behind the clock), `/symbol/AAPL/options` (should now show the elevated `glass-sheet` tint instead of flat black), and `/symbol/doesnotexist` (not-found state on both routes) for the same consistent-background check.

- [ ] **Step 7: Commit**

```bash
git add app/symbol/\[symbol\]/page.tsx app/symbol/\[symbol\]/options/page.tsx
git commit -m "Fix status-bar background seam on symbol/options screens"
```

---

### Task 2: Extend the options mock-data generator

**Files:**
- Modify: `data/mock-options-data.ts`

**Interfaces:**
- Consumes: existing `strikesFor(price, daysOut, type)` returning `OptionStrike[]`, `expirations`.
- Produces: `shortPutSpreadFor(price, daysOut, dialStop): SpreadQuote`, `ironCondorFor(price, daysOut): IronCondorQuote` — consumed by Task 15 (`dial-in`) and Task 21 (`dial-in-all-four`) screens.

- [ ] **Step 1: Add the spread/condor helpers**

Append to `data/mock-options-data.ts`:
```ts
export interface SpreadQuote {
  sellStrike: number
  buyStrike: number
  credit: number
  maxGain: number
  maxLoss: number
  breakeven: number
}

const DIAL_STOP_OFFSET: Record<50 | 70 | 90, number> = { 50: 0, 70: -1, 90: -2 }

/**
 * Short put spread sized off a target "chance this works" (50/70/90) — the
 * further OTM the short strike, the higher the displayed probability and
 * the smaller the credit. `strikesFor` already returns 7 strikes centered
 * on the money (offsets -3..3); index 3 is at-the-money.
 */
export function shortPutSpreadFor(
  price: number,
  daysOut: number,
  dialStop: 50 | 70 | 90
): SpreadQuote {
  const strikes = strikesFor(price, daysOut, "put")
  const atmIndex = 3
  const sellIndex = atmIndex + DIAL_STOP_OFFSET[dialStop]
  const buyIndex = Math.max(0, sellIndex - 1)
  const sell = strikes[sellIndex]
  const buy = strikes[buyIndex]
  const credit = Number((sell.premium - buy.premium).toFixed(2))
  return {
    sellStrike: sell.strike,
    buyStrike: buy.strike,
    credit,
    maxGain: Number((credit * 100).toFixed(2)),
    maxLoss: Number(((sell.strike - buy.strike - credit) * 100).toFixed(2)),
    breakeven: Number((sell.strike - credit).toFixed(2)),
  }
}

export interface IronCondorQuote {
  sellPutStrike: number
  buyPutStrike: number
  sellCallStrike: number
  buyCallStrike: number
  credit: number
  maxGain: number
  maxLoss: number
  lowerBreakeven: number
  upperBreakeven: number
}

/** Iron condor — one strike in from at-the-money on each side, protective wing one strike further out. */
export function ironCondorFor(price: number, daysOut: number): IronCondorQuote {
  const puts = strikesFor(price, daysOut, "put")
  const calls = strikesFor(price, daysOut, "call")
  const atmIndex = 3
  const sellPut = puts[atmIndex - 1]
  const buyPut = puts[atmIndex - 2]
  const sellCall = calls[atmIndex + 1]
  const buyCall = calls[atmIndex + 2]
  const credit = Number(
    (sellPut.premium - buyPut.premium + (sellCall.premium - buyCall.premium)).toFixed(2)
  )
  const putWidth = sellPut.strike - buyPut.strike
  const callWidth = buyCall.strike - sellCall.strike
  return {
    sellPutStrike: sellPut.strike,
    buyPutStrike: buyPut.strike,
    sellCallStrike: sellCall.strike,
    buyCallStrike: buyCall.strike,
    credit,
    maxGain: Number((credit * 100).toFixed(2)),
    maxLoss: Number(((Math.max(putWidth, callWidth) - credit) * 100).toFixed(2)),
    lowerBreakeven: Number((sellPut.strike - credit).toFixed(2)),
    upperBreakeven: Number((sellCall.strike + credit).toFixed(2)),
  }
}

export interface OptionStrikeDetailed extends OptionStrike {
  delta: number
}

function estimateDelta(price: number, strike: number, type: OptionType): number {
  const distance = (strike - price) / price
  const raw = type === "call" ? 0.5 - distance * 2.4 : 0.5 + distance * 2.4
  return Math.max(0.02, Math.min(0.98, Number(raw.toFixed(2))))
}

/** Same strikes as `strikesFor`, with an approximate delta attached — used by the chain screen. */
export function strikesWithDeltaFor(
  price: number,
  daysOut: number,
  type: OptionType
): OptionStrikeDetailed[] {
  return strikesFor(price, daysOut, type).map((s) => ({
    ...s,
    delta: estimateDelta(price, s.strike, type),
  }))
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: PASS (no other file references these new exports yet, so this alone can't break anything — just confirm the new code itself type-checks).

- [ ] **Step 3: Commit**

```bash
git add data/mock-options-data.ts
git commit -m "Add spread/condor pricing helpers to the options mock generator"
```

---

### Task 3: Create the practice mock-data file

**Files:**
- Create: `data/mock-practice-data.ts`

**Interfaces:**
- Consumes: `Axis` type from `components/providers/practice-provider` (created in Task 4 — this task can be done first since it only needs the type name, not the module's runtime exports; if Task 4 hasn't landed yet, temporarily inline the `Axis` union here and switch the import once Task 4 exists).
- Produces: `catalystsFor(symbol): SymbolCatalyst`, `ALL_STRUCTURES`, `CERTIFICATES`, `LOCKED_CERTIFICATE`, `FEE_UNLOCKS` — consumed by Tasks 13 (`briefing`), 22–24 (`chain`/`record`/`earned`).

- [ ] **Step 1: Write the file**

```ts
import type { Axis } from "@/components/providers/practice-provider"

export interface CatalystEvent {
  date: string
  label: string
  axis: Axis
  daysOut: number
}

export interface SymbolCatalyst {
  symbol: string
  impliedMovePercent: number
  events: CatalystEvent[]
}

export const SYMBOL_CATALYSTS: SymbolCatalyst[] = [
  {
    symbol: "AAPL",
    impliedMovePercent: 6.5,
    events: [
      { date: "Sep 29", label: "Index rebalance", axis: "volatility", daysOut: 13 },
      { date: "Oct 2", label: "Investor day", axis: "direction", daysOut: 16 },
      { date: "Oct 30", label: "Q4 earnings", axis: "direction", daysOut: 44 },
    ],
  },
  {
    symbol: "TSLA",
    impliedMovePercent: 9.2,
    events: [
      { date: "Oct 8", label: "Delivery numbers", axis: "distance", daysOut: 22 },
      { date: "Oct 22", label: "Q3 earnings", axis: "direction", daysOut: 36 },
    ],
  },
  {
    symbol: "NVDA",
    impliedMovePercent: 8.1,
    events: [
      { date: "Oct 6", label: "GTC keynote", axis: "volatility", daysOut: 20 },
      { date: "Nov 19", label: "Q3 earnings", axis: "direction", daysOut: 64 },
    ],
  },
  {
    symbol: "COIN",
    impliedMovePercent: 11.4,
    events: [
      { date: "Oct 15", label: "Crypto volatility spike", axis: "volatility", daysOut: 29 },
      { date: "Nov 5", label: "Q3 earnings", axis: "direction", daysOut: 50 },
    ],
  },
]

export function catalystsFor(symbol: string): SymbolCatalyst {
  return SYMBOL_CATALYSTS.find((c) => c.symbol === symbol) ?? SYMBOL_CATALYSTS[0]
}

export type StructureShape =
  | "put-spread"
  | "call-spread"
  | "iron-condor"
  | "straddle"
  | "strangle"
  | "covered-call"

export interface StructureDef {
  id: StructureShape
  label: string
}

export const ALL_STRUCTURES: StructureDef[] = [
  { id: "put-spread", label: "Short put spread" },
  { id: "call-spread", label: "Short call spread" },
  { id: "iron-condor", label: "Iron condor" },
  { id: "straddle", label: "Straddle" },
  { id: "strangle", label: "Strangle" },
  { id: "covered-call", label: "Covered call" },
]

export interface CertificateDef {
  id: string
  label: string
  earnedOn: string
}

export const CERTIFICATES: CertificateDef[] = [
  { id: "defined-risk", label: "Defined Risk", earnedOn: "Sep 2" },
  { id: "directional-trades", label: "Directional Trades", earnedOn: "Aug 18" },
]

export const LOCKED_CERTIFICATE = { id: "volatility", label: "Volatility" }

export interface FeeUnlock {
  id: string
  label: string
  sublabel: string
  axis: Axis
  before: string
  after: string
}

export const FEE_UNLOCKS: FeeUnlock[] = [
  {
    id: "commission",
    label: "Commission, per opening contract",
    sublabel: "earned at the Distance tier",
    axis: "distance",
    before: "$1.00",
    after: "$0.65",
  },
  {
    id: "exercise",
    label: "Exercise and assignment",
    sublabel: "earned at the Duration tier",
    axis: "duration",
    before: "charged",
    after: "waived",
  },
  {
    id: "index-surcharge",
    label: "Index option surcharge",
    sublabel: "at the Volatility tier",
    axis: "volatility",
    before: "",
    after: "locked",
  },
]
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: FAIL at this point if Task 4 hasn't landed yet (`Axis` won't exist) — that's expected; re-run once Task 4 is done. If Task 4 is already done, expect PASS.

- [ ] **Step 3: Commit**

```bash
git add data/mock-practice-data.ts
git commit -m "Add practice-mode mock data: catalysts, structures, certificates, fees"
```

---

### Task 4: Create the PracticeProvider

**Files:**
- Create: `components/providers/practice-provider.tsx`

**Interfaces:**
- Produces: `ScreenId`, `Axis`, `DirectionThesis`, `DialStop`, `ResolvedTrade`, `PracticeState` types; `PracticeProvider` component; `usePractice()` hook returning `{ currentScreen, symbol, chosenDirection, dialStop, unlockedAxes, xp, level, streak, resolvedTrades, structuresEarned, goTo, setSymbol, setDirection, setDialStop, unlockAxis, resolveTrade }`. Every other Practice file depends on these exact names.

- [ ] **Step 1: Write the provider**

```tsx
"use client"

import * as React from "react"

export type ScreenId =
  | "cold-start"
  | "briefing"
  | "direction"
  | "dial-in"
  | "open-trades"
  | "resolution"
  | "payout"
  | "duration-unlock"
  | "distance-drill"
  | "dial-in-all-four"
  | "chain"
  | "record"
  | "earned"
  | "graduation"

export type Axis = "direction" | "duration" | "distance" | "volatility"
export type DirectionThesis = "rallies" | "sellsOff" | "flat" | "outsized"
export type DialStop = 50 | 70 | 90

export interface ResolvedTrade {
  id: string
  symbol: string
  outcome: "win" | "loss" | "partial"
  axesCorrect: Axis[]
  axesMissed: Axis[]
  xpEarned: number
  finishedPrice: number
}

export interface PracticeState {
  currentScreen: ScreenId
  symbol: string
  chosenDirection: DirectionThesis | null
  dialStop: DialStop
  unlockedAxes: Axis[]
  xp: number
  level: number
  streak: number
  resolvedTrades: ResolvedTrade[]
  structuresEarned: string[]
}

interface PracticeContextValue extends PracticeState {
  goTo: (screen: ScreenId) => void
  setSymbol: (symbol: string) => void
  setDirection: (thesis: DirectionThesis) => void
  setDialStop: (stop: DialStop) => void
  unlockAxis: (axis: Axis) => void
  resolveTrade: (trade: Omit<ResolvedTrade, "id">) => void
}

const PracticeContext = React.createContext<PracticeContextValue | null>(null)

export const PRACTICE_STORAGE_KEY = "hackathon-practice-state-v1"

const XP_PER_LEVEL = 3000

const initialState: PracticeState = {
  currentScreen: "cold-start",
  symbol: "AAPL",
  chosenDirection: null,
  dialStop: 70,
  unlockedAxes: ["direction"],
  xp: 2840,
  level: 7,
  streak: 6,
  resolvedTrades: [],
  structuresEarned: ["put-spread", "call-spread", "iron-condor", "straddle"],
}

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<PracticeState>(initialState)

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRACTICE_STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync read of localStorage on mount, not a derived-state loop
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }))
    } catch {
      // ignore malformed/unavailable storage — falls back to defaults
    }
  }, [])

  const skippedFirstWrite = React.useRef(false)
  React.useEffect(() => {
    if (!skippedFirstWrite.current) {
      skippedFirstWrite.current = true
      return
    }
    try {
      window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [state])

  const goTo = React.useCallback((screen: ScreenId) => {
    setState((prev) => ({ ...prev, currentScreen: screen }))
  }, [])

  const setSymbol = React.useCallback((symbol: string) => {
    setState((prev) => ({ ...prev, symbol }))
  }, [])

  const setDirection = React.useCallback((thesis: DirectionThesis) => {
    setState((prev) => ({ ...prev, chosenDirection: thesis }))
  }, [])

  const setDialStop = React.useCallback((stop: DialStop) => {
    setState((prev) => ({ ...prev, dialStop: stop }))
  }, [])

  const unlockAxis = React.useCallback((axis: Axis) => {
    setState((prev) =>
      prev.unlockedAxes.includes(axis) ? prev : { ...prev, unlockedAxes: [...prev.unlockedAxes, axis] }
    )
  }, [])

  const resolveTrade = React.useCallback((trade: Omit<ResolvedTrade, "id">) => {
    setState((prev) => {
      const xp = prev.xp + trade.xpEarned
      return {
        ...prev,
        resolvedTrades: [...prev.resolvedTrades, { ...trade, id: String(prev.resolvedTrades.length) }],
        xp,
        level: 1 + Math.floor(xp / XP_PER_LEVEL),
        streak: trade.outcome === "loss" ? 0 : prev.streak + 1,
      }
    })
  }, [])

  const value = React.useMemo<PracticeContextValue>(
    () => ({ ...state, goTo, setSymbol, setDirection, setDialStop, unlockAxis, resolveTrade }),
    [state, goTo, setSymbol, setDirection, setDialStop, unlockAxis, resolveTrade]
  )

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>
}

export function usePractice() {
  const ctx = React.useContext(PracticeContext)
  if (!ctx) throw new Error("usePractice must be used within PracticeProvider")
  return ctx
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/providers/practice-provider.tsx
git commit -m "Add PracticeProvider for Chapter 2 state"
```

---

### Task 5: Create the practice-flow config

**Files:**
- Create: `lib/practice-flow.ts`

**Interfaces:**
- Consumes: `ScreenId`, `Axis`, `DirectionThesis`, `PracticeState`, `ResolvedTrade` from `@/components/providers/practice-provider`; `watchlist` from `@/data/mock-market-data`.
- Produces: `PRACTICE_SCREEN_ORDER: ScreenId[]`, `PracticeFooterCta` type, `PRACTICE_FOOTER_CTAS: Record<ScreenId, PracticeFooterCta[]>`, `computeResolution(state: PracticeState): Omit<ResolvedTrade, "id">` — consumed by `practice-tab.tsx` (Task 12) and every screen needing "how many screens total" context.

- [ ] **Step 1: Write the file**

```ts
import type { Axis, PracticeState, ResolvedTrade, ScreenId } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"

export const PRACTICE_SCREEN_ORDER: ScreenId[] = [
  "cold-start",
  "briefing",
  "direction",
  "dial-in",
  "open-trades",
  "resolution",
  "payout",
  "duration-unlock",
  "distance-drill",
  "dial-in-all-four",
  "chain",
  "record",
  "earned",
  "graduation",
]

export interface PracticeFooterCta {
  label: string
  goTo: ScreenId
  emphasis?: "primary" | "secondary"
}

export const PRACTICE_FOOTER_CTAS: Record<ScreenId, PracticeFooterCta[]> = {
  "cold-start": [{ label: "See what's coming", goTo: "briefing", emphasis: "primary" }],
  briefing: [{ label: "Pick a direction", goTo: "direction", emphasis: "primary" }],
  direction: [{ label: "Dial it in", goTo: "dial-in", emphasis: "primary" }],
  "dial-in": [{ label: "Make the trade", goTo: "open-trades", emphasis: "primary" }],
  "open-trades": [{ label: "See resolution", goTo: "resolution", emphasis: "primary" }],
  resolution: [{ label: "See the payout", goTo: "payout", emphasis: "primary" }],
  payout: [{ label: "See what this unlocked", goTo: "duration-unlock", emphasis: "primary" }],
  "duration-unlock": [{ label: "Set the window", goTo: "distance-drill", emphasis: "primary" }],
  "distance-drill": [{ label: "Fix the date", goTo: "dial-in-all-four", emphasis: "primary" }],
  "dial-in-all-four": [{ label: "Make the trade", goTo: "chain", emphasis: "primary" }],
  chain: [{ label: "See your record", goTo: "record", emphasis: "primary" }],
  record: [{ label: "See what this earned", goTo: "earned", emphasis: "primary" }],
  earned: [{ label: "Graduate", goTo: "graduation", emphasis: "primary" }],
  graduation: [
    { label: "Make the trade", goTo: "cold-start", emphasis: "primary" },
    { label: "Not yet — make another trade", goTo: "open-trades", emphasis: "secondary" },
  ],
}

/**
 * Deterministic mock scoring for the Resolution screen — Direction is the
 * only axis the player actually chose (the rest are auto-scored, matching
 * the source prototype's "we track all four axes from day one, you just
 * haven't been asked about three of them yet" mechanic). Distance is the
 * one that's "supposed" to miss on a first pass — it's the newest/hardest
 * axis — so the demo tells a consistent story across runs.
 */
export function computeResolution(state: PracticeState): Omit<ResolvedTrade, "id"> {
  const quote = watchlist.find((q) => q.symbol === state.symbol)
  const trendUp = (quote?.changePercent ?? 0) >= 0
  const directionCorrect =
    state.chosenDirection === "flat" ||
    state.chosenDirection === "outsized" ||
    (state.chosenDirection === "rallies" && trendUp) ||
    (state.chosenDirection === "sellsOff" && !trendUp)

  const axesCorrect: Axis[] = directionCorrect
    ? ["direction", "duration", "volatility"]
    : ["duration", "volatility"]
  const axesMissed: Axis[] = directionCorrect ? ["distance"] : ["direction", "distance"]

  const xpEarned = axesCorrect.length * 20

  return {
    symbol: state.symbol,
    outcome: axesMissed.length === 0 ? "win" : axesCorrect.length === 0 ? "loss" : "partial",
    axesCorrect,
    axesMissed,
    xpEarned,
    finishedPrice: quote?.price ?? 0,
  }
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/practice-flow.ts
git commit -m "Add practice-flow screen order, footer CTA config, and resolution scoring"
```

---

### Task 6: Add missing icons

**Files:**
- Modify: `lib/icons.ts`

**Interfaces:**
- Produces: `Lock`, `Unlock`, `TrendingDown`, `ExternalLink`, `Award` — consumed by Tasks 7, 15, 19, 22, 26.

- [ ] **Step 1: Add the icons to the export list**

In `lib/icons.ts`, insert into the existing `export { ... } from "lucide-react"` block (alphabetically, matching the existing style):
```ts
export {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Award,
  BatteryFull,
  Bell,
  Bitcoin,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  Compass,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  HeartPulse,
  Home,
  Landmark,
  Lightbulb,
  LineChart,
  Lock,
  MessageCircle,
  Minus,
  Newspaper,
  Pencil,
  Plane,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Signal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Tv,
  Unlock,
  User,
  Wallet,
  Wifi,
  X,
  Zap,
} from "lucide-react"
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/icons.ts
git commit -m "Add Lock, Unlock, TrendingDown, ExternalLink, Award icons"
```

---

### Task 7: Create PracticeBanner

**Files:**
- Create: `components/practice/practice-banner.tsx`

**Interfaces:**
- Consumes: nothing (static).
- Produces: `PracticeBanner` component, no props — consumed by Task 8 (`PracticeShell`).

- [ ] **Step 1: Write the component**

```tsx
/**
 * Docked-at-top "this is practice, not a real trade" banner. Sits behind
 * the shared `<StatusBar />` (rendered separately by PhoneFrame) rather
 * than duplicating the clock/icons — this just supplies the gold gradient
 * background for that strip plus the info row beneath it. Height (h-24 =
 * 96px) is the 54px status-bar zone (matches StatusBar's own h-13.5) plus
 * ~42px for the info row. Tokens from docs/token-map.md (already bridged
 * in app/globals.css): --priority-gold / --priority-gold-surface.
 */
export function PracticeBanner() {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex h-24 flex-col border-b border-white/12 bg-linear-to-b from-priority-gold-surface to-elevated-surface">
      <div className="h-13.5 shrink-0" aria-hidden />
      <div className="flex flex-1 items-center justify-between px-4">
        <span className="type-label inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-priority-gold">
          <span className="size-1.5 rounded-full bg-priority-gold" aria-hidden />
          Practice
        </span>
        <span className="type-label text-priority-gold/80">simulated · nothing here trades</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/practice/practice-banner.tsx
git commit -m "Add PracticeBanner"
```

---

### Task 8: Create PracticeShell

**Files:**
- Create: `components/practice/practice-shell.tsx`

**Interfaces:**
- Consumes: `PracticeBanner` (Task 7), `BottomNav` from `@/components/mobile/bottom-nav` (its controlled props land in Task 9 — this task can be written now referencing `activeIndex`/`onActiveChange`, it just won't type-check until Task 9 lands; do Task 9 first if strict ordering matters, or treat Tasks 8–9 as a pair).
- Produces: `PracticeShell` component with props `{ children, footer, activeTabIndex, onActiveTabChange }` — consumed by Task 12 (`practice-tab.tsx`).

- [ ] **Step 1: Write the component**

```tsx
import * as React from "react"

import { BottomNav } from "@/components/mobile/bottom-nav"
import { PracticeBanner } from "@/components/practice/practice-banner"

export interface PracticeShellProps {
  children: React.ReactNode
  footer: React.ReactNode
  activeTabIndex: number
  onActiveTabChange: (index: number) => void
}

/**
 * Shared wrapper every Practice screen renders inside. Owns the
 * background-bleed pattern (see docs/superpowers/specs/2026-09-16-chapter-2-
 * practice-tab-design.md "Background & banner") so no individual screen
 * repeats it, the PracticeBanner overlay, the scrollable body, the pinned
 * footer CTA row, and the persistent app-level bottom nav.
 */
export function PracticeShell({ children, footer, activeTabIndex, onActiveTabChange }: PracticeShellProps) {
  return (
    <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col pt-24">
      <PracticeBanner />
      <div className="flex flex-1 flex-col gap-6 px-4 pb-4">{children}</div>
      <div className="glass-nav sticky bottom-14 -mx-4 mt-auto flex flex-col gap-2 px-4 pt-3 pb-3">{footer}</div>
      <BottomNav
        activeIndex={activeTabIndex}
        onActiveChange={onActiveTabChange}
        className="sticky inset-x-0 bottom-0 z-10"
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: FAIL until Task 9 lands (`BottomNav` doesn't accept `activeIndex`/`onActiveChange` yet) — expected at this point in the sequence; re-verify after Task 9.

- [ ] **Step 3: Commit**

```bash
git add components/practice/practice-shell.tsx
git commit -m "Add PracticeShell"
```

---

### Task 9: Make BottomNav controllable, add the Practice tab

**Files:**
- Modify: `components/mobile/bottom-nav.tsx`

**Interfaces:**
- Produces: `BottomNavProps` gains optional `activeIndex?: number` and `onActiveChange?: (index: number) => void`. Uncontrolled behavior (no props passed) is unchanged — `app/prototype-kit/page.tsx`'s existing call site needs no changes.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client"

import * as React from "react"
import { cn } from "cn"

import { ArrowLeftRight, Compass, Home, LineChart, Sparkles, Wallet } from "@/lib/icons"

const items = [
  { label: "Home", icon: Home },
  { label: "Discover", icon: Compass },
  { label: "Trade", icon: ArrowLeftRight },
  { label: "Portfolio", icon: Wallet },
  { label: "Watchlist", icon: LineChart },
  { label: "Practice", icon: Sparkles },
] as const

export interface BottomNavProps {
  className?: string
  /** Controlled active tab index. Omit to let the nav manage its own state (e.g. the static prototype-kit demo). */
  activeIndex?: number
  /** Required to actually change tabs when `activeIndex` is controlled from a parent. */
  onActiveChange?: (index: number) => void
}

/**
 * Functional glass surface (section 11) — one of the few places translucency
 * is used. Ordinary content cards stay opaque.
 */
export function BottomNav({ className, activeIndex, onActiveChange }: BottomNavProps) {
  const [internalActive, setInternalActive] = React.useState(0)
  const active = activeIndex ?? internalActive

  function handleClick(index: number) {
    if (onActiveChange) onActiveChange(index)
    else setInternalActive(index)
  }

  return (
    <nav
      className={cn(
        "glass-nav flex items-center justify-around px-2 py-2",
        className
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        const isActive = index === active
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(index)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            <span className="type-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS. Then re-run Task 8's verify step (`npm run typecheck`) — it should now pass too.

- [ ] **Step 3: Commit**

```bash
git add components/mobile/bottom-nav.tsx
git commit -m "Make BottomNav controllable, add Practice tab"
```

---

### Task 10: Create AxisTag and TickerChip

**Files:**
- Create: `components/practice/axis-tag.tsx`
- Create: `components/practice/ticker-chip.tsx`

**Interfaces:**
- Consumes: `Axis` from `@/components/providers/practice-provider`; `Lock` from `@/lib/icons` (Task 6); `Quote` from `@/data/mock-market-data`; `formatPercent` from `@/lib/format`.
- Produces: `AxisTag({ axis, unlocked, className? })`, `TickerChip({ quote, catalystLabel, axis, selected, onSelect })` — consumed by Tasks 13 (`cold-start`), 14 (`briefing`), 16 (`dial-in`), 21 (`dial-in-all-four`).

- [ ] **Step 1: Write AxisTag**

```tsx
import { cn } from "cn"

import type { Axis } from "@/components/providers/practice-provider"
import { Lock } from "@/lib/icons"

const AXIS_LABEL: Record<Axis, string> = {
  direction: "Direction",
  duration: "Duration",
  distance: "Distance",
  volatility: "Volatility",
}

export interface AxisTagProps {
  axis: Axis
  unlocked: boolean
  className?: string
}

export function AxisTag({ axis, unlocked, className }: AxisTagProps) {
  return (
    <span
      className={cn(
        "type-label inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-1 uppercase tracking-wide",
        unlocked ? "text-foreground" : "text-muted-foreground/60",
        className
      )}
    >
      {!unlocked && <Lock className="size-3" />}
      {AXIS_LABEL[axis]}
    </span>
  )
}
```

- [ ] **Step 2: Write TickerChip**

```tsx
import { cn } from "cn"

import { AxisTag } from "@/components/practice/axis-tag"
import type { Axis } from "@/components/providers/practice-provider"
import type { Quote } from "@/data/mock-market-data"
import { formatPercent } from "@/lib/format"

export interface TickerChipProps {
  quote: Quote
  catalystLabel: string
  axis: Axis
  selected: boolean
  onSelect: () => void
}

export function TickerChip({ quote, catalystLabel, axis, selected, onSelect }: TickerChipProps) {
  const trend = quote.changePercent >= 0 ? "positive" : "negative"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-lg border px-3.5 py-3 text-left",
        selected ? "border-priority-gold bg-priority-gold-surface" : "border-transparent bg-muted"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="type-body-strong text-foreground">{quote.symbol}</span>
          <span className="type-label text-muted-foreground">{quote.name}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="type-body-strong tabular-nums text-foreground">${quote.price.toFixed(2)}</span>
          <span
            className={cn(
              "type-label tabular-nums",
              trend === "positive" ? "text-positive" : "text-negative"
            )}
          >
            {formatPercent(quote.changePercent)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("type-label truncate", selected ? "text-priority-gold" : "text-muted-foreground")}>
          {catalystLabel}
        </span>
        <AxisTag axis={axis} unlocked={axis === "direction"} />
      </div>
    </button>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/practice/axis-tag.tsx components/practice/ticker-chip.tsx
git commit -m "Add AxisTag and TickerChip"
```

---

### Task 11: Create PayoffChart, DialSlider, StatRadar

**Files:**
- Create: `components/practice/payoff-chart.tsx`
- Create: `components/practice/dial-slider.tsx`
- Create: `components/practice/stat-radar.tsx`

**Interfaces:**
- Consumes: `Slider` from `@/components/ui/slider`; `DialStop` from `@/components/providers/practice-provider`; `Axis` from the same.
- Produces: `PayoffChart({ points, breakevens, height?, className? })`, `DialSlider({ value, onChange, className? })`, `StatRadar({ values, className? })` — consumed by Tasks 16, 20, 21 (payoff/dial) and 23 (radar).

- [ ] **Step 1: Write PayoffChart**

```tsx
import { cn } from "cn"

export interface PayoffChartPoint {
  strike: number
  value: number
}

export interface PayoffChartProps {
  /** Ascending by strike, at least 2 points — drawn as a connected step line. */
  points: PayoffChartPoint[]
  breakevens: number[]
  height?: number
  className?: string
}

const WIDTH = 300
const PAD = 20

/** Simplified payoff diagram — a straight-line approximation of the real step function, good enough to teach the shape. */
export function PayoffChart({ points, breakevens, height = 120, className }: PayoffChartProps) {
  const strikes = points.map((p) => p.strike)
  const values = points.map((p) => p.value)
  const minStrike = Math.min(...strikes)
  const maxStrike = Math.max(...strikes)
  const minValue = Math.min(...values, 0)
  const maxValue = Math.max(...values, 0)
  const strikeRange = maxStrike - minStrike || 1
  const valueRange = maxValue - minValue || 1

  function xFor(strike: number) {
    return PAD + ((strike - minStrike) / strikeRange) * (WIDTH - PAD * 2)
  }
  function yFor(value: number) {
    return height - PAD - ((value - minValue) / valueRange) * (height - PAD * 2)
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.strike)},${yFor(p.value)}`).join(" ")
  const zeroY = yFor(0)
  const fillPath = `${linePath} L${xFor(maxStrike)},${zeroY} L${xFor(minStrike)},${zeroY} Z`

  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} className={cn("w-full", className)} preserveAspectRatio="none">
      <line x1={PAD} x2={WIDTH - PAD} y1={zeroY} y2={zeroY} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 4" />
      <path d={fillPath} fill="var(--positive)" fillOpacity={0.15} />
      <path d={linePath} fill="none" stroke="var(--positive)" strokeWidth={2} />
      {breakevens.map((b) => (
        <circle key={b} cx={xFor(b)} cy={zeroY} r={4} fill="var(--positive)" />
      ))}
    </svg>
  )
}
```

- [ ] **Step 2: Write DialSlider**

```tsx
import { cn } from "cn"

import { Slider } from "@/components/ui/slider"
import type { DialStop } from "@/components/providers/practice-provider"

const STOPS: DialStop[] = [50, 70, 90]

export interface DialSliderProps {
  value: DialStop
  onChange: (value: DialStop) => void
  className?: string
}

/** Single-thumb slider snapped to the 3 built "chance this works" stops. */
export function DialSlider({ value, onChange, className }: DialSliderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Slider
        value={[value]}
        min={50}
        max={90}
        step={20}
        onValueChange={(v) => onChange((Array.isArray(v) ? v[0] : v) as DialStop)}
      />
      <div className="flex justify-between px-0.5">
        {STOPS.map((stop) => (
          <span
            key={stop}
            className={cn("type-label tabular-nums", stop === value ? "text-foreground" : "text-muted-foreground/50")}
          >
            {stop}%
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write StatRadar**

```tsx
import { cn } from "cn"

import type { Axis } from "@/components/providers/practice-provider"

const AXES: Axis[] = ["direction", "duration", "distance", "volatility"]
const AXIS_ANGLE_DEG: Record<Axis, number> = { direction: -90, duration: 0, distance: 90, volatility: 180 }
const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 80

function pointFor(axis: Axis, value: number) {
  const angle = (AXIS_ANGLE_DEG[axis] * Math.PI) / 180
  const r = (Math.max(0, Math.min(100, value)) / 100) * RADIUS
  return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`
}

export interface StatRadarProps {
  /** 0–100 per axis. */
  values: Record<Axis, number>
  className?: string
}

export function StatRadar({ values, className }: StatRadarProps) {
  const polygon = AXES.map((a) => pointFor(a, values[a])).join(" ")
  const gridPolygon = AXES.map((a) => pointFor(a, 100)).join(" ")

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={cn("w-full", className)}>
      <polygon points={gridPolygon} fill="none" stroke="currentColor" strokeOpacity={0.15} />
      <polygon points={polygon} fill="var(--positive)" fillOpacity={0.25} stroke="var(--positive)" strokeWidth={2} />
    </svg>
  )
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/practice/payoff-chart.tsx components/practice/dial-slider.tsx components/practice/stat-radar.tsx
git commit -m "Add PayoffChart, DialSlider, StatRadar"
```

---

### Task 12: Create the 14 screen components

**Files:**
- Create: `components/practice/screens/cold-start.tsx`
- Create: `components/practice/screens/briefing.tsx`
- Create: `components/practice/screens/direction.tsx`
- Create: `components/practice/screens/dial-in.tsx`
- Create: `components/practice/screens/open-trades.tsx`
- Create: `components/practice/screens/resolution.tsx`
- Create: `components/practice/screens/payout.tsx`
- Create: `components/practice/screens/duration-unlock.tsx`
- Create: `components/practice/screens/distance-drill.tsx`
- Create: `components/practice/screens/dial-in-all-four.tsx`
- Create: `components/practice/screens/chain.tsx`
- Create: `components/practice/screens/record.tsx`
- Create: `components/practice/screens/earned.tsx`
- Create: `components/practice/screens/graduation.tsx`

**Interfaces:**
- Consumes: `usePractice()` (Task 4), all shared components from Tasks 10–11, `watchlist`/`today` from `@/data/mock-market-data`, `expirations`/`strikesFor`/`strikesWithDeltaFor`/`shortPutSpreadFor`/`ironCondorFor` from `@/data/mock-options-data` (Task 2), `catalystsFor`/`ALL_STRUCTURES`/`CERTIFICATES`/`LOCKED_CERTIFICATE`/`FEE_UNLOCKS` from `@/data/mock-practice-data` (Task 3), `Progress` from `@/components/ui/progress`, `Badge` from `@/components/ui/badge`, `formatCurrency`/`formatPercent` from `@/lib/format`.
- Produces: one default-exported (named export, matching this repo's convention of named function exports — see every existing component in `components/`) component per file, each taking no props (they all read/write via `usePractice()`). These exact names are what Task 13's `SCREEN_COMPONENTS` map references: `ColdStartScreen`, `BriefingScreen`, `DirectionScreen`, `DialInScreen`, `OpenTradesScreen`, `ResolutionScreen`, `PayoutScreen`, `DurationUnlockScreen`, `DistanceDrillScreen`, `DialInAllFourScreen`, `ChainScreen`, `RecordScreen`, `EarnedScreen`, `GraduationScreen`.

This task is naturally 14 independent sub-steps (one screen doesn't depend on another's internals, only on the shared pieces from Tasks 2–11) — each is its own commit so a reviewer can approve/reject one screen without blocking the rest.

- [ ] **Step 1: `cold-start.tsx`**

```tsx
import { TickerChip } from "@/components/practice/ticker-chip"
import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { catalystsFor } from "@/data/mock-practice-data"

const FEATURED_SYMBOLS = ["AAPL", "TSLA", "NVDA", "COIN"]

export function ColdStartScreen() {
  const { symbol, setSymbol } = usePractice()
  const quotes = FEATURED_SYMBOLS.map((s) => watchlist.find((q) => q.symbol === s)).filter(
    (q): q is NonNullable<typeof q> => Boolean(q)
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">Worth a look</h1>
        <p className="type-body text-muted-foreground">Four with something happening this week.</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {quotes.map((quote) => {
          const catalyst = catalystsFor(quote.symbol)
          const nextEvent = catalyst.events[0]
          return (
            <TickerChip
              key={quote.symbol}
              quote={quote}
              axis={nextEvent?.axis ?? "direction"}
              catalystLabel={nextEvent ? `${nextEvent.label} · implied move ± ${catalyst.impliedMovePercent}%` : "Nothing scheduled"}
              selected={symbol === quote.symbol}
              onSelect={() => setSymbol(quote.symbol)}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `briefing.tsx`**

```tsx
import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { catalystsFor } from "@/data/mock-practice-data"

export function BriefingScreen() {
  const { symbol, unlockedAxes } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)
  const catalyst = catalystsFor(symbol)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">What&apos;s coming</h1>
        <p className="type-body text-muted-foreground">
          {symbol} · next 30 days · implied move ± {catalyst.impliedMovePercent}%
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">On the calendar</span>
        {catalyst.events.map((event) => (
          <div
            key={event.label}
            className={cn(
              "flex items-center justify-between rounded-lg px-3.5 py-3",
              event === catalyst.events[catalyst.events.length - 1]
                ? "border border-priority-gold bg-priority-gold-surface"
                : "bg-muted"
            )}
          >
            <div className="flex flex-col">
              <span className="type-body-strong text-foreground">{event.label}</span>
              <span className="type-label text-muted-foreground">{event.date}</span>
            </div>
            <span className="type-label text-muted-foreground">{event.daysOut} days out</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Signals</span>
        {(["direction", "duration", "distance", "volatility"] as const).map((axis) => (
          <div key={axis} className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
            <span className={cn("type-body capitalize", unlockedAxes.includes(axis) ? "text-foreground" : "text-muted-foreground/60")}>
              {axis}
            </span>
            <span className="type-label text-muted-foreground">
              {unlockedAxes.includes(axis) ? "open" : "locked"}
            </span>
          </div>
        ))}
      </div>

      {quote && (
        <p className="type-label text-muted-foreground">
          {quote.symbol} is at ${quote.price.toFixed(2)}, {quote.changePercent >= 0 ? "up" : "down"}{" "}
          {Math.abs(quote.changePercent).toFixed(2)}% today.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: `direction.tsx`**

```tsx
import { cn } from "cn"

import { usePractice, type DirectionThesis } from "@/components/providers/practice-provider"
import { Check, Minus, TrendingDown, TrendingUp, Zap } from "@/lib/icons"

const OPTIONS: { id: DirectionThesis; label: string; sublabel: string; icon: typeof TrendingUp }[] = [
  { id: "rallies", label: "It rallies", sublabel: "you'd want upside exposure", icon: TrendingUp },
  { id: "sellsOff", label: "It sells off", sublabel: "you'd want downside exposure", icon: TrendingDown },
  { id: "flat", label: "It stays flat", sublabel: "you'd sell premium and let time work", icon: Minus },
  {
    id: "outsized",
    label: "It makes an outsized move",
    sublabel: "earnings, macro, political · you'd buy movement, not direction",
    icon: Zap,
  },
]

export function DirectionScreen() {
  const { chosenDirection, setDirection } = usePractice()
  const selected = chosenDirection ?? "rallies"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">Direction</h1>
        <p className="type-body text-muted-foreground">rally, sell off, flat, or an outsized move</p>
      </div>

      <span className="type-label uppercase tracking-wide text-muted-foreground">What do you think happens</span>

      <div className="flex flex-col gap-2.5">
        {OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = option.id === selected
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setDirection(option.id)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left",
                isSelected ? "border-positive bg-positive/10" : "border-transparent bg-muted"
              )}
            >
              <Icon className="size-5 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <span className="type-body-strong text-foreground">{option.label}</span>
                <span className="type-label text-muted-foreground">{option.sublabel}</span>
              </div>
              {isSelected && <Check className="size-5 shrink-0 text-positive" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `dial-in.tsx`**

```tsx
import { DialSlider } from "@/components/practice/dial-slider"
import { PayoffChart } from "@/components/practice/payoff-chart"
import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations, shortPutSpreadFor } from "@/data/mock-options-data"
import { formatCurrency } from "@/lib/format"

export function DialInScreen() {
  const { symbol, dialStop, setDialStop } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)
  const price = quote?.price ?? 100
  const spread = shortPutSpreadFor(price, expirations[1].daysOut, dialStop)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="type-title text-foreground">{symbol}</span>
          <span className="type-label text-muted-foreground">Direction · you said up</span>
        </div>
        <span className="type-body-strong tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span className="type-hero text-foreground">{dialStop}</span>
          <span className="type-title text-muted-foreground">%</span>
        </div>
        <span className="type-body text-foreground">Chance this works</span>
        <span className="type-label text-muted-foreground">probability of profit</span>
      </div>

      <PayoffChart
        points={[
          { strike: spread.buyStrike * 0.95, value: -spread.maxLoss },
          { strike: spread.buyStrike, value: -spread.maxLoss },
          { strike: spread.sellStrike, value: spread.maxGain },
          { strike: spread.sellStrike * 1.05, value: spread.maxGain },
        ]}
        breakevens={[spread.breakeven]}
      />

      <DialSlider value={dialStop} onChange={setDialStop} />

      <div className="flex flex-col gap-2 rounded-lg glass-card p-4">
        <span className="type-label text-muted-foreground">dial it in</span>
        <span className="type-body-strong text-foreground">Short put spread</span>
        <span className="type-label text-muted-foreground">
          sell the {spread.sellStrike} put, buy the {spread.buyStrike} put · {formatCurrency(spread.credit)} credit
        </span>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-negative">{formatCurrency(spread.maxLoss)}</span>
            <span className="type-label text-muted-foreground">max loss</span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-positive">{formatCurrency(spread.maxGain)}</span>
            <span className="type-label text-muted-foreground">max gain</span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-foreground">{spread.breakeven.toFixed(2)}</span>
            <span className="type-label text-muted-foreground">breakeven</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `open-trades.tsx`**

```tsx
import { usePractice } from "@/components/providers/practice-provider"

export function OpenTradesScreen() {
  const { symbol, streak, resolvedTrades } = usePractice()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="type-title text-foreground">Your trades</h1>
        <div className="flex flex-col items-end rounded-lg bg-muted px-3 py-2">
          <span className="type-body-strong tabular-nums text-priority-gold">{streak}</span>
          <span className="type-label text-muted-foreground">resolved in a row</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Open</span>
        <div className="flex flex-col gap-2 rounded-lg bg-muted p-3.5">
          <div className="flex items-center justify-between">
            <span className="type-body-strong text-foreground">{symbol}</span>
            <span className="type-label text-muted-foreground">resolves soon</span>
          </div>
          <span className="type-body text-muted-foreground">Short put spread</span>
        </div>
      </div>

      {resolvedTrades.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Resolved this week</span>
          {resolvedTrades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
              <span className="type-body-strong text-foreground">{trade.symbol}</span>
              <span className="type-label text-muted-foreground">
                {trade.axesCorrect.length} of {trade.axesCorrect.length + trade.axesMissed.length}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: `resolution.tsx`**

```tsx
import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { computeResolution } from "@/lib/practice-flow"
import { Check, X } from "@/lib/icons"

const AXIS_LABEL = { direction: "Direction", duration: "Duration", distance: "Distance", volatility: "Volatility" } as const

export function ResolutionScreen() {
  const practice = usePractice()
  const quote = watchlist.find((q) => q.symbol === practice.symbol)
  const preview = computeResolution(practice)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="type-body text-muted-foreground">{practice.symbol} finished at</span>
        <span className="type-hero tabular-nums text-foreground">${(quote?.price ?? 0).toFixed(2)}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="type-title tabular-nums text-foreground">
          {preview.axesCorrect.length} of {preview.axesCorrect.length + preview.axesMissed.length}
        </span>
        <span className="type-body-strong tabular-nums text-priority-gold">+{preview.xpEarned} XP</span>
      </div>

      <div className="flex flex-col">
        {[...preview.axesCorrect.map((a) => [a, true] as const), ...preview.axesMissed.map((a) => [a, false] as const)].map(
          ([axis, correct]) => (
            <div key={axis} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <div className="flex items-center gap-2">
                {correct ? <Check className="size-4 text-positive" /> : <X className="size-4 text-negative" />}
                <span className="type-body text-foreground">{AXIS_LABEL[axis]}</span>
              </div>
              <span className={cn("type-label", correct ? "text-positive" : "text-negative")}>
                {correct ? "correct" : "missed"}
              </span>
            </div>
          )
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg bg-muted p-4">
        <span className="type-body-strong text-foreground">
          {preview.outcome === "win" ? "The contract worked." : "The contract missed on Distance."}
        </span>
        <span className="type-label text-muted-foreground">Streak intact · {practice.streak} resolved in a row.</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: `payout.tsx`**

```tsx
import { usePractice } from "@/components/providers/practice-provider"
import { Progress } from "@/components/ui/progress"

const XP_PER_LEVEL = 3000

export function PayoutScreen() {
  const { xp, level, streak, resolvedTrades } = usePractice()
  const lastTrade = resolvedTrades[resolvedTrades.length - 1]
  const xpIntoLevel = xp % XP_PER_LEVEL

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="type-hero text-priority-gold">+{lastTrade?.xpEarned ?? 0} XP</span>
        <span className="type-body text-muted-foreground">
          {lastTrade?.outcome === "win" ? "The contract paid out." : "The contract paid nothing."}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Where it came from</span>
        {lastTrade?.axesCorrect.map((axis) => (
          <div key={axis} className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
            <span className="type-body capitalize text-foreground">{axis}</span>
            <span className="type-body-strong tabular-nums text-priority-gold">+20</span>
          </div>
        ))}
        {lastTrade?.axesMissed.map((axis) => (
          <div key={axis} className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
            <span className="type-body capitalize text-muted-foreground">{axis}</span>
            <span className="type-body-strong tabular-nums text-muted-foreground">0</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-body-strong text-foreground">Level {level}</span>
          <span className="type-label tabular-nums text-muted-foreground">{xpIntoLevel} / {XP_PER_LEVEL} XP</span>
        </div>
        <Progress value={(xpIntoLevel / XP_PER_LEVEL) * 100} />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-priority-gold-surface px-4 py-3">
        <div className="flex flex-col">
          <span className="type-body-strong text-priority-gold">{streak} resolved in a row</span>
          <span className="type-label text-priority-gold/80">3 more for Ten Straight</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: `duration-unlock.tsx`**

```tsx
import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations } from "@/data/mock-options-data"
import { Check, Lock, Unlock } from "@/lib/icons"

const AXES = [
  { id: "direction", label: "Direction", sublabel: "rally, sell off or flat? · delta" },
  { id: "duration", label: "Duration", sublabel: "by when? · theta · expiration" },
  { id: "distance", label: "Distance", sublabel: "how far? · strike selection" },
  { id: "volatility", label: "Volatility", sublabel: "how wild? · vega · IV at entry" },
] as const

export function DurationUnlockScreen() {
  const { symbol, unlockedAxes } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Unlock className="size-6 text-priority-gold" />
        <h1 className="type-title text-foreground">Duration</h1>
        <p className="type-label text-muted-foreground">by when? · theta · expiration</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-priority-gold">Now open on the chain</span>
        {expirations.map((exp) => (
          <div key={exp.id} className="flex flex-col rounded-lg bg-muted px-3.5 py-3 text-center">
            <span className="type-body-strong text-foreground">
              {exp.label} ({exp.daysOut})
            </span>
            <span className="type-label text-muted-foreground">
              {quote ? `underlying $${quote.price.toFixed(2)}` : ""}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Drill down</span>
        {AXES.map((axis) => {
          const unlocked = unlockedAxes.includes(axis.id)
          return (
            <div key={axis.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <div className="flex items-center gap-2">
                {unlocked ? <Check className="size-4 text-positive" /> : <Lock className="size-4 text-muted-foreground" />}
                <div className="flex flex-col">
                  <span className={cn("type-body", unlocked ? "text-foreground" : "text-muted-foreground/60")}>
                    {axis.label}
                  </span>
                  <span className="type-label text-muted-foreground">{axis.sublabel}</span>
                </div>
              </div>
              <span className="type-label text-muted-foreground">
                {axis.id === "duration" ? "new" : unlocked ? "done" : "locked"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

Note: this file uses `cn` — add the import:
```tsx
import { cn } from "cn"
```
at the top, alongside the others.

- [ ] **Step 9: `distance-drill.tsx`**

```tsx
import { DialSlider } from "@/components/practice/dial-slider"
import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations, shortPutSpreadFor } from "@/data/mock-options-data"
import { Check, X } from "@/lib/icons"

export function DistanceDrillScreen() {
  const { symbol, dialStop, setDialStop } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)
  const price = quote?.price ?? 100
  const spread = shortPutSpreadFor(price, expirations[2].daysOut, dialStop)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">Drill</h1>
        <p className="type-label text-muted-foreground">Distance tier · 3 of 5 · +15 XP each</p>
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-blue-950/40 p-4">
        <span className="type-label uppercase tracking-wide text-priority-blue">We think</span>
        <p className="type-body text-foreground">
          {symbol} drifts up, stays under ${spread.sellStrike.toFixed(0)}, and gets there by {expirations[2].label}.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border py-2">
          <span className="type-body text-foreground">up</span>
          <Check className="size-4 text-positive" />
        </div>
        <div className="flex items-center justify-between border-b border-border py-2">
          <span className="type-body text-foreground">stays under ${spread.sellStrike.toFixed(0)}</span>
          <Check className="size-4 text-positive" />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="type-body text-foreground">by {expirations[2].label}</span>
          <X className="size-4 text-negative" />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg glass-card p-4">
        <div className="flex items-center justify-between">
          <span className="type-body-strong text-foreground">Call spread</span>
          <span className="type-label text-muted-foreground">{symbol}</span>
        </div>
        <span className="type-label text-muted-foreground">
          sell the {spread.sellStrike} call, buy the {spread.buyStrike} call · expires {expirations[2].label}
        </span>
        <DialSlider value={dialStop} onChange={setDialStop} />
      </div>
    </div>
  )
}
```

- [ ] **Step 10: `dial-in-all-four.tsx`**

```tsx
import { AxisTag } from "@/components/practice/axis-tag"
import { PayoffChart } from "@/components/practice/payoff-chart"
import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations, ironCondorFor } from "@/data/mock-options-data"
import { formatCurrency } from "@/lib/format"

const AXES = ["direction", "duration", "distance", "volatility"] as const

export function DialInAllFourScreen() {
  const { symbol } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)
  const price = quote?.price ?? 100
  const condor = ironCondorFor(price, expirations[1].daysOut)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="type-title text-foreground">{symbol}</span>
          <span className="type-label text-muted-foreground">all four columns open</span>
        </div>
        <span className="type-body-strong tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {AXES.map((axis) => (
          <AxisTag key={axis} axis={axis} unlocked className="bg-positive/10 text-positive" />
        ))}
      </div>

      <PayoffChart
        points={[
          { strike: condor.buyPutStrike * 0.97, value: -condor.maxLoss },
          { strike: condor.buyPutStrike, value: -condor.maxLoss },
          { strike: condor.sellPutStrike, value: condor.maxGain },
          { strike: condor.sellCallStrike, value: condor.maxGain },
          { strike: condor.buyCallStrike, value: -condor.maxLoss },
          { strike: condor.buyCallStrike * 1.03, value: -condor.maxLoss },
        ]}
        breakevens={[condor.lowerBreakeven, condor.upperBreakeven]}
      />

      <div className="flex flex-col gap-2 rounded-lg glass-card p-4">
        <span className="type-body-strong text-foreground">Iron condor</span>
        <span className="type-label text-muted-foreground">
          {condor.buyPutStrike}/{condor.sellPutStrike} put spread + {condor.sellCallStrike}/{condor.buyCallStrike} call spread ·{" "}
          {formatCurrency(condor.credit)} credit
        </span>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-negative">{formatCurrency(condor.maxLoss)}</span>
            <span className="type-label text-muted-foreground">max loss</span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-positive">{formatCurrency(condor.maxGain)}</span>
            <span className="type-label text-muted-foreground">max gain</span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-foreground">
              {condor.lowerBreakeven.toFixed(0)}–{condor.upperBreakeven.toFixed(0)}
            </span>
            <span className="type-label text-muted-foreground">profit zone</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 11: `chain.tsx`**

```tsx
import * as React from "react"

import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations, strikesWithDeltaFor } from "@/data/mock-options-data"
import { formatCurrency } from "@/lib/format"

export function ChainScreen() {
  const { symbol } = usePractice()
  const [expirationId, setExpirationId] = React.useState(expirations[0].id)
  const quote = watchlist.find((q) => q.symbol === symbol)
  const price = quote?.price ?? 100
  const expiration = expirations.find((e) => e.id === expirationId) ?? expirations[0]
  const puts = strikesWithDeltaFor(price, expiration.daysOut, "put")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="type-title text-foreground">{symbol}</span>
          <span className="type-label text-muted-foreground">all four columns open</span>
        </div>
        <span className="type-body-strong tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Expiration</span>
        {expirations.map((exp) => (
          <button
            key={exp.id}
            type="button"
            onClick={() => setExpirationId(exp.id)}
            className={
              exp.id === expirationId
                ? "rounded-lg bg-muted px-3.5 py-3 text-center type-body-strong text-foreground"
                : "rounded-lg px-3.5 py-3 text-center type-body text-muted-foreground"
            }
          >
            {exp.label} ({exp.daysOut})
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-2 type-label text-muted-foreground">
          <span className="w-14">Strike</span>
          <span className="w-16 text-right">Bid</span>
          <span className="w-16 text-right">Ask</span>
          <span className="w-16 text-right">Delta</span>
        </div>
        {puts.map((strike) => (
          <div key={strike.strike} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
            <span className="w-14 type-body-strong tabular-nums text-foreground">{strike.strike}</span>
            <span className="w-16 text-right type-body tabular-nums text-muted-foreground">
              {formatCurrency(Math.max(0.01, strike.premium - 0.06))}
            </span>
            <span className="w-16 text-right type-body tabular-nums text-muted-foreground">
              {formatCurrency(strike.premium + 0.06)}
            </span>
            <span className="w-16 text-right type-body tabular-nums text-muted-foreground">{strike.delta.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 12: `record.tsx`**

```tsx
import { StatRadar } from "@/components/practice/stat-radar"
import { usePractice } from "@/components/providers/practice-provider"
import { ALL_STRUCTURES } from "@/data/mock-practice-data"
import { Lock } from "@/lib/icons"

const AXES = [
  { id: "direction" as const, label: "Direction", sublabel: "delta", value: 71, tier: "SHARP" },
  { id: "duration" as const, label: "Duration", sublabel: "theta · expiration", value: 66, tier: "SOLID" },
  { id: "distance" as const, label: "Distance", sublabel: "strike selection", value: 54, tier: "DEVELOPING" },
  { id: "volatility" as const, label: "Volatility", sublabel: "vega · IV at entry", value: 48, tier: "UNPROVEN" },
]

export function RecordScreen() {
  const { level, xp, resolvedTrades, structuresEarned } = usePractice()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="type-title text-foreground">Your record</h1>
          <span className="type-label text-muted-foreground">{resolvedTrades.length} resolved trades this run</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="type-body-strong text-priority-gold">LVL {level}</span>
          <span className="type-label tabular-nums text-muted-foreground">{xp} XP</span>
        </div>
      </div>

      <StatRadar values={{ direction: 71, duration: 66, distance: 54, volatility: 48 }} />

      <div className="flex flex-col">
        {AXES.map((axis) => (
          <div key={axis.id} className="flex flex-col gap-1 border-b border-border py-2.5 last:border-b-0">
            <div className="flex items-center justify-between">
              <span className="type-body text-foreground">{axis.label}</span>
              <div className="flex items-center gap-2">
                <span className="type-label text-muted-foreground">{axis.tier}</span>
                <span className="type-body-strong tabular-nums text-foreground">{axis.value}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-lg bg-priority-blue-surface! p-4">
        <span className="type-body-strong text-foreground">Volatility is your weakest stat.</span>
        <span className="type-label text-muted-foreground">Trade it more to bring it up.</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Structures earned</span>
          <span className="type-label tabular-nums text-muted-foreground">
            {structuresEarned.length} / 12
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {ALL_STRUCTURES.map((structure) => {
            const earned = structuresEarned.includes(structure.id)
            return (
              <div
                key={structure.id}
                className={
                  earned
                    ? "flex aspect-square items-center justify-center rounded-lg bg-muted"
                    : "flex aspect-square items-center justify-center rounded-lg bg-muted/40"
                }
                title={structure.label}
              >
                {earned ? (
                  <span className="type-label text-foreground">{structure.label.slice(0, 2)}</span>
                ) : (
                  <Lock className="size-4 text-muted-foreground/50" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 13: `earned.tsx`**

```tsx
import { usePractice } from "@/components/providers/practice-provider"
import { CERTIFICATES, FEE_UNLOCKS, LOCKED_CERTIFICATE } from "@/data/mock-practice-data"
import { Award, Lock, Unlock } from "@/lib/icons"

export function EarnedScreen() {
  const { unlockedAxes, resolvedTrades } = usePractice()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">What this earned</h1>
        <span className="type-label text-muted-foreground">
          {unlockedAxes.length} tiers complete · {resolvedTrades.length} resolved trades
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-positive/40 bg-positive/10 p-4">
        <span className="type-label uppercase tracking-wide text-positive">Your real options level</span>
        <div className="flex items-baseline gap-2">
          <span className="type-hero text-muted-foreground line-through">2</span>
          <span className="type-hero text-positive">3</span>
        </div>
        <span className="type-label text-muted-foreground">long options → defined-risk spreads</span>
        <p className="type-label mt-1 border-t border-positive/20 pt-2 text-muted-foreground">
          Evidence toward a review. Approval stays with the firm.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Fees</span>
        {FEE_UNLOCKS.map((fee) => {
          const unlocked = unlockedAxes.includes(fee.axis)
          return (
            <div key={fee.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <div className="flex items-center gap-2">
                {unlocked ? <Unlock className="size-4 text-priority-gold" /> : <Lock className="size-4 text-muted-foreground" />}
                <div className="flex flex-col">
                  <span className={unlocked ? "type-body text-foreground" : "type-body text-muted-foreground/60"}>
                    {fee.label}
                  </span>
                  <span className="type-label text-muted-foreground">{fee.sublabel}</span>
                </div>
              </div>
              <span className="type-label text-muted-foreground">{unlocked ? fee.after : "locked"}</span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Certificates</span>
          <span className="type-label tabular-nums text-muted-foreground">{CERTIFICATES.length} / {CERTIFICATES.length + 1}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CERTIFICATES.map((cert) => (
            <div key={cert.id} className="flex flex-col gap-1 rounded-lg border border-priority-gold bg-priority-gold-surface p-3">
              <Award className="size-4 text-priority-gold" />
              <span className="type-body-strong text-foreground">{cert.label}</span>
              <span className="type-label text-muted-foreground">{cert.earnedOn}</span>
            </div>
          ))}
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-muted p-3 text-center">
            <Lock className="size-4 text-muted-foreground" />
            <span className="type-label text-muted-foreground">{LOCKED_CERTIFICATE.label}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-lg bg-muted p-4">
        <span className="type-label uppercase tracking-wide text-muted-foreground">What tiers do not unlock</span>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Futures options</span>
          <span className="type-label text-muted-foreground">needs a futures-enabled account</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Portfolio margin</span>
          <span className="type-label text-muted-foreground">needs $125,000 equity</span>
        </div>
      </div>

      <p className="type-label text-center text-muted-foreground">Earned on trades, not on profit or loss.</p>
    </div>
  )
}
```

- [ ] **Step 14: `graduation.tsx`**

```tsx
import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations, shortPutSpreadFor } from "@/data/mock-options-data"
import { formatCurrency } from "@/lib/format"
import { ExternalLink } from "@/lib/icons"

export function GraduationScreen() {
  const { symbol, dialStop, resolvedTrades } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)
  const price = quote?.price ?? 100
  const spread = shortPutSpreadFor(price, expirations[1].daysOut, dialStop)
  const wins = resolvedTrades.filter((t) => t.outcome !== "loss").length
  const hitRate = resolvedTrades.length > 0 ? Math.round((wins / resolvedTrades.length) * 100) : 71

  return (
    <div className="flex flex-col gap-6">
      <span className="type-label uppercase tracking-wide text-muted-foreground">Practice → Live</span>

      <div className="flex flex-col gap-1">
        <p className="type-body text-foreground">
          You have made this trade <span className="type-title">{Math.max(resolvedTrades.length, 14)} times</span>
        </p>
        <p className="type-body text-foreground">
          and been right <span className="type-title text-positive">{hitRate}%</span>
        </p>
        <span className="type-label text-muted-foreground">your hit rate on this kind of trade</span>
      </div>

      <p className="type-body-strong text-foreground">The same trade, with real money behind it.</p>

      <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="type-body-strong text-foreground">Short put spread</span>
          <span className="type-label text-muted-foreground">{symbol}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Sell</span>
          <span className="type-body-strong tabular-nums text-foreground">{spread.sellStrike} put</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Buy</span>
          <span className="type-body-strong tabular-nums text-foreground">{spread.buyStrike} put</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Expires</span>
          <span className="type-body-strong text-foreground">{expirations[1].label}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Most you can lose</span>
          <span className="type-body-strong tabular-nums text-negative">{formatCurrency(spread.maxLoss)}</span>
        </div>
      </div>

      <span className="type-label text-priority-gold">⚠ Real money. Sized to what you actually hold.</span>

      <div className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-3">
        <span className="type-body text-foreground">Simulated practice ends here.</span>
        <ExternalLink className="size-4 text-muted-foreground" />
      </div>

      <p className="type-label text-center text-muted-foreground">This is a prototype — no real money moves.</p>
    </div>
  )
}
```

- [ ] **Step 15: Verify all 14 screens**

Run: `npm run typecheck && npm run lint`
Expected: FAIL at this point — no screen is imported/used anywhere yet, so unused-export lint rules may or may not fire depending on config, but more importantly Task 13 hasn't wired them up, so this is really the point where you find any typos across the 14 files. Fix any errors before moving on.

- [ ] **Step 16: Commit**

```bash
git add components/practice/screens
git commit -m "Add all 14 Chapter 2 practice screens"
```

---

### Task 13: Create PracticeTab and wire it into the app

**Files:**
- Create: `components/practice/practice-tab.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `PracticeShell` (Task 8), `usePractice`/`ScreenId` (Task 4), `PRACTICE_FOOTER_CTAS`/`computeResolution`/`PracticeFooterCta` (Task 5), `PracticeProvider` (Task 4), all 14 screen components (Task 12), `Button` from `@/components/ui/button`.
- Produces: `PracticeTab({ activeTabIndex, onActiveTabChange })` — this is the last piece; nothing downstream depends on it except `app/page.tsx`.

- [ ] **Step 1: Write `practice-tab.tsx`**

```tsx
"use client"

import * as React from "react"

import { PracticeShell } from "@/components/practice/practice-shell"
import { BriefingScreen } from "@/components/practice/screens/briefing"
import { ChainScreen } from "@/components/practice/screens/chain"
import { ColdStartScreen } from "@/components/practice/screens/cold-start"
import { DialInScreen } from "@/components/practice/screens/dial-in"
import { DialInAllFourScreen } from "@/components/practice/screens/dial-in-all-four"
import { DirectionScreen } from "@/components/practice/screens/direction"
import { DistanceDrillScreen } from "@/components/practice/screens/distance-drill"
import { DurationUnlockScreen } from "@/components/practice/screens/duration-unlock"
import { EarnedScreen } from "@/components/practice/screens/earned"
import { GraduationScreen } from "@/components/practice/screens/graduation"
import { OpenTradesScreen } from "@/components/practice/screens/open-trades"
import { PayoutScreen } from "@/components/practice/screens/payout"
import { RecordScreen } from "@/components/practice/screens/record"
import { ResolutionScreen } from "@/components/practice/screens/resolution"
import { usePractice, type ScreenId } from "@/components/providers/practice-provider"
import { Button } from "@/components/ui/button"
import { PRACTICE_FOOTER_CTAS, computeResolution, type PracticeFooterCta } from "@/lib/practice-flow"

const SCREEN_COMPONENTS: Record<ScreenId, React.ComponentType> = {
  "cold-start": ColdStartScreen,
  briefing: BriefingScreen,
  direction: DirectionScreen,
  "dial-in": DialInScreen,
  "open-trades": OpenTradesScreen,
  resolution: ResolutionScreen,
  payout: PayoutScreen,
  "duration-unlock": DurationUnlockScreen,
  "distance-drill": DistanceDrillScreen,
  "dial-in-all-four": DialInAllFourScreen,
  chain: ChainScreen,
  record: RecordScreen,
  earned: EarnedScreen,
  graduation: GraduationScreen,
}

export interface PracticeTabProps {
  activeTabIndex: number
  onActiveTabChange: (index: number) => void
}

export function PracticeTab({ activeTabIndex, onActiveTabChange }: PracticeTabProps) {
  const practice = usePractice()
  const { currentScreen, goTo, unlockAxis, resolveTrade } = practice
  const ScreenComponent = SCREEN_COMPONENTS[currentScreen]
  const ctas = PRACTICE_FOOTER_CTAS[currentScreen]

  function handleCta(cta: PracticeFooterCta) {
    if (currentScreen === "duration-unlock") unlockAxis("duration")
    if (currentScreen === "distance-drill") {
      unlockAxis("distance")
      unlockAxis("volatility")
    }
    if (currentScreen === "resolution") resolveTrade(computeResolution(practice))
    goTo(cta.goTo)
  }

  return (
    <PracticeShell
      activeTabIndex={activeTabIndex}
      onActiveTabChange={onActiveTabChange}
      footer={
        <>
          {ctas.map((cta) => (
            <Button
              key={cta.label}
              size="lg"
              variant={cta.emphasis === "secondary" ? "ghost" : "default"}
              className="h-11! w-full"
              onClick={() => handleCta(cta)}
            >
              {cta.label}
            </Button>
          ))}
        </>
      }
    >
      <ScreenComponent />
    </PracticeShell>
  )
}
```

- [ ] **Step 2: Wire it into `app/page.tsx`**

Add imports (near the top, alongside the existing ones):
```tsx
import { PracticeProvider } from "@/components/providers/practice-provider"
import { PracticeTab } from "@/components/practice/practice-tab"
```

Add state, right after the existing `useOnboarding()` destructure:
```tsx
const [activeTab, setActiveTab] = React.useState(0)
```
(This needs `import * as React from "react"` — the file is currently missing it since it has no other hooks; add it to the top import block.)

Wrap the existing return value. The current return is:
```tsx
  return (
    <div className="glass-sheet relative -mt-14 flex min-h-[calc(100%+3.5rem)] flex-col pt-14">
      {!quizDismissed && <OnboardingOverlay />}
      {/* ...rest of dashboard... */}
      <BottomNav className="sticky inset-x-0 bottom-0 z-10" />
    </div>
  )
```
Change it to:
```tsx
  if (activeTab === 5) {
    return (
      <PracticeProvider>
        <PracticeTab activeTabIndex={activeTab} onActiveTabChange={setActiveTab} />
      </PracticeProvider>
    )
  }

  return (
    <div className="glass-sheet relative -mt-14 flex min-h-[calc(100%+3.5rem)] flex-col pt-14">
      {!quizDismissed && <OnboardingOverlay />}
      {/* ...rest of dashboard, unchanged... */}
      <BottomNav
        className="sticky inset-x-0 bottom-0 z-10"
        activeIndex={activeTab}
        onActiveChange={setActiveTab}
      />
    </div>
  )
```
(Only the `BottomNav` line at the very end and the new early-return block are new — everything between `{!quizDismissed && ...}` and the old `<BottomNav .../>` line stays exactly as it is today.)

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Then `npm run dev`, open the app at 390px width, confirm:
- Tapping "Practice" in the bottom nav swaps to the Chapter 2 flow, starting at "Worth a look".
- The gold practice banner sits behind the clock/battery with no seam, and the rest of the screen is one consistent shade below it.
- Clicking through all 14 screens via the footer CTA(s) reaches Graduation, and both Graduation buttons loop back correctly.
- Tapping a different ticker chip on the first screen and re-entering the flow shows that symbol's data on `briefing`/`dial-in`/etc.
- Switching to any other bottom-nav tab and back to "Practice" resumes wherever you left off (state persists via context, not reset).
- Switching to Home tab still shows the normal Chapter 1 dashboard, unaffected.

- [ ] **Step 4: Commit**

```bash
git add components/practice/practice-tab.tsx app/page.tsx
git commit -m "Wire Chapter 2 Practice tab into the app"
```

---

## Self-review notes

- **Spec coverage:** all 15 source screens are represented (14 components, with `dial-in` parametrized over the 3 slider stops per the spec's own table). Background-seam fix covered (Task 1 for pre-existing bugs, `PracticeShell` for all new screens). Banner covered (Task 7). Entry point covered (Task 9 + Task 13 Step 2). Data reuse covered (Tasks 2–3 build on existing `mock-market-data.ts`/`mock-options-data.ts` rather than duplicating).
- **Placeholder scan:** no TBD/TODO — every step has real, complete code.
- **Type consistency:** `ScreenId`, `Axis`, `DialStop`, `DirectionThesis`, `PracticeState`, `ResolvedTrade` are defined once in Task 4 and referenced by exact name everywhere else; `usePractice()` return shape matches every call site; `SpreadQuote`/`IronCondorQuote`/`OptionStrikeDetailed` defined once in Task 2 and consumed by exact field names in Tasks 12/16/20/21/22/26.
