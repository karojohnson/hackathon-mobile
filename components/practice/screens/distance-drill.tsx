import { cn } from "cn"

import { LegPills } from "@/components/practice/leg-pills"
import { StrikeDial } from "@/components/practice/strike-dial"
import { StructureGlyph } from "@/components/practice/structure-glyph"
import { usePractice } from "@/components/providers/practice-provider"
import {
  expirationFor,
  expirations,
  shortPutSpreadFor,
  strategyFor,
} from "@/data/mock-options-data"
import { practiceQuoteFor } from "@/data/mock-practice-data"
import { Check, X } from "@/lib/icons"

const TAGS = ["Direction", "Distance", "Date"] as const

export function DistanceDrillScreen() {
  const { symbol, strikeStep, setStrikeStep, expirationId } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const price = quote.price
  const chosen = expirationFor(expirationId)
  // The drill's ask is always the nearest window; the scripted miss is that
  // the customer's own expiration sits past it.
  const asked = expirations[0]
  const spread = shortPutSpreadFor(price, chosen.daysOut, strikeStep)
  // The drill's thesis is fixed ("drifts up"), so the structure is always
  // the bullish one; strategyFor supplies the dial track and both legs.
  const strategy = strategyFor(price, chosen.daysOut, strikeStep, "rallies")

  const dateIsRight = chosen.id === asked.id
  const daysPast = chosen.daysOut - asked.daysOut

  /*
   * Each row states the ask and, underneath, what the customer actually
   * set — the Figma frame's `└ you set: …` line. Without it a red X tells
   * you that you were wrong but not what you did, which is the one thing
   * a drill has to hand back.
   */
  const checklist = [
    { ask: "up", set: "up", ok: true },
    {
      ask: `stays above ${spread.sellStrike}`,
      set: `short put at ${spread.sellStrike}`,
      ok: true,
    },
    {
      ask: `by ${asked.label}`,
      set: chosen.label,
      ok: dateIsRight,
      miss: `${daysPast} days past the ask.`,
    },
  ]
  const captured = checklist.filter((row) => row.ok).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="type-title text-foreground">Drill</h1>
          <span className="type-label text-muted-foreground">
            Distance tier · 3 of 5
          </span>
        </div>
        <span className="type-label shrink-0 rounded-md bg-priority-gold-surface px-2 py-1 text-priority-gold tabular-nums">
          +15 XP each
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-priority-blue-surface! p-4">
        <span className="type-label tracking-wide text-priority-blue uppercase">
          We think
        </span>
        <p className="type-body text-foreground">
          {symbol} drifts up, stays above ${spread.sellStrike.toFixed(0)}, and
          gets there by {asked.label}.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="type-label rounded-md bg-surface-glass-sunken px-2 py-0.5 tracking-wide text-muted-foreground uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="type-label text-muted-foreground">Build it.</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-label tracking-wide text-muted-foreground uppercase">
            What you captured
          </span>
          <span className="type-label text-priority-gold tabular-nums">
            {captured} of {checklist.length}
          </span>
        </div>
        <div className="glass-card flex flex-col rounded-lg px-4">
          {checklist.map((row) => (
            <div
              key={row.ask}
              className="flex items-start gap-2 border-b border-border py-2.5 last:border-b-0"
            >
              {row.ok ? (
                <Check className="mt-0.5 size-4 shrink-0 text-positive" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-negative" />
              )}
              <div className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    "type-body",
                    row.ok ? "text-foreground" : "text-foreground"
                  )}
                >
                  {row.ask}
                </span>
                <span className="type-label text-muted-foreground">
                  you set: {row.set}
                </span>
                {!row.ok && row.miss && (
                  <span className="type-label text-negative">{row.miss}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card flex flex-col gap-3 rounded-lg p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StructureGlyph
              shape="put-spread"
              className="size-5 shrink-0 text-positive"
            />
            <span className="type-body-strong text-foreground">Put spread</span>
          </div>
          <span className="type-label text-muted-foreground">{symbol}</span>
        </div>
        {/* Both legs, named. A defined-risk structure that only ever shows
            the leg you sold is indistinguishable from a naked one. */}
        <span className="type-label text-muted-foreground">
          sell the {spread.sellStrike} put, buy the {spread.buyStrike} put ·
          expires {chosen.label}
        </span>
        {/* One thumb, one 5-point spread. The dial moves the whole
            structure between strikes; it is not asking how wide to make
            it, so both legs shift together and the pills below report
            where they landed. */}
        <StrikeDial
          track={strategy.track}
          value={strikeStep}
          onChange={setStrikeStep}
          xDomain={strategy.xDomain}
        />
        <LegPills parts={strategy.parts} />
      </div>
    </div>
  )
}
