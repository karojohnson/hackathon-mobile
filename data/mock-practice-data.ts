import type { Axis } from "@/components/providers/practice-provider"

export interface CatalystEvent {
  date: string
  label: string
  /**
   * Beginner-facing version of `label` for the cold-start ticker chip: the
   * same technical term, plus a short gloss on why it moves the stock. The
   * bare `label` above stays terse because the briefing screen's calendar
   * shows it next to a date and a days-out count, where a gloss would
   * crowd the row.
   *
   * Kept under ~215px at type-label (12px) — the chip's label track is
   * 224px before it truncates.
   */
  chipLabel?: string
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
    symbol: "ZNTH",
    impliedMovePercent: 7.2,
    events: [
      /*
       * The lead symbol's nearest event is a Direction event on purpose.
       * Cold-start tags each chip with `events[0].axis`, and Direction is
       * the only axis unlocked at the start — so when every symbol's first
       * event was Volatility or Distance, the entry screen rendered four
       * padlocks and no open door, then sent the customer to the Direction
       * picker anyway. One unlocked chip plus three locked ones reads as
       * "here's one you can do now, three you'll grow into".
       *
       * Note this is where the build departs from Figma: the design authors
       * each cold-start chip's axis tag by hand, so its ZNTH calendar opens
       * on a Volatility rebalance while the chip still reads DIRECTION. We
       * derive the tag instead, so ZNTH leads with its earnings date.
       */
      { date: "Sep 22", label: "Q3 earnings", chipLabel: "Earnings Tuesday · ± 7.2% move", axis: "direction", daysOut: 6 },
      { date: "Sep 29", label: "Index rebalance", chipLabel: "Index rebalance: forced buying", axis: "volatility", daysOut: 13 },
      { date: "Oct 2", label: "Investor day", axis: "direction", daysOut: 16 },
      { date: "Oct 14", label: "Analyst day", axis: "distance", daysOut: 28 },
    ],
  },
  {
    symbol: "KLTR",
    impliedMovePercent: 9.2,
    events: [
      { date: "Oct 8", label: "Gap fill watch", chipLabel: "Gapped 9% on no news", axis: "distance", daysOut: 22 },
      { date: "Oct 22", label: "Q3 earnings", axis: "direction", daysOut: 36 },
    ],
  },
  {
    symbol: "ARVO",
    impliedMovePercent: 8.1,
    events: [
      { date: "Oct 6", label: "Elevated IV", chipLabel: "IV rank 71% · premium is rich", axis: "volatility", daysOut: 20 },
      { date: "Nov 19", label: "Q3 earnings", axis: "direction", daysOut: 64 },
    ],
  },
  {
    symbol: "MERD",
    impliedMovePercent: 4.5,
    events: [
      { date: "Sep 29", label: "Index rebalance", chipLabel: "Index rebalance · Sep 29", axis: "duration", daysOut: 13 },
      { date: "Nov 5", label: "Q3 earnings", axis: "direction", daysOut: 50 },
    ],
  },
]

/**
 * Quotes for the four Chapter 2 symbols, straight from the Figma file
 * (`01 Cold start`). These are invented companies on purpose — the practice
 * flow shouldn't read as a recommendation on a real ticker.
 *
 * Deliberately NOT added to `watchlist` in data/mock-market-data.ts: that
 * list feeds Prototype 1's dashboard and watchlist screens, and ZNTH has no
 * business showing up there. Chapter 2 is the only consumer, so the data
 * lives here with the rest of the Chapter 2 fixtures.
 */
export interface PracticeQuote {
  symbol: string
  name: string
  price: number
  changePercent: number
}

export const PRACTICE_QUOTES: PracticeQuote[] = [
  { symbol: "ZNTH", name: "Zenith Grid Holdings", price: 100.0, changePercent: 0.62 },
  { symbol: "ARVO", name: "Arvo Semiconductor", price: 64.18, changePercent: -1.1 },
  { symbol: "KLTR", name: "Kestrel Air Group", price: 212.4, changePercent: 0.34 },
  { symbol: "MERD", name: "Meridian Power", price: 38.75, changePercent: 2.06 },
]

/**
 * The ONLY way a Chapter 2 screen should get a price.
 *
 * Returns non-optionally on purpose. Every screen used to do
 * `watchlist.find(...)?.price ?? 100`, and when the symbols moved to the
 * invented set that lookup started missing on all nine call sites — the
 * `?? 100` silently matched ZNTH's real price, so five screens looked
 * correct while quietly pricing every other symbol at 100, and Resolution's
 * `?? 0` rendered "finished at $0.00". A total return kills the fallback
 * that made a broken lookup render plausibly.
 */
export function practiceQuoteFor(symbol: string): PracticeQuote {
  return PRACTICE_QUOTES.find((q) => q.symbol === symbol) ?? PRACTICE_QUOTES[0]
}

/**
 * Open positions on the "Your trades" screen, from the Figma frame
 * `03 Open trades`.
 *
 * `thesis` is the point of the screen: the four axes the customer dialled
 * in, handed back as one plain-English sentence. The two entries differ by
 * tier on purpose — the iron condor states all four axes, the short put
 * spread states one — so the progression is visible at a glance.
 */
export interface OpenTrade {
  id: string
  symbol: string
  thesis: string
  structure: string
  maxLoss: number
  /** Real calendar date. The design note on this frame reads "the slow clock, real calendar". */
  resolvesOn: string
  direction: "up" | "down"
}

export const OPEN_TRADES: OpenTrade[] = [
  {
    id: "znth-oct16",
    symbol: "ZNTH",
    thesis: "Up, but under 6%, and calm.",
    structure: "iron condor",
    maxLoss: 320,
    resolvesOn: "Oct 16",
    direction: "up",
  },
  {
    id: "kltr-oct16",
    symbol: "KLTR",
    thesis: "Up, at all.",
    structure: "short put spread",
    maxLoss: 350,
    resolvesOn: "Oct 16",
    direction: "up",
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
