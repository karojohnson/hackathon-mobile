/**
 * Mocked "related news" per symbol. Headlines are generated from a small
 * template pool rather than hand-authored per ticker (24 symbols x 3
 * headlines is a lot to keep believable) — deterministic per symbol via a
 * simple string hash, so the same ticker always shows the same 3 items.
 */
import { today } from "./mock-market-data"

const DAY_SECONDS = 86_400

export interface NewsItem {
  id: string
  headline: string
  source: string
  timestamp: number // unix seconds
  thumbnailUrl?: string
}

const SOURCES = ["Reuters", "Bloomberg", "MarketWatch", "CNBC", "Barron's", "Yahoo Finance"]

const TEMPLATES: Array<(name: string) => string> = [
  (name) => `${name} shares climb as investors weigh growth outlook`,
  (name) => `What Wall Street is saying about ${name} this week`,
  (name) => `${name} updates guidance ahead of next earnings call`,
  (name) => `Analysts raise price targets on ${name}`,
  (name) => `${name} stock moves with broader market sentiment`,
  (name) => `${name} announces new product roadmap`,
]

const DAYS_AGO = [1, 2, 4]

/**
 * Real photos (Wikimedia Commons, verified reachable) for symbols where we've
 * bothered to hand-pick them — currently just AAPL, since sourcing 3 relevant
 * photos per ticker for all 24 mock symbols is its own project. Other symbols
 * fall back to the generic icon tile in RelatedNews.
 */
const THUMBNAILS_BY_SYMBOL: Record<string, string[]> = {
  AAPL: [
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Apple%2C_Dubai._Flagship_Retail_Store.jpg/330px-Apple%2C_Dubai._Flagship_Retail_Store.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Aerial_view_of_Apple_Park_dllu.jpg/330px-Aerial_view_of_Apple_Park_dllu.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Apple_iPhone_15_Pro.jpg/330px-Apple_iPhone_15_Pro.jpg",
  ],
}

function hashSymbol(symbol: string) {
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash * 31 + symbol.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function newsFor(symbol: string, name: string): NewsItem[] {
  const seed = hashSymbol(symbol)
  const thumbnails = THUMBNAILS_BY_SYMBOL[symbol]

  return DAYS_AGO.map((daysAgo, i) => {
    const templateIndex = (seed + i * 7) % TEMPLATES.length
    const sourceIndex = (seed + i * 5) % SOURCES.length

    return {
      id: `${symbol}-news-${i}`,
      headline: TEMPLATES[templateIndex](name),
      source: SOURCES[sourceIndex],
      timestamp: today - daysAgo * DAY_SECONDS,
      thumbnailUrl: thumbnails?.[i],
    }
  })
}
