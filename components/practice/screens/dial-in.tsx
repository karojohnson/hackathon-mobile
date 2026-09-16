import { cn } from "cn"

import { DialSlider } from "@/components/practice/dial-slider"
import { PayoffChart } from "@/components/practice/payoff-chart"
import { usePractice } from "@/components/providers/practice-provider"
import { expirations, shortPutSpreadFor } from "@/data/mock-options-data"
import { practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrency } from "@/lib/format"

const THESIS_LABEL = {
  rallies: "up",
  sellsOff: "down",
  flat: "flat",
  outsized: "a big move",
} as const

// Interim: the model below is continuous now, but this screen still snaps to
// three stops. Left in place so the build stays green; the continuous drag is
// the unfinished half of this change.
const DIAL_STOPS: readonly number[] = [50, 70, 90]

export function DialInScreen() {
  const { symbol, dialStop, setDialStop, chosenDirection } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const price = quote.price
  const days = expirations[1].daysOut
  const spread = shortPutSpreadFor(price, days, dialStop)
  const thesisLabel = THESIS_LABEL[chosenDirection ?? "rallies"]
  const change = (price * quote.changePercent) / 100
  const up = quote.changePercent >= 0

  /*
   * Every stop priced up front, for two reasons: the chart's axis domains are
   * taken across all three so they hold still as you dial (otherwise the
   * curve re-normalises and never appears to move), and dragging the chart
   * handle snaps to whichever stop's strike is nearest the pointer, so the
   * handle and the slider are two controls over one value.
   */
  const allStops = DIAL_STOPS.map((stop) => ({
    stop,
    quote: shortPutSpreadFor(price, days, stop),
  }))
  const xMin = price * 0.88
  const xMax = price * 1.12
  const yMax = Math.max(...allStops.map((s) => s.quote.maxGain))
  const yMin = -Math.max(...allStops.map((s) => s.quote.maxLoss))

  function snapToNearestStop(strike: number) {
    const nearest = allStops.reduce((best, candidate) =>
      Math.abs(candidate.quote.sellStrike - strike) < Math.abs(best.quote.sellStrike - strike)
        ? candidate
        : best
    )
    if (nearest.stop !== dialStop) setDialStop(nearest.stop)
  }

  function stepStop(direction: -1 | 1) {
    const i = DIAL_STOPS.indexOf(dialStop)
    const next = DIAL_STOPS[Math.min(DIAL_STOPS.length - 1, Math.max(0, i + direction))]
    if (next !== dialStop) setDialStop(next)
  }

  return (
    <div className="flex flex-col gap-6">
      {/*
        Ticker header + tier question, from Figma nodes 26:134 / 26:142. The
        earlier version had only the symbol, one subtitle and a small price —
        no company name, no day change, and no "why now" chip. The chip is
        gold in the design; accent-blue here, since gold is the practice flag.
      */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="type-title text-foreground">{symbol}</span>
            <span className="type-label truncate text-muted-foreground">{quote.name}</span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="type-title tabular-nums text-foreground">{price.toFixed(2)}</span>
            <span className={cn("type-label tabular-nums", up ? "text-positive" : "text-negative")}>
              {up ? "+" : ""}
              {change.toFixed(2)} {up ? "+" : ""}
              {quote.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="type-label font-bold uppercase tracking-[1.6px] text-foreground">
            Direction
          </span>
          <span className="type-label text-muted-foreground/60">·</span>
          <span className="type-body text-muted-foreground">you said {thesisLabel}</span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-accent-blue px-2 py-1">
            <span aria-hidden className="size-1.5 rounded-full bg-accent-blue" />
            <span className="type-label text-accent-blue">why now</span>
          </span>
        </div>
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
          { strike: xMin, value: -spread.maxLoss },
          { strike: spread.buyStrike, value: -spread.maxLoss },
          { strike: spread.sellStrike, value: spread.maxGain },
          { strike: xMax, value: spread.maxGain },
        ]}
        xMin={xMin}
        xMax={xMax}
        yMin={yMin}
        yMax={yMax}
        profitFrom={spread.breakeven}
        handleAt={spread.breakeven}
        handleLabel={spread.sellStrike.toFixed(2)}
        onScrub={snapToNearestStop}
        onStep={stepStop}
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
