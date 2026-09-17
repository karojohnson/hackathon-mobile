"use client"

import * as React from "react"

import { CountUp } from "@/components/practice/count-up"
import { LegPills } from "@/components/practice/leg-pills"
import { PayoffChart } from "@/components/practice/payoff-chart"
import { StrikeDial } from "@/components/practice/strike-dial"
import { StructureGlyph } from "@/components/practice/structure-glyph"
import {
  expirationFor,
  shortPutSpreadFor,
  strategyFor,
  type DirectionThesis,
} from "@/data/mock-options-data"
import { practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrency } from "@/lib/format"

/**
 * Chart-and-dial bench. Every payoff structure the Chapter 2 dial can
 * produce, at mobile width, with nothing else on screen — a review surface
 * for the interaction itself, not a screen in the flow.
 *
 * Registered as a BARE_ROUTE in components/demo/demo-stage.tsx so it renders
 * full-page rather than inside the phone mockup.
 */

const SYMBOL = "AAPL"
const EXPIRATION = "14d"

const PANELS: { thesis: DirectionThesis; caption: string }[] = [
  { thesis: "rallies", caption: "Direction · you said up" },
  { thesis: "sellsOff", caption: "Direction · you said down" },
  { thesis: "flat", caption: "All four axes · you said flat" },
  { thesis: "outsized", caption: "Volatility · you said a big move" },
]

function DialPanel({
  thesis,
  caption,
}: {
  thesis: DirectionThesis
  caption: string
}) {
  const [step, setStep] = React.useState(2)
  const quote = practiceQuoteFor(SYMBOL)
  const expiration = expirationFor(EXPIRATION)
  const strategy = strategyFor(quote.price, expiration.daysOut, step, thesis)

  return (
    <div className="glass-card flex w-[390px] shrink-0 flex-col gap-5 rounded-2xl p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-body-strong text-foreground">
          {strategy.label}
        </span>
        <span className="type-label text-muted-foreground tabular-nums">
          {SYMBOL} {quote.price.toFixed(2)} · {expiration.label}
        </span>
      </div>
      <span className="type-label tracking-wide text-muted-foreground uppercase">
        {caption}
      </span>

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
        spot={quote.price}
      />

      <StrikeDial
        track={strategy.track}
        value={step}
        onChange={setStep}
        xDomain={strategy.xDomain}
      />

      <div className="flex items-start justify-between gap-2">
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
  )
}

/**
 * The Distance drill's Put spread card, on its own.
 *
 * Built from the same parts as the screen, so what is reviewed here is what
 * ships: one thumb moving a fixed 5-point spread between strike positions,
 * with the prose above and the pills below both reporting where it landed.
 * The width never changes, so the learner is only ever answering how far
 * away to place the trade.
 */
function PutSpreadCard() {
  const [step, setStep] = React.useState(2)
  const quote = practiceQuoteFor(SYMBOL)
  const expiration = expirationFor(EXPIRATION)
  const spread = shortPutSpreadFor(quote.price, expiration.daysOut, step)
  const strategy = strategyFor(quote.price, expiration.daysOut, step, "rallies")

  return (
    <div className="flex w-[390px] shrink-0 flex-col gap-4">
      <div className="glass-card flex flex-col gap-3 rounded-lg p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StructureGlyph
              shape="put-spread"
              className="size-5 shrink-0 text-positive"
            />
            <span className="type-body-strong text-foreground">Put spread</span>
          </div>
          <span className="type-label text-muted-foreground">{SYMBOL}</span>
        </div>
        <span className="type-label text-muted-foreground">
          sell the {spread.sellStrike} put, buy the {spread.buyStrike} put ·
          expires {expiration.label}
        </span>
        <StrikeDial
          track={strategy.track}
          value={step}
          onChange={setStep}
          xDomain={strategy.xDomain}
        />
        <LegPills parts={strategy.parts} />
      </div>
    </div>
  )
}

export default function DialLabPage() {
  return (
    <div className="min-h-dvh bg-background p-8">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="type-title text-foreground">
            Payoff chart and strike dial
          </h1>
          <p className="type-body text-muted-foreground">
            Drag each dial. The chart height, the zero line and the now marker
            hold still; strikes, breakevens, the profitable range and the
            probability are the only things that move.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          {PANELS.map((panel) => (
            <DialPanel
              key={panel.thesis}
              thesis={panel.thesis}
              caption={panel.caption}
            />
          ))}
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <h2 className="type-body-strong text-foreground">
            Put spread card · strike selector
          </h2>
          <p className="type-body text-muted-foreground">
            The card from the Distance drill. One thumb moves the whole 5-point
            spread between strikes. The sentence above the rail and the pills
            below it are output; neither is draggable.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <PutSpreadCard />
        </div>
      </div>
    </div>
  )
}
