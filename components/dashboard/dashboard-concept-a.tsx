import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WatchlistRow } from "@/components/finance/watchlist-row"
import { NextStepCard } from "@/components/dashboard/next-step-card"
import { Badge } from "@/components/ui/badge"
import { portfolio, positions, watchlist } from "@/data/mock-market-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { AlertTriangle } from "@/lib/icons"

/**
 * Concept A — "narrative" dashboard. Static/exploratory (Part 2 of the
 * spec), not wired up: the alert-banner trigger and next-step logic aren't
 * real. Leads with the most severe thing a user could see (a manual-review
 * document request), then a personalized "what's next" story, then
 * positions/watchlist.
 */
export function DashboardConceptA() {
  const firstPosition = positions[0]

  return (
    <div className="flex flex-col gap-6 px-4 pt-8 pb-8">
      <header className="flex flex-col gap-1">
        <span className="type-label text-muted-foreground">Good afternoon</span>
        <h1 className="type-title text-foreground">Welcome back</h1>
      </header>

      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>Action needed: re-upload your photo ID</AlertTitle>
        <AlertDescription>
          Your application needs a quick manual review. This is the most important thing to do
          right now.
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="destructive">
            Upload
          </Button>
        </AlertAction>
      </Alert>

      <section className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
        <span className="type-label text-muted-foreground">Net worth</span>
        <span className="type-hero text-foreground">{formatCurrency(portfolio.totalValue)}</span>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="type-label uppercase tracking-wide text-muted-foreground">What&apos;s next</h2>
        <NextStepCard symbol={firstPosition.symbol} />
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3.5 text-left transition-colors hover:bg-muted"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="type-body-strong text-foreground">Curious about futures?</span>
            <span className="type-label text-muted-foreground">A quick primer, no commitment.</span>
          </div>
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="type-label uppercase tracking-wide text-muted-foreground">Positions</h2>
          <Badge variant="outline" className="border-positive/30 text-positive">
            Your first trade was {firstPosition.symbol}
          </Badge>
        </div>
        <div className="flex flex-col rounded-lg border border-border bg-surface px-4">
          {positions.map((position) => (
            <div key={position.symbol} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="type-body-strong text-foreground">{position.symbol}</span>
                <span className="type-label text-muted-foreground">{position.quantity} shares</span>
              </div>
              <div className="flex w-24 shrink-0 flex-col items-end">
                <span className="type-body-strong tabular-nums text-foreground">
                  {formatCurrency(position.marketValue)}
                </span>
                <span className={position.changePercent >= 0 ? "type-label text-positive" : "type-label text-negative"}>
                  {formatPercent(position.changePercent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="type-label uppercase tracking-wide text-muted-foreground">Watchlist</h2>
        <div className="flex flex-col rounded-lg border border-border bg-surface px-4">
          {watchlist.slice(0, 3).map((quote) => (
            <WatchlistRow key={quote.symbol} quote={quote} />
          ))}
        </div>
      </section>
    </div>
  )
}
