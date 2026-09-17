import type { Axis } from "@/components/providers/practice-provider"
import type { StrategyId } from "@/data/mock-options-data"
import { dateLabelFor, watchlist } from "@/data/mock-market-data"

export interface CatalystEvent {
  /**
   * Derived from `daysOut` by `dateLabelFor`, never authored.
   *
   * These used to be hand-written strings sitting next to their own
   * days-out count. They were authored against a different anchor than
   * `today`, so all ten events were eight days out of step with the count
   * beside them, and the briefing calendar prints both in the same row.
   */
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
  /**
   * Axes this event informs, shown as tags on the briefing calendar (Figma
   * node 41:281). An array because a big catalyst moves more than one: Q3
   * earnings tells you direction, distance and volatility at once, which is
   * what makes it the event worth planning around.
   */
  informs: Axis[]
  daysOut: number
  /**
   * The focal event: accented row, accented date and days-out, and the only
   * row that carries a `note`. Set explicitly rather than inferred from
   * position, so reordering the calendar can't silently move the emphasis.
   */
  focus?: boolean
}

export interface SymbolCatalyst {
  symbol: string
  impliedMovePercent: number
  events: CatalystEvent[]
}

/**
 * Catalyst fixtures, minus the date: `date` is derived from `daysOut` below
 * so the two can never disagree.
 */
type CatalystSeed = Omit<CatalystEvent, "date">

interface SymbolCatalystSeed extends Omit<SymbolCatalyst, "events"> {
  events: CatalystSeed[]
}

/**
 * Three screens read `events[0]` and nothing else: the cold-start chip
 * takes its label from it, the Direction screen quotes it back as the
 * reason to have an opinion, and `computeResolution` scores the trade
 * against it. So `events[0]` carries a hard invariant:
 *
 *   1. It is the focal event (`focus: true`).
 *   2. It informs `direction`.
 *   3. It falls inside the 30 days the briefing header promises.
 *
 * Rule 2 is the one that used to hold for AAPL alone. Picking any other
 * symbol handed the Direction screen a catalyst for a padlocked axis — it
 * asked "what do you think happens?" underneath an IV reading — and left
 * the briefing with no accented row and no expiration note at all, because
 * both hang off `focus`. Every symbol now opens on a catalyst the customer
 * can actually have a view about, and keeps its signature signal on a
 * later row, where it becomes the reason to come back at a higher tier.
 */
const CATALYST_SEED: SymbolCatalystSeed[] = [
  {
    symbol: "AAPL",
    impliedMovePercent: 7.2,
    events: [
      {
        label: "Q4 earnings",
        chipLabel: "Earnings Tuesday · ± 7.2% move",
        informs: ["direction", "distance", "volatility"],
        daysOut: 6,
        focus: true,
      },
      { label: "Index rebalance", informs: ["volatility"], daysOut: 13 },
      { label: "Product event", informs: ["direction"], daysOut: 16 },
      { label: "Analyst day", informs: ["distance"], daysOut: 28 },
    ],
  },
  {
    symbol: "AMZN",
    impliedMovePercent: 8.1,
    events: [
      {
        label: "Analyst day",
        chipLabel: "Analyst day · guidance in play",
        informs: ["direction"],
        daysOut: 10,
        focus: true,
      },
      // The signature signal that used to lead here, and the reason AMZN is
      // worth reopening once the Volatility tier is unlocked.
      { label: "Elevated IV", informs: ["volatility"], daysOut: 20 },
      { label: "Q3 earnings", informs: ["direction", "distance", "volatility"], daysOut: 27 },
    ],
  },
  {
    symbol: "NVDA",
    impliedMovePercent: 9.2,
    events: [
      {
        label: "Product launch",
        chipLabel: "Product launch · ± 9.2% move",
        informs: ["direction", "volatility"],
        daysOut: 8,
        focus: true,
      },
      { label: "Gap fill watch", informs: ["distance"], daysOut: 22 },
      { label: "Q3 earnings", informs: ["direction", "distance", "volatility"], daysOut: 29 },
    ],
  },
  {
    symbol: "TSLA",
    impliedMovePercent: 4.5,
    events: [
      /*
       * Deliveries inform direction *and* duration: the number moves the
       * stock, and it lands on a date you can price a contract around.
       * That dual reading is why TSLA keeps its duration character here
       * without needing a padlocked axis to lead the calendar.
       */
      {
        label: "Delivery numbers",
        chipLabel: "Delivery numbers · ± 4.5% move",
        informs: ["direction", "duration"],
        daysOut: 13,
        focus: true,
      },
      { label: "Index rebalance", informs: ["volatility"], daysOut: 21 },
      { label: "Q3 earnings", informs: ["direction", "distance", "volatility"], daysOut: 28 },
    ],
  },
]

export const SYMBOL_CATALYSTS: SymbolCatalyst[] = CATALYST_SEED.map((catalyst) => ({
  ...catalyst,
  events: catalyst.events.map((event) => ({ ...event, date: dateLabelFor(event.daysOut) })),
}))

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
  /*
   * The Distance drill's debit spread. A shape, not a cabinet slot: it is
   * deliberately absent from ALL_STRUCTURES, which stays at twelve so the
   * record screen keeps its exact 2x6 grid. The drill teaches the ceiling,
   * it doesn't award a structure.
   */
  | "long-call-spread"
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
  "long-call-spread": "long-call-spread",
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
  /**
   * Rendered as locked even once its axis is open.
   *
   * Figma frame `07b What this earned` shows the index surcharge still
   * padlocked while the header above it counts four tiers complete: the
   * screen deliberately ends on something the customer *doesn't* get, which
   * is what sets up "what tiers do not unlock" underneath it.
   *
   * It needs saying out loud because it used to be true by accident. The
   * row's `after` was the literal string "locked" and Volatility had no
   * unlock point anywhere in the flow, so the row rendered locked because
   * the state was never reached. Once Volatility actually unlocks, that
   * accident produced an open padlock beside a green "locked".
   */
  stillLocked?: boolean
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
    after: "",
    stillLocked: true,
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

/**
 * The four signals on the "What's coming" briefing, from Figma node 122:263.
 *
 * These are the *inputs* a trader reads, each one feeding one of the four
 * axes — which is the teaching point, and why the row shows both: "Implied
 * move" is the thing you look at, "distance" is the decision it informs. An
 * earlier pass listed the axis names alone, which lost that pairing.
 *
 * A signal is open once its axis is unlocked; until then the row shows which
 * tier unlocks it.
 */
export interface SignalDef {
  id: string
  /** The signal itself, e.g. "Implied move". */
  label: string
  /** The axis this signal feeds. */
  informs: Axis
  /** Tier that unlocks it, shown as "tier N" while locked. */
  tier: number
}

export const SIGNALS: SignalDef[] = [
  { id: "catalyst-calendar", label: "Catalyst calendar", informs: "direction", tier: 1 },
  { id: "event-vs-expiration", label: "Event vs expiration", informs: "duration", tier: 2 },
  { id: "implied-move", label: "Implied move", informs: "distance", tier: 3 },
  { id: "iv-rank", label: "IV rank", informs: "volatility", tier: 4 },
]
