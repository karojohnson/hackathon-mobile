import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { usePractice } from "@/components/providers/practice-provider"
import { AXIS_LABEL, AXIS_SUBLABEL, computeResolution } from "@/lib/practice-flow"
import { Check, X } from "@/lib/icons"

/**
 * "How it resolved" — the Figma frame `04 Resolution`.
 *
 * The screen answers three questions in order: what the market did, how
 * each axis scored, and what it cost. Every element that was here before
 * is still here; what changed is that the three answers now carry three
 * different ranks instead of all arriving at 14px.
 *
 *   what the market did   the finishing price, `.type-hero`
 *   how you scored        `.type-display` — the one figure on the screen
 *                         that outranks the section heads around it
 *   why                   a sunken well of axis rows, each with its own
 *                         verdict Badge and its XP at `.type-figure`
 *   what it cost          the one raised card on the screen
 *
 * The per-axis XP used to be `.type-body-strong`, i.e. the same size as
 * the axis name it was paying for, so the reward never read as the
 * reward. It is the whole reason the breakdown exists.
 */
export function ResolutionScreen() {
  const practice = usePractice()
  const preview = computeResolution(practice)
  const correct = preview.axisResults.filter((r) => r.correct)
  const clean = correct.length === preview.axisResults.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="type-body text-muted-foreground">{practice.symbol} finished at</span>
        <span className="type-hero tabular-nums text-foreground">{preview.finishedPrice.toFixed(2)}</span>
        <span className="type-label text-muted-foreground">
          day {preview.dayOfWindow} of your {preview.windowDays}-day window
        </span>
        {/* Factual context, not an alert — it was orange for no reason. */}
        <span className="type-label text-muted-foreground">{preview.gapNote}</span>
      </div>

      {/*
        The score and the XP it paid, as one pair. `3 of 4` takes
        `.type-display` and the XP `.type-figure`, so the count leads and
        the reward answers it — previously both sat at title/body-strong
        and the eye had no reason to start at either.
      */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="type-display text-foreground">
            {correct.length} <span className="text-muted-foreground">of {preview.axisResults.length}</span>
          </span>
          <span className="type-figure text-priority-gold">+{preview.xpEarned} XP</span>
        </div>
        {/* The one orange left on the screen. */}
        <span className={cn("type-body", clean ? "text-positive" : "text-partial")}>{preview.verdictLine}</span>
      </div>

      {/*
        The axis breakdown. Container, padding and row rhythm are the
        original's — `glass-card px-4` with `py-2.5` rows — restored after a
        pass that put it in a `.surface-sunken` well on tighter padding.
        The well was the more correct elevation in theory and the wrong
        call in practice: this table is the substance of the screen, not a
        recessed list of secondary rows, and it wants the card's weight.

        No section label above it either. "Axis by axis" was added to give
        the table a head, but the table is self-evidently the breakdown of
        the score directly above it, so the label only added a rank for the
        eye to climb.

        What is kept from the redesign: the verdict Badge, and the XP at
        `.type-figure` so the payout outweighs the axis name it paid for.
      */}
      <div className="flex flex-col rounded-lg glass-card px-4">
        {preview.axisResults.map((result) => (
          <div
            key={result.axis}
            className="flex flex-col gap-1 border-b border-border py-2.5 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                {result.correct ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-positive" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0 text-negative" />
                )}
                <div className="flex min-w-0 flex-col">
                  <span className="type-body text-foreground">{AXIS_LABEL[result.axis]}</span>
                  <span className="type-label text-muted-foreground">{AXIS_SUBLABEL[result.axis]}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <Badge variant={result.correct ? "success" : "error"}>
                  {result.correct ? "Correct" : "Missed"}
                </Badge>
                <span
                  className={cn(
                    "type-figure w-9 text-right",
                    result.correct ? "text-priority-gold" : "text-muted-foreground/50"
                  )}
                >
                  {result.correct ? `+${result.xp}` : "0"}
                </span>
              </div>
            </div>
            {/*
              The miss explanation gets the card's full width instead of the
              ~200px left column it was squeezed into beside the badge and
              the figure. It is the one sentence on the screen that teaches
              something, so it shouldn't be the narrowest text on it.
              Indented to the label's left edge, not the icon's, so it reads
              as belonging to the axis above it.
            */}
            {result.note && (
              <span className="type-label pl-6 text-muted-foreground">{result.note}</span>
            )}
          </div>
        ))}
      </div>

      {/*
        What it cost — the screen's conclusion, and the only raised card on
        it. The tint still carries the verdict (green clean, orange
        partial); the elevation is what makes it read as the thing the
        breakdown above was building toward.
      */}
      <div
        className={cn(
          "surface-raised flex flex-col gap-0.5 rounded-lg px-4 py-2.5",
          clean ? "bg-positive/8!" : "bg-partial/6!"
        )}
      >
        <span className="type-lead-strong text-foreground">{preview.contractHeadline}</span>
        <span className="type-label text-muted-foreground">{preview.lossNote}</span>
      </div>

      <div className="flex items-center gap-2">
        <span aria-hidden className="size-1.5 rounded-full bg-priority-gold" />
        <span className="type-label text-muted-foreground">
          Streak intact · {practice.streak + 1} resolved in a row
        </span>
      </div>
    </div>
  )
}
