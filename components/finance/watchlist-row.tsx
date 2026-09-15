import { cn } from "cn"

import type { Quote } from "@/data/mock-market-data"

export interface WatchlistRowProps {
  quote: Quote
  className?: string
}

/**
 * Dense, text-only row per the "Glass Card Treatments" spec — no
 * avatar/sparkline, fixed-width right-aligned change% so decimals line up
 * column-style, and a proper minus glyph (U+2212, not a hyphen).
 */
export function WatchlistRow({ quote, className }: WatchlistRowProps) {
  const isPositive = quote.changePercent >= 0

  return (
    <div
      className={cn(
        "-mx-3 flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 hover:bg-[rgba(255,255,255,0.03)]",
        className
      )}
    >
      <span className="type-body-strong text-foreground">{quote.symbol}</span>
      <div className="flex items-center gap-3">
        <span className="type-body-strong tabular-nums text-(--price)">
          ${quote.price.toFixed(2)}
        </span>
        <span
          className={cn(
            "type-label w-14 shrink-0 text-right tabular-nums",
            isPositive ? "text-(--gain)" : "text-(--loss)"
          )}
        >
          {isPositive ? "+" : "−"}
          {Math.abs(quote.changePercent).toFixed(2)}%
        </span>
      </div>
    </div>
  )
}
