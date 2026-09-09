"use client"

import Link from "next/link"
import { cn } from "cn"

import { BottomNav } from "@/components/mobile/bottom-nav"
import { EmptyState } from "@/components/mobile/empty-state"
import { WatchlistRow } from "@/components/finance/watchlist-row"
import { TickerAvatar } from "@/components/finance/ticker-avatar"
import { AccountBar } from "@/components/dashboard/account-bar"
import { QuoteChipRow } from "@/components/dashboard/quote-chip-row"
import { NextStepCard } from "@/components/dashboard/next-step-card"
import { TodoList } from "@/components/dashboard/todo-list"
import { PreferenceSpotlight } from "@/components/dashboard/preference-spotlight"
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { watchlist as allQuotes, portfolio } from "@/data/mock-market-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { LineChart, Wallet } from "@/lib/icons"

export default function Page() {
  const { watchlist, positions, lastTradedSymbol, quizDismissed, todos, dominantPreference } = useOnboarding()

  const watchedQuotes = allQuotes.filter((q) => watchlist.includes(q.symbol))
  const positionsValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
  const netWorth = portfolio.buyingPower + positionsValue

  return (
    <div className="relative flex min-h-full flex-col">
      {!quizDismissed && <OnboardingOverlay />}

      <div
        className={cn(
          "flex flex-1 flex-col gap-8 px-4 pt-8 pb-28 transition-all duration-500",
          !quizDismissed && "pointer-events-none scale-[0.98] opacity-60 blur-md"
        )}
      >
        <AccountBar />

        <h1 className="type-title text-foreground">Hello, Pritam!</h1>

        <section className="flex flex-col gap-1">
          <span className="type-label flex items-center gap-1.5 text-muted-foreground">
            <Wallet className="size-3.5" />
            Net worth
          </span>
          <span className="type-hero text-foreground">{formatCurrency(netWorth)}</span>
          <span className="type-label text-muted-foreground">
            {formatCurrency(portfolio.buyingPower)} cash · {formatCurrency(positionsValue)} invested
          </span>
        </section>

        {positions.length === 0 && <QuoteChipRow quotes={watchedQuotes} />}

        <TodoList todos={todos} />

        <PreferenceSpotlight preference={dominantPreference} />

        {/*
          Positions (plus its "more ways to trade" nudge) before watchlist —
          once a customer actually holds something, that's the more
          important thing to lead with (reversed from the earlier
          watchlist-first ordering, which only made sense pre-first-trade).
        */}
        {positions.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="type-label uppercase tracking-wide text-muted-foreground">Positions</h2>
            <div className="flex flex-col rounded-lg border border-border bg-surface px-4">
              {positions.map((position) => (
                <div
                  key={position.symbol}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <TickerAvatar symbol={position.symbol} size={32} />
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
            {lastTradedSymbol && <NextStepCard symbol={lastTradedSymbol} />}
          </section>
        )}

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
      </div>

      <BottomNav className="sticky inset-x-0 bottom-0 z-10" />
    </div>
  )
}
