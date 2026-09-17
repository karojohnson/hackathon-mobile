import { CountUp } from "@/components/practice/count-up"
import { PayoffChart } from "@/components/practice/payoff-chart"
import { StrikeDial } from "@/components/practice/strike-dial"
import { StructureGlyph } from "@/components/practice/structure-glyph"
import { usePractice } from "@/components/providers/practice-provider"
import {
  expirationFor,
  ironCondorFor,
  strategyFor,
} from "@/data/mock-options-data"
import { practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { Check } from "@/lib/icons"

const AXES = ["Direction", "Duration", "Distance", "Volatility"] as const

export function DialInAllFourScreen() {
  const { symbol, strikeStep, setStrikeStep, expirationId } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const price = quote.price
  const expiration = expirationFor(expirationId)
  const condor = ironCondorFor(price, expiration.daysOut, strikeStep)
  /*
   * This tier is the iron condor whatever Direction said earlier — it's the
   * screen that shows all four axes open at once, and Figma draws it as a
   * condor. So the thesis is pinned to "flat" rather than read from state.
   *
   * strategyFor also supplies the axis windows, scanned across every width
   * the dial can reach rather than fitted to the current one. A narrow
   * condor and a wide one differ mostly in how much of the axis their
   * plateau covers, which is exactly the comparison a self-fitting axis
   * erases.
   */
  const strategy = strategyFor(price, expiration.daysOut, strikeStep, "flat")

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="type-title text-foreground">{symbol}</span>
          <span className="type-label truncate text-muted-foreground">
            {quote.name}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="type-body-strong text-foreground tabular-nums">
            {price.toFixed(2)}
          </span>
          <span
            className={
              quote.changePercent >= 0
                ? "type-label text-positive tabular-nums"
                : "type-label text-negative tabular-nums"
            }
          >
            {quote.changeAbs >= 0 ? "+" : ""}
            {quote.changeAbs.toFixed(2)} · {formatPercent(quote.changePercent)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {AXES.map((axis) => (
          <span
            key={axis}
            className="type-label inline-flex items-center gap-1 rounded-md bg-surface-glass-sunken px-2 py-1 tracking-wide text-muted-foreground uppercase"
          >
            {axis}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1">
          <CountUp
            to={strategy.pop}
            continuous
            className="type-hero text-foreground"
          />
          <span className="type-title text-muted-foreground">%</span>
        </div>
        <span className="type-body text-foreground">Chance this works</span>
        <span className="type-label text-muted-foreground">
          probability of profit
        </span>
      </div>

      <PayoffChart
        points={strategy.points}
        breakevens={strategy.breakevens}
        xDomain={strategy.xDomain}
        strikes={strategy.parts.map((leg) => leg.strike)}
        spot={price}
      />

      {/* All four legs, named. The two shorts are what the dial moves;
          the wings follow one strike out on each side, which is the whole
          reason the loss is capped. */}
      <StrikeDial
        track={strategy.track}
        value={strikeStep}
        onChange={setStrikeStep}
        xDomain={strategy.xDomain}
      />

      <div className="glass-card flex flex-col gap-2 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <StructureGlyph
            shape="iron-condor"
            className="size-5 shrink-0 text-positive"
          />
          <span className="type-body-strong text-foreground">Iron condor</span>
        </div>
        <span className="type-label text-muted-foreground">
          {condor.buyPutStrike}/{condor.sellPutStrike} put spread +{" "}
          {condor.sellCallStrike}/{condor.buyCallStrike} call spread ·{" "}
          {formatCurrency(condor.credit)} credit · expires {expiration.label}
        </span>
        {/*
          Names the lineage the strikes already carry. Both short legs come
          off the same `strikeStep` as the earlier screens, so this condor
          is the floor from the dial screen and the ceiling from the drill,
          sold together — but the readout above only shows four numbers,
          and nobody reading it for the first time is going to notice that
          two of them are their own. Saying it is the difference between a
          structure that arrives and one that adds up.
        */}
        <span className="type-label text-priority-gold">
          └ your {condor.sellPutStrike} floor and your {condor.sellCallStrike} ceiling, sold together
        </span>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="type-body-strong text-negative tabular-nums">
              {formatCurrency(condor.maxLoss)}
            </span>
            <span className="type-label text-muted-foreground">
              Most you can lose
            </span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong text-positive tabular-nums">
              {formatCurrency(condor.maxGain)}
            </span>
            <span className="type-label text-muted-foreground">
              Most you can make
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="type-body-strong text-foreground tabular-nums">
              {condor.lowerBreakeven.toFixed(0)}–
              {condor.upperBreakeven.toFixed(0)}
            </span>
            <span className="type-label text-muted-foreground">
              Profit zone
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {AXES.map((axis) => (
          <span
            key={axis}
            className="type-label inline-flex items-center gap-1.5 text-foreground"
          >
            <Check className="size-3.5 text-positive" />
            {axis}
          </span>
        ))}
      </div>
    </div>
  )
}
