"use client"

import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { FinancialChart } from "@/components/finance/financial-chart"
import { formatCurrency, formatPercent } from "@/lib/format"
import { ChevronRight, Wallet } from "@/lib/icons"
import { portfolio, watchlist as allQuotes } from "@/data/mock-market-data"
import { sentimentFor } from "@/data/mock-sentiment"

export interface PickTradeProps {
  symbols: string[]
  onPick: (symbol: string) => void
  onSkip: () => void
  onBack: () => void
}

/**
 * The guided hand-off from "watchlist built" to "first trade placed" — a
 * dedicated step in the same full-screen onboarding flow, rather than
 * dropping the customer on the dashboard and hoping they notice a row to
 * tap. Tapping a card goes straight into its buy screen (no radio button,
 * no intermediate bottom sheet — decided against both per stakeholder
 * walkthrough: direct navigation plus the Back button above already gives
 * the "look, then come back" flexibility they wanted).
 */
export function PickTrade({ symbols, onPick, onSkip, onBack }: PickTradeProps) {
  const quotes = allQuotes.filter((q) => symbols.includes(q.symbol))

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-10">
      <div className="flex flex-col gap-1.5 px-6">
        <button
          type="button"
          onClick={onBack}
          className="type-label mb-1 flex w-fit items-center gap-1 text-muted-foreground"
        >
          <ChevronRight className="size-3.5 rotate-180" />
          Back
        </button>

        <span className="type-label text-muted-foreground">Your watchlist is ready</span>
        <h1 className="type-title text-foreground">Place your first trade</h1>
        <p className="type-body text-muted-foreground">
          Tap one to get started — you can always trade something else later.
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          <Wallet className="size-3.5 text-muted-foreground" />
          <span className="type-label text-muted-foreground">
            Available to invest: <span className="type-body-strong text-foreground">{formatCurrency(portfolio.buyingPower)}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-2.5">
          {quotes.map((quote) => {
            const trend = quote.changePercent >= 0 ? "positive" : "negative"
            const { rating, sentiment } = sentimentFor(quote.symbol)
            const ratingColor =
              rating === "Sell" ? "text-negative" : rating === "Hold" ? "text-muted-foreground" : "text-positive"
            return (
              <button
                key={quote.symbol}
                type="button"
                onClick={() => onPick(quote.symbol)}
                className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="type-body-strong text-foreground">{quote.symbol}</span>
                    <span className="type-label truncate text-muted-foreground">{quote.name}</span>
                  </div>
                  <div className="h-8 w-14 shrink-0">
                    <FinancialChart data={quote.history} variant="line" trend={trend} height={32} />
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="type-body-strong tabular-nums text-foreground">
                      ${quote.price.toFixed(2)}
                    </span>
                    <span
                      className={cn(
                        "type-label tabular-nums",
                        trend === "positive" ? "text-positive" : "text-negative"
                      )}
                    >
                      {formatPercent(quote.changePercent)}
                    </span>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
                  {sentiment ? (
                    <Badge variant="outline">{sentiment}</Badge>
                  ) : (
                    <span />
                  )}
                  <span className={cn("type-label font-medium", ratingColor)}>
                    Analysts: {rating}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6">
        <button
          type="button"
          onClick={onSkip}
          className="type-label self-center text-muted-foreground underline-offset-2 hover:underline"
        >
          I&apos;ll do this later
        </button>
      </div>
    </div>
  )
}
