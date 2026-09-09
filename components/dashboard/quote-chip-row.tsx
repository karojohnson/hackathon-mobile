import Link from "next/link"
import { cn } from "cn"

import { formatPercent } from "@/lib/format"
import type { Quote } from "@/data/mock-market-data"

export interface QuoteChipRowProps {
  quotes: Quote[]
}

/**
 * Horizontal at-a-glance strip — composition borrowed from the stakeholder
 * reference screenshot's quick-quote row. Sits under the hero, above the
 * full (functional, tappable) watchlist section further down the page.
 */
export function QuoteChipRow({ quotes }: QuoteChipRowProps) {
  if (quotes.length === 0) return null

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {quotes.map((quote) => {
        const trend = quote.changePercent >= 0 ? "positive" : "negative"
        return (
          <Link
            key={quote.symbol}
            href={`/symbol/${quote.symbol}`}
            className="flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-lg py-2 text-center"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <span className="type-label font-bold text-foreground">{quote.symbol.slice(0, 2)}</span>
            </div>
            <span className="type-label text-foreground">{quote.symbol}</span>
            <span
              className={cn("type-label", trend === "positive" ? "text-positive" : "text-negative")}
            >
              {formatPercent(quote.changePercent)}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
