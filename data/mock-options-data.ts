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
