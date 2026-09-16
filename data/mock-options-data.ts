/**
 * Mocked options chain generator — no real options data source. Strikes and
 * premiums are derived from the underlying's mock quote price with a simple
 * plausible-looking formula (intrinsic value + a decaying time-value term),
 * not a real pricing model. Good enough for a prototype "buy/sell options"
 * happy path, not for anything resembling real quotes.
 */
import { today } from "@/data/mock-market-data"

export type OptionType = "call" | "put"

export interface OptionExpiration {
  id: string
  label: string
  daysOut: number
}

export interface OptionStrike {
  strike: number
  premium: number
}

const DAY_SECONDS = 86_400

export const expirations: OptionExpiration[] = [7, 14, 30].map((daysOut) => {
  const date = new Date((today + daysOut * DAY_SECONDS) * 1000)
  return {
    id: `${daysOut}d`,
    label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    daysOut,
  }
})

function strikeIncrement(price: number): number {
  if (price < 50) return 1
  if (price < 150) return 2.5
  if (price < 400) return 5
  return 10
}

function estimatePremium(price: number, strike: number, daysOut: number, type: OptionType): number {
  const intrinsic = type === "call" ? Math.max(price - strike, 0) : Math.max(strike - price, 0)
  const distance = Math.abs(price - strike) / price
  const timeValue = price * 0.018 * Math.sqrt(daysOut / 30) * Math.exp(-distance * 6)
  return Math.max(0.05, Number((intrinsic + timeValue).toFixed(2)))
}

export function strikesFor(price: number, daysOut: number, type: OptionType): OptionStrike[] {
  const increment = strikeIncrement(price)
  const atm = Math.round(price / increment) * increment
  const offsets = [-3, -2, -1, 0, 1, 2, 3]
  return offsets.map((offset) => ({
    strike: Number((atm + offset * increment).toFixed(2)),
    premium: estimatePremium(price, atm + offset * increment, daysOut, type),
  }))
}

export interface SpreadQuote {
  sellStrike: number
  buyStrike: number
  credit: number
  maxGain: number
  maxLoss: number
  breakeven: number
}

/** Annualised vol for the mock underlyings. Prototype constant, not a quote. */
const MOCK_IV = 0.3

/** Probability range the dial spans, as whole percents. */
export const POP_MIN = 50
export const POP_MAX = 90

/**
 * Inverse normal CDF (Abramowitz & Stegun 26.2.23), accurate to ~4.5e-4 —
 * far beyond what a teaching prototype needs. Used to turn a target
 * probability into a strike distance in standard deviations.
 */
function normalQuantile(p: number): number {
  const tail = p > 0.5 ? 1 - p : p
  const t = Math.sqrt(-2 * Math.log(tail))
  const z =
    t -
    (2.515517 + 0.802853 * t + 0.010328 * t * t) /
      (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)
  return p > 0.5 ? z : -z
}

/**
 * Short put spread sized from a target probability of profit.
 *
 * Derived analytically rather than by stepping along a strike ladder. The
 * previous version picked strikes by index and read premiums off a decay
 * curve whose adjacent values barely differed, so a 2.5-wide spread came out
 * at $0.15 credit — $15 of max gain against $235 of max loss at 70%, a trade
 * nobody would take. That broke the one thing this screen teaches: that
 * buying a higher chance of winning costs you upside.
 *
 * The relationships here are the textbook ones, and they reproduce the
 * design's own readout exactly (Figma 26:128 — 100/95 spread, 2.50 credit,
 * $250 max gain, $250 max loss, breakeven 97.50, at 50%):
 *
 *   - short strike sits `z(pop)` standard deviations below spot, so it is
 *     at-the-money at 50% and further out as the probability climbs
 *   - credit ≈ width × (1 − pop): the market pays you the odds
 *   - max gain = credit, max loss = width − credit, breakeven = strike − credit
 *
 * `pop` is a whole percent and may be any value in [POP_MIN, POP_MAX] — the
 * dial is continuous, not three fixed stops.
 */
export function shortPutSpreadFor(price: number, daysOut: number, pop: number): SpreadQuote {
  const clamped = Math.min(POP_MAX, Math.max(POP_MIN, pop)) / 100
  const increment = strikeIncrement(price)
  const width = increment * 2

  const sigma = MOCK_IV * Math.sqrt(daysOut / 365)
  const sellStrike = Number(
    (Math.round((price * (1 - normalQuantile(clamped) * sigma)) / increment) * increment).toFixed(2)
  )
  const buyStrike = Number((sellStrike - width).toFixed(2))

  // Floor the credit so the deep-OTM end still shows a real (if small) payout
  // rather than collapsing to zero and making max gain read as $0.
  const credit = Number(Math.max(0.05, width * (1 - clamped)).toFixed(2))

  return {
    sellStrike,
    buyStrike,
    credit,
    maxGain: Number((credit * 100).toFixed(2)),
    maxLoss: Number(((width - credit) * 100).toFixed(2)),
    breakeven: Number((sellStrike - credit).toFixed(2)),
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
}

/** Iron condor — one strike in from at-the-money on each side, protective wing one strike further out. */
export function ironCondorFor(price: number, daysOut: number): IronCondorQuote {
  const puts = strikesFor(price, daysOut, "put")
  const calls = strikesFor(price, daysOut, "call")
  const atmIndex = 3
  const sellPut = puts[atmIndex - 1]
  const buyPut = puts[atmIndex - 2]
  const sellCall = calls[atmIndex + 1]
  const buyCall = calls[atmIndex + 2]
  const credit = Number(
    (sellPut.premium - buyPut.premium + (sellCall.premium - buyCall.premium)).toFixed(2)
  )
  const putWidth = sellPut.strike - buyPut.strike
  const callWidth = buyCall.strike - sellCall.strike
  return {
    sellPutStrike: sellPut.strike,
    buyPutStrike: buyPut.strike,
    sellCallStrike: sellCall.strike,
    buyCallStrike: buyCall.strike,
    credit,
    maxGain: Number((credit * 100).toFixed(2)),
    maxLoss: Number(((Math.max(putWidth, callWidth) - credit) * 100).toFixed(2)),
    lowerBreakeven: Number((sellPut.strike - credit).toFixed(2)),
    upperBreakeven: Number((sellCall.strike + credit).toFixed(2)),
  }
}

export interface OptionStrikeDetailed extends OptionStrike {
  delta: number
}

function estimateDelta(price: number, strike: number, type: OptionType): number {
  const distance = (strike - price) / price
  const raw = type === "call" ? 0.5 - distance * 2.4 : 0.5 + distance * 2.4
  return Math.max(0.02, Math.min(0.98, Number(raw.toFixed(2))))
}

/** Same strikes as `strikesFor`, with an approximate delta attached — used by the chain screen. */
export function strikesWithDeltaFor(
  price: number,
  daysOut: number,
  type: OptionType
): OptionStrikeDetailed[] {
  return strikesFor(price, daysOut, type).map((s) => ({
    ...s,
    delta: estimateDelta(price, s.strike, type),
  }))
}
