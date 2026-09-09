# Prompt A — Onboarding-to-First-Trade Flow

Status: approved for implementation planning
Date: 2026-09-09

## Context

`hackathon-mobile` is a rapid product-design hackathon prototype (see repo `CLAUDE.md`).
This spec covers **Prompt A — Product Evolution**: a beginner who has just finished
account opening and needs a low-friction path into the product.

This direction was shaped by a live planning call between Karolina Johnson and Jolie
Lepselter (2026-09-09; see project memory `hackathon_prompt_a_direction`). Key decisions
from that call, which override an earlier draft of this concept:

- Account application is already submitted and auto-approved via an external WebView.
  Native account opening is out of scope. The prototype begins the instant the WebView
  closes and the user lands in the native app for the first time.
- The first thing shown is **not** the bare dashboard, and **not** a single prescriptive
  trade recommendation. It's a fun, lightweight, skippable interest quiz, followed by a
  personalized watchlist-building moment. "I don't want to direct them, I want them to
  direct us" (Karolina).
- Scope explicitly continues past watchlist-building into an actual first trade, using
  the same trading UI a regular user would see — no separate dumbed-down "first trade"
  screen.

## Goal / user story

A new user finishes account opening, and within seconds feels like the app already knows
them: they tell it what they're interested in, get a personalized set of things to watch,
build a watchlist from it, and — when ready — place their first trade on something they
picked themselves.

## Out of scope

- Native account opening / KYC (WebView hands off already-approved).
- Any trade type beyond a simple market buy (no options, no order types beyond market,
  no sell flow).
- Persisting state across sessions (in-memory only; refresh resets to the start).
- The "customize top-left icon" aside mentioned on the call — not enough signal to spec.

## Flow

Six screens/states, in order:

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
   prior steps, this is the existing empty-state dashboard.
4. **Symbol detail** — tapping a watchlist row opens that symbol's detail screen: quote
   header (price/change), `financial-chart`, key stats via `kpi-card`. This is the same
   detail screen any user would land on — not a beginner-specific variant. Primary CTA:
   "Buy."
5. **Order ticket** — quantity input (default 1 share), live estimated cost, "Review
   order" → "Place order" (single confirm step, no separate review/confirm split needed
   for this scope).
6. **Success** — confirmation state (checkmark, symbol/qty/cost recap), CTA "Done" →
   returns to dashboard, which now shows the new position.

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
- `app/symbol/[symbol]/page.tsx` — step 4 detail screen (new route, reuses
  `financial-chart`, `kpi-card`).
- `components/trade/order-ticket.tsx` — step 5.
- `components/trade/order-success.tsx` — step 6.

Dashboard (`app/page.tsx`) is redesigned to: render the (blurred, when overlay active)
real dashboard with watchlist section + existing empty-state fallback, plus positions
section once non-empty. `BottomNav` unaffected.

## Testing / verification

- `npm run typecheck`, `npm run lint`.
- Manual click-through at 390px viewport covering: quiz skip path (lands on existing
  empty-state dashboard), full path with 1 interest picked, full path with multiple
  interests picked (verify union/de-dup), symbol detail → order ticket → success →
  dashboard reflects new position alongside watchlist.
