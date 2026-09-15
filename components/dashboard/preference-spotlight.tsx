"use client"

import { useRouter } from "next/navigation"

import { SignalBanner } from "@/components/dashboard/signal-banner"
import { PredictionMarketCard } from "@/components/dashboard/prediction-market-card"
import type { ProductPreference } from "@/components/providers/onboarding-provider"

/**
 * Switches the dashboard's featured "flavor" module based on whichever
 * product type currently weighs highest (see the control sidebar). Stocks has no extra
 * spotlight — the watchlist/positions sections already are the stocks
 * experience — the other three get a dedicated card, all rendered through
 * the shared SignalBanner family (except predictions, which has its own
 * live-odds anatomy).
 */
export function PreferenceSpotlight({ preference }: { preference: ProductPreference }) {
  const router = useRouter()

  if (preference === "predictions") return <PredictionMarketCard />

  if (preference === "options") {
    return (
      <SignalBanner
        variant="blue"
        eyebrow="Options idea"
        badge="For you"
        title="Covered call on AAPL"
        body="A simple way to earn extra income on shares you already own."
        cta="Trade this idea"
        secondary="How it works"
        onAction={() => router.push("/symbol/AAPL/options")}
      />
    )
  }

  if (preference === "etfs") {
    return (
      <SignalBanner
        variant="blue"
        eyebrow="ETF spotlight"
        title="SPY · SPDR S&P 500 ETF Trust"
        body="One trade, broad exposure to the S&P 500 — a steady way to stay diversified."
        cta="Trade SPY"
        onAction={() => router.push("/symbol/SPY")}
      />
    )
  }

  return null
}
