import { AxisTag } from "@/components/practice/axis-tag"
import { PayoffChart } from "@/components/practice/payoff-chart"
import { usePractice } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"
import { expirations, ironCondorFor } from "@/data/mock-options-data"
import { formatCurrency } from "@/lib/format"

const AXES = ["direction", "duration", "distance", "volatility"] as const

export function DialInAllFourScreen() {
  const { symbol } = usePractice()
  const quote = watchlist.find((q) => q.symbol === symbol)
  const price = quote?.price ?? 100
  const condor = ironCondorFor(price, expirations[1].daysOut)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="type-title text-foreground">{symbol}</span>
          <span className="type-label text-muted-foreground">all four columns open</span>
        </div>
        <span className="type-body-strong tabular-nums text-foreground">${price.toFixed(2)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {AXES.map((axis) => (
          <AxisTag key={axis} axis={axis} unlocked className="bg-positive/10 text-positive" />
        ))}
      </div>

      <PayoffChart
        points={[
          { strike: condor.buyPutStrike * 0.97, value: -condor.maxLoss },
          { strike: condor.buyPutStrike, value: -condor.maxLoss },
          { strike: condor.sellPutStrike, value: condor.maxGain },
          { strike: condor.sellCallStrike, value: condor.maxGain },
          { strike: condor.buyCallStrike, value: -condor.maxLoss },
          { strike: condor.buyCallStrike * 1.03, value: -condor.maxLoss },
        ]}
        breakevens={[condor.lowerBreakeven, condor.upperBreakeven]}
      />

      <div className="flex flex-col gap-2 rounded-lg glass-card p-4">
        <span className="type-body-strong text-foreground">Iron condor</span>
        <span className="type-label text-muted-foreground">
          {condor.buyPutStrike}/{condor.sellPutStrike} put spread + {condor.sellCallStrike}/{condor.buyCallStrike} call spread ·{" "}
          {formatCurrency(condor.credit)} credit
        </span>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-negative">{formatCurrency(condor.maxLoss)}</span>
            <span className="type-label text-muted-foreground">max loss</span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-positive">{formatCurrency(condor.maxGain)}</span>
            <span className="type-label text-muted-foreground">max gain</span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong tabular-nums text-foreground">
              {condor.lowerBreakeven.toFixed(0)}–{condor.upperBreakeven.toFixed(0)}
            </span>
            <span className="type-label text-muted-foreground">profit zone</span>
          </div>
        </div>
      </div>
    </div>
  )
}
