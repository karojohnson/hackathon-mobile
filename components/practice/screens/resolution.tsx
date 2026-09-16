import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { computeResolution } from "@/lib/practice-flow"
import { Check, X } from "@/lib/icons"

const AXIS_LABEL = { direction: "Direction", duration: "Duration", distance: "Distance", volatility: "Volatility" } as const

export function ResolutionScreen() {
  const practice = usePractice()
  const quote = watchlist.find((q) => q.symbol === practice.symbol)
  const preview = computeResolution(practice)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="type-body text-muted-foreground">{practice.symbol} finished at</span>
        <span className="type-hero tabular-nums text-foreground">${(quote?.price ?? 0).toFixed(2)}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="type-title tabular-nums text-foreground">
          {preview.axesCorrect.length} of {preview.axesCorrect.length + preview.axesMissed.length}
        </span>
        <span className="type-body-strong tabular-nums text-priority-gold">+{preview.xpEarned} XP</span>
      </div>

      <div className="flex flex-col">
        {[...preview.axesCorrect.map((a) => [a, true] as const), ...preview.axesMissed.map((a) => [a, false] as const)].map(
          ([axis, correct]) => (
            <div key={axis} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <div className="flex items-center gap-2">
                {correct ? <Check className="size-4 text-positive" /> : <X className="size-4 text-negative" />}
                <span className="type-body text-foreground">{AXIS_LABEL[axis]}</span>
              </div>
              <span className={cn("type-label", correct ? "text-positive" : "text-negative")}>
                {correct ? "correct" : "missed"}
              </span>
            </div>
          )
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg bg-muted p-4">
        <span className="type-body-strong text-foreground">
          {preview.outcome === "win" ? "The contract worked." : "The contract missed on Distance."}
        </span>
        <span className="type-label text-muted-foreground">Streak intact · {practice.streak} resolved in a row.</span>
      </div>
    </div>
  )
}
