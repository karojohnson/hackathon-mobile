# Prompt A — Onboarding-to-First-Trade Flow

Status: approved for implementation, timeboxed to a 2.5-hour build session
Date: 2026-09-09 (revised same day after a follow-up stakeholder note)

## Context

`hackathon-mobile` is a rapid product-design hackathon prototype (see repo `CLAUDE.md`).
This spec covers **Prompt A — Product Evolution**: a beginner who has just finished
account opening and needs a low-friction path into the product.

This direction was shaped by a live planning call between Karolina Johnson and Jolie
Lepselter (2026-09-09; see project memory `hackathon_prompt_a_direction`, which also
documents the timeline of decisions/reversals below). Key decisions, latest first:

- The first-trade UI is a **deliberately simplified, stock-only** buy screen —
  plain-language metric labels with small inline explainers (e.g. what "P&L" means) —
  **not** the same UI a regular/veteran user would see. This reverses an earlier lean in
  the same call toward reusing the regular trading UI; the simplified-UI direction is
  explicitly flagged by the stakeholder as needing more design work/user research, so
  this spec calls out open questions inline (see "Open design questions") rather than
  presenting the simplified UI as fully resolved.
- Account application is already submitted and auto-approved via an external WebView.
  Native account opening is out of scope. The prototype begins the instant the WebView
  closes and the user lands in the native app for the first time.
- The first thing shown is **not** the bare dashboard. It's a fun, lightweight, skippable
  interest quiz, followed by a personalized watchlist-building moment. "I don't want to
  direct them, I want them to direct us" (Karolina) — this is why the quiz drives a
  *watchlist* rather than a single prescriptive trade recommendation.
- The user then picks **one** item from their own new watchlist (example used: Apple) to
  carry through the simplified buy flow above. No 2FA on placing this trade (not a
  sensitive-enough action for this prototype).
- After the trade, the dashboard shows the new position plus a contextual "what's next"
  prompt tied to *that specific instrument* (e.g. "more ways to trade Apple" → prediction
  markets on Apple's price by a date, single-stock futures on the same name).

## Goal / user story

A new user finishes account opening, and within seconds feels like the app already knows
them: they tell it what they're interested in, get a personalized set of things to watch,
build a watchlist from it, pick one thing from that list, and place their first trade
through a simplified, beginner-friendly buy screen — landing back on a dashboard that
shows their new position and a next step tied to what they just did.

## Two-part deliverable

Given the 2.5-hour window, this spec covers two deliverables of very different fidelity:

1. **Part 1 — fully clickable** (this spec's "Flow" section below): the complete path
   from quiz through trade confirmation. This is the real, working build.
2. **Part 2 — static/exploratory, not wired up**: 2 alternate "dynamic dashboard" concept
   mockups for discussion, not part of the clickable path. Each should show: a
   high-severity alert banner for an edge case (e.g. "we need a new photo ID" — manual
   review kicked back after auto-approval, shown because it's the most critical thing a
   user could see), a personalized next-steps section, a positions section (including
   the trade placed in Part 1), and the watchlist. Purpose is visual/conceptual
   comparison, not interactivity — static screens (or a simple side-by-side/toggle) are
   sufficient; don't wire up the alert-banner trigger condition or next-steps logic.

## Open design questions (flagged by stakeholder, not resolved here)

The simplified trading UI needs real design/user-research work beyond what a hackathon
prototype can settle. Build a best-guess version, but leave these visibly unresolved
(e.g. as a `{/* design question: ... */}` comment at the relevant spot in code, or a
small on-screen "designer note" callout) rather than presenting them as decided:

- Exactly which metrics are simple enough to show (candidates mentioned: P&L, cost
  basis; likely also current price, est. total cost — final set TBD).
- Whether every metric gets an inline explainer (e.g. an info icon + tooltip/popover) or
  only the less-obvious ones.
- Exact wording of those explainers.

## Out of scope

- Native account opening / KYC (WebView hands off already-approved).
- Any trade type beyond a simple market buy (no options, no order types beyond market,
  no sell flow).
- 2FA / step-up auth on placing the trade (explicitly waived for this prototype).
- Persisting state across sessions (in-memory only; refresh resets to the start).
- The "customize top-left icon" aside mentioned on the call — not enough signal to spec.
- The account-tied ML/interest-scoring personalization backend described in the
  follow-up call (inferring interest from behavior like clicking into "prediction
  markets" and storing it server-side) — a future vision, not part of this build.

## Flow (Part 1 — fully clickable)

Seven screens/states, in order:

1. **Quiz overlay (app launch)** — the dashboard route renders underneath, dimmed/blurred
   (`backdrop-blur` + reduced opacity), with a full-screen quiz sheet on top: "What are
   you interested in?" — multi-select chips (Tech companies / Brands you use / Bold bets
   / Steady & stable). A small, visually de-emphasized "Skip for now" sits apart from the
   primary "Continue" CTA. Multi-select; at least one pick required to enable Continue,
   or the user can skip entirely.
2. **Curated list** — a tick-box list of instruments matching the picked interest(s)
   (union across categories, de-duplicated), using the existing `watchlist-row` visual
   pattern with a checkbox affordance added. Items default unchecked. CTA: "Add N to
   watchlist" (count updates live; disabled at 0). A secondary "skip" continues with an
   empty watchlist.
3. **Dashboard reveal** — blur/dim lifts (animated), revealing the real dashboard with
   the new watchlist populated in place of the empty state. If the user skipped both
   prior steps, this is the existing empty-state dashboard. Watchlist rows are tappable
   with a prompt like "Ready to place your first trade? Pick one to start."
4. **Pick one to trade** — tapping a watchlist row (e.g. Apple) proceeds directly to that
   symbol's simplified buy screen (no separate "confirm your pick" screen — tapping the
   row *is* the pick).
5. **Simplified buy screen** — stock-only, beginner-oriented (see "Open design
   questions" above for what's still unresolved): quote header (price/change),
   `financial-chart`, a small set of plain-language metrics (e.g. estimated cost, cost
   basis) each with an inline explainer (info icon → tooltip/popover with a one-line
   definition), quantity input (default 1 share). This is intentionally **not** the same
   screen a regular user sees. CTA: "Place order" (single step — no separate
   review/confirm split, and no 2FA prompt).
6. **Success** — confirmation state (checkmark, symbol/qty/cost recap), CTA "View
   dashboard".
7. **Dashboard, post-trade** — shows the new position (alongside the watchlist) plus a
   contextual next-step card tied to the traded symbol, e.g. "More ways to trade Apple"
   (prediction markets on Apple's price by a date; single-stock futures on the same
   name). This card can be static copy — it doesn't need to link anywhere real.

## Data

No new fake tickers. Reuse the six existing `mock-market-data.ts` symbols, tagged by
interest category in a new `data/interests.ts`:

| Category | Symbols |
|---|---|
| Tech companies | NVDA, MSFT |
| Brands you use | AAPL, AMZN |
| Bold bets | TSLA |
| Steady & stable | SPY |

A symbol may appear under only one category (keeps the curated-list step simple: no
de-duplication-across-categories edge case beyond a straight set union, which is trivial
since categories are disjoint here).

## State

One in-memory React context (`components/providers/onboarding-provider.tsx`), wrapping
the app in `app/layout.tsx`:

```ts
interface OnboardingState {
  interests: InterestCategory[] // picked in step 1
  watchlist: string[]           // symbols, built in step 2, editable implicitly by re-visiting
  positions: Position[]         // starts empty; gains an entry on trade success (step 6)
  lastTradedSymbol: string | null // set on trade success — drives the step 7 "more ways to trade X" nudge
  quizDismissed: boolean        // true once step 1 is skipped or completed — gates whether the overlay renders
}
```

No persistence (resets on hard refresh) — acceptable for a hackathon demo per the
existing mock-data pattern (`data/mock-market-data.ts` is already static/seeded, not
live).

## Components (new)

Only ~20 of the shadcn/ui registry's components are installed so far (see `AGENTS.md`'s
list). Rather than add just the one (`Checkbox`) this flow strictly needs, install
**every remaining component from the default shadcn registry** during implementation
(e.g. `npx shadcn@latest add --all`, or one-by-one if the CLI's bulk flag isn't
available), so the full library — `Checkbox`, `RadioGroup`, `Label`, `Avatar`, `Alert`,
`Table`, `Accordion`, etc. — is on hand for this flow and any later hackathon work, not
re-fetched component-by-component. Update `AGENTS.md`'s "what's already set up" list once
done.

All built from existing/newly-added primitives (`Button`, `Card`, `Checkbox`,
`Separator`, `Badge`), existing `lib/motion.ts` presets, `lib/icons.ts`, `lib/format.ts`:

- `components/onboarding/interest-quiz.tsx` — step 1 overlay.
- `components/onboarding/curated-list.tsx` — step 2 tick-list (wraps `watchlist-row` with
  a leading checkbox).
- `components/onboarding/onboarding-overlay.tsx` — orchestrates steps 1→2, mounted once
  in the dashboard route, gated by `quizDismissed`.
- `app/symbol/[symbol]/page.tsx` — steps 4–5, the simplified buy screen (new route,
  reuses `financial-chart`, `kpi-card`; new `components/trade/simple-metric.tsx` for the
  label + inline-explainer pattern).
- `components/trade/order-success.tsx` — step 6.
- `components/dashboard/next-step-card.tsx` — step 7's "more ways to trade X" nudge,
  reads `lastTradedSymbol`.
- `components/dashboard/dashboard-concept-a.tsx` /
  `components/dashboard/dashboard-concept-b.tsx` — Part 2's two static/exploratory
  dashboard mockups (not linked into the main clickable path; reachable via a couple of
  temporary links, e.g. from a `/concepts` page, for review purposes only).

Dashboard (`app/page.tsx`) is redesigned to: render the (blurred, when overlay active)
real dashboard with watchlist section + existing empty-state fallback, plus positions
section and the next-step card once non-empty. `BottomNav` unaffected.

## Testing / verification

- `npm run typecheck`, `npm run lint`.
- Manual click-through at 390px viewport covering: quiz skip path (lands on existing
  empty-state dashboard), full path with 1 interest picked, full path with multiple
  interests picked (verify union/de-dup), pick-one → simplified buy screen → success →
  dashboard reflects new position, watchlist, and the traded-symbol next-step card.
- Part 2 concepts reviewed visually at 390px; no interaction testing needed.
