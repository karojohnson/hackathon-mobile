/*
 * AUTO-VENDORED "BEFORE" COPY — do not hand-edit.
 *
 * Extracted verbatim from git HEAD so /compare can render the original
 * screen next to the redesigned one on a single dev server. Only three
 * mechanical changes were applied: the exported name gains a `Before`
 * suffix, sibling before-components are imported from this folder, and
 * `glass-card` becomes `glass-card-before` (which restores the exact
 * pre-redesign declarations — the live `.glass-card` has since gained a
 * top-lit inner highlight and a stronger light-theme border, and using it
 * here would quietly flatter the "before").
 *
 * Regenerate with: git show HEAD:<path> > <this file>, then re-run the
 * rewrite in the /compare page's commit.
 */
import { cn } from "cn"

import type { PracticeQuote } from "@/data/mock-practice-data"
import { formatPercent } from "@/lib/format"

export interface TickerChipBeforeProps {
  quote: PracticeQuote
  catalystLabel: string
  selected: boolean
  onSelect: () => void
}

export function TickerChipBefore({ quote, catalystLabel, selected, onSelect }: TickerChipBeforeProps) {
  const trend = quote.changePercent >= 0 ? "positive" : "negative"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-lg border px-3.5 py-3 text-left transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        selected ? "border-accent-blue bg-accent-blue/12" : "glass-card-before"
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
      <span className={cn("type-label truncate", selected ? "text-accent-blue" : "text-muted-foreground")}>
        {catalystLabel}
      </span>
    </button>
  )
}
