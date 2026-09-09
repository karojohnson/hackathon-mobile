/**
 * Onboarding-quiz interest categories, each mapped to existing
 * mock-market-data.ts symbols — no new fake tickers. Categories are
 * disjoint (each symbol appears once) so building the curated watchlist is a
 * plain union, no de-dup logic needed.
 */
export interface Interest {
  id: string
  label: string
  blurb: string
  symbols: string[]
}

export const interests: Interest[] = [
  {
    id: "tech",
    label: "Tech companies",
    blurb: "The names building what's next.",
    symbols: ["NVDA", "MSFT"],
  },
  {
    id: "brands",
    label: "Brands you use",
    blurb: "Everyday names you already know.",
    symbols: ["AAPL", "AMZN"],
  },
  {
    id: "bold",
    label: "Bold bets",
    blurb: "Higher risk, higher swings.",
    symbols: ["TSLA"],
  },
  {
    id: "steady",
    label: "Steady & stable",
    blurb: "Broad and diversified, less drama.",
    symbols: ["SPY"],
  },
]

export function symbolsForInterests(ids: string[]): string[] {
  const picked = new Set<string>()
  for (const interest of interests) {
    if (ids.includes(interest.id)) {
      for (const symbol of interest.symbols) picked.add(symbol)
    }
  }
  return Array.from(picked)
}
