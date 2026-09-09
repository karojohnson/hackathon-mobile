"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { FinancialChart } from "@/components/finance/financial-chart"
import { SimpleMetric } from "@/components/trade/simple-metric"
import { OrderSuccess } from "@/components/trade/order-success"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { watchlist as allQuotes } from "@/data/mock-market-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { ChevronRight, Minus, Plus } from "@/lib/icons"

/**
 * Simplified, stock-only buy screen — deliberately NOT the same UI a
 * regular/veteran user sees (see spec's "Open design questions": exactly
 * which metrics belong here, whether every metric needs an explainer, and
 * final explainer wording are all still open and need real design/user
 * research beyond this prototype).
 */
export default function SymbolPage() {
  const params = useParams<{ symbol: string }>()
  const router = useRouter()
  const { placeTrade } = useOnboarding()
  const [quantity, setQuantity] = React.useState(1)
  const [step, setStep] = React.useState<"buy" | "success">("buy")

  const symbol = params.symbol
  const quote = allQuotes.find((q) => q.symbol === symbol)

  if (!quote) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="type-body text-muted-foreground">We couldn&apos;t find {symbol}.</p>
        <Link href="/" className="type-body-strong text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const trend = quote.changePercent >= 0 ? "positive" : "negative"
  const estimatedCost = Number((quote.price * quantity).toFixed(2))

  if (step === "success") {
    return (
      <div className="flex min-h-dvh flex-col">
        <OrderSuccess
          symbol={quote.symbol}
          name={quote.name}
          quantity={quantity}
          estimatedCost={estimatedCost}
          onDone={() => router.push("/")}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col gap-6 px-4 pt-8 pb-8">
      <Link href="/" className="type-label flex w-fit items-center gap-1 text-muted-foreground">
        <ChevronRight className="size-3.5 rotate-180" />
        Dashboard
      </Link>

      <div className="flex flex-col gap-1">
        <span className="type-label text-muted-foreground">{quote.name}</span>
        <div className="flex items-baseline gap-2">
          <h1 className="type-hero text-foreground">${quote.price.toFixed(2)}</h1>
          <span className={cn("type-body-strong", trend === "positive" ? "text-positive" : "text-negative")}>
            {formatPercent(quote.changePercent)}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <FinancialChart data={quote.history} variant="area" trend={trend} height={160} />
      </div>

      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Buy {quote.symbol}</span>

        <div className="flex items-center justify-between py-3">
          <span className="type-body text-muted-foreground">Shares</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
              aria-label="Decrease shares"
            >
              <Minus className="size-4" />
            </button>
            <span className="type-body-strong w-6 text-center tabular-nums text-foreground">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
              aria-label="Increase shares"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border border-t border-border">
          <SimpleMetric
            label="Price per share"
            value={formatCurrency(quote.price)}
            explainer="What one share of this stock costs right now."
          />
          <SimpleMetric
            label="Estimated cost"
            value={formatCurrency(estimatedCost)}
            explainer="The total you'll pay for this trade, before any fees."
          />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          size="lg"
          onClick={() => {
            placeTrade(quote.symbol, quantity)
            setStep("success")
          }}
        >
          Place order
        </Button>
        <p className="type-label text-center text-muted-foreground">
          This is a prototype — no real money moves.
        </p>
      </div>
    </div>
  )
}
