/**
 * Mocked options chain generator — no real options data source. Strikes are
 * derived from the underlying's mock quote price; premiums and deltas come
 * from a zero-rate Black-Scholes at the expiration's implied vol.
 *
 * Black-Scholes rather than a hand-tuned formula on purpose. The earlier
 * "intrinsic + decaying time value" fudge priced a 2.50-wide put spread at a
 * $0.13-$0.17 credit no matter which strike you sold, so every setting of
 * the dial produced roughly the same max gain against the same max loss —
 * the dial had no economic consequence and the payoff chart drew the same
 * picture at every stop. With a real pricing model the risk/reward falls out
 * on its own, and probability of profit becomes something the model reports
 * rather than something the control asserts.
 *
 * Still a prototype: zero rates, no skew, one vol per expiration, European
 * exercise.
 */
import { today } from "@/data/mock-market-data"

export type OptionType = "call" | "put"

export interface OptionExpiration {
  id: string
  label: string
  daysOut: number
  /** Percent, e.g. 41.2. */
  impliedVolatility: number
  cadence: "Weekly" | "Monthly"
}

const DAY_SECONDS = 86_400

/**
 * Implied vol slopes *down* with time, which looks backwards until you
 * remember the story: the lead symbol has earnings inside the week, so the
 * front expiration is bid up for the event and vol falls as you go out past
 * it. Values from Figma `06b The chain` (node 131:1024), mapped in order.
 *
 * The cadence labels are deliberately not Figma's. Its expirations are
 * 36/43/72 days out and read Monthly/Weekly/Monthly; ours are 7/14/30, where
 * the honest labels are two weeklies and the third-Friday monthly. Copying
 * Figma's order literally would put "Monthly" on a 7-day expiration.
 */
const EXPIRATION_SEED = [
  { daysOut: 7, impliedVolatility: 41.2, cadence: "Weekly" },
  { daysOut: 14, impliedVolatility: 38.8, cadence: "Weekly" },
  { daysOut: 30, impliedVolatility: 35.1, cadence: "Monthly" },
] as const

export const expirations: OptionExpiration[] = EXPIRATION_SEED.map((seed) => {
  const date = new Date((today + seed.daysOut * DAY_SECONDS) * 1000)
  return {
    id: `${seed.daysOut}d`,
    label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    daysOut: seed.daysOut,
    impliedVolatility: seed.impliedVolatility,
    cadence: seed.cadence,
  }
})

export function expirationFor(id: string): OptionExpiration {
  return expirations.find((e) => e.id === id) ?? expirations[0]
}

/** Vol as a decimal for the expiration nearest `daysOut`. */
function volFor(daysOut: number): number {
  let best = expirations[0]
  for (const e of expirations) {
    if (Math.abs(e.daysOut - daysOut) < Math.abs(best.daysOut - daysOut)) best = e
  }
  return best.impliedVolatility / 100
}

function strikeIncrement(price: number): number {
  if (price < 50) return 1
  if (price < 150) return 2.5
  if (price < 400) return 5
  return 10
}

function atmStrike(price: number): number {
  const increment = strikeIncrement(price)
  return Math.round(price / increment) * increment
}

/** Abramowitz & Stegun 7.1.26 — standard normal CDF, accurate to ~1e-7. */
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const poly =
    t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  const cdf = 1 - (poly * Math.exp((-x * x) / 2)) / Math.sqrt(2 * Math.PI)
  return x >= 0 ? cdf : 1 - cdf
}

function d1For(price: number, strike: number, daysOut: number): number {
  const t = Math.max(daysOut, 1) / 365
  const vol = volFor(daysOut)
  return (Math.log(price / strike) + 0.5 * vol * vol * t) / (vol * Math.sqrt(t))
}

function estimatePremium(price: number, strike: number, daysOut: number, type: OptionType): number {
  const t = Math.max(daysOut, 1) / 365
  const vol = volFor(daysOut)
  const d1 = d1For(price, strike, daysOut)
  const d2 = d1 - vol * Math.sqrt(t)
  const value =
    type === "call"
      ? price * normCdf(d1) - strike * normCdf(d2)
      : strike * normCdf(-d2) - price * normCdf(-d1)
  return Math.max(0.05, Number(value.toFixed(2)))
}

/** Absolute delta, 0–1. Calls use N(d1), puts N(-d1). */
function absDelta(price: number, strike: number, daysOut: number, type: OptionType): number {
  const d1 = d1For(price, strike, daysOut)
  return type === "call" ? normCdf(d1) : normCdf(-d1)
}

/**
 * Risk-neutral probability the underlying finishes above `level`.
 * Zero drift, so ln(S_T/S_0) ~ N(-σ²T/2, σ²T).
 */
function probAbove(price: number, level: number, daysOut: number): number {
  const t = Math.max(daysOut, 1) / 365
  const vol = volFor(daysOut)
  return normCdf((Math.log(price / level) - 0.5 * vol * vol * t) / (vol * Math.sqrt(t)))
}

/**
 * Half-width of the strike ladder the strategies select from, in increments.
 *
 * Has to clear `STRIKE_STEP_MAX + 1`: the binding case is an iron condor at
 * the furthest step, whose protective wing sits one strike beyond a short
 * leg that is already `STRIKE_STEP_MAX` out. At the old default of 3 the
 * wing indexed past the end of the array, which doesn't throw where it
 * happens — `strikes[9]` on a 7-element array is `undefined`, and the throw
 * lands a frame later reading `.strike` off it.
 */
const LADDER_SPAN = 7

/** How many strikes out of the money the short leg can sit. */
export const STRIKE_STEP_MIN = 1
export const STRIKE_STEP_MAX = 5

export interface OptionStrike {
  strike: number
  premium: number
}

/**
 * Strikes around the money, `span` increments either side, index `span`
 * always at the money. The chain screen wants the default seven.
 */
export function strikesFor(
  price: number,
  daysOut: number,
  type: OptionType,
  span = 3
): OptionStrike[] {
  const increment = strikeIncrement(price)
  const atm = atmStrike(price)
  const strikes: OptionStrike[] = []
  for (let offset = -span; offset <= span; offset++) {
    const strike = Number((atm + offset * increment).toFixed(2))
    if (strike <= 0) continue
    strikes.push({ strike, premium: estimatePremium(price, strike, daysOut, type) })
  }
  return strikes
}

export type StrategyId = "put-spread" | "call-spread" | "iron-condor" | "long-strangle"
export type DirectionThesis = "rallies" | "sellsOff" | "flat" | "outsized"

export interface PayoffPoint {
  strike: number
  value: number
}

export interface StrategyLeg {
  strike: number
  type: OptionType
  /** Sold legs collect premium; bought legs cap the risk (or are the trade, for a strangle). */
  role: "short" | "long"
}

export interface TrackStop {
  step: number
  /** The short (or, for a strangle, the bought) strike this step produces. */
  strike: number
  /** Companion strike on the same side, so the dial can show both legs. */
  wingStrike: number
  pop: number
}

export interface StrategyQuote {
  id: StrategyId
  /** Structure name, e.g. "Short put spread". */
  label: string
  /** Plain-English legs, e.g. "sell the 235 put, buy the 230 put". */
  legs: string
  parts: StrategyLeg[]
  /** Positive for a credit structure, negative for a debit one. */
  net: number
  isCredit: boolean
  maxGain: number
  maxLoss: number
  /** True when the upside is uncapped and `maxGain` is only the charted ceiling. */
  openEndedGain: boolean
  breakevens: number[]
  /** Model probability of profit, 0–100 — derived, never asserted by the control. */
  pop: number
  popLabel: string
  popSublabel: string
  points: PayoffPoint[]
  /** Price bands where the structure makes money, for the chart's shaded zone. */
  profitZones: [number, number][]
  /**
   * Axis windows, deliberately scanned across every reachable step rather
   * than fitted to this step's own gain and loss. Holding them constant is
   * the whole point: it's what makes the payoff shape visibly slide and
   * flatten as you move the dial instead of being re-normalised back into
   * an identical picture.
   */
  xDomain: [number, number]
  yDomain: [number, number]
  /** Every step the dial can reach, so the track can be labelled with strikes. */
  track: TrackStop[]
}

function round2(n: number): number {
  return Number(n.toFixed(2))
}

function clampStep(step: number): number {
  return Math.min(STRIKE_STEP_MAX, Math.max(STRIKE_STEP_MIN, Math.round(step)))
}

export interface SpreadQuote {
  sellStrike: number
  buyStrike: number
  credit: number
  maxGain: number
  maxLoss: number
  breakeven: number
  probabilityOfProfit: number
}

/**
 * Short put spread. `step` is how many strikes below the money the short put
 * sits, so a bigger step means further out: less credit, more room to be
 * wrong. The protective wing is always one strike further out again.
 */
export function shortPutSpreadFor(price: number, daysOut: number, step: number): SpreadQuote {
  const increment = strikeIncrement(price)
  const sellStrike = round2(atmStrike(price) - clampStep(step) * increment)
  const buyStrike = round2(sellStrike - increment)
  const credit = round2(
    estimatePremium(price, sellStrike, daysOut, "put") - estimatePremium(price, buyStrike, daysOut, "put")
  )
  const breakeven = round2(sellStrike - credit)
  return {
    sellStrike,
    buyStrike,
    credit,
    maxGain: round2(credit * 100),
    maxLoss: round2((sellStrike - buyStrike - credit) * 100),
    breakeven,
    probabilityOfProfit: Math.round(probAbove(price, breakeven, daysOut) * 100),
  }
}

/** Mirror of `shortPutSpreadFor` for a bearish thesis: sell the call, buy the one above it. */
export function shortCallSpreadFor(price: number, daysOut: number, step: number): SpreadQuote {
  const increment = strikeIncrement(price)
  const sellStrike = round2(atmStrike(price) + clampStep(step) * increment)
  const buyStrike = round2(sellStrike + increment)
  const credit = round2(
    estimatePremium(price, sellStrike, daysOut, "call") - estimatePremium(price, buyStrike, daysOut, "call")
  )
  const breakeven = round2(sellStrike + credit)
  return {
    sellStrike,
    buyStrike,
    credit,
    maxGain: round2(credit * 100),
    maxLoss: round2((buyStrike - sellStrike - credit) * 100),
    breakeven,
    probabilityOfProfit: Math.round((1 - probAbove(price, breakeven, daysOut)) * 100),
  }
}

export interface IronCondorQuote {
  sellPutStrike: number
  buyPutStrike: number
  sellCallStrike: number
  buyCallStrike: number
  credit: number
  maxGain: number
  maxLoss: number
  lowerBreakeven: number
  upperBreakeven: number
  probabilityOfProfit: number
}

/** Iron condor — both short legs `step` strikes out, a wing one strike beyond each. */
export function ironCondorFor(price: number, daysOut: number, step: number): IronCondorQuote {
  const increment = strikeIncrement(price)
  const atm = atmStrike(price)
  const offset = clampStep(step) * increment
  const sellPutStrike = round2(atm - offset)
  const sellCallStrike = round2(atm + offset)
  const buyPutStrike = round2(sellPutStrike - increment)
  const buyCallStrike = round2(sellCallStrike + increment)
  const credit = round2(
    estimatePremium(price, sellPutStrike, daysOut, "put") -
      estimatePremium(price, buyPutStrike, daysOut, "put") +
      (estimatePremium(price, sellCallStrike, daysOut, "call") -
        estimatePremium(price, buyCallStrike, daysOut, "call"))
  )
  const lowerBreakeven = round2(sellPutStrike - credit)
  const upperBreakeven = round2(sellCallStrike + credit)
  return {
    sellPutStrike,
    buyPutStrike,
    sellCallStrike,
    buyCallStrike,
    credit,
    maxGain: round2(credit * 100),
    maxLoss: round2((increment - credit) * 100),
    lowerBreakeven,
    upperBreakeven,
    probabilityOfProfit: Math.round(
      (probAbove(price, lowerBreakeven, daysOut) - probAbove(price, upperBreakeven, daysOut)) * 100
    ),
  }
}

export interface StrangleQuote {
  putStrike: number
  callStrike: number
  debit: number
  maxLoss: number
  lowerBreakeven: number
  upperBreakeven: number
  probabilityOfProfit: number
}

/**
 * Long strangle for the "outsized move" thesis — the only debit structure of
 * the four, and the only one where a bigger step makes the trade *less*
 * likely to pay: further-out strikes are cheaper but need a larger move.
 * The screen says "chance it pays" rather than "chance this works" for
 * exactly that reason.
 */
export function longStrangleFor(price: number, daysOut: number, step: number): StrangleQuote {
  const increment = strikeIncrement(price)
  const atm = atmStrike(price)
  const offset = clampStep(step) * increment
  const putStrike = round2(atm - offset)
  const callStrike = round2(atm + offset)
  const debit = round2(
    estimatePremium(price, putStrike, daysOut, "put") + estimatePremium(price, callStrike, daysOut, "call")
  )
  const lowerBreakeven = round2(putStrike - debit)
  const upperBreakeven = round2(callStrike + debit)
  return {
    putStrike,
    callStrike,
    debit,
    maxLoss: round2(debit * 100),
    lowerBreakeven,
    upperBreakeven,
    probabilityOfProfit: Math.round(
      ((1 - probAbove(price, lowerBreakeven, daysOut)) + probAbove(price, upperBreakeven, daysOut)) * 100
    ),
  }
}

/** The price window each structure is charted in — constant across every step. */
function windowFor(price: number, thesis: DirectionThesis): [number, number] {
  const increment = strikeIncrement(price)
  const atm = atmStrike(price)
  const out = (STRIKE_STEP_MAX + 2) * increment
  const near = 2 * increment
  if (thesis === "rallies") return [round2(atm - out), round2(atm + near)]
  if (thesis === "sellsOff") return [round2(atm - near), round2(atm + out)]
  return [round2(atm - out), round2(atm + out)]
}

interface StrategyCore {
  id: StrategyId
  label: string
  legs: string
  parts: StrategyLeg[]
  net: number
  isCredit: boolean
  maxGain: number
  maxLoss: number
  openEndedGain: boolean
  breakevens: number[]
  pop: number
  popLabel: string
  popSublabel: string
  points: PayoffPoint[]
  profitZones: [number, number][]
  /** The short (or bought) strike this step produced, for the dial track. */
  anchorStrike: number
  wingStrike: number
}

const CREDIT_POP_LABEL = "Chance this works"
const CREDIT_POP_SUBLABEL = "probability of profit"

function coreFor(
  price: number,
  daysOut: number,
  step: number,
  thesis: DirectionThesis,
  xDomain: [number, number]
): StrategyCore {
  if (thesis === "sellsOff") {
    const s = shortCallSpreadFor(price, daysOut, step)
    return {
      id: "call-spread",
      label: "Short call spread",
      legs: `sell the ${s.sellStrike} call, buy the ${s.buyStrike} call`,
      parts: [
        { strike: s.sellStrike, type: "call", role: "short" },
        { strike: s.buyStrike, type: "call", role: "long" },
      ],
      net: s.credit,
      isCredit: true,
      maxGain: s.maxGain,
      maxLoss: s.maxLoss,
      openEndedGain: false,
      breakevens: [s.breakeven],
      pop: s.probabilityOfProfit,
      popLabel: CREDIT_POP_LABEL,
      popSublabel: CREDIT_POP_SUBLABEL,
      // Gain on the left, loss on the right — the mirror of the put spread.
      points: [
        { strike: xDomain[0], value: s.maxGain },
        { strike: s.sellStrike, value: s.maxGain },
        { strike: s.buyStrike, value: -s.maxLoss },
        { strike: xDomain[1], value: -s.maxLoss },
      ],
      profitZones: [[xDomain[0], s.breakeven]],
      anchorStrike: s.sellStrike,
      wingStrike: s.buyStrike,
    }
  }

  if (thesis === "flat") {
    const c = ironCondorFor(price, daysOut, step)
    return {
      id: "iron-condor",
      label: "Iron condor",
      legs: `${c.buyPutStrike}/${c.sellPutStrike} put spread + ${c.sellCallStrike}/${c.buyCallStrike} call spread`,
      parts: [
        { strike: c.buyPutStrike, type: "put", role: "long" },
        { strike: c.sellPutStrike, type: "put", role: "short" },
        { strike: c.sellCallStrike, type: "call", role: "short" },
        { strike: c.buyCallStrike, type: "call", role: "long" },
      ],
      net: c.credit,
      isCredit: true,
      maxGain: c.maxGain,
      maxLoss: c.maxLoss,
      openEndedGain: false,
      breakevens: [c.lowerBreakeven, c.upperBreakeven],
      pop: c.probabilityOfProfit,
      popLabel: CREDIT_POP_LABEL,
      popSublabel: CREDIT_POP_SUBLABEL,
      // Tent: loss on both wings, a plateau of gain between the short strikes.
      points: [
        { strike: xDomain[0], value: -c.maxLoss },
        { strike: c.buyPutStrike, value: -c.maxLoss },
        { strike: c.sellPutStrike, value: c.maxGain },
        { strike: c.sellCallStrike, value: c.maxGain },
        { strike: c.buyCallStrike, value: -c.maxLoss },
        { strike: xDomain[1], value: -c.maxLoss },
      ],
      profitZones: [[c.lowerBreakeven, c.upperBreakeven]],
      anchorStrike: c.sellPutStrike,
      wingStrike: c.sellCallStrike,
    }
  }

  if (thesis === "outsized") {
    const s = longStrangleFor(price, daysOut, step)
    // Uncapped both ways in theory; chart the payoff out to the window edges.
    const gainAtLowEdge = round2((s.lowerBreakeven - xDomain[0]) * 100)
    const gainAtHighEdge = round2((xDomain[1] - s.upperBreakeven) * 100)
    return {
      id: "long-strangle",
      label: "Long strangle",
      legs: `buy the ${s.putStrike} put, buy the ${s.callStrike} call`,
      parts: [
        { strike: s.putStrike, type: "put", role: "long" },
        { strike: s.callStrike, type: "call", role: "long" },
      ],
      net: -s.debit,
      isCredit: false,
      maxGain: Math.max(gainAtLowEdge, gainAtHighEdge),
      maxLoss: s.maxLoss,
      openEndedGain: true,
      breakevens: [s.lowerBreakeven, s.upperBreakeven],
      pop: s.probabilityOfProfit,
      popLabel: "Chance it pays",
      popSublabel: "needs a move past either breakeven",
      // Valley: paying out at both edges, the debit lost between the strikes.
      points: [
        { strike: xDomain[0], value: gainAtLowEdge },
        { strike: s.putStrike, value: -s.maxLoss },
        { strike: s.callStrike, value: -s.maxLoss },
        { strike: xDomain[1], value: gainAtHighEdge },
      ],
      profitZones: [
        [xDomain[0], s.lowerBreakeven],
        [s.upperBreakeven, xDomain[1]],
      ],
      anchorStrike: s.putStrike,
      wingStrike: s.callStrike,
    }
  }

  const s = shortPutSpreadFor(price, daysOut, step)
  return {
    id: "put-spread",
    label: "Short put spread",
    legs: `sell the ${s.sellStrike} put, buy the ${s.buyStrike} put`,
    parts: [
      { strike: s.buyStrike, type: "put", role: "long" },
      { strike: s.sellStrike, type: "put", role: "short" },
    ],
    net: s.credit,
    isCredit: true,
    maxGain: s.maxGain,
    maxLoss: s.maxLoss,
    openEndedGain: false,
    breakevens: [s.breakeven],
    pop: s.probabilityOfProfit,
    popLabel: CREDIT_POP_LABEL,
    popSublabel: CREDIT_POP_SUBLABEL,
    // Loss on the left, gain on the right.
    points: [
      { strike: xDomain[0], value: -s.maxLoss },
      { strike: s.buyStrike, value: -s.maxLoss },
      { strike: s.sellStrike, value: s.maxGain },
      { strike: xDomain[1], value: s.maxGain },
    ],
    profitZones: [[s.breakeven, xDomain[1]]],
    anchorStrike: s.sellStrike,
    wingStrike: s.buyStrike,
  }
}

/**
 * The one entry point the Chapter 2 dial screens should use. Maps the
 * Direction thesis to a structure, sizes it off the strike dial, and hands
 * back everything a screen needs: the numbers, the payoff polyline, the
 * fixed axis windows to draw it in, and every step the dial can reach so
 * the track can be labelled with real strike prices.
 */
export function strategyFor(
  price: number,
  daysOut: number,
  step: number,
  thesis: DirectionThesis
): StrategyQuote {
  const xDomain = windowFor(price, thesis)
  const steps: number[] = []
  for (let s = STRIKE_STEP_MIN; s <= STRIKE_STEP_MAX; s++) steps.push(s)

  const everyStep = steps.map((s) => coreFor(price, daysOut, s, thesis, xDomain))
  const lowestValue = Math.min(...everyStep.flatMap((c) => c.points.map((p) => p.value)))
  const highestValue = Math.max(...everyStep.flatMap((c) => c.points.map((p) => p.value)))
  const yDomain: [number, number] = [round2(lowestValue * 1.08), round2(highestValue * 1.08)]

  const core = everyStep[clampStep(step) - STRIKE_STEP_MIN]
  return {
    ...core,
    xDomain,
    yDomain,
    track: steps.map((s, i) => ({
      step: s,
      strike: everyStep[i].anchorStrike,
      wingStrike: everyStep[i].wingStrike,
      pop: everyStep[i].pop,
    })),
  }
}

export interface OptionStrikeDetailed extends OptionStrike {
  delta: number
}

/** Same strikes as `strikesFor`, with the model delta attached — used by the chain screen. */
export function strikesWithDeltaFor(
  price: number,
  daysOut: number,
  type: OptionType,
  span = 3
): OptionStrikeDetailed[] {
  return strikesFor(price, daysOut, type, span).map((s) => ({
    ...s,
    delta: Number(absDelta(price, s.strike, daysOut, type).toFixed(2)),
  }))
}

export { LADDER_SPAN }
