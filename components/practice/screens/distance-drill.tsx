import { DialSlider } from "@/components/practice/dial-slider"
import { usePractice } from "@/components/providers/practice-provider"
import { expirations, shortPutSpreadFor } from "@/data/mock-options-data"
import { practiceQuoteFor } from "@/data/mock-practice-data"
import { Check, X } from "@/lib/icons"

export function DistanceDrillScreen() {
  const { symbol, dialStop, setDialStop } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const price = quote.price
  const spread = shortPutSpreadFor(price, expirations[2].daysOut, dialStop)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="type-title text-foreground">Drill</h1>
        <p className="type-label text-muted-foreground">Distance tier · 3 of 5 · +15 XP each</p>
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-priority-blue-surface! p-4">
        <span className="type-label uppercase tracking-wide text-priority-blue">We think</span>
        <p className="type-body text-foreground">
          {symbol} drifts up, stays under ${spread.sellStrike.toFixed(0)}, and gets there by {expirations[2].label}.
        </p>
      </div>

      <div className="flex flex-col rounded-lg glass-card px-4">
        <div className="flex items-center justify-between border-b border-border py-2.5">
          <span className="type-body text-foreground">up</span>
          <Check className="size-5 text-positive" />
        </div>
        <div className="flex items-center justify-between border-b border-border py-2.5">
          <span className="type-body text-foreground">stays under ${spread.sellStrike.toFixed(0)}</span>
          <Check className="size-5 text-positive" />
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="type-body text-foreground">by {expirations[2].label}</span>
          <X className="size-5 text-negative" />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg glass-card p-4">
        <div className="flex items-center justify-between">
          <span className="type-body-strong text-foreground">Call spread</span>
          <span className="type-label text-muted-foreground">{symbol}</span>
        </div>
        {/* shortPutSpreadFor is a put-spread generator being reused here for a call spread;
            it returns buyStrike < sellStrike, so we sell the lower strike and buy the higher one. */}
        <span className="type-label text-muted-foreground">
          sell the {spread.buyStrike} call, buy the {spread.sellStrike} call · expires {expirations[2].label}
        </span>
        <DialSlider value={dialStop} onChange={setDialStop} />
      </div>
    </div>
  )
}
