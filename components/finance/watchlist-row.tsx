import { cn } from "cn"

import { FinancialChart } from "@/components/finance/financial-chart"
import type { Quote } from "@/data/mock-market-data"
import { formatPercent } from "@/lib/format"

export interface WatchlistRowProps {
  quote: Quote
  className?: string
}

/**
 * Same row shape as the onboarding watchlist-builder step (CuratedList) —
 * name + sparkline + price/change — minus its checkbox, since this row
 * navigates to the symbol page instead of toggling selection.
 */
export function WatchlistRow({ quote, className }: WatchlistRowProps) {
  const trend = quote.changePercent >= 0 ? "positive" : "negative"

  return (
    <div className={cn("flex items-center gap-3 border-b border-border py-3 last:border-b-0", className)}>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="type-body-strong text-foreground">{quote.symbol}</span>
        <span className="type-label truncate text-muted-foreground">{quote.name}</span>
      </div>
      <div className="h-8 w-14 shrink-0">
        <FinancialChart data={quote.history} variant="line" trend={trend} height={32} />
      </div>
      <div className="flex w-20 shrink-0 flex-col items-end">
        <span className="type-body-strong tabular-nums text-foreground">${quote.price.toFixed(2)}</span>
        <span
          className={cn("type-label tabular-nums", trend === "positive" ? "text-positive" : "text-negative")}
        >
          {formatPercent(quote.changePercent)}
        </span>
      </div>
    </div>
  )
}
