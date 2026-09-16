import { DialSlider } from "@/components/practice/dial-slider"
import { PayoffChart } from "@/components/practice/payoff-chart"
import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations, shortPutSpreadFor } from "@/data/mock-options-data"
import { formatCurrency } from "@/lib/format"

export function DialInScreen() {
  const { symbol, dialStop, setDialStop } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)
  const price = quote?.price ?? 100
  const spread = shortPutSpreadFor(price, expirations[1].daysOut, dialStop)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="type-title text-foreground">{symbol}</span>
          <span className="type-label text-muted-foreground">Direction · you said up</span>
        </div>
        <span className="type-body-strong tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span className="type-hero text-foreground">{dialStop}</span>
          <span className="type-title text-muted-foreground">%</span>
        </div>
        <span className="type-body text-foreground">Chance this works</span>
        <span className="type-label text-muted-foreground">probability of profit</span>
      </div>

      <PayoffChart
        points={[
          { strike: spread.buyStrike * 0.95, value: -spread.maxLoss },
          { strike: spread.buyStrike, value: -spread.maxLoss },
          { strike: spread.sellStrike, value: spread.maxGain },
          { strike: spread.sellStrike * 1.05, value: spread.maxGain },
        ]}
        breakevens={[spread.breakeven]}
      />

      <DialSlider value={dialStop} onChange={setDialStop} />

      <div className="flex flex-col gap-2 rounded-lg glass-card p-4">
        <span className="type-label text-muted-foreground">dial it in</span>
        <span className="type-body-strong text-foreground">Short put spread</span>
        <span className="type-label text-muted-foreground">
          sell the {spread.sellStrike} put, buy the {spread.buyStrike} put · {formatCurrency(spread.credit)} credit
        </span>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-negative">{formatCurrency(spread.maxLoss)}</span>
            <span className="type-label text-muted-foreground">max loss</span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-positive">{formatCurrency(spread.maxGain)}</span>
            <span className="type-label text-muted-foreground">max gain</span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-foreground">{spread.breakeven.toFixed(2)}</span>
            <span className="type-label text-muted-foreground">breakeven</span>
          </div>
        </div>
      </div>
    </div>
  )
}
