"use client"

import { cn } from "cn"

import { CountUp } from "@/components/practice/count-up"
import { StructureGlyph } from "@/components/practice/structure-glyph"
import {
  usePractice,
  XP_PER_LEVEL,
} from "@/components/providers/practice-provider"
import {
  NEXT_STREAK_MILESTONE,
  NEXT_STRUCTURE_UNLOCK,
} from "@/data/mock-practice-data"
import { Progress } from "@/components/ui/progress"
import { AXIS_LABEL, AXIS_SUBLABEL } from "@/lib/practice-flow"
import { Check, X } from "@/lib/icons"

/**
 * "The payout" — what the resolution paid.
 *
 * This is the chapter's reward screen, and three things on it were
 * drawn quieter than the things they were rewarding:
 *
 *   - the earned figure arrived fully formed, with nothing to watch. It
 *     now counts up, reusing the same `CountUp` the graduation screen
 *     uses, over a single soft gold bloom (`.earned-bloom`). One bloom,
 *     on the one screen announcing a reward.
 *   - the per-axis XP sat at `.type-body-strong`, the same size as the
 *     axis name, so the payout and its label weighed the same.
 *   - the level bar — the whole argument for caring about XP — was a
 *     default 2px `Progress`. It is now an 8px sunken track with a lit
 *     gold fill.
 */
export function PayoutScreen() {
  const { xp, level, streak, resolvedTrades } = usePractice()
  const lastTrade = resolvedTrades[resolvedTrades.length - 1]
  const xpIntoLevel = xp % XP_PER_LEVEL

  const xpToStructure = Math.max(0, NEXT_STRUCTURE_UNLOCK.atXp - xp)
  const streakToGo = Math.max(0, NEXT_STREAK_MILESTONE.at - streak)
  const earned = lastTrade?.xpEarned ?? 0

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex flex-col items-center gap-1 py-1 text-center">
        {/*
          -top-6 is exactly the shell's content pt-6, so the wash starts at
          the app bar's lower edge and runs down behind the figure rather
          than starting in the middle of empty canvas. The bar is sticky at
          z-30 and this sits in content flow, so the glow passes behind it.
          -inset-x-8 overshoots the shell's px-4 so it bleeds off both edges
          instead of ending in a visible vertical seam.
        */}
        <div
          aria-hidden
          className="earned-bloom pointer-events-none absolute -inset-x-8 -top-6 -bottom-2"
        />
        <span className="type-hero relative text-priority-gold">
          +<CountUp to={earned} /> XP
        </span>
        {/*
          The verdict reads as this screen's subtitle rather than as a
          card. It was a raised panel under the figure, which made the
          screen open with two competing blocks and pushed the level meter
          further from the "+70 XP" it is supposed to answer. Centred and
          tight under the figure, the two lines are what the number means.
          `relative` for the same reason the figure above needs it: the
          bloom behind is absolutely positioned and would otherwise paint
          over the text.
        */}
        {lastTrade && (
          <div className="relative flex flex-col gap-0.5 text-center">
            <span className="type-body-strong text-foreground">
              {lastTrade.contractHeadline}
            </span>
            <span className="type-label text-muted-foreground">
              {lastTrade.lossNote}
            </span>
          </div>
        )}
      </div>

      {/*
        The meter sits directly under the earned figure, ahead of the
        itemisation, which inverts the Figma frame's order deliberately.
        "+70 XP" and "the bar moved" are cause and effect and they were
        four rows apart, so the reward loop never closed on screen; where
        the 70 came from is detail, and detail follows the consequence.
      */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="type-figure text-foreground">Level {level}</span>
          <span className="type-mono type-label text-muted-foreground">
            {xpIntoLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP
          </span>
        </div>
        <Progress
          value={(xpIntoLevel / XP_PER_LEVEL) * 100}
          trackClassName="xp-track h-2"
          indicatorClassName="xp-fill rounded-full"
          aria-label={`Level ${level} progress`}
          aria-valuetext={`${xpIntoLevel} of ${XP_PER_LEVEL} XP toward level ${level + 1}`}
        />
        {/*
          What the bar is actually paying toward. Without this the screen
          asks the customer to care about a number filling up and never
          says what happens when it does — the Figma frame names the prize
          right under the track, and that naming is the reason the bar
          motivates anything.
        */}
        <div className="flex items-start gap-2">
          <StructureGlyph
            shape={NEXT_STRUCTURE_UNLOCK.id}
            className="mt-0.5 size-4 shrink-0 text-priority-gold"
          />
          <div className="flex min-w-0 flex-col">
            <span className="type-body text-foreground">
              {xpToStructure.toLocaleString()} XP to the{" "}
              {NEXT_STRUCTURE_UNLOCK.label.toLowerCase()}
            </span>
            <span className="type-label text-muted-foreground">
              {NEXT_STRUCTURE_UNLOCK.sublabel}
            </span>
          </div>
        </div>
      </div>

      {/*
        Where the XP came from. Container, padding and row rhythm are the
        original's — `glass-card px-4`, `py-2.5` rows, label over sublabel —
        and the section label above it is gone: the list sits directly under
        the meter it itemises, so naming it only added a rank to climb.
        Matches the resolution screen's breakdown exactly; the two show the
        same four axes and must not drift apart.
      */}
      <div className="glass-card flex flex-col rounded-lg px-4">
        {lastTrade?.axisResults.map((result) => (
          <div
            key={result.axis}
            className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
          >
            <div className="flex min-w-0 items-center gap-2">
              {result.correct ? (
                <Check className="size-4 shrink-0 text-positive" />
              ) : (
                <X className="size-4 shrink-0 text-negative" />
              )}
              <div className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    "type-body",
                    result.correct ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {AXIS_LABEL[result.axis]}
                </span>
                <span className="type-label text-muted-foreground">
                  {AXIS_SUBLABEL[result.axis]}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "type-figure shrink-0",
                result.correct
                  ? "text-priority-gold"
                  : "text-muted-foreground/50"
              )}
            >
              {result.correct ? `+${result.xp}` : "0"}
            </span>
          </div>
        ))}
      </div>

      {/*
        The streak, raised. It used to be a flat gold-surface card at the
        same elevation as the plain content card above it; it is the
        screen's standing achievement, so it sits above them.
      */}
      <div className="surface-raised flex items-center justify-between gap-3 rounded-lg bg-priority-gold-surface! px-4 py-3.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="type-figure text-priority-gold">{streak}</span>
            <span className="type-label text-priority-gold">
              resolved in a row
            </span>
          </div>
          <span className="type-label text-muted-foreground">
            {streakToGo} more for {NEXT_STREAK_MILESTONE.label}
          </span>
        </div>
        {/* The last three notches of the streak, so "3 more" has a shape. */}
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-2.5 rounded-full",
                i < 3 - Math.min(3, streakToGo)
                  ? "bg-priority-gold"
                  : "border border-priority-gold/50"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
