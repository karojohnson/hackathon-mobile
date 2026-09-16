import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { catalystsFor } from "@/data/mock-practice-data"

export function BriefingScreen() {
  const { symbol, unlockedAxes } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)
  const catalyst = catalystsFor(symbol)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">What&apos;s coming</h1>
        <p className="type-body text-muted-foreground">
          {symbol} · next 30 days · implied move ± {catalyst.impliedMovePercent}%
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">On the calendar</span>
        {catalyst.events.map((event) => (
          <div
            key={event.label}
            className={cn(
              "flex items-center justify-between rounded-lg px-3.5 py-3",
              event === catalyst.events[catalyst.events.length - 1]
                ? "border border-priority-gold bg-priority-gold-surface"
                : "bg-muted"
            )}
          >
            <div className="flex flex-col">
              <span className="type-body-strong text-foreground">{event.label}</span>
              <span className="type-label text-muted-foreground">{event.date}</span>
            </div>
            <span className="type-label text-muted-foreground">{event.daysOut} days out</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Signals</span>
        {(["direction", "duration", "distance", "volatility"] as const).map((axis) => (
          <div key={axis} className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
            <span className={cn("type-body capitalize", unlockedAxes.includes(axis) ? "text-foreground" : "text-muted-foreground/60")}>
              {axis}
            </span>
            <span className="type-label text-muted-foreground">
              {unlockedAxes.includes(axis) ? "open" : "locked"}
            </span>
          </div>
        ))}
      </div>

      {quote && (
        <p className="type-label text-muted-foreground">
          {quote.symbol} is at ${quote.price.toFixed(2)}, {quote.changePercent >= 0 ? "up" : "down"}{" "}
          {Math.abs(quote.changePercent).toFixed(2)}% today.
        </p>
      )}
    </div>
  )
}
