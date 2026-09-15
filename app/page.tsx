"use client"

import { Fragment } from "react"
import Link from "next/link"
import { cn } from "cn"

import { BottomNav } from "@/components/mobile/bottom-nav"
import { WatchlistRow } from "@/components/finance/watchlist-row"
import { GlassShell } from "@/components/finance/glass-shell"
import { AccountBar } from "@/components/dashboard/account-bar"
import { QuoteChipRow } from "@/components/dashboard/quote-chip-row"
import { NextStepCard } from "@/components/dashboard/next-step-card"
import { TodoList } from "@/components/dashboard/todo-list"
import { PreferenceSpotlight } from "@/components/dashboard/preference-spotlight"
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { watchlist as allQuotes, portfolio } from "@/data/mock-market-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { Wallet } from "@/lib/icons"

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
            <GlassShell contentClassName="p-2">
              {positions.map((position, index) => (
                <Fragment key={position.symbol}>
                  {index > 0 && <div className="mx-3.5 h-px bg-(--divider)" />}
                  <div className="flex items-center justify-between gap-3 rounded-[14px] p-3.5 transition-colors hover:bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.06)]">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="type-body-strong text-foreground">{position.symbol}</span>
                      <span className="type-label truncate text-(--text-2)">
                        {position.quantity} {position.quantity === 1 ? "share" : "shares"} · avg $
                        {position.avgCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex w-24 shrink-0 flex-col items-end">
                      <span className="type-body-strong tabular-nums text-(--price)">
                        {formatCurrency(position.marketValue)}
                      </span>
                      <span
                        className={cn(
                          "type-label tabular-nums",
                          position.changePercent >= 0 ? "text-(--gain)" : "text-(--loss)"
                        )}
                      >
                        {formatPercent(position.changePercent)}
                      </span>
                    </div>
                  </div>
                </Fragment>
              ))}
            </GlassShell>
            {lastTradedSymbol && <NextStepCard symbol={lastTradedSymbol} />}
          </section>
        )}

        <section className="flex flex-col gap-3">
          {watchedQuotes.length === 0 ? (
            <>
              <h2 className="type-label uppercase tracking-wide text-muted-foreground">Watchlist</h2>
              <GlassShell contentClassName="flex items-center justify-center px-6 py-10 text-center">
                <span className="type-body text-(--text-2)">
                  Tell us what you&apos;re into to get a personalized watchlist.
                </span>
              </GlassShell>
            </>
          ) : (
            <GlassShell contentClassName="flex flex-col p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="type-label uppercase tracking-wide text-muted-foreground">Watchlist</h2>
                <span className="type-label text-(--watchlist-count-accent)">{watchedQuotes.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                {watchedQuotes.map((quote) => (
                  <Link key={quote.symbol} href={`/symbol/${quote.symbol}`} className="block">
                    <WatchlistRow quote={quote} />
                  </Link>
                ))}
              </div>
            </GlassShell>
          )}
        </section>
      </div>

      <BottomNav className="sticky inset-x-0 bottom-0 z-10" />
    </div>
  )
}
