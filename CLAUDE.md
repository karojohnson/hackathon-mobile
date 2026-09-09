# hackathon-mobile — Project X

This is a **rapid product-design hackathon** repo (tastytrade). It is a Next.js 16 (App
Router) + TypeScript + Tailwind v4 mobile-web prototype foundation, not a production app.

Optimize for:

- speed
- product storytelling
- polished interaction
- mobile-first quality
- believable user flows
- reuse of what's already here
- visual coherence with tastytrade (see `docs/design-foundation.md` and `docs/token-map.md`)

Do **not** optimize prematurely for:

- production architecture
- exhaustive edge cases
- backend completeness
- extensive unit tests
- unrelated refactoring
- perfect abstraction

## What's already set up

- shadcn/ui on Base UI primitives (`components/ui/`) — button, input, textarea, tabs,
  dialog, sheet, drawer, popover, dropdown-menu, select, slider, progress, badge,
  separator, skeleton, switch, toggle, scroll-area, card, tooltip.
- DashboardCN registered as a shadcn registry (`components.json` → `@dashboardcn`) —
  **currently unreachable from this network** (Zscaler TLS inspection redirects the
  registry request; see `docs/design-foundation.md`). `components/finance/kpi-card.tsx`
  and `allocation-bar.tsx` are hand-built stand-ins for that pattern; swap them for
  `npx shadcn add @dashboardcn/<name>` once the registry is reachable.
- `components/finance/financial-chart.tsx` — TradingView Lightweight Charts wrapper
  (line/area/candlestick, responsive, theme-aware).
- `components/finance/watchlist-row.tsx`, `kpi-card.tsx`, `allocation-bar.tsx` —
  mobile-optimized financial data patterns (rows/lists, not desktop tables).
- `components/mobile/bottom-nav.tsx`, `empty-state.tsx`.
- `lib/motion.ts` — shared Motion transition presets (`fast`, `standard`, `spring`,
  `sheet`). Reach for one of these instead of inlining ad hoc transitions.
- `lib/icons.ts` — Lucide fallback icons, re-exported from one place so they're easy to
  grep and swap for real tastytrade icons later.
- `lib/format.ts` — currency/percent formatters for mock financial data.
- `data/mock-market-data.ts` — portfolio, watchlist, positions, activity fixtures.
- `app/globals.css` — tastytrade tokens bridged in as CSS variables (light/dark), plus a
  small `.type-*` typography scale and a restrained `.glass-*` material layer. See
  `docs/token-map.md` before hardcoding any new color/spacing/radius value.
- `/prototype-kit` — a foundation smoke test (390px mobile viewport with every base
  pattern). Not the hackathon solution — don't build on this page directly.
- `@tanstack/react-table` is installed but unused by default — reach for it only when a
  screen genuinely needs a structured desktop-style table; mobile screens should default
  to rows/lists (see the watchlist/positions pattern above).

## When given a hackathon concept

1. Clarify the core beginner problem.
2. Identify one memorable user story.
3. Define the minimum 3–5 screens/states needed.
4. Build the complete clickable happy path first.
5. Reuse the components/tokens/data above before creating new ones.
6. Polish hierarchy, copy, interaction, and motion.
7. Add secondary cases only if time remains.

If a minor requirement is ambiguous, make a reasonable assumption and keep moving — don't
stop progress for insignificant implementation decisions.

## Two possible directions

- **Prompt A — Product Evolution** (primary target for this foundation): a beginner who
  opened an account but hasn't placed a first trade. Reuse existing tastytrade product
  patterns where they genuinely help; don't force one into a beginner flow if it adds
  complexity. Priority order: existing tasty pattern → adapted beginner variant →
  shadcn/Base UI primitive on tasty tokens → adapted DashboardCN pattern → new component.
- **Prompt B — Experimental Learning**: teach options through an interactive/game
  experience. More freedom in layout, motion, and metaphor — but it should still feel like
  a tastytrade product, not an unrelated downloaded game.

## Commands

```bash
npm run dev        # start the dev server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```
