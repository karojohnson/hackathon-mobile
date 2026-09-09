# Token Map

How `app/globals.css` bridges `tastyworks-ui-design-tokens` into this prototype. See
`docs/design-foundation.md` for the raw audit this is derived from.

## Method

Values are copied by hand from the **built CSS output** of the tokens repo
(`build/dark-theme-colors.css`, `build/light-theme-colors.css`, `build/corner-radius.css`,
`build/border-width.css`) into `app/globals.css`'s `:root` (light) / `.dark` blocks. Each
CSS variable in `globals.css` carries a comment naming its source token. This is a one-time
copy for hackathon velocity, not a live sync — if the source tokens change, re-copy the
affected values by hand (there's no build step wired up between the two repos).

## Color

| Prototype variable | tastytrade source token | Notes |
|---|---|---|
| `--background` | `color-background-general-primary-background` | App canvas |
| `--foreground` | `color-text-general-primary-text` | Primary text |
| `--surface` / `--card` / `--popover` | `color-background-general-primary-surface` | Cards, popovers |
| `--elevated-surface` / `--secondary` | `color-background-general-secondary-surface` | One step up from surface |
| `--muted` | `color-background-general-tertiary-surface` | Muted fill |
| `--muted-foreground` / `--text-secondary` | `color-text-general-secondary-text` | Secondary text |
| `--accent` / `--accent-foreground` | `color-background-general-secondary-surface` + primary text | Hover/emphasis fill |
| `--border` | `color-border-general-default` | Default hairline border |
| `--input` | `color-border-input-field-text-input-border` | Form control border |
| `--ring` / `--focus` | `color-border-general-focused-state` | Focus ring + `.type`/interactive accent |
| `--positive` | `color-text-general-positive-tick` | Gains, confirmations |
| `--negative` / `--destructive` | `color-text-general-negative-tick` | Losses, destructive actions |
| `--warning` | `color-text-alerts-warning` | Warnings, pending states |

**Deliberate deviation — `--primary`:** there is no single official "brand primary button"
token (confirmed in the audit — tastytrade's real button-default is a neutral dark-gray
fill, and the brand red family is reserved for logo/marketing, not in-product buttons).
Rather than invent an unofficial brand color, primary actions use an **ink-button**
pattern: `--primary` = the theme's foreground color, `--primary-foreground` = the theme's
background color (white-on-black in dark mode, black-on-cream in light mode). This reads
as confident/premium without introducing a color that isn't actually part of the system,
and keeps accent color (`--ring`/`--focus`, the tastytrade "focused-state" blue) reserved
for links, focus rings, and rare emphasis — per the "limited use of accent color" visual
principle.

Primitive/core color ramps (`--color-solid-*` in `build/static-vars.css`) were **not**
copied in — only semantic tokens were bridged. Reach for a primitive directly only if a
new need arises that no semantic token covers.

## Typography

Font family: **Inter** (variable), loaded via `next/font/local` from
`app/fonts/InterVariable.woff2` (copied from
`web-based-2.0/packages/style-config/assets/fonts/`), replacing the template's default
Geist. Monospace: **Roboto Mono** (`RobotoMono-Regular.woff2`), used for tabular financial
figures via the `.type-mono` utility.

Scale: a small set of `.type-*` utility classes in `globals.css` (`type-label`,
`type-body`, `type-body-strong`, `type-title`, `type-hero`) map directly to sizes/weights
from `build/typography.css`'s `typography-v2-{size}-{weight}` groups (weights 400/525/650).
Not every typography-v2 step was ported — only the handful needed for hierarchy in a
mobile prototype (label → body → title → hero). Add more `.type-*` classes the same way if
a screen needs a size that isn't here yet.

## Radius

`--radius: 8px`, taken directly from `--large-border-radius` in `corner-radius.css` — used
as the base for shadcn's `--radius-sm/md/lg/xl/2xl` scale (`globals.css`'s `@theme inline`
block derives the rest from this one value). Tastytrade's actual radius tokens are
small (2/4/8/12px) and deliberately restrained; using `large` (8px) as the base keeps
components tight rather than pill-shaped, matching "avoid huge radii everywhere."

## Border width

Not wired into a Tailwind scale (Tailwind's default `border`/`border-2` is close enough
for a hackathon prototype). tastytrade's actual scale — `0.5px` / `1px` / `2px` / `4px`
(`build/border-width.css`) — is worth reaching for by hand (e.g. `style={{ borderWidth:
"0.5px" }}`) anywhere a genuinely hairline separator matters, per "thin separators" in the
visual principles.

## Elevation / shadow

Not bridged as CSS variables — `build/*-theme-effects.css` shadows are very low-opacity
and directional (top/bottom/left/right/up/down × soft/medium/strong). The
`glass-*` utilities in `globals.css` (section 11 of the brief) use a simpler
`box-shadow`/backdrop-blur combination tuned to look right at mobile scale rather than
importing the full effect set. Revisit if a screen needs a specific directional shadow.

## Spacing

No official tastytrade spacing token scale exists (see design-foundation.md gap). Using
Tailwind's default spacing scale as-is.

## Icons

Not bridged as a token/variable system — see "Existing iconography" in
`docs/design-foundation.md`. Default to Lucide; use a real tastytrade icon
(`tastyworks-ui-design-tokens/input/icons/*.svg`) only for an exact, obviously-named match.
