"use client"

import * as React from "react"
import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { expirationFor, expirations, strikesWithDeltaFor } from "@/data/mock-options-data"
import { practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrency, formatPercent } from "@/lib/format"

/**
 * "The chain" — a clean copy of the Figma frame `06b The chain`
 * (node 131:1024), which is the first time Chapter 2 shows a customer a
 * real options chain.
 *
 * Four things carry the frame, and the build previously had one of them:
 *
 *  1. Expirations that say *why* they differ — IV and weekly/monthly — and
 *     that stay bound to the date chosen back on the Duration screen, so
 *     the chain opens on the contract the customer already picked rather
 *     than resetting to the front month.
 *  2. A farther/closer control on the strike window. The ladder only shows
 *     five rows on a 390px screen, so which five is a real choice, and
 *     "farther" is how a beginner walks out to the safer strikes.
 *  3. A selected row, highlighted in gold, because a chain you can't pick
 *     from is a table.
 *  4. The bid/mid/ask bar under the ladder. This is the detail the frame
 *     ends on: it's where the spread stops being two numbers in a row and
 *     becomes a visible gap you pay to cross.
 */

/** How many ladder rows fit before the frame starts scrolling. */
const VISIBLE_ROWS = 5

type StrikeWindow = "closer" | "farther"

export function ChainScreen() {
  const { symbol, expirationId, setExpirationId } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const price = quote.price

  const [strikeWindow, setStrikeWindow] = React.useState<StrikeWindow>("closer")
  const [selectedStrike, setSelectedStrike] = React.useState<number | null>(null)

  const expiration = expirationFor(expirationId)
  const allPuts = strikesWithDeltaFor(price, expiration.daysOut, "put")

  /*
   * `strikesWithDeltaFor` returns the full ladder centred on the money.
   * "Closer" shows the window ending at the money; "farther" slides one
   * notch down into the cheaper, safer, lower-delta strikes. For puts,
   * further out of the money means further *down* the ladder.
   */
  const end = strikeWindow === "closer" ? allPuts.length - 1 : allPuts.length - 2
  const puts = allPuts.slice(Math.max(0, end - VISIBLE_ROWS + 1), end + 1)

  // Default to the first strike below spot — the one a beginner selling a
  // put would actually be looking at.
  const defaultStrike = [...puts].reverse().find((s) => s.strike < price)?.strike ?? puts[0].strike
  const activeStrike = puts.some((s) => s.strike === selectedStrike) ? selectedStrike : defaultStrike
  const active = puts.find((s) => s.strike === activeStrike) ?? puts[0]

  const bid = Math.max(0.01, active.premium - 0.06)
  const ask = active.premium + 0.06
  const mid = (bid + ask) / 2

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="type-title text-foreground">{symbol}</span>
          <span className="type-label text-muted-foreground">all four columns open</span>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="type-body-strong tabular-nums text-foreground">{price.toFixed(2)}</span>
          <span
            className={cn(
              "type-label tabular-nums",
              quote.changePercent >= 0 ? "text-positive" : "text-negative"
            )}
          >
            {formatPercent(quote.changePercent)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Expiration</span>
        <div role="radiogroup" aria-label="Expiration" className="flex flex-col gap-1">
          {expirations.map((exp) => {
            const selected = exp.id === expiration.id
            return (
              <button
                key={exp.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setExpirationId(exp.id)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg border px-3.5 py-2.5 text-center transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  selected
                    ? "border-accent-blue bg-accent-blue/12"
                    : "border-transparent hover:bg-surface-glass-sunken"
                )}
              >
                <span
                  className={cn(
                    "tabular-nums",
                    selected ? "type-body-strong text-foreground" : "type-body text-muted-foreground"
                  )}
                >
                  {exp.label} ({exp.daysOut})
                </span>
                <span className="type-label tabular-nums text-muted-foreground">
                  IV: {exp.impliedVolatility}% · {exp.cadence}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Puts</span>
          <div className="flex items-center gap-3">
            {(["farther", "closer"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={strikeWindow === option}
                onClick={() => setStrikeWindow(option)}
                className={cn(
                  "type-label rounded-md px-1 transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  strikeWindow === option ? "text-priority-gold" : "text-muted-foreground"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-lg glass-card px-4 pt-3">
          <div className="flex items-center justify-between border-b border-border pb-2 type-label uppercase tracking-wide text-muted-foreground">
            <span className="w-14">Strike</span>
            <span className="w-16 text-right">Bid</span>
            <span className="w-16 text-right">Ask</span>
            <span className="w-14 text-right">Delta</span>
          </div>

          {puts.map((strike) => {
            const selected = strike.strike === active.strike
            return (
              <button
                key={strike.strike}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedStrike(strike.strike)}
                className={cn(
                  "-mx-2 flex items-center justify-between rounded-md border border-transparent px-2 py-2.5 text-left transition-colors",
                  "border-b-border not-last:border-b",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  selected && "border-priority-gold! bg-priority-gold-surface"
                )}
              >
                <span
                  className={cn(
                    "w-14 type-body-strong tabular-nums",
                    selected ? "text-priority-gold" : "text-foreground"
                  )}
                >
                  {strike.strike}
                </span>
                <span className="w-16 text-right type-body tabular-nums text-muted-foreground">
                  {formatCurrency(Math.max(0.01, strike.premium - 0.06))}
                </span>
                <span className="w-16 text-right type-body tabular-nums text-muted-foreground">
                  {formatCurrency(strike.premium + 0.06)}
                </span>
                <span className="w-14 text-right type-body tabular-nums text-muted-foreground">
                  {strike.delta.toFixed(2)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg glass-card p-4">
        <span className="type-body-strong tabular-nums text-foreground">{active.strike} put</span>
        {/*
          Bid, mid and ask on one track. The two rows above give the same
          numbers, but side by side they read as a price; laid out on a
          line, the distance between them reads as a cost — which is the
          thing a beginner needs to see before they cross it.
        */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between type-label text-muted-foreground">
            <span>Bid</span>
            <span>Mid</span>
            <span>Ask</span>
          </div>
          <div className="relative h-1 rounded-full bg-muted-foreground/25">
            {[0, 50, 100].map((pct) => (
              <span
                key={pct}
                className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                style={{ left: `${pct}%` }}
              />
            ))}
          </div>
          <div className="flex items-baseline justify-between type-body tabular-nums text-foreground">
            <span>{bid.toFixed(2)}</span>
            <span>{mid.toFixed(2)}</span>
            <span>{ask.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
