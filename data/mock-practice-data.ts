import type { Axis } from "@/components/providers/practice-provider"

export interface CatalystEvent {
  date: string
  label: string
  axis: Axis
  daysOut: number
}

export interface SymbolCatalyst {
  symbol: string
  impliedMovePercent: number
  events: CatalystEvent[]
}

export const SYMBOL_CATALYSTS: SymbolCatalyst[] = [
  {
    symbol: "AAPL",
    impliedMovePercent: 6.5,
    events: [
      { date: "Sep 29", label: "Index rebalance", axis: "volatility", daysOut: 13 },
      { date: "Oct 2", label: "Investor day", axis: "direction", daysOut: 16 },
      { date: "Oct 30", label: "Q4 earnings", axis: "direction", daysOut: 44 },
    ],
  },
  {
    symbol: "TSLA",
    impliedMovePercent: 9.2,
    events: [
      { date: "Oct 8", label: "Delivery numbers", axis: "distance", daysOut: 22 },
      { date: "Oct 22", label: "Q3 earnings", axis: "direction", daysOut: 36 },
    ],
  },
  {
    symbol: "NVDA",
    impliedMovePercent: 8.1,
    events: [
      { date: "Oct 6", label: "GTC keynote", axis: "volatility", daysOut: 20 },
      { date: "Nov 19", label: "Q3 earnings", axis: "direction", daysOut: 64 },
    ],
  },
  {
    symbol: "COIN",
    impliedMovePercent: 11.4,
    events: [
      { date: "Oct 15", label: "Crypto volatility spike", axis: "volatility", daysOut: 29 },
      { date: "Nov 5", label: "Q3 earnings", axis: "direction", daysOut: 50 },
    ],
  },
]

export function catalystsFor(symbol: string): SymbolCatalyst {
  return SYMBOL_CATALYSTS.find((c) => c.symbol === symbol) ?? SYMBOL_CATALYSTS[0]
}

export type StructureShape =
  | "put-spread"
  | "call-spread"
  | "iron-condor"
  | "straddle"
  | "strangle"
  | "covered-call"

export interface StructureDef {
  id: StructureShape
  label: string
}

export const ALL_STRUCTURES: StructureDef[] = [
  { id: "put-spread", label: "Short put spread" },
  { id: "call-spread", label: "Short call spread" },
  { id: "iron-condor", label: "Iron condor" },
  { id: "straddle", label: "Straddle" },
  { id: "strangle", label: "Strangle" },
  { id: "covered-call", label: "Covered call" },
]

export interface CertificateDef {
  id: string
  label: string
  earnedOn: string
}

export const CERTIFICATES: CertificateDef[] = [
  { id: "defined-risk", label: "Defined Risk", earnedOn: "Sep 2" },
  { id: "directional-trades", label: "Directional Trades", earnedOn: "Aug 18" },
]

export const LOCKED_CERTIFICATE = { id: "volatility", label: "Volatility" }

export interface FeeUnlock {
  id: string
  label: string
  sublabel: string
  axis: Axis
  before: string
  after: string
}

export const FEE_UNLOCKS: FeeUnlock[] = [
  {
    id: "commission",
    label: "Commission, per opening contract",
    sublabel: "earned at the Distance tier",
    axis: "distance",
    before: "$1.00",
    after: "$0.65",
  },
  {
    id: "exercise",
    label: "Exercise and assignment",
    sublabel: "earned at the Duration tier",
    axis: "duration",
    before: "charged",
    after: "waived",
  },
  {
    id: "index-surcharge",
    label: "Index option surcharge",
    sublabel: "at the Volatility tier",
    axis: "volatility",
    before: "",
    after: "locked",
  },
]
