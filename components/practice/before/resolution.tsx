/*
 * AUTO-VENDORED "BEFORE" COPY — do not hand-edit.
 *
 * Extracted verbatim from git HEAD so /compare can render the original
 * screen next to the redesigned one on a single dev server. Only three
 * mechanical changes were applied: the exported name gains a `Before`
 * suffix, sibling before-components are imported from this folder, and
 * `glass-card` becomes `glass-card-before` (which restores the exact
 * pre-redesign declarations — the live `.glass-card` has since gained a
 * top-lit inner highlight and a stronger light-theme border, and using it
 * here would quietly flatter the "before").
 *
 * Regenerate with: git show HEAD:<path> > <this file>, then re-run the
 * rewrite in the /compare page's commit.
 */
import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { AXIS_LABEL, AXIS_SUBLABEL, computeResolution } from "@/lib/practice-flow"
import { Check, X } from "@/lib/icons"

/**
 * "How it resolved" — the Figma frame `04 Resolution`.
 *
 * The screen has to answer three questions in order, and an earlier pass
 * only answered the first: what the market did, how each axis scored, and
 * what it cost. The middle one is where the teaching happens, so every
 * axis row carries its own XP and a missed one carries the sentence
 * explaining the miss — "implied move was 7.2%. You set the floor at 235.
 * It moved 11%." A red X with nothing next to it tells a beginner they
 * were wrong and nothing else.
 */
export function ResolutionScreenBefore() {
  const practice = usePractice()
  const preview = computeResolution(practice)
  const correct = preview.axisResults.filter((r) => r.correct)
  const clean = correct.length === preview.axisResults.length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <span className="type-body text-muted-foreground">{practice.symbol} finished at</span>
        <span className="type-hero tabular-nums text-foreground">{preview.finishedPrice.toFixed(2)}</span>
        <span className="type-label text-muted-foreground">
          day {preview.dayOfWindow} of your {preview.windowDays}-day window
        </span>
        <span className="type-label text-partial">{preview.gapNote}</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="type-title tabular-nums text-foreground">
            {correct.length} <span className="text-muted-foreground">of {preview.axisResults.length}</span>
          </span>
          <span className="type-body-strong tabular-nums text-priority-gold">+{preview.xpEarned} XP</span>
        </div>
        <span className={cn("type-body", clean ? "text-positive" : "text-partial")}>{preview.verdictLine}</span>
      </div>

      <div className="flex flex-col rounded-lg glass-card-before px-4">
        {preview.axisResults.map((result) => (
          <div
            key={result.axis}
            className="flex items-start justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
          >
            <div className="flex min-w-0 items-start gap-2">
              {result.correct ? (
                <Check className="mt-0.5 size-4 shrink-0 text-positive" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-negative" />
              )}
              <div className="flex min-w-0 flex-col">
                <span className="type-body text-foreground">{AXIS_LABEL[result.axis]}</span>
                <span className="type-label text-muted-foreground">{AXIS_SUBLABEL[result.axis]}</span>
                {result.note && <span className="type-label mt-1 text-partial">{result.note}</span>}
              </div>
            </div>
            <div className="flex shrink-0 items-baseline gap-3">
              <span className={cn("type-label", result.correct ? "text-positive" : "text-negative")}>
                {result.correct ? "correct" : "missed"}
              </span>
              <span
                className={cn(
                  "type-body-strong w-8 text-right tabular-nums",
                  result.correct ? "text-priority-gold" : "text-muted-foreground"
                )}
              >
                {result.correct ? `+${result.xp}` : "0"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "flex flex-col gap-1 rounded-lg border p-4",
          clean ? "border-positive/40 bg-positive/10" : "border-partial/40 bg-partial/10"
        )}
      >
        <span className="type-body-strong text-foreground">{preview.contractHeadline}</span>
        <span className={cn("type-label", clean ? "text-positive" : "text-partial")}>{preview.lossNote}</span>
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
