import { TickerChip } from "@/components/practice/ticker-chip"
import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { catalystsFor } from "@/data/mock-practice-data"

const FEATURED_SYMBOLS = ["AAPL", "TSLA", "NVDA", "COIN"]

export function ColdStartScreen() {
  const { symbol, setSymbol, unlockedAxes } = usePractice()
  const quotes = FEATURED_SYMBOLS.map((s) => watchlist.find((q) => q.symbol === s)).filter(
    (q): q is NonNullable<typeof q> => Boolean(q)
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
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
              axis={nextEvent?.axis ?? "direction"}
              catalystLabel={nextEvent ? nextEvent.label : "Nothing scheduled"}
              unlocked={unlockedAxes.includes(nextEvent?.axis ?? "direction")}
              selected={symbol === quote.symbol}
              onSelect={() => setSymbol(quote.symbol)}
            />
          )
        })}
      </div>
    </div>
  )
}
