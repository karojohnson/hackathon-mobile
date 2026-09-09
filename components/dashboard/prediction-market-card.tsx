"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  const yesPercent = 52

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="type-label uppercase tracking-wide text-muted-foreground">
          Prediction market
        </span>
        <Badge variant="outline" className="border-positive/30 text-positive">
          Live
        </Badge>
      </div>

      <p className="type-body-strong text-foreground">Will AAPL close above $245 by Friday?</p>

      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-positive" style={{ width: `${yesPercent}%` }} />
        <div className="h-full bg-negative" style={{ width: `${100 - yesPercent}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="type-label text-positive">{yesPercent}% Yes</span>
        <span className="type-label text-negative">{100 - yesPercent}% No</span>
      </div>

      {predictionsEnabled ? (
        <Button size="sm">Trade this market</Button>
      ) : (
        <div className="flex flex-col gap-2 rounded-md bg-muted p-3">
          <p className="type-label text-muted-foreground">
            We noticed you were curious about prediction markets.
          </p>
          <Button size="sm" onClick={enablePredictions}>
            Enable prediction markets
          </Button>
        </div>
      )}
    </div>
  )
}
