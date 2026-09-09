"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialChart } from "@/components/finance/financial-chart"
import { TickerAvatar } from "@/components/finance/ticker-avatar"
import { OrderSuccess } from "@/components/trade/order-success"
import { watchlist as allQuotes } from "@/data/mock-market-data"
import { expirations, strikesFor, type OptionType } from "@/data/mock-options-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { ChevronDown, ChevronRight, Minus, Plus } from "@/lib/icons"

type OrderSide = "buy" | "sell"

/**
 * Simplified options buy/sell screen — mirrors the stock trade screen's
 * layout (same header/chart/CTA pattern) but swaps share quantity for a
 * call/put + expiration + strike picker. Contracts always control 100
 * shares, so est. cost is premium × 100 × contracts, per how options
 * actually settle.
 */
export default function OptionsPage() {
  const params = useParams<{ symbol: string }>()
  const router = useRouter()
  const [orderSide, setOrderSide] = React.useState<OrderSide>("buy")
  const [optionType, setOptionType] = React.useState<OptionType>("call")
  const [expirationId, setExpirationId] = React.useState(expirations[0].id)
  const [contracts, setContracts] = React.useState(1)
  const [selectedStrike, setSelectedStrike] = React.useState<number | null>(null)
  const [step, setStep] = React.useState<"trade" | "success">("trade")

  const symbol = params.symbol
  const quote = allQuotes.find((q) => q.symbol === symbol)
  const expiration = expirations.find((e) => e.id === expirationId) ?? expirations[0]
  const strikes = React.useMemo(
    () => (quote ? strikesFor(quote.price, expiration.daysOut, optionType) : []),
    [quote, expiration.daysOut, optionType]
  )
  const defaultStrike = strikes[Math.floor(strikes.length / 2)]?.strike ?? null
  const effectiveStrike = selectedStrike ?? defaultStrike

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

  const chartTrend = quote.changePercent >= 0 ? "positive" : "negative"
  const activeStrike = strikes.find((s) => s.strike === effectiveStrike) ?? strikes[0]
  const premium = activeStrike?.premium ?? 0
  const estimatedCost = premium * 100 * contracts

  function increment() {
    setContracts((c) => c + 1)
  }

  function decrement() {
    setContracts((c) => Math.max(1, c - 1))
  }

  if (step === "success" && activeStrike) {
    return (
      <div className="flex min-h-full flex-col">
        <OrderSuccess
          symbol={quote.symbol}
          name={`$${activeStrike.strike} ${optionType === "call" ? "Call" : "Put"} · ${expiration.label}`}
          quantity={contracts}
          estimatedCost={Number(estimatedCost.toFixed(2))}
          unitLabel="contract"
          onDone={() => router.push("/")}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-5 px-4 pt-8">
      <Link href="/" className="type-body flex w-fit items-center gap-1 text-muted-foreground">
        <ChevronRight className="size-4 rotate-180" />
        Back
      </Link>

      <div className="flex items-center gap-3">
        <TickerAvatar symbol={quote.symbol} size={56} />
        <div className="flex flex-col gap-1">
          <span className="type-label text-muted-foreground">{quote.name} options</span>
          <div className="flex items-baseline gap-2">
            <h1 className="type-hero text-foreground">${quote.price.toFixed(2)}</h1>
            <span
              className={cn(
                "type-body-strong",
                chartTrend === "positive" ? "text-positive" : "text-negative"
              )}
            >
              {formatPercent(quote.changePercent)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <FinancialChart data={quote.history} variant="area" trend={chartTrend} height={140} />
      </div>

      <Tabs value={orderSide} onValueChange={(v) => setOrderSide(v as OrderSide)}>
        <TabsList className="w-full">
          <TabsTrigger
            value="buy"
            className="flex-1 data-active:bg-positive/15! data-active:text-positive!"
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

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Type</span>
          <Tabs
            value={optionType}
            onValueChange={(v) => {
              setOptionType(v as OptionType)
              setSelectedStrike(null)
            }}
          >
            <TabsList>
              <TabsTrigger
                value="call"
                className="data-active:bg-positive/15! data-active:text-positive!"
              >
                Call
              </TabsTrigger>
              <TabsTrigger
                value="put"
                className="data-active:bg-destructive/15! data-active:text-destructive!"
              >
                Put
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">
            Expiration
          </span>
          <Tabs
            value={expirationId}
            onValueChange={(v) => {
              setExpirationId(v)
              setSelectedStrike(null)
            }}
          >
            <TabsList>
              {expirations.map((exp) => (
                <TabsTrigger key={exp.id} value={exp.id}>
                  {exp.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col rounded-lg border border-border">
          {strikes.map((s) => {
            const isSelected = s.strike === effectiveStrike
            return (
              <button
                key={s.strike}
                type="button"
                onClick={() => setSelectedStrike(s.strike)}
                className={cn(
                  "flex items-center justify-between border-b border-border px-3 py-2.5 text-left last:border-b-0",
                  isSelected && "bg-muted"
                )}
              >
                <span className="type-body-strong tabular-nums text-foreground">
                  ${s.strike.toFixed(2)}
                </span>
                <span className="type-body tabular-nums text-muted-foreground">
                  {formatCurrency(s.premium)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">
            Contracts
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted px-2 py-2">
          <button
            type="button"
            onClick={decrement}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-background/60"
            aria-label="Decrease contracts"
          >
            <Minus className="size-5" />
          </button>
          <span className="type-hero text-foreground tabular-nums">{contracts}</span>
          <button
            type="button"
            onClick={increment}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-background/60"
            aria-label="Increase contracts"
          >
            <Plus className="size-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="type-label text-muted-foreground">Premium</span>
            <span className="type-body-strong tabular-nums text-foreground">
              {formatCurrency(premium)} × 100
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

      <div className="glass-nav sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 px-4 pt-3 pb-6">
        <Button
          size="lg"
          className="h-11! w-full"
          variant={orderSide === "sell" ? "destructive" : "default"}
          disabled={!activeStrike}
          onClick={() => setStep("success")}
        >
          {orderSide === "buy" ? "Buy" : "Sell"} {contracts} {quote.symbol} $
          {activeStrike?.strike.toFixed(0)} {optionType === "call" ? "Call" : "Put"}
        </Button>
        <p className="type-label text-center text-muted-foreground">
          This is a prototype — no real money moves.
        </p>
      </div>
    </div>
  )
}
