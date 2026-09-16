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

const DIAL_STOP_OFFSET: Record<50 | 70 | 90, number> = { 50: 0, 70: -1, 90: -2 }

/**
 * Short put spread sized off a target "chance this works" (50/70/90) — the
 * further OTM the short strike, the higher the displayed probability and
 * the smaller the credit. `strikesFor` already returns 7 strikes centered
 * on the money (offsets -3..3); index 3 is at-the-money.
 */
export function shortPutSpreadFor(
  price: number,
  daysOut: number,
  dialStop: 50 | 70 | 90
): SpreadQuote {
  const strikes = strikesFor(price, daysOut, "put")
  const atmIndex = 3
  const sellIndex = atmIndex + DIAL_STOP_OFFSET[dialStop]
  const buyIndex = Math.max(0, sellIndex - 1)
  const sell = strikes[sellIndex]
  const buy = strikes[buyIndex]
  const credit = Number((sell.premium - buy.premium).toFixed(2))
  return {
    sellStrike: sell.strike,
    buyStrike: buy.strike,
    credit,
    maxGain: Number((credit * 100).toFixed(2)),
    maxLoss: Number(((sell.strike - buy.strike - credit) * 100).toFixed(2)),
    breakeven: Number((sell.strike - credit).toFixed(2)),
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
