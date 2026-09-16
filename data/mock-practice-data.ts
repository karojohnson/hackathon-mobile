import type { Axis } from "@/components/providers/practice-provider"
import type { StrategyId } from "@/data/mock-options-data"
import { watchlist } from "@/data/mock-market-data"

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
    symbol: "AAPL",
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
       */
      { date: "Sep 22", label: "Q4 earnings", chipLabel: "Earnings Tuesday · ± 7.2% move", axis: "direction", daysOut: 6 },
      { date: "Sep 29", label: "Index rebalance", chipLabel: "Index rebalance: forced buying", axis: "volatility", daysOut: 13 },
      { date: "Oct 2", label: "Product event", axis: "direction", daysOut: 16 },
      { date: "Oct 14", label: "Analyst day", axis: "distance", daysOut: 28 },
    ],
  },
  {
    symbol: "NVDA",
    impliedMovePercent: 9.2,
    events: [
      { date: "Oct 8", label: "Gap fill watch", chipLabel: "Gapped 9% on no news", axis: "distance", daysOut: 22 },
      { date: "Oct 22", label: "Q3 earnings", axis: "direction", daysOut: 36 },
    ],
  },
  {
    symbol: "AMZN",
    impliedMovePercent: 8.1,
    events: [
      { date: "Oct 6", label: "Elevated IV", chipLabel: "IV rank 71% · premium is rich", axis: "volatility", daysOut: 20 },
      { date: "Nov 19", label: "Q3 earnings", axis: "direction", daysOut: 64 },
    ],
  },
  {
    symbol: "TSLA",
    impliedMovePercent: 4.5,
    events: [
      { date: "Sep 29", label: "Delivery numbers", chipLabel: "Delivery numbers · Sep 29", axis: "duration", daysOut: 13 },
      { date: "Nov 5", label: "Q3 earnings", axis: "direction", daysOut: 50 },
    ],
  },
]

/**
 * The four symbols Chapter 2 practises on.
 *
 * These are real, well-known tickers, and their prices and names come
 * straight out of the shared `watchlist` that Prototype 1's dashboard uses
 * — so AAPL is quoted at the same number in both chapters. An earlier pass
 * used invented companies (ZNTH/ARVO/KLTR/MERD) to keep the flow from
 * reading as a recommendation; the "PRACTICE · simulated, nothing here
 * trades" banner on every screen already carries that, and made-up tickers
 * cost more in recognition than they bought in caution.
 */
export interface PracticeQuote {
  symbol: string
  name: string
  price: number
  changePercent: number
  changeAbs: number
}

export const PRACTICE_SYMBOLS = ["AAPL", "AMZN", "NVDA", "TSLA"] as const

export const PRACTICE_QUOTES: PracticeQuote[] = PRACTICE_SYMBOLS.map((symbol) => {
  const quote = watchlist.find((q) => q.symbol === symbol)
  if (!quote) throw new Error(`Practice symbol ${symbol} is missing from the shared watchlist`)
  return {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    changePercent: quote.changePercent,
    changeAbs: quote.changeAbs,
  }
})

/**
 * The ONLY way a Chapter 2 screen should get a price.
 *
 * Returns non-optionally on purpose. Every screen used to do
 * `watchlist.find(...)?.price ?? 100`, and when the symbol set changed that
 * lookup started missing on all nine call sites — the `?? 100` silently
 * matched one symbol's real price, so five screens looked correct while
 * quietly pricing every other symbol at 100, and Resolution's `?? 0`
 * rendered "finished at $0.00". A total return kills the fallback that made
 * a broken lookup render plausibly.
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
    id: "aapl-oct16",
    symbol: "AAPL",
    thesis: "Up, but under 6%, and calm.",
    structure: "iron condor",
    maxLoss: 320,
    resolvesOn: "Oct 16",
    direction: "up",
  },
  {
    id: "nvda-oct16",
    symbol: "NVDA",
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

/**
 * Trades that resolved before this session started.
 *
 * Chapter 2 opens on a customer six weeks in, not on an empty account — the
 * streak counter says 6, the record screen says 40 resolved trades, and the
 * XP bar sits at 2,840. "Resolved this week" on the Your-trades screen is
 * gated on there being resolved trades, so with an empty array the whole
 * section silently never rendered and the screen contradicted every
 * neighbouring one. These two are what the Figma frame shows.
 */
export interface PriorResolution {
  id: string
  symbol: string
  correct: number
  total: number
}

export const PRIOR_RESOLUTIONS: PriorResolution[] = [
  { id: "prior-tsla", symbol: "TSLA", correct: 4, total: 4 },
  { id: "prior-amzn", symbol: "AMZN", correct: 2, total: 4 },
]

/**
 * Every structure the cabinet on the record screen can hold.
 *
 * The glyph for each one lives in `components/practice/structure-glyph.tsx`,
 * keyed by this id — the Figma frames label a structure with its payoff
 * shape rather than its name, because a customer who can't yet say "jade
 * lizard" can still recognise the silhouette they have been looking at for
 * eight screens.
 */
export type StructureShape =
  | "put-spread"
  | "call-spread"
  | "iron-condor"
  | "straddle"
  | "strangle"
  | "covered-call"
  | "jade-lizard"
  | "butterfly"
  | "calendar"
  | "ratio-spread"
  | "broken-wing"
  | "collar"

/**
 * The options model and the certificate cabinet name the same structures
 * differently — `strategyFor` returns "long-strangle" where the cabinet
 * calls it "strangle". Lives here next to StructureShape rather than in a
 * screen: dial-in, open-trades and graduation all need it.
 */
export const GLYPH_FOR: Record<StrategyId, StructureShape> = {
  "put-spread": "put-spread",
  "call-spread": "call-spread",
  "iron-condor": "iron-condor",
  "long-strangle": "strangle",
}

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
  { id: "jade-lizard", label: "Jade lizard" },
  { id: "butterfly", label: "Butterfly" },
  { id: "calendar", label: "Calendar" },
  { id: "ratio-spread", label: "Ratio spread" },
  { id: "broken-wing", label: "Broken wing" },
  { id: "collar", label: "Collar" },
]

export function structureFor(id: string): StructureDef | undefined {
  return ALL_STRUCTURES.find((s) => s.id === id)
}

/**
 * The next structure the XP bar is paying toward. Surfaced on both the
 * payout screen ("90 XP to the jade lizard") and the record screen's
 * cabinet footer — a progress bar with nothing named at the end of it is
 * just a bar.
 */
export const NEXT_STRUCTURE_UNLOCK = {
  id: "jade-lizard" as StructureShape,
  label: "Jade lizard",
  sublabel: "a new structure to use",
  atXp: 3000,
}

/** The streak milestone the payout screen counts toward. */
export const NEXT_STREAK_MILESTONE = { label: "Ten Straight", at: 10 }

export interface CertificateDef {
  id: string
  label: string
  earnedOn: string
  shape: StructureShape
}

export const CERTIFICATES: CertificateDef[] = [
  { id: "defined-risk", label: "Defined Risk", earnedOn: "Sep 2", shape: "put-spread" },
  { id: "directional-trades", label: "Directional Trades", earnedOn: "Aug 18", shape: "covered-call" },
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

/**
 * Per-axis skill on the record screen. `n` is how many resolved trades
 * actually tested that axis — the Figma frame shows it as `(n=40)`, and it
 * is the number that makes a 48% read as "unproven" rather than "bad".
 */
export interface AxisRecord {
  id: Axis
  label: string
  sublabel: string
  value: number
  tier: "SHARP" | "SOLID" | "DEVELOPING" | "UNPROVEN"
  n: number
}

export const AXIS_RECORDS: AxisRecord[] = [
  { id: "direction", label: "Direction", sublabel: "delta", value: 71, tier: "SHARP", n: 40 },
  { id: "duration", label: "Duration", sublabel: "theta · expiration", value: 66, tier: "SOLID", n: 40 },
  { id: "distance", label: "Distance", sublabel: "strike selection", value: 54, tier: "DEVELOPING", n: 31 },
  { id: "volatility", label: "Volatility", sublabel: "vega · IV at entry", value: 48, tier: "UNPROVEN", n: 19 },
]

/**
 * How many expirations are open at each tier. Duration is the tier that
 * unlocks the picker, and it opens two of the three — the far-dated one
 * stays behind the next tier so the unlock has somewhere left to go.
 */
export const DURATION_TIER_EXPIRATIONS = 2

/**
 * The options-approval level this chapter is arguing the customer up to.
 *
 * Deliberately NOT derived from the XP level. They are different systems:
 * XP is the game's, this one is the firm's, and the whole point of the
 * earned screen is that practice produces *evidence* for a review rather
 * than the upgrade itself. Deriving one from the other would quietly claim
 * the game grants the approval.
 */
export const OPTIONS_LEVEL = {
  from: 2,
  to: 3,
  detail: "long options → defined-risk spreads",
  submittedOn: "Sep 14",
}

/** Practice history the customer arrives with, before this session's trades. */
export const PRACTICE_HISTORY = { resolvedTrades: 40, since: "Aug 4" }
