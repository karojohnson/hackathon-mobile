# Design Foundation Audit

Quick audit of `tastyworks-ui-design-tokens` and `web-based-2.0`, done before setting up
Project X. Treat this repo primarily as a **foundation and brand-token source**, not the
final visual system — Tailwind/shadcn implement it, they don't define it.

## Where the tokens live

`~/Repositories/tastyworks-ui-design-tokens/`

- **Source of truth**: `input/tokens/*.tokens.json` — exported from Figma via the "tasty
  Export" plugin (`color.styles.tokens.json`, `core.value.tokens.json`,
  `effect.styles.tokens.json`, `text.styles.tokens.json`, `typography.value.tokens.json`,
  `theme.{dark,light,dark-cvd-1,dark-cvd-2,light-cvd-1,light-cvd-2}.tokens.json`).
- **Consumable output**: `npm run build` compiles those JSON files to CSS custom
  properties in `build/` (also mirrored under `build/tokens/web/` going forward; iOS/Android
  outputs exist too but aren't relevant here). Web projects are meant to consume the
  generated **CSS variables**, not the raw JSON.
- Icon source SVGs/PDFs live in `input/icons/` (427 icons, semantic names); optimized web
  SVGs build to `build/icons/web/`.

## Semantic color tokens (consumed as CSS custom properties)

Namespaced `--color-{category}-{area}-{purpose}`, themed via `body.dark` / default (light)
selectors in `build/dark-theme-colors.css` / `build/light-theme-colors.css`. Most relevant
for Project X:

| Purpose | Token | Dark value | Light value |
|---|---|---|---|
| App background | `--color-background-general-primary-background` | `#000000` | (near-white) |
| Surface | `--color-background-general-primary-surface` | `#141414` | — |
| Elevated surface | `--color-background-general-secondary-surface` | `#1f1f1f` | — |
| Muted surface | `--color-background-general-tertiary-surface` | `#262626` | — |
| Border (default) | `--color-border-general-default` | `#444444` | — |
| Divider | `--color-border-divider-horizontal` | `#333333` | — |
| Focus/active | `--color-border-general-focused-state` / `--color-icon-general-active-state` | `#34a5eb` | — |
| Text primary | `--color-text-general-primary-text` | `#ffffff` | `#1e120b` |
| Text secondary | `--color-text-general-secondary-text` | `#afafaa` | `#6e645e` |
| Positive (tick/pnl) | `--color-text-general-positive-tick` / `--color-background-general-positive-movement` | `#2db26a` / `#266e44` | `#008060` |
| Negative (tick/pnl) | `--color-text-general-negative-tick` / `--color-background-general-negative-movement` | `#fc4138` / `#a32a24` | `#d10a2c` |
| Warning | `--color-text-alerts-warning` / `--color-border-alert-order-working` | `#ffc800` | `#946a00` |
| Button default (primary action surface) | `--color-background-button-default` | `#333333` | — |
| Button "continue" (secondary accent, blue) | `--color-background-button-continue` | `#285a78`-family | — |

There is also a separate **brand mark palette** (`--color-brand-solid-cherry`,
`-apple`, `-wine`, etc. — the tastytrade red family) used for logo/marketing, not for
in-product UI. Product UI primary actions use neutral/dark surfaces with the blue
"active/focused" accent for links, focus rings, and informational emphasis — there is no
single "brand primary button color" token; don't invent one, reuse the blue accent
sparingly per the visual principles (limited use of accent color).

## Core (primitive) color tokens

`build/static-vars.css` — raw ramps, e.g. `--color-solid-neutral-{050…1000}`,
`--color-solid-red-*`, `-orange-*`, etc. These back the semantic tokens above. Always
prefer the semantic layer; only reach for primitives if a semantic token genuinely doesn't
exist yet.

## Typography

- **Font family**: Inter (variable font). Static asset available at
  `~/Repositories/web-based-2.0/packages/style-config/assets/fonts/InterVariable.woff2`
  (monospace companion: `RobotoMono-Regular.woff2`).
- **Scale**: `build/typography.css` defines a `typography-v2-{size}-{weight}` system:
  sizes `xsmall`(10/12) → `small`(12/16) → `medium`(14/20) → `large`(16/24) →
  `xlarge`(20/28) → (larger sizes continue past what was sampled), each at weights
  **400 / 525 / 650** (regular / medium / semibold-ish). Each group exposes
  `-font-family`, `-font-size`, `-font-weight`, `-letter-spacing`, `-line-height`.
- No separate "font weights" token file — weights are baked into each typography group
  (400, 525, 650).

## Spacing tokens

No dedicated spacing-scale CSS file was found in `build/` (spacing appears to live inside
component-level Figma specs rather than as an exported token set). **Gap**: Project X will
define its own spacing scale using Tailwind's default scale, informed by the radius/border
tokens' proportions rather than an official tasty spacing token.

## Radius tokens

`build/corner-radius.css`:

```
--small-border-radius: 2px;
--medium-border-radius: 4px;
--large-border-radius: 8px;
--x-large-border-radius: 12px;
```

Notably small/restrained — consistent with the "avoid huge radii everywhere" visual
principle in the brief.

## Border tokens

`build/border-width.css`:

```
--x-small-border-width: 0.5px;
--small-border-width: 1px;
--medium-border-width: 2px;
--large-border-width: 4px;
```

## Elevation / shadow tokens

`build/dark-theme-effects.css` / `light-theme-effects.css` — `--effect-inner-shadow-*` and
`--effect-drop-shadow-*` (soft/medium/strong variants, directional). These are subtle,
low-opacity shadows (`#00000059`-ish), matching the "subtle depth" principle. Good
candidates for the glass/elevated-material layer (section 11) rather than everyday cards.

## Existing iconography

`input/icons/` — 427 icons as paired `.svg`/`.pdf` (854 files), clearly named
(`accountIndividual`, `dashboard`, `earnings`, `checkmark`, `bell`, `wallet`,
`accessDenied`, etc.). Optimized web SVGs build to `build/icons/web/`. This is a real,
usable icon set — but pulling individual icons in ad hoc during a hackathon is slow.
**Decision**: default to Lucide for velocity; reach for a tasty icon only when an exact,
obviously-named match exists (e.g. `accounts`, `dashboard`, `bell`, `checkmark`). Lucide
fallbacks should be easy to grep for so they can be swapped later (see `lib/icons.ts`
convention introduced in this setup).

## Existing reusable layout primitives / mobile patterns

- `web-based-2.0/packages/ui/src/lib/components/ui/` is a mature **Svelte** compound
  component kit (accordion, button, card, checkbox, date-input, dialog, field,
  file-upload, input, label, loader, pagination, popper, radio-group, select, separator,
  switch, table, tabs, tile, tooltip). Useful as **prior art for interaction/behavior
  patterns**, not directly reusable (different framework — Svelte, not React).
- `web-based-2.0/apps/` contains only **web** apps (`my.tastytrade.com`,
  `tradedesk.tastyworks.com`, `account-management`, `start.tastytrade.com`,
  `tastytrade-electron`, `design-system`) — there is no dedicated native/PWA mobile app in
  this repo to source mobile-specific patterns from. Mobile experience today is
  responsive web. **Gap**: no existing "mobile pattern library" to lean on; Project X's
  mobile patterns (bottom sheet, bottom nav, glass surfaces) are being originated here,
  informed by the tokens above rather than ported from an existing mobile screen.

## What's missing

- No official spacing token scale (using Tailwind defaults instead).
- No single "primary brand button color" token — intentional; primary actions use neutral
  surfaces + a restrained blue accent, not the red brand mark.
- No existing mobile-native component library to draw from (web-only monorepo).
- No focus-ring width/style token (only a focus *color*) — will follow standard Tailwind
  focus-ring sizing.

## Inconsistencies / technical limitations discovered

- Tokens ship as **raw JSON** (Figma export format) with a separate **build step** to CSS;
  this Next.js app doesn't run that build — instead, only the *values* were copied into
  `app/globals.css` as CSS variables (see `docs/token-map.md`) rather than importing the
  design-tokens package directly, to avoid a cross-repo build dependency for a hackathon
  prototype.
- `theme.light.tokens.json` / `theme.dark.tokens.json` are both exactly 1358 lines —
  structurally identical, values differ — confirms it's safe to treat them as a single
  shape with two value sets.
- The token repo also outputs CVD (color-vision-deficiency) theme variants
  (`light-cvd-1/2`, `dark-cvd-1/2`) which are out of scope for this hackathon prototype but
  worth knowing they exist if accessibility work comes up.
