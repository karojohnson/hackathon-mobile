/**
 * Onboarding-quiz categories, each mapped to existing mock-market-data.ts
 * symbols — no fake tickers, real (mocked) quotes only. Modeled on how real
 * brokerages group symbols for discovery (GICS-style sectors, investing-style
 * screeners, thematic collections, market-cap/popularity lists). Deliberately
 * more subcategories than symbols-per-subcategory so the quiz feels varied,
 * and symbols repeat across subcategories/categories the way they would on a
 * real brokerage's browse page; the curated watchlist is then capped to a
 * fixed size (see curateWatchlist) regardless of how many were picked.
 */
import type { LucideIcon } from "lucide-react"
import { Landmark, ShoppingBag, Sparkles, TrendingUp, Zap } from "@/lib/icons"

export interface Subcategory {
  id: string
  label: string
  symbols: string[]
}

export interface Category {
  id: string
  label: string
  icon: LucideIcon
  subcategories: Subcategory[]
}

export const WATCHLIST_SIZE = 6

export const categories: Category[] = [
  {
    id: "sectors",
    label: "Sectors & Industries",
    icon: Landmark,
    subcategories: [
      { id: "technology", label: "Technology", symbols: ["AAPL", "MSFT", "NVDA", "AMD"] },
      { id: "financial-services", label: "Financial Services", symbols: ["JPM", "V", "PYPL"] },
      { id: "health-care", label: "Health Care", symbols: ["JNJ", "UNH"] },
      { id: "energy", label: "Energy", symbols: ["XOM", "CVX"] },
      { id: "consumer-staples", label: "Consumer Staples", symbols: ["KO", "WMT", "COST"] },
      { id: "communication-services", label: "Communication Services", symbols: ["DIS", "NFLX"] },
    ],
  },
  {
    id: "investing-style",
    label: "Investing Style",
    icon: TrendingUp,
    subcategories: [
      { id: "growth", label: "Growth", symbols: ["TSLA", "NVDA", "AMZN"] },
      { id: "value", label: "Value", symbols: ["JPM", "XOM", "WMT"] },
      { id: "dividend-income", label: "Dividend & Income", symbols: ["JNJ", "KO", "XOM"] },
      { id: "blue-chip", label: "Blue Chip & Stable", symbols: ["AAPL", "MSFT", "JNJ"] },
      { id: "high-risk", label: "High Risk, High Reward", symbols: ["TSLA", "COIN", "AMD"] },
      { id: "index-diversified", label: "Index & Diversified", symbols: ["SPY"] },
    ],
  },
  {
    id: "themes",
    label: "Themes & Innovation",
    icon: Sparkles,
    subcategories: [
      { id: "artificial-intelligence", label: "Artificial Intelligence", symbols: ["NVDA", "AMD", "MSFT"] },
      { id: "ev-clean-energy", label: "Electric Vehicles & Clean Energy", symbols: ["TSLA"] },
      { id: "crypto-digital-assets", label: "Crypto & Digital Assets", symbols: ["COIN"] },
      { id: "fintech-payments", label: "Fintech & Payments", symbols: ["PYPL", "V", "COIN"] },
      { id: "cloud-software", label: "Cloud & Software", symbols: ["MSFT", "AMZN"] },
    ],
  },
  {
    id: "consumer-lifestyle",
    label: "Consumer & Lifestyle",
    icon: ShoppingBag,
    subcategories: [
      { id: "retail-ecommerce", label: "Retail & E-Commerce", symbols: ["AMZN", "WMT", "COST"] },
      { id: "food-beverage", label: "Food & Beverage", symbols: ["KO", "SBUX"] },
      { id: "travel-leisure", label: "Travel & Leisure", symbols: ["ABNB", "DAL", "UBER"] },
      { id: "streaming-entertainment", label: "Streaming & Entertainment", symbols: ["NFLX", "DIS"] },
    ],
  },
  {
    id: "market-cap-popularity",
    label: "Market Cap & Popularity",
    icon: Zap,
    subcategories: [
      { id: "mega-cap", label: "Mega Cap Leaders", symbols: ["AAPL", "MSFT", "AMZN", "NVDA"] },
      { id: "large-cap", label: "Large Cap", symbols: ["JPM", "DIS", "NFLX", "V"] },
      { id: "small-mid-cap", label: "Small & Mid Cap", symbols: ["ABNB", "COIN", "DAL", "UBER"] },
      { id: "new-listings", label: "New Listings & IPOs", symbols: ["ABNB", "COIN", "UBER"] },
      { id: "most-popular", label: "Most Popular", symbols: ["AAPL", "TSLA", "NVDA", "AMZN"] },
    ],
  },
]

const allSubcategories = categories.flatMap((category) => category.subcategories)

export function symbolsForInterests(ids: string[]): string[] {
  const picked = new Set<string>()
  for (const subcategory of allSubcategories) {
    if (ids.includes(subcategory.id)) {
      for (const symbol of subcategory.symbols) picked.add(symbol)
    }
  }
  return Array.from(picked)
}

const allSymbolsInDefinitionOrder = allSubcategories.flatMap((s) => s.symbols)

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

/**
 * More options for the curated-list screen beyond the default curated set —
 * gives the customer a real, bigger pool to pick from rather than a
 * take-it-or-leave-it list of exactly WATCHLIST_SIZE.
 */
export function additionalChoices(alreadyIncluded: string[], count: number): string[] {
  const extra: string[] = []
  for (const symbol of allSymbolsInDefinitionOrder) {
    if (extra.length >= count) break
    if (!alreadyIncluded.includes(symbol) && !extra.includes(symbol)) extra.push(symbol)
  }
  return extra
}
