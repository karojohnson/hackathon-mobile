import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { OPEN_TRADES } from "@/data/mock-practice-data"
import { formatCurrencyWhole } from "@/lib/format"
import { TrendingDown, TrendingUp } from "@/lib/icons"

/**
 * "Your trades" — the Figma frame `03 Open trades`.
 *
 * The open card carries four things, and the middle one is the point of the
 * whole chapter: the axes the customer dialled in, handed back as one plain
 * sentence. Symbol and structure alone make it a label; the thesis makes it
 * theirs. `most you can lose` is the defined-risk number a beginner is
 * actually looking for on a positions screen.
 *
 * Dates are real ("resolves Oct 16", not "resolves soon") — the design note
 * above this frame reads "the slow clock, real calendar".
 */
export function OpenTradesScreen() {
  const { streak, resolvedTrades } = usePractice()
  const openTrades = OPEN_TRADES

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
          {openTrades.length > 0 && (
            <span className="type-label tabular-nums text-muted-foreground">{openTrades.length}</span>
          )}
        </div>

        {openTrades.length === 0 ? (
          <div className="flex flex-col gap-1 rounded-lg glass-card p-4">
            <span className="type-body-strong text-foreground">No open trades.</span>
            <span className="type-label text-muted-foreground">
              Pick a symbol with something happening this week and dial one in.
            </span>
          </div>
        ) : (
          openTrades.map((trade) => {
            const Arrow = trade.direction === "up" ? TrendingUp : TrendingDown
            return (
              <article key={trade.id} className="flex flex-col gap-3 rounded-lg glass-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Arrow className="size-5 shrink-0 text-muted-foreground" aria-hidden />
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
          })
        )}
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
                      className={cn("size-5 shrink-0", clean ? "text-positive" : "text-partial")}
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
