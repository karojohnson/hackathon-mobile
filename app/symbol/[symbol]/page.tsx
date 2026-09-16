"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialChart } from "@/components/finance/financial-chart"
import { TickerAvatar } from "@/components/finance/ticker-avatar"
import { QuoteStatsGrid } from "@/components/trade/quote-stats-grid"
import { OrderSuccess } from "@/components/trade/order-success"
import { RelatedNews } from "@/components/trade/related-news"
import { OrderTypeSheet, type OrderType, type TimeInForce } from "@/components/trade/order-type-sheet"
import { StepProgress } from "@/components/onboarding/step-progress"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { watchlist as allQuotes, today } from "@/data/mock-market-data"
import { deriveQuoteStats } from "@/lib/quote-stats"
import { formatCurrency, formatPercent } from "@/lib/format"
import { Bell, ChevronRight, MessageCircle, Minus, Plus } from "@/lib/icons"

type OrderSide = "buy" | "sell"
type InputMode = "shares" | "dollars"
type ChartRange = "1w" | "1m"

const DOLLAR_STEP = 10
const DAY_SECONDS = 86_400

/**
 * Simplified, stock-only buy/sell screen — deliberately NOT the same UI a
 * regular/veteran user sees (see spec's "Open design questions"). Supports
 * sizing an order by share count or by dollar amount, per stakeholder
 * feedback.
 */
export default function SymbolPage() {
  const params = useParams<{ symbol: string }>()
  const router = useRouter()
  const { placeTrade, dismissQuiz } = useOnboarding()
  const [orderSide, setOrderSide] = React.useState<OrderSide>("buy")
  const [inputMode, setInputMode] = React.useState<InputMode>("dollars")
  const [shareQty, setShareQty] = React.useState(1)
  const [dollarAmt, setDollarAmt] = React.useState(DOLLAR_STEP)
  const [step, setStep] = React.useState<"buy" | "success">("buy")
  const [scrubbedPrice, setScrubbedPrice] = React.useState<number | null>(null)

  const symbol = params.symbol
  const quote = allQuotes.find((q) => q.symbol === symbol)

  const [orderType, setOrderType] = React.useState<OrderType>("market")
  const [orderPrice, setOrderPrice] = React.useState(() => Number((quote?.price ?? 0).toFixed(2)))
  const [timeInForce, setTimeInForce] = React.useState<TimeInForce>("day")
  const [gtdDate, setGtdDate] = React.useState(() =>
    new Date((today + 30 * DAY_SECONDS) * 1000).toISOString().slice(0, 10)
  )
  const [chartRange, setChartRange] = React.useState<ChartRange>("1m")

  if (!quote) {
    return (
      <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col items-center justify-center gap-4 px-6 pt-14 text-center">
        <p className="type-body text-muted-foreground">We couldn&apos;t find {symbol}.</p>
        <Link href="/" className="type-body-strong text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  // The chart's own line color stays pinned to today's real trend even
  // while scrubbing — only the price/change text below should track the
  // crosshair, recomputed against the start of the loaded history (rather
  // than freezing on today's change while looking at a different point).
  const chartTrend = quote.changePercent >= 0 ? "positive" : "negative"
  const chartData = chartRange === "1w" ? quote.history.slice(-8) : quote.history
  const chartStartValue = chartData[0]?.value ?? quote.price
  const chartEndValue = chartData[chartData.length - 1]?.value ?? quote.price
  const rangeReturnPercent =
    chartStartValue !== 0 ? ((chartEndValue - chartStartValue) / chartStartValue) * 100 : 0
  const displayPrice = scrubbedPrice ?? quote.price
  const displayChangePercent =
    scrubbedPrice === null
      ? quote.changePercent
      : ((scrubbedPrice - chartStartValue) / chartStartValue) * 100
  const displayTrend = displayChangePercent >= 0 ? "positive" : "negative"
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
      <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col pt-14">
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
    <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col gap-5 px-4 pt-16">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 quiz-top-glow" />

      <div className="flex flex-col">
        <StepProgress current={4} className="mb-6" />

        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="type-body flex w-fit items-center gap-1 self-start text-muted-foreground"
          >
            <ChevronRight className="size-4 rotate-180" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Chat with support"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MessageCircle className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Price alerts"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bell className="size-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TickerAvatar symbol={quote.symbol} size={56} className="border border-(--glass-border-shade)" />
        <div className="flex flex-col gap-1">
          <span className="type-label text-muted-foreground">{quote.name}</span>
          <div className="flex items-baseline gap-2">
            <h1 className="type-hero text-foreground">${displayPrice.toFixed(2)}</h1>
            <span
              className={cn(
                "type-body-strong",
                displayTrend === "positive" ? "text-positive" : "text-negative"
              )}
            >
              {formatPercent(displayChangePercent)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <span className="type-body text-muted-foreground">
            {chartRange === "1w" ? "1W" : "1M"}{" "}
            <span className={rangeReturnPercent >= 0 ? "text-positive" : "text-negative"}>
              {formatPercent(rangeReturnPercent)}
            </span>
          </span>
          <Tabs value={chartRange} onValueChange={(v) => setChartRange(v as ChartRange)}>
            <TabsList>
              <TabsTrigger value="1w">1W</TabsTrigger>
              <TabsTrigger value="1m">1M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <FinancialChart
          data={chartData}
          variant="area"
          trend={chartTrend}
          height={160}
          showGrid
          showPriceLabels
          showTimeLabels
          currentPrice={quote.price}
          interactive
          className="[&_#tv-attr-logo]:top-2.5! [&_#tv-attr-logo]:bottom-auto!"
          onCrosshairMove={(point) => setScrubbedPrice(point ? point.value : null)}
        />
      </div>

      <Tabs value={orderSide} onValueChange={(v) => setOrderSide(v as OrderSide)} className="mt-2">
        <TabsList className="h-10! w-full">
          <TabsTrigger
            value="buy"
            className="flex-1 border-transparent data-active:border-positive/50! data-active:bg-positive/20! data-active:text-positive!"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="flex-1 data-active:bg-destructive/15! data-active:text-destructive!"
          >
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="-mt-1 flex flex-col gap-3 rounded-lg glass-card p-4">
        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Quantity</span>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
            <TabsList>
              <TabsTrigger value="shares" className="px-2">
                Shares
              </TabsTrigger>
              <TabsTrigger value="dollars" className="px-2">
                Dollar $
              </TabsTrigger>
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

        <OrderTypeSheet
          orderType={orderType}
          onOrderTypeChange={setOrderType}
          price={orderPrice}
          onPriceChange={setOrderPrice}
          timeInForce={timeInForce}
          onTimeInForceChange={setTimeInForce}
          gtdDate={gtdDate}
          onGtdDateChange={setGtdDate}
        />
      </div>

      <QuoteStatsGrid stats={stats} />

      <RelatedNews symbol={quote.symbol} name={quote.name} />

      <div className="glass-nav sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 px-4 pt-3 pb-10">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-full h-32 glass-nav-fade" />
        <Button
          size="lg"
          className="h-11! w-full"
          variant={orderSide === "sell" ? "destructive" : "default"}
          onClick={() => {
            placeTrade(quote.symbol, Number(shares.toFixed(4)))
            dismissQuiz()
            setStep("success")
          }}
        >
          {orderSide === "buy" ? "Buy" : "Sell"}{" "}
          {inputMode === "dollars"
            ? `${formatCurrency(dollarAmt)} worth of`
            : `${shareQty} ${shareQty === 1 ? "share" : "shares"} of`}{" "}
          {quote.symbol}
        </Button>
      </div>
    </div>
  )
}
