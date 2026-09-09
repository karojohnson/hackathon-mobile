import Link from "next/link"

import { Button } from "@/components/ui/button"
import { BannerCard } from "@/components/dashboard/banner-card"
import { PredictionMarketCard } from "@/components/dashboard/prediction-market-card"
import type { ProductPreference } from "@/components/providers/onboarding-provider"

/**
 * Switches the dashboard's featured "flavor" module based on whichever
 * product type currently weighs highest (see the control sidebar). Stocks has no extra
 * spotlight — the watchlist/positions sections already are the stocks
 * experience — the other three get a dedicated card, styled as the same
 * accent-bar banner as the account-signal to-dos.
 */
export function PreferenceSpotlight({ preference }: { preference: ProductPreference }) {
  if (preference === "predictions") return <PredictionMarketCard />

  if (preference === "options") {
    return (
      <BannerCard accent="blue">
        <div className="flex flex-col gap-0.5">
          <span className="type-label uppercase tracking-wide text-focus">Options idea</span>
          <span className="type-body-strong text-foreground">Covered call on AAPL</span>
          <span className="type-label text-muted-foreground">
            A simple way to earn extra income on shares you already own.
          </span>
        </div>
        <Button size="lg" className="h-11! w-full" render={<Link href="/symbol/AAPL/options" />}>
          Trade this idea
        </Button>
      </BannerCard>
    )
  }

  if (preference === "etfs") {
    return (
      <BannerCard accent="gray">
        <div className="flex flex-col gap-0.5">
          <span className="type-label uppercase tracking-wide text-muted-foreground">
            ETF spotlight
          </span>
          <span className="type-body-strong text-foreground">SPY · SPDR S&amp;P 500 ETF Trust</span>
          <span className="type-label text-muted-foreground">
            One trade, broad exposure to the S&amp;P 500 — a steady way to stay diversified.
          </span>
        </div>
        <Button size="lg" className="h-11! w-full" render={<Link href="/symbol/SPY" />}>
          Trade SPY
        </Button>
      </BannerCard>
    )
  }

  return null
}
