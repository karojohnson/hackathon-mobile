import { cn } from "cn"

import { StructureGlyph } from "@/components/practice/structure-glyph"
import { axesCorrect, usePractice, type DirectionThesis } from "@/components/providers/practice-provider"
import { expirationFor, strategyFor } from "@/data/mock-options-data"
import {
  GLYPH_FOR,
  OPEN_TRADES,
  PRIOR_RESOLUTIONS,
  catalystsFor,
  practiceQuoteFor,
  type StructureShape,
} from "@/data/mock-practice-data"
import { formatCurrencyWhole } from "@/lib/format"
import { TrendingDown, TrendingUp } from "@/lib/icons"

/**
 * "Your trades" — the Figma frame `03 Open trades`.
 *
 * The card carries four things, and the middle one is the point of the whole
 * chapter: the axes the customer dialled in, handed back as one plain
 * sentence. Symbol and structure alone make it a label; the thesis makes it
 * theirs. `most you can lose` is the defined-risk number a beginner is
 * actually looking for on a positions screen.
 *
 * The lead card is built from live state — symbol, direction, strike — rather
 * than a fixture. An earlier pass hardcoded it to match the Figma two-card
 * layout, which meant picking AMZN in cold-start still landed on an AAPL
 * card here while every neighbouring screen said AMZN. The screen the
 * customer's own trade belongs on was the one screen ignoring it.
 *
 * Dates are real — the design note above this frame reads "the slow clock,
 * real calendar".
 */

/**
 * The thesis sentence, in the design's voice. `short` is the tier-1 form
 * (only Direction is unlocked, so that's all the customer has actually
 * said); `full` is the all-four-axes form, which also states magnitude and
 * calm. Figma's two examples are "Up, at all." and "Up, but under 6%, and
 * calm." — the same trade, one tier apart.
 */
const THESIS: Record<DirectionThesis, { short: string; full: (move: number) => string }> = {
  rallies: { short: "Up, at all.", full: (m) => `Up, but under ${m}%, and calm.` },
  sellsOff: { short: "Down, at all.", full: (m) => `Down, but under ${m}%, and calm.` },
  flat: { short: "Flat, and staying there.", full: (m) => `Flat, inside ${m}%, and calm.` },
  outsized: { short: "A big move, either way.", full: (m) => `A big move — more than ${m}%.` },
}

export function OpenTradesScreen() {
  const {
    symbol,
    chosenDirection,
    strikeStep,
    expirationId,
    unlockedAxes,
    streak,
    resolvedTrades,
  } = usePractice()

  const quote = practiceQuoteFor(symbol)
  const expiration = expirationFor(expirationId)
  const allFour = unlockedAxes.length === 4

  // No stated direction means they haven't actually placed anything yet —
  // show only the standing position rather than inventing one for them.
  const thesis = chosenDirection

  /*
   * Built from the same call the dial screen used, so this card reports the
   * trade the customer actually made rather than a stand-in. At the
   * all-four tier the structure is the iron condor whatever Direction said,
   * matching dial-in-all-four; below it, Direction chooses.
   */
  const dialled = strategyFor(
    quote.price,
    expiration.daysOut,
    strikeStep,
    allFour ? "flat" : (thesis ?? "rallies")
  )
  const structure = {
    label: dialled.label.toLowerCase(),
    shape: GLYPH_FOR[dialled.id],
    maxLoss: dialled.maxLoss,
  }

  const yourTrade = thesis
    ? {
        id: `${symbol}-live`,
        symbol,
        thesis: allFour ? THESIS[thesis].full(catalystsFor(symbol).impliedMovePercent) : THESIS[thesis].short,
        structure: structure.label,
        shape: structure.shape,
        maxLoss: structure.maxLoss,
        resolvesOn: expiration.label,
        direction: thesis === "sellsOff" ? ("down" as const) : ("up" as const),
      }
    : null

  // The customer's live trade, then the standing one from the design.
  const openTrades = [
    ...(yourTrade ? [yourTrade] : []),
    ...OPEN_TRADES.filter((t) => t.symbol !== symbol).map((t) => {
      const shape: StructureShape = t.structure === "iron condor" ? "iron-condor" : "put-spread"
      return { ...t, shape }
    }),
  ].slice(0, 2)

  /*
   * Resolved trades from before this session, plus anything resolved in
   * it. The list used to be gated on in-session resolutions alone, so a
   * customer arriving on a 6-trade streak saw an empty "resolved" section
   * — the one part of the screen that proves the streak is real.
   */
  const resolved = [
    ...resolvedTrades.map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      correct: axesCorrect(trade).length,
      total: trade.axisResults.length,
    })),
    ...PRIOR_RESOLUTIONS,
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="type-title text-foreground">Your trades</h1>
        {/* Bare text, matching the header-right stat on `record` — this used
            to sit in a glass card and competed with the title beside it. */}
        <div className="flex flex-col items-end">
          <span className="type-body-strong tabular-nums text-priority-gold">{streak}</span>
          <span className="type-label text-muted-foreground">resolved in a row</span>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Open</span>
          <span className="type-label tabular-nums text-muted-foreground">{openTrades.length}</span>
        </div>

        {openTrades.length === 0 && (
          <div className="flex flex-col gap-1 rounded-lg glass-card p-4">
            <span className="type-body-strong text-foreground">No open trades.</span>
            <span className="type-label text-muted-foreground">
              Pick a symbol with something happening this week and dial one in.
            </span>
          </div>
        )}

        {openTrades.map((trade) => {
          const Arrow = trade.direction === "up" ? TrendingUp : TrendingDown
          return (
            <article key={trade.id} className="flex flex-col gap-3 rounded-lg glass-card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Arrow className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="type-body-strong truncate text-foreground">{trade.symbol}</span>
                </div>
                <span className="type-label shrink-0 text-muted-foreground">resolves {trade.resolvesOn}</span>
              </div>

              <p className="type-body text-foreground">{trade.thesis}</p>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
                <span className="type-label flex min-w-0 items-center gap-1.5 text-muted-foreground">
                  <StructureGlyph shape={trade.shape} className="size-4 shrink-0" />
                  <span className="truncate">{trade.structure}</span>
                </span>
                <span className="type-label shrink-0 tabular-nums text-muted-foreground">
                  most you can lose {formatCurrencyWhole(trade.maxLoss)}
                </span>
              </div>
            </article>
          )
        })}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Resolved this week</span>
          <span className="type-label tabular-nums text-muted-foreground">{resolved.length}</span>
        </div>
        <div className="flex flex-col rounded-lg glass-card px-4">
          {resolved.map((trade) => {
            const clean = trade.correct === trade.total
            const Arrow = clean ? TrendingUp : TrendingDown
            return (
              <div
                key={trade.id}
                className="flex items-center justify-between gap-2 border-b border-border py-2.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {/* Glyph carries the verdict too, so it isn't colour-only. */}
                  <Arrow className={cn("size-4 shrink-0", clean ? "text-positive" : "text-partial")} aria-hidden />
                  <span className="type-body-strong truncate text-foreground">{trade.symbol}</span>
                </div>
                <span className="type-body-strong shrink-0 tabular-nums text-muted-foreground">
                  <span className={clean ? "text-positive" : "text-partial"}>{trade.correct}</span> of {trade.total}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
