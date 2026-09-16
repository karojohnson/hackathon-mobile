import { usePractice } from "@/components/providers/practice-provider"
import { expirations, shortPutSpreadFor } from "@/data/mock-options-data"
import { practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrency } from "@/lib/format"
import { ExternalLink } from "@/lib/icons"

export function GraduationScreen() {
  const { symbol, dialStop, resolvedTrades } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const price = quote.price
  const spread = shortPutSpreadFor(price, expirations[1].daysOut, dialStop)
  // Seeded with the practice history the screen reports (14 trades at ~71%),
  // so a single in-session resolution nudges the rate instead of redefining it.
  const PRIOR_TRADES = 14
  const PRIOR_WINS = 10
  const totalTrades = PRIOR_TRADES + resolvedTrades.length
  const totalWins = PRIOR_WINS + resolvedTrades.filter((t) => t.outcome !== "loss").length
  const hitRate = Math.round((totalWins / totalTrades) * 100)

  return (
    <div className="flex flex-col gap-6">
      <span className="type-label uppercase tracking-wide text-muted-foreground">Practice → Live</span>

      <div className="flex flex-col gap-1">
        <p className="type-body text-foreground">
          You have made this trade <span className="type-title">{totalTrades} times</span>
        </p>
        <p className="type-body text-foreground">
          and been right <span className="type-title text-positive">{hitRate}%</span>
        </p>
        <span className="type-label text-muted-foreground">your hit rate on this kind of trade</span>
      </div>

      <p className="type-body-strong text-foreground">The same trade, with real money behind it.</p>

      <div className="flex flex-col gap-2 rounded-lg glass-card p-4">
        <div className="flex items-center justify-between">
          <span className="type-body-strong text-foreground">Short put spread</span>
          <span className="type-label text-muted-foreground">{symbol}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Sell</span>
          <span className="type-body-strong tabular-nums text-foreground">{spread.sellStrike} put</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Buy</span>
          <span className="type-body-strong tabular-nums text-foreground">{spread.buyStrike} put</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Expires</span>
          <span className="type-body-strong text-foreground">{expirations[1].label}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Most you can lose</span>
          <span className="type-body-strong tabular-nums text-negative">{formatCurrency(spread.maxLoss)}</span>
        </div>
      </div>

      <span className="type-label text-priority-gold">⚠ Real money. Sized to what you actually hold.</span>

      <div className="flex items-center justify-between rounded-lg glass-card p-4">
        <span className="type-body text-foreground">Simulated practice ends here.</span>
        <ExternalLink className="size-5 text-muted-foreground" />
      </div>

      <p className="type-label text-center text-muted-foreground">This is a prototype. No real money moves.</p>
    </div>
  )
}
