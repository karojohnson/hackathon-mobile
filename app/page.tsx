"use client"

import Link from "next/link"
import { cn } from "cn"

import { BottomNav } from "@/components/mobile/bottom-nav"
import { EmptyState } from "@/components/mobile/empty-state"
import { WatchlistRow } from "@/components/finance/watchlist-row"
import { NextStepCard } from "@/components/dashboard/next-step-card"
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { watchlist as allQuotes, portfolio } from "@/data/mock-market-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { LineChart } from "@/lib/icons"

export default function Page() {
  const { watchlist, positions, lastTradedSymbol, quizDismissed } = useOnboarding()

  const watchedQuotes = allQuotes.filter((q) => watchlist.includes(q.symbol))
  const positionsValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
  const netWorth = portfolio.buyingPower + positionsValue

  return (
    <div className="relative flex min-h-dvh flex-col">
      {!quizDismissed && <OnboardingOverlay />}

      <div
        className={cn(
          "flex flex-1 flex-col gap-8 px-4 pt-8 pb-28 transition-all duration-500",
          !quizDismissed && "pointer-events-none scale-[0.98] opacity-60 blur-md"
        )}
      >
        <header className="flex flex-col gap-1">
          <span className="type-label text-muted-foreground">Welcome</span>
          <h1 className="type-title text-foreground">Your account</h1>
        </header>

        <section className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
          <span className="type-label text-muted-foreground">Net worth</span>
          <span className="type-hero text-foreground">{formatCurrency(netWorth)}</span>
          <span className="type-label text-muted-foreground">
            {formatCurrency(portfolio.buyingPower)} cash · {formatCurrency(positionsValue)} invested
          </span>
        </section>

        {/*
          Watchlist before positions, deliberately — a watchlist can grow to
          ~20 symbols and would otherwise bury a single new position if
          positions were shown first (per follow-up stakeholder note).
        */}
        <section className="flex flex-col gap-3">
          <h2 className="type-label uppercase tracking-wide text-muted-foreground">Watchlist</h2>
          {watchedQuotes.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface">
              <EmptyState
                icon={LineChart}
                title="No watchlist yet"
                description="Tell us what you're into to get a personalized watchlist."
              />
            </div>
          ) : (
            <div className="flex flex-col rounded-lg border border-border bg-surface px-4">
              {watchedQuotes.map((quote) => (
                <Link key={quote.symbol} href={`/symbol/${quote.symbol}`} className="block">
                  <WatchlistRow quote={quote} />
                </Link>
              ))}
            </div>
          )}
        </section>

        {positions.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="type-label uppercase tracking-wide text-muted-foreground">Positions</h2>
            <div className="flex flex-col rounded-lg border border-border bg-surface px-4">
              {positions.map((position) => (
                <div
                  key={position.symbol}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="type-body-strong text-foreground">{position.symbol}</span>
                    <span className="type-label truncate text-muted-foreground">
                      {position.quantity} {position.quantity === 1 ? "share" : "shares"}
                    </span>
                  </div>
                  <div className="flex w-24 shrink-0 flex-col items-end">
                    <span className="type-body-strong tabular-nums text-foreground">
                      {formatCurrency(position.marketValue)}
                    </span>
                    <span
                      className={cn(
                        "type-label tabular-nums",
                        position.changePercent >= 0 ? "text-positive" : "text-negative"
                      )}
                    >
                      {formatPercent(position.changePercent)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {lastTradedSymbol && <NextStepCard symbol={lastTradedSymbol} />}

        <Link
          href="/concepts"
          className="type-label self-center text-muted-foreground underline-offset-2 hover:underline"
        >
          View dashboard concepts (exploratory)
        </Link>
      </div>

      <BottomNav className="fixed inset-x-0 bottom-0" />
    </div>
  )
}
