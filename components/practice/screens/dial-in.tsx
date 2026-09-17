import { CountUp } from "@/components/practice/count-up"
import { PayoffChart } from "@/components/practice/payoff-chart"
import { StrikeDial } from "@/components/practice/strike-dial"
import { StructureGlyph } from "@/components/practice/structure-glyph"
import { usePractice } from "@/components/providers/practice-provider"
import { expirationFor, strategyFor } from "@/data/mock-options-data"
import { GLYPH_FOR, practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { Lock } from "@/lib/icons"

const THESIS_LABEL = {
  rallies: "up",
  sellsOff: "down",
  flat: "flat",
  outsized: "a big move",
} as const

const LOCKED_AXES = ["Duration", "Distance", "Volatility"] as const

export function DialInScreen() {
  const {
    symbol,
    strikeStep,
    setStrikeStep,
    chosenDirection,
    expirationId,
    unlockedAxes,
  } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const price = quote.price
  const expiration = expirationFor(expirationId)
  const thesis = chosenDirection ?? "rallies"
  const strategy = strategyFor(price, expiration.daysOut, strikeStep, thesis)

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

      <span className="type-label tracking-wide text-muted-foreground uppercase">
        Direction · you said {THESIS_LABEL[thesis]}
      </span>

      {/* Reported by the pricing model, not set by the dial. Drag a strike
          and this follows; it isn't a target you pick and then reverse
          into a position. */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1">
          <CountUp
            to={strategy.pop}
            continuous
            className="type-hero text-foreground"
          />
          <span className="type-title text-muted-foreground">%</span>
        </div>
        <span className="type-body text-foreground">{strategy.popLabel}</span>
        <span className="type-label text-muted-foreground">
          {strategy.popSublabel}
        </span>
      </div>

      <PayoffChart
        points={strategy.points}
        breakevens={strategy.breakevens}
        xDomain={strategy.xDomain}
        strikes={strategy.parts.map((leg) => leg.strike)}
        spot={price}
      />

      <StrikeDial
        track={strategy.track}
        value={strikeStep}
        onChange={setStrikeStep}
        xDomain={strategy.xDomain}
      />

      <div className="glass-card flex flex-col gap-2 rounded-lg p-4">
        <span className="type-label text-muted-foreground">dial it in</span>
        <div className="flex items-center gap-2">
          <StructureGlyph
            shape={GLYPH_FOR[strategy.id]}
            className="size-5 shrink-0 text-positive"
          />
          <span className="type-body-strong text-foreground">
            {strategy.label}
          </span>
        </div>
        <span className="type-label text-muted-foreground">
          {strategy.legs} · {formatCurrency(Math.abs(strategy.net))}{" "}
          {strategy.isCredit ? "credit" : "debit"} · expires {expiration.label}
        </span>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="type-body-strong text-negative tabular-nums">
              {formatCurrency(strategy.maxLoss)}
            </span>
            <span className="type-label text-muted-foreground">
              Most you can lose
            </span>
          </div>
          <div className="flex flex-col">
            <span className="type-body-strong text-positive tabular-nums">
              {strategy.openEndedGain
                ? "Uncapped"
                : formatCurrency(strategy.maxGain)}
            </span>
            <span className="type-label text-muted-foreground">
              Most you can make
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="type-body-strong text-foreground tabular-nums">
              {strategy.breakevens.map((b) => b.toFixed(2)).join(" / ")}
            </span>
            <span className="type-label text-muted-foreground">
              Break even at
            </span>
          </div>
        </div>
      </div>

      {/* The three axes still behind a padlock at this tier — the Figma
          frame keeps them on screen so the customer can see what the dial
          is *not* asking them about yet. */}
      <div className="flex flex-wrap items-center gap-2">
        {LOCKED_AXES.filter(
          (axis) => !unlockedAxes.includes(axis.toLowerCase() as never)
        ).map((axis) => (
          <span
            key={axis}
            className="type-label inline-flex items-center gap-1 rounded-md bg-surface-glass-sunken px-2 py-1 text-muted-foreground/70"
          >
            <Lock className="size-3" />
            {axis}
          </span>
        ))}
      </div>
    </div>
  )
}
