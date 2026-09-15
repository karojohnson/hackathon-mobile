"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FinancialChart } from "@/components/finance/financial-chart"
import { formatPercent } from "@/lib/format"
import { ChevronRight } from "@/lib/icons"
import { watchlist as allQuotes } from "@/data/mock-market-data"
import { StepProgress } from "@/components/onboarding/step-progress"

export interface CuratedListProps {
  symbols: string[]
  defaultChecked: string[]
  onConfirm: (selectedSymbols: string[]) => void
  onSkip: () => void
  onBack: () => void
}

export function CuratedList({ symbols, defaultChecked, onConfirm, onSkip, onBack }: CuratedListProps) {
  const [checked, setChecked] = React.useState<Set<string>>(() => new Set(defaultChecked))
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
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden pt-16">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 quiz-top-glow" />

      <div className="flex flex-col px-6">
        <StepProgress current={2} className="mb-6" />
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onBack}
            className="type-body flex w-fit items-center gap-1 text-muted-foreground"
          >
            <ChevronRight className="size-4 rotate-180" />
            Back
          </button>
          <h1 className="type-title text-foreground">Build your watchlist</h1>
          <p className="type-body text-muted-foreground">
            A starter watchlist based on your picks, plus more to choose from. Check anything
            you want to follow.{" "}
            <button
              type="button"
              onClick={onSkip}
              className="text-foreground"
            >
              Skip
            </button>
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4">
        <div className="flex flex-col rounded-lg glass-card px-4">
          {quotes.map((quote) => {
            const isChecked = checked.has(quote.symbol)
            const trend = quote.changePercent >= 0 ? "positive" : "negative"
            return (
              <label
                key={quote.symbol}
                className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
              >
                <Checkbox checked={isChecked} onCheckedChange={() => toggle(quote.symbol)} />
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

      <div aria-hidden className="pointer-events-none -mt-32 h-32 shrink-0 glass-sheet-fade" />

      <div className="flex flex-col gap-3 px-6 pb-10">
        <Button
          size="lg"
          className="h-11! w-full"
          disabled={checked.size === 0}
          onClick={() => onConfirm(Array.from(checked))}
        >
          Add {checked.size} to watchlist
        </Button>
      </div>
    </div>
  )
}
