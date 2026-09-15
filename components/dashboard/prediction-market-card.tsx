"use client"

import { SignalBanner } from "@/components/dashboard/signal-banner"
import { useOnboarding } from "@/components/providers/onboarding-provider"

/**
 * Flagship "flavor" module for a prediction-markets-dominant preference —
 * a Kalshi-style live-odds card. Static/mocked odds, no real market data.
 * If the customer hasn't "enabled" prediction markets yet, leads with a
 * nudge instead of a trade CTA — per the follow-up call's walkthrough of
 * "we saw you browsing prediction markets, enable Kalshi."
 */
export function PredictionMarketCard() {
  const { predictionsEnabled, enablePredictions } = useOnboarding()

  return (
    <SignalBanner
      variant="blue"
      eyebrow="Prediction market"
      badge="Live"
      badgeTone="live"
      title="Will AAPL close above $245 by Friday?"
      meter={52}
      cta={predictionsEnabled ? "Trade this market" : "Enable prediction markets"}
      onAction={predictionsEnabled ? undefined : enablePredictions}
    />
  )
}
