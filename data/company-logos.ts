/**
 * Maps our mock tickers to TradingView's public per-company logo CDN
 * (same ecosystem as the Lightweight Charts we already use). Clearbit's
 * logo API — the more commonly reached-for option — is DNS-blocked on
 * this network, so this is the verified-working alternative. Most ETFs
 * have no single-company logo of their own; SPY uses its issuer's mark
 * (State Street Global Advisors) since one exists on this CDN, but that
 * won't hold for every ETF — fall back to a monogram for the rest.
 */
const logoSlugBySymbol: Record<string, string> = {
  AAPL: "apple",
  SPY: "state-street",
  TSLA: "tesla",
  NVDA: "nvidia",
  MSFT: "microsoft",
  AMZN: "amazon",
  JNJ: "johnson-and-johnson",
  UNH: "unitedhealth",
  XOM: "exxon",
  CVX: "chevron",
  ABNB: "airbnb",
  DAL: "delta-air-lines",
  COST: "costco-wholesale",
  SBUX: "starbucks",
  JPM: "jpmorgan-chase",
  V: "visa",
  PYPL: "paypal",
  NFLX: "netflix",
  DIS: "walt-disney",
  COIN: "coinbase",
  AMD: "advanced-micro-devices",
  UBER: "uber",
  KO: "coca-cola",
  WMT: "walmart",
}

export function logoSlugFor(symbol: string): string | undefined {
  return logoSlugBySymbol[symbol]
}

export function logoUrlFor(symbol: string): string | undefined {
  const slug = logoSlugFor(symbol)
  return slug ? `https://s3-symbol-logo.tradingview.com/${slug}--big.svg` : undefined
}
