import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations } from "@/data/mock-options-data"
import { Check, Lock, Unlock } from "@/lib/icons"

const AXES = [
  { id: "direction", label: "Direction", sublabel: "rally, sell off or flat? · delta" },
  { id: "duration", label: "Duration", sublabel: "by when? · theta · expiration" },
  { id: "distance", label: "Distance", sublabel: "how far? · strike selection" },
  { id: "volatility", label: "Volatility", sublabel: "how wild? · vega · IV at entry" },
] as const

export function DurationUnlockScreen() {
  const { symbol, unlockedAxes } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Unlock className="size-6 text-priority-gold" />
        <h1 className="type-title text-foreground">Duration</h1>
        <p className="type-label text-muted-foreground">by when? · theta · expiration</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-priority-gold">Now open on the chain</span>
        {expirations.map((exp) => (
          <div key={exp.id} className="flex flex-col rounded-lg bg-muted px-3.5 py-3 text-center">
            <span className="type-body-strong text-foreground">
              {exp.label} ({exp.daysOut})
            </span>
            <span className="type-label text-muted-foreground">
              {quote ? `underlying $${quote.price.toFixed(2)}` : ""}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Drill down</span>
        {AXES.map((axis) => {
          const unlocked = unlockedAxes.includes(axis.id)
          return (
            <div key={axis.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <div className="flex items-center gap-2">
                {unlocked ? <Check className="size-4 text-positive" /> : <Lock className="size-4 text-muted-foreground" />}
                <div className="flex flex-col">
                  <span className={cn("type-body", unlocked ? "text-foreground" : "text-muted-foreground/60")}>
                    {axis.label}
                  </span>
                  <span className="type-label text-muted-foreground">{axis.sublabel}</span>
                </div>
              </div>
              <span className="type-label text-muted-foreground">
                {axis.id === "duration" ? "new" : unlocked ? "done" : "locked"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
