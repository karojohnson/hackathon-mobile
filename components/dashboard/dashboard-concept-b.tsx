import { KpiCard } from "@/components/finance/kpi-card"
import { AllocationBar } from "@/components/finance/allocation-bar"
import { WatchlistRow } from "@/components/finance/watchlist-row"
import { Badge } from "@/components/ui/badge"
import { portfolio, positions, watchlist } from "@/data/mock-market-data"
import { formatCurrency, formatSignedCurrency, formatPercent } from "@/lib/format"

/**
 * Concept B — "at a glance" dashboard. Static/exploratory (Part 2 of the
 * spec), not wired up. Deliberately denser/quieter than Concept A: a small
 * action badge instead of a loud banner, KPI grid up top, tighter rows — the
 * contrast is the point (per the call: a first-time trader and a 10-year
 * veteran shouldn't necessarily see the identical layout).
 */
export function DashboardConceptB() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-8 pb-8">
      <h1 className="type-title text-foreground">Hello, Pritam!</h1>

      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="type-label text-muted-foreground">Net worth</span>
          <span className="type-title text-foreground tabular-nums">{formatCurrency(portfolio.totalValue)}</span>
        </div>
        <Badge variant="outline" className="border-warning/40 text-warning">
          1 action needed
        </Badge>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <KpiCard label="Buying power" value={formatCurrency(portfolio.buyingPower)} />
        <KpiCard
          label="Today"
          value={formatSignedCurrency(portfolio.todayChange)}
          changePercent={portfolio.todayChangePercent}
        />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="type-label uppercase tracking-wide text-muted-foreground">Allocation</h2>
        <div className="rounded-lg border border-border bg-surface p-4">
          <AllocationBar
            slices={[
              { label: "Equities", percent: 58, colorClassName: "bg-positive" },
              { label: "ETFs", percent: 27, colorClassName: "bg-accent" },
              { label: "Cash", percent: 15, colorClassName: "bg-muted-foreground" },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-label uppercase tracking-wide text-muted-foreground">Positions</h2>
        <div className="flex flex-col rounded-lg border border-border bg-surface px-3">
          {positions.map((position) => (
            <div key={position.symbol} className="flex items-center gap-3 border-b border-border py-2 last:border-b-0">
              <span className="type-body-strong w-14 shrink-0 text-foreground">{position.symbol}</span>
              <span className="type-label flex-1 text-muted-foreground">{position.quantity} sh</span>
              <span className="type-body tabular-nums text-foreground">{formatCurrency(position.marketValue)}</span>
              <span
                className={
                  position.changePercent >= 0
                    ? "type-label w-14 shrink-0 text-right tabular-nums text-positive"
                    : "type-label w-14 shrink-0 text-right tabular-nums text-negative"
                }
              >
                {formatPercent(position.changePercent)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-label uppercase tracking-wide text-muted-foreground">Watchlist</h2>
        <div className="flex flex-col rounded-lg border border-border bg-surface px-4">
          {watchlist.map((quote) => (
            <WatchlistRow key={quote.symbol} quote={quote} />
          ))}
        </div>
      </section>
    </div>
  )
}
