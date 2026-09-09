import type { Quote } from "@/data/mock-market-data"

/**
 * Deterministically derived (not real) quote detail stats — a beginner-
 * relevant subset only: day/52-week range, open, and volume. Deliberately
 * excludes bid/ask/bid-size/ask-size/liquidity — market-microstructure
 * detail that's "too intense" for a first trade (per stakeholder call).
 */
export interface QuoteStats {
  open: number
  dayHigh: number
  dayLow: number
  week52High: number
  week52Low: number
  volume: number
}

export function deriveQuoteStats(quote: Quote): QuoteStats {
  const values = quote.history.map((h) => h.value)
  const rangeMin = Math.min(...values, quote.price)
  const rangeMax = Math.max(...values, quote.price)
  const prevClose = quote.price - quote.changeAbs

  const seed = quote.symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return {
    open: Number((prevClose + (quote.price - prevClose) * 0.4).toFixed(2)),
    dayHigh: Number((Math.max(quote.price, prevClose) * 1.006).toFixed(2)),
    dayLow: Number((Math.min(quote.price, prevClose) * 0.994).toFixed(2)),
    week52High: Number((rangeMax * 1.18).toFixed(2)),
    week52Low: Number((rangeMin * 0.82).toFixed(2)),
    volume: 4_000_000 + (seed % 30) * 1_200_000,
  }
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`
  return String(volume)
}
