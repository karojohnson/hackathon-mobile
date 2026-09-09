"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FinancialChart } from "@/components/finance/financial-chart"
import { formatPercent } from "@/lib/format"
import { watchlist as allQuotes } from "@/data/mock-market-data"

export interface CuratedListProps {
  symbols: string[]
  onConfirm: (selectedSymbols: string[]) => void
  onSkip: () => void
}

export function CuratedList({ symbols, onConfirm, onSkip }: CuratedListProps) {
  const [checked, setChecked] = React.useState<Set<string>>(() => new Set(symbols))
  const quotes = allQuotes.filter((q) => symbols.includes(q.symbol))

  function toggle(symbol: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) next.delete(symbol)
      else next.add(symbol)
      return next
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden pt-10">
      <div className="flex flex-col gap-1.5 px-6">
        <span className="type-label text-muted-foreground">Based on what you picked</span>
        <h1 className="type-title text-foreground">Build your watchlist</h1>
        <p className="type-body text-muted-foreground">
          A starter watchlist based on your picks. Uncheck anything you don&apos;t want to
          follow.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="flex flex-col rounded-lg border border-border bg-surface px-4">
        {quotes.map((quote) => {
          const isChecked = checked.has(quote.symbol)
          const trend = quote.changePercent >= 0 ? "positive" : "negative"
          return (
            <label
              key={quote.symbol}
              className={cn(
                "flex items-center gap-3 border-b border-border py-3 last:border-b-0"
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggle(quote.symbol)}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="type-body-strong text-foreground">{quote.symbol}</span>
                <span className="type-label truncate text-muted-foreground">{quote.name}</span>
              </div>
              <div className="h-8 w-14 shrink-0">
                <FinancialChart data={quote.history} variant="line" trend={trend} height={32} />
              </div>
              <div className="flex w-20 shrink-0 flex-col items-end">
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
            </label>
          )
        })}
      </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6">
        <Button size="lg" disabled={checked.size === 0} onClick={() => onConfirm(Array.from(checked))}>
          Add {checked.size} to watchlist
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="type-label self-center text-muted-foreground underline-offset-2 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
