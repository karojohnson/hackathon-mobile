import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Badge — a short status label. Read, not operated: it marks the state of
 * the thing beside it, so it takes no event handlers.
 *
 * This is a React port of the real tastytrade component
 * (`@tastyworks/ui-library`, web-based-2.0/packages/ui/src/lib/components/
 * ui/badge/), not a shadcn badge on tasty colors. The base classes, the
 * radius, the padding, the 4px icon gap, the 16px icon box and the five
 * variant color pairs are all carried over from its cva verbatim; see
 * docs/token-map.md for the token bridge.
 *
 * What that replaced: nine different pill/tag spellings across the two
 * prototypes — `rounded-4xl` shadcn pills on the dashboard, and in Chapter
 * 2 six variations of a `rounded-md` tinted tag at four different paddings
 * plus `rounded-full` leg chips and a 10px uppercase tier pill.
 *
 * Two deliberate departures from the source, both noted where they bite:
 *
 *   - `wise` is omitted. It exists for Wise-branded surfaces only and
 *     nothing in either prototype is one.
 *   - The source's type is `font-small-525` (typography-v2-small-525:
 *     12px/16px/525), which is exactly this repo's `.type-label`, so the
 *     class is used rather than re-declaring the values.
 */
const badgeVariants = cva(
  // Base is the source cva's base, one for one: `inline-flex w-fit
  // items-center gap-x-1 rounded px-1.5 py-1 align-middle
  // transition-colors font-small-525`. `rounded` is Tailwind's 4px, which
  // is tasty's own --medium-border-radius — not this repo's --radius (8px),
  // so it is spelled `rounded` here on purpose and must not be "corrected"
  // to rounded-md.
  "type-label inline-flex w-fit shrink-0 items-center gap-x-1 rounded px-1.5 py-1 align-middle whitespace-nowrap transition-colors [&_svg]:size-4 [&_svg]:shrink-0 [&_img]:size-4 [&_img]:shrink-0",
  {
    variants: {
      /**
       * Required, with no default — every call site states the meaning it
       * intends, per the component's own docs. Meanings are the source's:
       *
       *   primary    the current or selected item, and informational state
       *   secondary  neutral metadata that shouldn't compete for attention
       *   pending    something in progress, or needing attention soon
       *   error      a failed or blocked state
       *   success    a completed or enabled state
       */
      variant: {
        primary: "bg-badge-primary-surface text-badge-primary-text",
        secondary: "bg-badge-secondary-surface text-badge-secondary-text",
        pending: "bg-badge-pending-surface text-badge-pending-text",
        error: "bg-badge-error-surface text-badge-error-text",
        success: "bg-badge-success-surface text-badge-success-text",
      },
      /**
       * An icon-only badge is a square: 4px on every side rather than the
       * wider horizontal padding a text badge gets. tailwind-merge drops
       * the base `px-1.5 py-1` in favour of this.
       */
      iconOnly: { true: "p-1", false: "" },
      /**
       * Not in the source component. Financial figures on a badge — "+15
       * XP each", "most you can lose $388", a strike — need tabular
       * digits or they shift width as the value changes, which in this
       * prototype it does on every dial drag.
       */
      numeric: { true: "tabular-nums", false: "" },
    },
    defaultVariants: { iconOnly: false, numeric: false },
  }
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

export const BADGE_VARIANTS: BadgeVariant[] = [
  "primary",
  "secondary",
  "pending",
  "error",
  "success",
]

type BadgeBaseProps = Omit<useRender.ComponentProps<"span">, "children"> &
  Pick<VariantProps<typeof badgeVariants>, "numeric"> & {
    variant: BadgeVariant
  }

/**
 * Either a labelled badge (with an optional icon), or an icon-only badge —
 * which requires `aria-label`, because the icon is the whole message and
 * without a name the badge is invisible to a screen reader. The union
 * makes that a type error rather than an audit finding.
 */
type BadgeContentProps =
  | { children: React.ReactNode; icon?: React.ReactNode }
  | { children?: never; icon: React.ReactNode; "aria-label": string }

export type BadgeProps = BadgeBaseProps & BadgeContentProps

function Badge({ className, variant, numeric, icon, children, render, ...props }: BadgeProps) {
  const iconOnly = !!icon && children === undefined
  // `aria-label` on a bare <span> is dropped — a generic role can't be
  // named — so the icon-only shape gets role="img" to make the name stick.
  const role = iconOnly ? "img" : undefined

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      // `data-variant` mirrors the source component's own styling/test
      // hook. Base UI's mergeProps types its first argument to span props,
      // which don't include arbitrary data-*, so it's asserted rather than
      // dropped.
      {
        className: cn(badgeVariants({ variant, iconOnly, numeric }), className),
        role,
        "data-variant": variant,
      } as useRender.ComponentProps<"span">,
      props,
      {
        children: (
          <>
            {icon && (
              <span aria-hidden className="inline-flex size-4 shrink-0 items-center justify-center">
                {icon}
              </span>
            )}
            {children}
          </>
        ),
      }
    ),
    render,
    state: { slot: "badge", variant },
  })
}

export { Badge, badgeVariants }
