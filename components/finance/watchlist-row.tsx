import { cn } from "cn"

import { FinancialChart } from "@/components/finance/financial-chart"
import { TickerAvatar } from "@/components/finance/ticker-avatar"
import { formatPercent } from "@/lib/format"
import type { Quote } from "@/data/mock-market-data"

export interface WatchlistRowProps {
  quote: Quote
  className?: string
}

/**
 * Optimized-for-mobile list row (not a desktop table) — see the brief's
 * guidance to prefer rows/lists over compressed tables on mobile.
 */
export function WatchlistRow({ quote, className }: WatchlistRowProps) {
  const trend = quote.changePercent >= 0 ? "positive" : "negative"

  return (
    <div className={cn("flex items-center gap-3 border-b border-border py-3 last:border-b-0", className)}>
      <TickerAvatar symbol={quote.symbol} size={32} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="type-body-strong text-foreground">{quote.symbol}</span>
        <span className="type-label truncate text-muted-foreground">{quote.name}</span>
      </div>
      <div className="h-8 w-16 shrink-0">
        <FinancialChart data={quote.history} variant="line" trend={trend} height={32} />
      </div>
      <div className="flex w-24 shrink-0 flex-col items-end">
        <span className="type-body-strong tabular-nums text-foreground">${quote.price.toFixed(2)}</span>
        <span className={cn("type-label tabular-nums", trend === "positive" ? "text-positive" : "text-negative")}>
          {formatPercent(quote.changePercent)}
        </span>
      </div>
    </div>
  )
}
