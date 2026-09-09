/**
 * Mocked "client sentiment" and analyst-rating stand-ins for the pick-a-
 * trade cards — composition/decision-support signal, not real data.
 */
export type AnalystRating = "Strong Buy" | "Buy" | "Hold" | "Sell"
export type SentimentLabel = "Trending" | "Popular" | null

export interface SentimentInfo {
  rating: AnalystRating
  sentiment: SentimentLabel
}

const sentimentBySymbol: Record<string, SentimentInfo> = {
  AAPL: { rating: "Buy", sentiment: "Trending" },
  TSLA: { rating: "Hold", sentiment: "Trending" },
  NVDA: { rating: "Strong Buy", sentiment: "Trending" },
  MSFT: { rating: "Buy", sentiment: "Popular" },
  AMZN: { rating: "Buy", sentiment: "Popular" },
  SPY: { rating: "Hold", sentiment: null },
  JNJ: { rating: "Hold", sentiment: null },
  UNH: { rating: "Hold", sentiment: null },
  XOM: { rating: "Buy", sentiment: null },
  CVX: { rating: "Buy", sentiment: null },
  ABNB: { rating: "Hold", sentiment: "Trending" },
  DAL: { rating: "Buy", sentiment: null },
  COST: { rating: "Buy", sentiment: "Popular" },
  SBUX: { rating: "Hold", sentiment: null },
  JPM: { rating: "Buy", sentiment: null },
  V: { rating: "Buy", sentiment: "Popular" },
  PYPL: { rating: "Hold", sentiment: null },
  NFLX: { rating: "Strong Buy", sentiment: "Trending" },
  DIS: { rating: "Hold", sentiment: null },
  COIN: { rating: "Buy", sentiment: "Trending" },
  AMD: { rating: "Strong Buy", sentiment: "Trending" },
  UBER: { rating: "Buy", sentiment: "Popular" },
  KO: { rating: "Hold", sentiment: null },
  WMT: { rating: "Buy", sentiment: "Popular" },
}

const defaultSentiment: SentimentInfo = { rating: "Hold", sentiment: null }

export function sentimentFor(symbol: string): SentimentInfo {
  return sentimentBySymbol[symbol] ?? defaultSentiment
}
