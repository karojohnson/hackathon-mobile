"use client"

import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "@/lib/icons"

export type SignalBannerVariant = "red" | "blue" | "gold" | "gray"
export type SignalBannerBadgeTone = "neutral" | "live"
export type SignalBannerCtaTone = "blue" | "neutral"

export interface SignalBannerProps {
  /** Priority → accent bar + eyebrow color. */
  variant: SignalBannerVariant
  /** Tints the card surface in the variant color. Reserve for the single most urgent banner. */
  emphasis?: boolean
  eyebrow?: string
  badge?: string
  badgeTone?: SignalBannerBadgeTone
  title: string
  body?: string
  /** 0–100 shows the Yes/No meter; omit for none. */
  meter?: number
  cta?: string
  /** `blue` (default action) or `neutral` (grey, lower emphasis). */
  ctaTone?: SignalBannerCtaTone
  secondary?: string
  dismissible?: boolean
  onAction?: () => void
  onSecondary?: () => void
  onDismiss?: () => void
  className?: string
}

/**
 * Shared styling per priority — the accent bar, eyebrow color, and (when
 * `emphasis` is set) the tinted card surface. This is the only thing that
 * varies between banners; everything else in the anatomy is fixed. See
 * docs/token-map.md for where each color comes from.
 */
const priorityStyles: Record<SignalBannerVariant, { bar: string; eyebrow: string; surface: string }> = {
  red: { bar: "bg-priority-red", eyebrow: "text-priority-red", surface: "bg-priority-red-surface!" },
  blue: { bar: "bg-priority-blue", eyebrow: "text-priority-blue", surface: "bg-priority-blue-surface!" },
  gold: { bar: "bg-priority-gold", eyebrow: "text-priority-gold", surface: "bg-priority-gold-surface!" },
  gray: { bar: "bg-muted-foreground", eyebrow: "text-muted-foreground", surface: "bg-muted!" },
}

/**
 * The one shared dashboard banner component — every account-signal to-do,
 * preference spotlight, severity alert, and nudge renders through this so
 * they read as one family. See the migration spec for the full anatomy;
 * nothing here should vary per call site beyond the documented props.
 */
export function SignalBanner({
  variant,
  emphasis = false,
  eyebrow,
  badge,
  badgeTone = "neutral",
  title,
  body,
  meter,
  cta,
  ctaTone = "blue",
  secondary,
  dismissible = false,
  onAction,
  onSecondary,
  onDismiss,
  className,
}: SignalBannerProps) {
  const priority = priorityStyles[variant]
  const hasMeta = Boolean(eyebrow) || Boolean(badge) || dismissible
  const hasMeter = typeof meter === "number" && meter >= 0

  return (
    <div
      className={cn(
        "glass-card relative flex flex-col gap-3 overflow-hidden rounded-lg pt-3.25 pr-4 pb-3.5 pl-4.75",
        emphasis && priority.surface,
        className
      )}
    >
      <span aria-hidden className={cn("absolute -inset-y-px -left-px w-1.75", priority.bar)} />

      {hasMeta && (
        <div className="flex items-center gap-2">
          {eyebrow && (
            <span className={cn("text-[11px] font-[650] uppercase tracking-[.07em]", priority.eyebrow)}>
              {eyebrow}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {badge && (
              <Badge
                variant="outline"
                className={
                  badgeTone === "live"
                    ? "border-positive/30 text-positive"
                    : "border-border text-muted-foreground"
                }
              >
                {badge}
              </Badge>
            )}
            {dismissible && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        <p className="type-lead-strong text-foreground">{title}</p>
        {body && <p className="type-body text-muted-foreground">{body}</p>}
      </div>

      {hasMeter && (
        <div className="flex flex-col gap-1">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-positive" style={{ width: `${meter}%` }} />
            <div className="h-full bg-negative" style={{ width: `${100 - meter}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="type-label text-positive">{meter}% Yes</span>
            <span className="type-label text-negative">{100 - meter}% No</span>
          </div>
        </div>
      )}

      {cta && (
        <Button
          size="lg"
          onClick={onAction}
          className={cn(
            "h-11! w-full",
            ctaTone === "neutral" && "bg-button-neutral text-foreground hover:bg-button-neutral/80"
          )}
        >
          {cta}
        </Button>
      )}

      {secondary && (
        <button type="button" onClick={onSecondary} className="type-body w-full text-center text-focus">
          {secondary}
        </button>
      )}
    </div>
  )
}
