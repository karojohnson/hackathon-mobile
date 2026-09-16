import { cn } from "cn"

import { usePractice, type DirectionThesis } from "@/components/providers/practice-provider"
import { expirations, ironCondorFor, shortPutSpreadFor } from "@/data/mock-options-data"
import { OPEN_TRADES, catalystsFor, practiceQuoteFor } from "@/data/mock-practice-data"
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
 * The lead card is built from live state — symbol, direction, dial stop —
 * rather than a fixture. An earlier pass hardcoded it to match the Figma
 * two-card layout, which meant picking ARVO in cold-start still landed on a
 * ZNTH card here while every neighbouring screen said ARVO. The screen the
 * customer's own trade belongs on was the one screen ignoring it.
 *
 * KLTR stays as a static second position so the frame keeps the two-tier
 * contrast the design is making: one axis stated versus all four.
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
  const { symbol, chosenDirection, dialStop, unlockedAxes, streak, resolvedTrades } = usePractice()

  const quote = practiceQuoteFor(symbol)
  const expiration = expirations[1]
  const allFour = unlockedAxes.length === 4

  // No stated direction means they haven't actually placed anything yet —
  // show only the standing position rather than inventing one for them.
  // This is the phantom-trade case the hardcoded card used to produce.
  const thesis = chosenDirection

  // Same helpers and expiration dial-in used one screen earlier, so the
  // numbers here agree with the ones the customer just saw.
  const structure = allFour
    ? { label: "iron condor", maxLoss: ironCondorFor(quote.price, expiration.daysOut).maxLoss }
    : { label: "short put spread", maxLoss: shortPutSpreadFor(quote.price, expiration.daysOut, dialStop).maxLoss }

  const yourTrade = thesis
    ? {
        id: `${symbol}-live`,
        symbol,
        thesis: allFour
          ? THESIS[thesis].full(catalystsFor(symbol).impliedMovePercent)
          : THESIS[thesis].short,
        structure: structure.label,
        maxLoss: structure.maxLoss,
        resolvesOn: expiration.label,
        direction: thesis === "sellsOff" ? ("down" as const) : ("up" as const),
      }
    : null

  // The customer's live trade, then the standing one from the design.
  const openTrades = [...(yourTrade ? [yourTrade] : []), ...OPEN_TRADES.filter((t) => t.symbol !== symbol)].slice(0, 2)

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
                <span className="type-label truncate text-muted-foreground">{trade.structure}</span>
                <span className="type-label shrink-0 tabular-nums text-muted-foreground">
                  most you can lose {formatCurrencyWhole(trade.maxLoss)}
                </span>
              </div>
            </article>
          )
        })}
      </section>

      {resolvedTrades.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="type-label uppercase tracking-wide text-muted-foreground">Resolved this week</span>
            <span className="type-label tabular-nums text-muted-foreground">{resolvedTrades.length}</span>
          </div>
          <div className="flex flex-col rounded-lg glass-card px-4">
            {resolvedTrades.map((trade) => {
              const total = trade.axesCorrect.length + trade.axesMissed.length
              const clean = trade.outcome === "win"
              const Arrow = clean ? TrendingUp : TrendingDown
              return (
                <div
                  key={trade.id}
                  className="flex items-center justify-between gap-2 border-b border-border py-2.5 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {/* Glyph carries the verdict too, so it isn't colour-only. */}
                    <Arrow
                      className={cn("size-4 shrink-0", clean ? "text-positive" : "text-partial")}
                      aria-hidden
                    />
                    <span className="type-body-strong truncate text-foreground">{trade.symbol}</span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-2">
                    <span className="type-label tabular-nums text-muted-foreground">+{trade.xpEarned} XP</span>
                    <span className="type-body-strong tabular-nums text-muted-foreground">
                      <span className={clean ? "text-positive" : "text-partial"}>{trade.axesCorrect.length}</span> of{" "}
                      {total}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
