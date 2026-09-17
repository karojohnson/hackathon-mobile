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
import { TickerChipBefore } from "@/components/practice/before/ticker-chip"
import { usePractice } from "@/components/providers/practice-provider"
import { PRACTICE_QUOTES, catalystsFor } from "@/data/mock-practice-data"

export function ColdStartScreenBefore() {
  const { symbol, setSymbol } = usePractice()
  const quotes = PRACTICE_QUOTES

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="type-title text-foreground">Worth a look</h1>
        <p className="type-body text-muted-foreground">Four with something happening this week.</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {quotes.map((quote) => {
          const catalyst = catalystsFor(quote.symbol)
          const nextEvent = catalyst.events[0]
          return (
            <TickerChipBefore
              key={quote.symbol}
              quote={quote}
              catalystLabel={nextEvent ? (nextEvent.chipLabel ?? nextEvent.label) : "Nothing scheduled"}
              selected={symbol === quote.symbol}
              onSelect={() => setSymbol(quote.symbol)}
            />
          )
        })}
      </div>
    </div>
  )
}
