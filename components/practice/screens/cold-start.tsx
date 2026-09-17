import { TickerChip } from "@/components/practice/ticker-chip"
import { usePractice } from "@/components/providers/practice-provider"
import { PRACTICE_QUOTES, catalystsFor } from "@/data/mock-practice-data"

export function ColdStartScreen() {
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
            <TickerChip
              key={quote.symbol}
              quote={quote}
              catalystLabel={nextEvent ? (nextEvent.chipLabel ?? nextEvent.label) : "Nothing scheduled"}
              selected={symbol === quote.symbol}
              onSelect={() => setSymbol(quote.symbol)}
            />
          )
        })}
      </div>

      {/*
        Figma node 10:1570. Not wired to anything: the four above are the
        chapter's curriculum, and this is here so the screen doesn't imply
        they're the only four symbols that exist.
      */}
      <button
        type="button"
        className="type-label w-fit text-accent-blue transition-colors hover:text-accent-blue/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Search all symbols
      </button>
    </div>
  )
}
