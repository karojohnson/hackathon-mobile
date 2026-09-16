import { cn } from "cn"

import { AxisTag } from "@/components/practice/axis-tag"
import type { Axis } from "@/components/providers/practice-provider"
import type { PracticeQuote } from "@/data/mock-practice-data"
import { formatPercent } from "@/lib/format"

export interface TickerChipProps {
  quote: PracticeQuote
  catalystLabel: string
  axis: Axis
  unlocked: boolean
  selected: boolean
  onSelect: () => void
}

export function TickerChip({ quote, catalystLabel, axis, unlocked, selected, onSelect }: TickerChipProps) {
  const trend = quote.changePercent >= 0 ? "positive" : "negative"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-lg border px-3.5 py-3 text-left transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        selected ? "border-accent-blue bg-accent-blue/12" : "glass-card"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="type-body-strong text-foreground">{quote.symbol}</span>
          <span className="type-label text-muted-foreground">{quote.name}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="type-body-strong tabular-nums text-foreground">${quote.price.toFixed(2)}</span>
          <span
            className={cn(
              "type-label tabular-nums",
              trend === "positive" ? "text-positive" : "text-negative"
            )}
          >
            {formatPercent(quote.changePercent)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("type-label truncate", selected ? "text-accent-blue" : "text-muted-foreground")}>
          {catalystLabel}
        </span>
        <AxisTag axis={axis} unlocked={unlocked} />
      </div>
    </button>
  )
}
