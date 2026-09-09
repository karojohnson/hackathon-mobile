/**
 * Realistic but entirely mocked prototype data. No live brokerage APIs are
 * involved — prices, histories, and positions below are fixed fixtures for
 * building screens against, not real market data.
 */

export interface ChartPoint {
  time: number // unix seconds (UTC), ascending
  value: number
}

export interface Quote {
  symbol: string
  name: string
  price: number
  changePercent: number
  changeAbs: number
  history: ChartPoint[]
}

export interface Position {
  symbol: string
  name: string
  quantity: number
  avgCost: number
  price: number
  marketValue: number
  changePercent: number
}

export interface ActivityItem {
  id: string
  type: "buy" | "sell" | "dividend" | "deposit"
  symbol?: string
  description: string
  amount: number
  date: string // ISO date
}

const DAY_SECONDS = 86_400
const today = Math.floor(new Date("2026-09-09T00:00:00Z").getTime() / 1000)

/** Deterministic seeded PRNG (mulberry32) so prototype data is stable across renders. */
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Deterministic pseudo-random walk with momentum, so it reads as a plausible
 * price series (short runs up/down) instead of a per-step sawtooth.
 */
function walk(seed: number, base: number, days: number, volatility: number): ChartPoint[] {
  const random = seededRandom(Math.floor(seed * 1000))
  const points: ChartPoint[] = []
  let value = base
  let momentum = 0
  for (let i = days; i >= 0; i--) {
    momentum = momentum * 0.75 + (random() - 0.5) * volatility
    value = Math.max(1, value + momentum)
    points.push({ time: today - i * DAY_SECONDS, value: Number(value.toFixed(2)) })
  }
  return points
}

export const watchlist: Quote[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 241.83,
    changePercent: 1.42,
    changeAbs: 3.39,
    history: walk(1.1, 228, 30, 1.8),
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 268.11,
    changePercent: -2.14,
    changeAbs: -5.87,
    history: walk(2.3, 282, 30, 3.4),
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 184.52,
    changePercent: 2.87,
    changeAbs: 5.15,
    history: walk(0.7, 165, 30, 2.6),
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 512.94,
    changePercent: 0.36,
    changeAbs: 1.84,
    history: walk(1.9, 498, 30, 2.1),
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 231.07,
    changePercent: -0.62,
    changeAbs: -1.44,
    history: walk(3.1, 236, 30, 1.9),
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    price: 618.4,
    changePercent: 0.21,
    changeAbs: 1.29,
    history: walk(0.4, 604, 30, 1.2),
  },
]

export const positions: Position[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 12,
    avgCost: 211.2,
    price: 241.83,
    marketValue: 2901.96,
    changePercent: 14.5,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    quantity: 25,
    avgCost: 142.6,
    price: 184.52,
    marketValue: 4613.0,
    changePercent: 29.4,
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    quantity: 8,
    avgCost: 589.1,
    price: 618.4,
    marketValue: 4947.2,
    changePercent: 5.0,
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    quantity: 6,
    avgCost: 297.4,
    price: 268.11,
    marketValue: 1608.66,
    changePercent: -9.85,
  },
]

export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "buy",
    symbol: "NVDA",
    description: "Bought 5 shares of NVDA",
    amount: -922.6,
    date: "2026-09-08",
  },
  {
    id: "act-2",
    type: "dividend",
    symbol: "AAPL",
    description: "Dividend payout",
    amount: 6.48,
    date: "2026-09-05",
  },
  {
    id: "act-3",
    type: "sell",
    symbol: "TSLA",
    description: "Sold 2 shares of TSLA",
    amount: 536.22,
    date: "2026-09-03",
  },
  {
    id: "act-4",
    type: "deposit",
    description: "Bank transfer deposit",
    amount: 500,
    date: "2026-09-01",
  },
]

export const portfolio = {
  totalValue: 14070.82,
  todayChange: 187.44,
  todayChangePercent: 1.35,
  buyingPower: 3420.11,
  history: walk(1.5, 13100, 90, 55),
}
