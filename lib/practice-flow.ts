import type { AxisResult, Axis, PracticeState, ResolvedTrade, ScreenId } from "@/components/providers/practice-provider"
import { expirationFor, shortPutSpreadFor } from "@/data/mock-options-data"
import { catalystsFor, practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrencyWhole } from "@/lib/format"

export const PRACTICE_SCREEN_ORDER: ScreenId[] = [
  "cold-start",
  "briefing",
  "direction",
  "dial-in",
  "open-trades",
  "resolution",
  "payout",
  "duration-unlock",
  "distance-drill",
  "dial-in-all-four",
  "chain",
  "record",
  "earned",
  "graduation",
]

/**
 * The screen before `id` in flow order, or null on the first one.
 *
 * Drives the shell's back control. Navigation only: it does not rewind an
 * unlock or a resolved trade, so stepping back and forward again re-applies
 * them rather than replaying the reveal.
 */
export function previousScreen(id: ScreenId): ScreenId | null {
  const index = PRACTICE_SCREEN_ORDER.indexOf(id)
  return index > 0 ? PRACTICE_SCREEN_ORDER[index - 1] : null
}

export interface PracticeFooterCta {
  label: string
  /**
   * Where the button goes, or omitted for one that acts on the current
   * screen and stays put (see `action`).
   */
  goTo?: ScreenId
  /**
   * A correction the button applies in place, instead of navigating.
   *
   * `snap-expiration` moves the expiration to the one the drill asked for,
   * which flips that screen's failing row to a check in front of the room.
   * The drill is the only screen designed to be failed, and the design
   * gives it two buttons for exactly that reason: the frame's `actions`
   * holds "Fix the date" and "Show me how". Shipping only the first told a
   * beginner they were wrong and handed them no way to learn why.
   *
   * `unlock-remaining-tiers` opens Distance and Volatility without walking
   * them, then travels on. It is what "you've opened up another challenge
   * to go through" means literally: the tier opens, the customer just
   * doesn't do it now. Granting is not optional decoration — the earned
   * screen gates its fee rows on `unlockedAxes`, so a skip that only
   * navigated would land on "Commission ... locked" and a header counting
   * two tiers, which is the opposite of what that screen is for.
   */
  action?: "snap-expiration" | "unlock-remaining-tiers"
  emphasis?: "primary" | "secondary"
}

export const PRACTICE_FOOTER_CTAS: Record<ScreenId, PracticeFooterCta[]> = {
  "cold-start": [{ label: "See what's coming", goTo: "briefing", emphasis: "primary" }],
  briefing: [{ label: "Pick a direction", goTo: "direction", emphasis: "primary" }],
  direction: [{ label: "Dial it in", goTo: "dial-in", emphasis: "primary" }],
  "dial-in": [{ label: "Make the trade", goTo: "open-trades", emphasis: "primary" }],
  /*
   * Deliberately empty, matching Figma frame `03 Open trades` — the only
   * frame in the chapter with no button at all. The trade card itself is
   * what opens the resolution, so the screen reads as "time passed, let's
   * see where this landed" rather than as one more step in a wizard.
   */
  "open-trades": [],
  resolution: [{ label: "See the payout", goTo: "payout", emphasis: "primary" }],
  payout: [{ label: "See what this unlocked", goTo: "duration-unlock", emphasis: "primary" }],
  "duration-unlock": [
    { label: "Set the window", goTo: "distance-drill", emphasis: "primary" },
    /*
     * The short path through the chapter, for a demo with less time than
     * the full fourteen screens: it leaves the Distance tier genuinely
     * open behind you and goes straight to the three closing screens that
     * make the argument — the record, what it earned, and the live ticket.
     */
    {
      label: "Skip ahead to your record",
      action: "unlock-remaining-tiers",
      goTo: "record",
      emphasis: "secondary",
    },
  ],
  "distance-drill": [
    { label: "Fix the date", goTo: "dial-in-all-four", emphasis: "primary" },
    { label: "Show me how", action: "snap-expiration", emphasis: "secondary" },
  ],
  "dial-in-all-four": [{ label: "Make the trade", goTo: "chain", emphasis: "primary" }],
  chain: [{ label: "See your record", goTo: "record", emphasis: "primary" }],
  record: [{ label: "See what this earned", goTo: "earned", emphasis: "primary" }],
  earned: [{ label: "Graduate", goTo: "graduation", emphasis: "primary" }],
  graduation: [
    { label: "Make the trade", goTo: "cold-start", emphasis: "primary" },
    { label: "Not yet, make another trade", goTo: "open-trades", emphasis: "secondary" },
  ],
}

export const AXIS_LABEL: Record<Axis, string> = {
  direction: "Direction",
  duration: "Duration",
  distance: "Distance",
  volatility: "Volatility",
}

export const AXIS_SUBLABEL: Record<Axis, string> = {
  direction: "delta",
  duration: "theta · expiration",
  distance: "strike selection",
  volatility: "vega · IV at entry",
}

/**
 * The plain-language question each axis actually asks, prefixed to the
 * greek on the tier ladder (Figma frame `05 Tier up`).
 *
 * Deliberately a second map rather than an edit to `AXIS_SUBLABEL`. The
 * design uses the bare greek on the resolution and payout scorecards,
 * where the customer has already met the axis and the row is a verdict,
 * and the expanded question only on the ladder that introduces all four as
 * a set. Folding them together would put "how far? · strike selection" on
 * a scorecard the design keeps terse, and would also rewrite the frozen
 * `components/practice/before/` snapshots that feed /compare.
 *
 * Note Direction is spelled out rather than given its short form. The
 * chapter's shorthand for it is "which way", but that string appears only
 * as a Figma layer name; the frame itself renders the expanded question.
 */
export const AXIS_QUESTION: Record<Axis, string> = {
  direction: "rally, sell off or flat?",
  duration: "by when?",
  distance: "how far?",
  volatility: "how wild?",
}

/** The ladder form: the question, then the greek behind it. */
export function axisLadderSublabel(axis: Axis): string {
  return `${AXIS_QUESTION[axis]} · ${AXIS_SUBLABEL[axis]}`
}

/** What each axis pays when it lands. Volatility is worth more: it's the last tier. */
const AXIS_XP: Record<Axis, number> = { direction: 20, duration: 20, distance: 20, volatility: 30 }

/**
 * The scripted move that decides every first-pass resolution: a gap far
 * larger than the implied move the briefing screen quoted. It has to
 * outrun the implied move for Distance to be a fair miss — the whole
 * lesson of the resolution screen is that being right about direction and
 * wrong about magnitude are two separate skills.
 */
const SCRIPTED_GAP_PERCENT = 11.0

/**
 * Deterministic mock scoring for the Resolution screen.
 *
 * Direction is the only axis the player actually chose — the rest are
 * auto-scored, matching the chapter's "we track all four axes from day
 * one, you just haven't been asked about three of them yet" mechanic.
 * Distance is the one that's meant to miss: it's the newest and hardest
 * axis, and it's the one the scripted gap is built to defeat, so the demo
 * tells the same story on every run.
 *
 * Note what this produces on the happy path: a scorecard that reads 3 of 4
 * on a trade that *made money*. The stock went the way the customer said
 * (Direction lands) but went much further than they sized for (Distance
 * misses), and a short put spread pays in full either way. That gap
 * between "the contract paid" and "your read was right" is the chapter's
 * argument, and the closing card says so out loud rather than pretending
 * a profitable trade was a clean one.
 */
export function computeResolution(state: PracticeState): Omit<ResolvedTrade, "id"> {
  const quote = practiceQuoteFor(state.symbol)
  const catalyst = catalystsFor(state.symbol)
  const expiration = expirationFor(state.expirationId)
  const spread = shortPutSpreadFor(quote.price, expiration.daysOut, state.strikeStep)

  const trendUp = quote.changePercent >= 0
  // Mirrors direction.tsx's displayed default, and guards against a stale
  // persisted null from an earlier session's localStorage.
  const thesis = state.chosenDirection ?? "rallies"
  const directionCorrect =
    thesis === "flat" ||
    thesis === "outsized" ||
    (thesis === "rallies" && trendUp) ||
    (thesis === "sellsOff" && !trendUp)

  const gapPercent = trendUp ? SCRIPTED_GAP_PERCENT : -SCRIPTED_GAP_PERCENT
  const finishedPrice = Number((quote.price * (1 + gapPercent / 100)).toFixed(2))
  const leadEvent = catalyst.events[0]

  const axisResults: AxisResult[] = [
    {
      axis: "direction",
      correct: directionCorrect,
      xp: directionCorrect ? AXIS_XP.direction : 0,
      note: directionCorrect
        ? undefined
        : `You said it would ${thesis === "sellsOff" ? "sell off" : "rally"}. It did the opposite.`,
    },
    { axis: "duration", correct: true, xp: AXIS_XP.duration },
    {
      axis: "distance",
      correct: false,
      xp: 0,
      note: `Implied move was ${catalyst.impliedMovePercent}%. You set the floor at ${spread.sellStrike}. It moved ${Math.abs(gapPercent).toFixed(1)}%.`,
    },
    { axis: "volatility", correct: true, xp: AXIS_XP.volatility },
  ]

  const correct = axisResults.filter((r) => r.correct)
  const missed = axisResults.filter((r) => !r.correct)
  const xpEarned = correct.reduce((sum, r) => sum + r.xp, 0)

  // The short put spread only loses if the underlying breaks *below* the
  // short strike, which on this script happens exactly when the customer
  // called the direction wrong.
  const floorHeld = directionCorrect

  return {
    symbol: state.symbol,
    outcome: missed.length === 0 ? "win" : correct.length === 0 ? "loss" : "partial",
    axisResults,
    xpEarned,
    finishedPrice,
    dayOfWindow: Math.max(1, expiration.daysOut - 2),
    windowDays: expiration.daysOut,
    gapNote: `gapped ${gapPercent > 0 ? "+" : ""}${gapPercent.toFixed(1)}% on ${leadEvent.date} ${leadEvent.label.toLowerCase()}`,
    verdictLine:
      missed.length === 0
        ? "All four paid."
        : missed.length === 1
          ? `${AXIS_LABEL[missed[0].axis]} was the miss.`
          : `${missed.length} axes missed.`,
    contractHeadline:
      missed.length === 0
        ? "The contract worked."
        : floorHeld
          ? "The contract paid. Your read didn't."
          : "The contract needed all four.",
    lossNote: floorHeld
      ? `Floor held at ${spread.sellStrike}. You kept the ${formatCurrencyWhole(spread.maxGain)} credit.`
      : `Floor breached. Max loss ${formatCurrencyWhole(spread.maxLoss)}.`,
  }
}
