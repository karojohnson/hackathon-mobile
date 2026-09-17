import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import type { PracticeQuote } from "@/data/mock-practice-data"
import { formatPercent } from "@/lib/format"

export interface TickerChipProps {
  quote: PracticeQuote
  catalystLabel: string
  selected: boolean
  onSelect: () => void
}

/**
 * A symbol you can pick on the cold-start screen.
 *
 * Three ranks, where there used to be two. The symbol is the identity you
 * scan for, so it takes `.type-figure`; the price and change are context
 * at body/label; the catalyst — the actual reason the symbol is on this
 * screen, given the heading is "Four with something happening this week" —
 * is a Badge rather than a third line of 12px grey, which is what it was.
 *
 * Deliberately heavier than Prototype 1's `WatchlistRow` (14/12 throughout):
 * that is a dense list row in a scrolling watchlist, this is one of four
 * selectable cards. Different job, so the extra weight doesn't put the two
 * prototypes out of step.
 *
 * The selected card keeps its original `accent-blue/12` wash rather than
 * the heavier `.accent-panel` surface: at four stacked cards the stronger
 * tint took over the screen. Selection is carried by the border, the
 * primary Badge and the elevation shadow, so the choice you've made sits
 * above the ones you haven't without the fill shouting.
 */
export function TickerChip({ quote, catalystLabel, selected, onSelect }: TickerChipProps) {
  const trend = quote.changePercent >= 0 ? "positive" : "negative"

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "row-selectable flex w-full flex-col gap-2.5 rounded-lg border px-4 py-3.5 text-left",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        selected
          ? "border-accent-blue bg-accent-blue/12 shadow-[var(--shadow-bottom-100)]"
          : "glass-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="type-figure text-foreground">{quote.symbol}</span>
          <span className="type-label truncate text-muted-foreground">{quote.name}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end">
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

      <Badge variant={selected ? "primary" : "secondary"} className="max-w-full">
        <span className="truncate">{catalystLabel}</span>
      </Badge>
    </button>
  )
}
