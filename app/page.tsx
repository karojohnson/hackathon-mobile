"use client"

import Link from "next/link"
import { cn } from "cn"

import { BottomNav } from "@/components/mobile/bottom-nav"
import { WatchlistRow } from "@/components/finance/watchlist-row"
import { GlassShell } from "@/components/finance/glass-shell"
import { SwipeablePositionRow } from "@/components/finance/swipeable-position-row"
import { AccountBar } from "@/components/dashboard/account-bar"
import { QuoteChipRow } from "@/components/dashboard/quote-chip-row"
import { NextStepCard } from "@/components/dashboard/next-step-card"
import { NetWorthSheet } from "@/components/dashboard/net-worth-sheet"
import { TodoList } from "@/components/dashboard/todo-list"
import { PreferenceSpotlight } from "@/components/dashboard/preference-spotlight"
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay"
import { PracticeProvider } from "@/components/providers/practice-provider"
import { PracticeTab } from "@/components/practice/practice-tab"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { PRACTICE_TAB_INDEX, usePrototype } from "@/components/providers/prototype-provider"
import { watchlist as allQuotes } from "@/data/mock-market-data"
import { formatCurrency } from "@/lib/format"
import { Plus, Wallet } from "@/lib/icons"

export default function Page() {
  const {
    watchlist,
    positions,
    lastTradedSymbol,
    cash,
    quizDismissed,
    todos,
    dominantPreference,
    editPositionQuantity,
    closePosition,
    adjustCash,
  } = useOnboarding()
  const { activeTab, setActiveTab } = usePrototype()

  const watchedQuotes = allQuotes.filter((q) => watchlist.includes(q.symbol))
  const positionsValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
  const netWorth = cash + positionsValue

  if (activeTab === PRACTICE_TAB_INDEX) {
    return (
      <PracticeProvider>
        <PracticeTab activeTabIndex={activeTab} onActiveTabChange={setActiveTab} />
      </PracticeProvider>
    )
  }

  return (
    // -mt-14/pt-14 cancel out (same 56px the phone-frame scroll container
    // reserves above via its own pt-14) so this glass-sheet's background
    // bleeds up behind the status bar/Dynamic Island instead of stopping
    // right below it — otherwise that reserved strip shows the phone
    // bezel's plain black through, a visible seam against the lighter
    // glass-sheet tint everywhere else. Content position is unaffected
    // since the two cancel out; only the background box grows upward.
    // min-h-[calc(100%+3.5rem)] (not min-h-full) grows height by that same
    // 56px the negative margin ate into — otherwise the box falls 56px
    // short at the bottom of the screen too. That shortfall is invisible
    // behind the dashboard's own bottom nav, but OnboardingOverlay's
    // `fixed inset-0` (backdrop-filter here makes this div its containing
    // block) inherits this exact box, so steps 1-3's CTA would float above
    // a bare black gap instead of reaching the true bottom edge.
    <div className="glass-sheet relative -mt-14 flex min-h-[calc(100%+3.5rem)] flex-col pt-14">
      {!quizDismissed && <OnboardingOverlay />}

      <div
        className={cn(
          "relative flex flex-1 flex-col gap-8 px-4 pt-4 pb-6 transition-all duration-500",
          !quizDismissed && "pointer-events-none scale-[0.98] opacity-60 blur-md"
        )}
      >
        {/* -top-14 bleeds the wash up behind the phone's status bar (pt-14 on the
            scroll container in phone-frame.tsx), instead of starting below it. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-14 h-141 dashboard-top-glow" />

        <AccountBar />

        <div className="flex flex-col gap-4">
          <h1 className="type-title text-foreground">Hello, Pritam!</h1>

          <NetWorthSheet cash={cash} onAdjustCash={adjustCash}>
            <div className="flex flex-col gap-1 px-3 py-2 -mx-3">
              <span className="type-label flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="size-3.5" />
                Net worth
              </span>
              <span className="type-hero text-foreground">{formatCurrency(netWorth)}</span>
              <span className="type-label text-muted-foreground">
                {formatCurrency(cash)} cash · {formatCurrency(positionsValue)} invested
              </span>
            </div>
          </NetWorthSheet>
        </div>

        {positions.length === 0 && <QuoteChipRow quotes={watchedQuotes} />}

        <TodoList todos={todos} />

        <PreferenceSpotlight preference={dominantPreference} />

        {/*
          Positions (plus its "more ways to trade" nudge) before watchlist —
          once a customer actually holds something, that's the more
          important thing to lead with (reversed from the earlier
          watchlist-first ordering, which only made sense pre-first-trade).
          Wrapped together in their own gap-3 (12px) flex column so that
          rhythm holds between Positions and Watchlist (and the "more ways
          to trade" nudge between them) regardless of which of these
          conditionally-rendered blocks are actually present — sizing it on
          the shared parent instead of per-sibling margins.
        */}
        <div className="flex flex-col gap-3">
          {positions.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="type-label uppercase tracking-wide text-muted-foreground">Positions</h2>
              <div className="flex flex-col overflow-hidden rounded-lg glass-card pl-4">
                {positions.map((position) => (
                  <SwipeablePositionRow
                    key={position.symbol}
                    position={position}
                    onEditQuantity={(quantity) => editPositionQuantity(position.symbol, quantity)}
                    onClosePosition={() => closePosition(position.symbol)}
                  />
                ))}
              </div>
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
              <>
                <div className="flex items-center justify-between">
                  <h2 className="type-label uppercase tracking-wide text-muted-foreground">Watchlist</h2>
                  <Button variant="ghost" size="sm" className="-mr-2.5">
                    <Plus />
                    Add
                  </Button>
                </div>
                <div className="flex flex-col rounded-lg glass-card px-4">
                  {watchedQuotes.map((quote) => (
                    <Link key={quote.symbol} href={`/symbol/${quote.symbol}`} className="block">
                      <WatchlistRow quote={quote} />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <BottomNav
        className="sticky inset-x-0 bottom-0 z-10"
        activeIndex={activeTab}
        onActiveChange={setActiveTab}
      />
    </div>
  )
}
