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

import { StructureGlyph } from "@/components/practice/structure-glyph"
import { usePractice, XP_PER_LEVEL } from "@/components/providers/practice-provider"
import { NEXT_STREAK_MILESTONE, NEXT_STRUCTURE_UNLOCK } from "@/data/mock-practice-data"
import { Progress } from "@/components/ui/progress"
import { AXIS_LABEL, AXIS_SUBLABEL } from "@/lib/practice-flow"
import { Check, X } from "@/lib/icons"

export function PayoutScreenBefore() {
  const { xp, level, streak, resolvedTrades } = usePractice()
  const lastTrade = resolvedTrades[resolvedTrades.length - 1]
  const xpIntoLevel = xp % XP_PER_LEVEL

  const xpToStructure = Math.max(0, NEXT_STRUCTURE_UNLOCK.atXp - xp)
  const streakToGo = Math.max(0, NEXT_STREAK_MILESTONE.at - streak)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="type-hero text-priority-gold">+{lastTrade?.xpEarned ?? 0} XP</span>
      </div>

      {lastTrade && (
        <div className="flex flex-col gap-1 rounded-lg glass-card-before p-4">
          <span className="type-body text-foreground">{lastTrade.contractHeadline}</span>
          <span className="type-label text-muted-foreground">{lastTrade.lossNote}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Where it came from</span>
        <div className="flex flex-col rounded-lg glass-card-before px-4">
          {lastTrade?.axisResults.map((result) => (
            <div
              key={result.axis}
              className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                {result.correct ? (
                  <Check className="size-4 shrink-0 text-positive" />
                ) : (
                  <X className="size-4 shrink-0 text-negative" />
                )}
                <div className="flex flex-col">
                  <span className={cn("type-body", result.correct ? "text-foreground" : "text-muted-foreground")}>
                    {AXIS_LABEL[result.axis]}
                  </span>
                  <span className="type-label text-muted-foreground">{AXIS_SUBLABEL[result.axis]}</span>
                </div>
              </div>
              <span
                className={cn(
                  "type-body-strong tabular-nums",
                  result.correct ? "text-priority-gold" : "text-muted-foreground"
                )}
              >
                {result.correct ? `+${result.xp}` : "0"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-body-strong text-foreground">Level {level}</span>
          <span className="type-label tabular-nums text-muted-foreground">
            {xpIntoLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP
          </span>
        </div>
        <Progress
          value={(xpIntoLevel / XP_PER_LEVEL) * 100}
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
        <div className="mt-1 flex items-start gap-2">
          <StructureGlyph shape={NEXT_STRUCTURE_UNLOCK.id} className="mt-0.5 size-4 shrink-0 text-priority-gold" />
          <div className="flex flex-col">
            <span className="type-body text-foreground">
              {xpToStructure.toLocaleString()} XP to the {NEXT_STRUCTURE_UNLOCK.label.toLowerCase()}
            </span>
            <span className="type-label text-muted-foreground">{NEXT_STRUCTURE_UNLOCK.sublabel}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-priority-gold/30 bg-priority-gold-surface px-4 py-3">
        <div className="flex flex-col">
          <span className="type-body-strong text-priority-gold">{streak} resolved in a row</span>
          <span className="type-label text-priority-gold/80">
            {streakToGo} more for {NEXT_STREAK_MILESTONE.label}
          </span>
        </div>
        {/* The last three notches of the streak, so "3 more" has a shape. */}
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-2 rounded-full",
                i < 3 - Math.min(3, streakToGo) ? "bg-priority-gold" : "border border-priority-gold/50"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
