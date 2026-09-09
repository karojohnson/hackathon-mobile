/**
 * Onboarding-quiz interest categories, each mapped to existing
 * mock-market-data.ts symbols — no fake tickers, real (mocked) quotes only.
 * Deliberately more sectors than symbols-per-category so the quiz feels
 * varied; the curated watchlist is then capped to a fixed size (see
 * curateWatchlist) regardless of how many categories were picked.
 */
export type InterestTier = "vibe" | "sector"

export interface Interest {
  id: string
  label: string
  blurb: string
  symbols: string[]
  /** "vibe" = broad, risk/style-based; "sector" = a specific industry. Mix and match. */
  tier: InterestTier
}

export const WATCHLIST_SIZE = 6

export const interests: Interest[] = [
  {
    id: "brands",
    label: "Brands you use",
    blurb: "Everyday names you already know.",
    symbols: ["AAPL", "AMZN"],
    tier: "vibe",
  },
  {
    id: "bold",
    label: "Bold bets",
    blurb: "Higher risk, higher swings.",
    symbols: ["TSLA"],
    tier: "vibe",
  },
  {
    id: "steady",
    label: "Steady & stable",
    blurb: "Broad and diversified, less drama.",
    symbols: ["SPY"],
    tier: "vibe",
  },
  {
    id: "tech",
    label: "Tech companies",
    blurb: "The names building what's next.",
    symbols: ["NVDA", "MSFT"],
    tier: "sector",
  },
  {
    id: "healthcare",
    label: "Health & wellness",
    blurb: "Healthcare and pharma names.",
    symbols: ["JNJ", "UNH"],
    tier: "sector",
  },
  {
    id: "energy",
    label: "Energy",
    blurb: "Oil, gas, and the power grid.",
    symbols: ["XOM", "CVX"],
    tier: "sector",
  },
  {
    id: "travel",
    label: "Travel & leisure",
    blurb: "Getting people where they're going.",
    symbols: ["ABNB", "DAL"],
    tier: "sector",
  },
  {
    id: "everyday",
    label: "Everyday essentials",
    blurb: "Where you shop and grab coffee.",
    symbols: ["COST", "SBUX"],
    tier: "sector",
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

const allSymbolsInDefinitionOrder = interests.flatMap((i) => i.symbols)

/**
 * Always returns exactly WATCHLIST_SIZE symbols: prioritizes what actually
 * matched the picked interests, then fills any remaining slots from the
 * full catalog (in category-definition order) so a beginner always lands
 * on a full, personalized-feeling watchlist rather than a lopsided list of
 * 1-2 names.
 */
export function curateWatchlist(matchedSymbols: string[]): string[] {
  const result = matchedSymbols.slice(0, WATCHLIST_SIZE)
  if (result.length >= WATCHLIST_SIZE) return result

  for (const symbol of allSymbolsInDefinitionOrder) {
    if (result.length >= WATCHLIST_SIZE) break
    if (!result.includes(symbol)) result.push(symbol)
  }
  return result
}
