import { PredictionMarketCard } from "@/components/dashboard/prediction-market-card"
import type { ProductPreference } from "@/components/providers/onboarding-provider"

/**
 * Switches the dashboard's featured "flavor" module based on whichever
 * product type currently weighs highest (see /demo). Stocks has no extra
 * spotlight — the watchlist/positions sections already are the stocks
 * experience — the other three get a dedicated card.
 */
export function PreferenceSpotlight({ preference }: { preference: ProductPreference }) {
  if (preference === "predictions") return <PredictionMarketCard />

  if (preference === "options") {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
        <span className="type-label uppercase tracking-wide text-muted-foreground">
          Options idea
        </span>
        <p className="type-body-strong text-foreground">Covered call on AAPL</p>
        <p className="type-label text-muted-foreground">
          A simple way to earn extra income on shares you already own.
        </p>
      </div>
    )
  }

  if (preference === "etfs") {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
        <span className="type-label uppercase tracking-wide text-muted-foreground">
          ETF spotlight
        </span>
        <p className="type-body-strong text-foreground">SPY · SPDR S&amp;P 500 ETF Trust</p>
        <p className="type-label text-muted-foreground">
          One trade, broad exposure to the S&amp;P 500 — a steady way to stay diversified.
        </p>
      </div>
    )
  }

  return null
}
