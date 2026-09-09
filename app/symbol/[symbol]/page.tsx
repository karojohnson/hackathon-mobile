"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialChart } from "@/components/finance/financial-chart"
import { QuoteStatsGrid } from "@/components/trade/quote-stats-grid"
import { OrderSuccess } from "@/components/trade/order-success"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { watchlist as allQuotes } from "@/data/mock-market-data"
import { deriveQuoteStats } from "@/lib/quote-stats"
import { formatCurrency, formatPercent } from "@/lib/format"
import { ChevronDown, ChevronRight, Minus, Plus } from "@/lib/icons"

type OrderSide = "buy" | "sell"
type InputMode = "shares" | "dollars"

const DOLLAR_STEP = 10

/**
 * Simplified, stock-only buy/sell screen — deliberately NOT the same UI a
 * regular/veteran user sees (see spec's "Open design questions"). Supports
 * sizing an order by share count or by dollar amount, per stakeholder
 * feedback; "Order type" is shown for composition but stays Market-only —
 * no other order types are modeled in this prototype.
 */
export default function SymbolPage() {
  const params = useParams<{ symbol: string }>()
  const router = useRouter()
  const { placeTrade, dismissQuiz } = useOnboarding()
  const [orderSide, setOrderSide] = React.useState<OrderSide>("buy")
  const [inputMode, setInputMode] = React.useState<InputMode>("shares")
  const [shareQty, setShareQty] = React.useState(1)
  const [dollarAmt, setDollarAmt] = React.useState(DOLLAR_STEP)
  const [step, setStep] = React.useState<"buy" | "success">("buy")

  const symbol = params.symbol
  const quote = allQuotes.find((q) => q.symbol === symbol)

  if (!quote) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="type-body text-muted-foreground">We couldn&apos;t find {symbol}.</p>
        <Link href="/" className="type-body-strong text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const trend = quote.changePercent >= 0 ? "positive" : "negative"
  const stats = deriveQuoteStats(quote)

  const shares = inputMode === "shares" ? shareQty : dollarAmt / quote.price
  const estimatedCost = inputMode === "shares" ? shareQty * quote.price : dollarAmt
  const bigNumberDisplay = inputMode === "shares" ? String(shareQty) : formatCurrency(dollarAmt)

  function increment() {
    if (inputMode === "shares") setShareQty((q) => q + 1)
    else setDollarAmt((a) => a + DOLLAR_STEP)
  }

  function decrement() {
    if (inputMode === "shares") setShareQty((q) => Math.max(1, q - 1))
    else setDollarAmt((a) => Math.max(DOLLAR_STEP, a - DOLLAR_STEP))
  }

  if (step === "success") {
    return (
      <div className="flex min-h-full flex-col">
        <OrderSuccess
          symbol={quote.symbol}
          name={quote.name}
          quantity={Number(shares.toFixed(4))}
          estimatedCost={Number(estimatedCost.toFixed(2))}
          onDone={() => router.push("/")}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-5 px-4 pt-12 pb-8">
      <Link href="/" className="type-body flex w-fit items-center gap-1 text-muted-foreground">
        <ChevronRight className="size-4 rotate-180" />
        Back
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

      <Tabs value={orderSide} onValueChange={(v) => setOrderSide(v as OrderSide)}>
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Quantity</span>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
            <TabsList>
              <TabsTrigger value="shares">Shares</TabsTrigger>
              <TabsTrigger value="dollars">$</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted px-2 py-2">
          <button
            type="button"
            onClick={decrement}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-background/60"
            aria-label={inputMode === "shares" ? "Decrease shares" : "Decrease amount"}
          >
            <Minus className="size-5" />
          </button>
          <span className="type-hero text-foreground tabular-nums">{bigNumberDisplay}</span>
          <button
            type="button"
            onClick={increment}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-background/60"
            aria-label={inputMode === "shares" ? "Increase shares" : "Increase amount"}
          >
            <Plus className="size-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="type-label text-muted-foreground">Shares</span>
            <span className="type-body-strong tabular-nums text-foreground">
              {inputMode === "shares" ? shares : shares.toFixed(4)}
            </span>
          </div>
          <span className="type-title text-muted-foreground/40">/</span>
          <div className="flex flex-col items-end">
            <span className="type-label text-muted-foreground">Est. cost</span>
            <span className="type-body-strong tabular-nums text-foreground">
              {formatCurrency(estimatedCost)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="type-body text-muted-foreground">Order type</span>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5">
            <span className="type-body-strong text-foreground">Market</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <QuoteStatsGrid stats={stats} />

      <div className="mt-auto flex flex-col gap-2">
        <Button
          size="lg"
          variant={orderSide === "sell" ? "destructive" : "default"}
          onClick={() => {
            placeTrade(quote.symbol, Number(shares.toFixed(4)))
            dismissQuiz()
            setStep("success")
          }}
        >
          {orderSide === "buy" ? "Place order" : "Place sell order"}
        </Button>
        <p className="type-label text-center text-muted-foreground">
          This is a prototype — no real money moves.
        </p>
      </div>
    </div>
  )
}
