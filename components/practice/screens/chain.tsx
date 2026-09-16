import * as React from "react"

import { usePractice } from "@/components/providers/practice-provider"
import { expirations, strikesWithDeltaFor } from "@/data/mock-options-data"
import { practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrency } from "@/lib/format"

export function ChainScreen() {
  const { symbol } = usePractice()
  const [expirationId, setExpirationId] = React.useState(expirations[0].id)
  const quote = practiceQuoteFor(symbol)
  const price = quote.price
  const expiration = expirations.find((e) => e.id === expirationId) ?? expirations[0]
  const puts = strikesWithDeltaFor(price, expiration.daysOut, "put")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="type-title text-foreground">{symbol}</span>
          <span className="type-label text-muted-foreground">all four columns open</span>
        </div>
        <span className="type-body-strong tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Expiration</span>
        {expirations.map((exp) => (
          <button
            key={exp.id}
            type="button"
            onClick={() => setExpirationId(exp.id)}
            className={
              exp.id === expirationId
                ? "rounded-lg border border-accent-blue bg-accent-blue/12 px-3.5 py-3 text-center type-body-strong text-foreground"
                : "rounded-lg border border-transparent px-3.5 py-3 text-center type-body text-muted-foreground"
            }
          >
            {exp.label} ({exp.daysOut})
          </button>
        ))}
      </div>

      <div className="flex flex-col rounded-lg glass-card px-4 pt-3">
        <div className="flex items-center justify-between border-b border-border pb-2 type-label text-muted-foreground">
          <span className="w-14">Strike</span>
          <span className="w-16 text-right">Bid</span>
          <span className="w-16 text-right">Ask</span>
          <span className="w-16 text-right">Delta</span>
        </div>
        {puts.map((strike) => (
          <div key={strike.strike} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
            <span className="w-14 type-body-strong tabular-nums text-foreground">{strike.strike}</span>
            <span className="w-16 text-right type-body tabular-nums text-muted-foreground">
              {formatCurrency(Math.max(0.01, strike.premium - 0.06))}
            </span>
            <span className="w-16 text-right type-body tabular-nums text-muted-foreground">
              {formatCurrency(strike.premium + 0.06)}
            </span>
            <span className="w-16 text-right type-body tabular-nums text-muted-foreground">{strike.delta.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
