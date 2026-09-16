import type { Axis, PracticeState, ResolvedTrade, ScreenId } from "@/components/providers/practice-provider"
import { watchlist } from "@/data/mock-market-data"

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

export interface PracticeFooterCta {
  label: string
  goTo: ScreenId
  emphasis?: "primary" | "secondary"
}

export const PRACTICE_FOOTER_CTAS: Record<ScreenId, PracticeFooterCta[]> = {
  "cold-start": [{ label: "See what's coming", goTo: "briefing", emphasis: "primary" }],
  briefing: [{ label: "Pick a direction", goTo: "direction", emphasis: "primary" }],
  direction: [{ label: "Dial it in", goTo: "dial-in", emphasis: "primary" }],
  "dial-in": [{ label: "Make the trade", goTo: "open-trades", emphasis: "primary" }],
  "open-trades": [{ label: "See resolution", goTo: "resolution", emphasis: "primary" }],
  resolution: [{ label: "See the payout", goTo: "payout", emphasis: "primary" }],
  payout: [{ label: "See what this unlocked", goTo: "duration-unlock", emphasis: "primary" }],
  "duration-unlock": [{ label: "Set the window", goTo: "distance-drill", emphasis: "primary" }],
  "distance-drill": [{ label: "Fix the date", goTo: "dial-in-all-four", emphasis: "primary" }],
  "dial-in-all-four": [{ label: "Make the trade", goTo: "chain", emphasis: "primary" }],
  chain: [{ label: "See your record", goTo: "record", emphasis: "primary" }],
  record: [{ label: "See what this earned", goTo: "earned", emphasis: "primary" }],
  earned: [{ label: "Graduate", goTo: "graduation", emphasis: "primary" }],
  graduation: [
    { label: "Make the trade", goTo: "cold-start", emphasis: "primary" },
    { label: "Not yet — make another trade", goTo: "open-trades", emphasis: "secondary" },
  ],
}

/**
 * Deterministic mock scoring for the Resolution screen — Direction is the
 * only axis the player actually chose (the rest are auto-scored, matching
 * the source prototype's "we track all four axes from day one, you just
 * haven't been asked about three of them yet" mechanic). Distance is the
 * one that's "supposed" to miss on a first pass — it's the newest/hardest
 * axis — so the demo tells a consistent story across runs.
 */
export function computeResolution(state: PracticeState): Omit<ResolvedTrade, "id"> {
  const quote = watchlist.find((q) => q.symbol === state.symbol)
  const trendUp = (quote?.changePercent ?? 0) >= 0
  const directionCorrect =
    state.chosenDirection === "flat" ||
    state.chosenDirection === "outsized" ||
    (state.chosenDirection === "rallies" && trendUp) ||
    (state.chosenDirection === "sellsOff" && !trendUp)

  const axesCorrect: Axis[] = directionCorrect
    ? ["direction", "duration", "volatility"]
    : ["duration", "volatility"]
  const axesMissed: Axis[] = directionCorrect ? ["distance"] : ["direction", "distance"]

  const xpEarned = axesCorrect.length * 20

  return {
    symbol: state.symbol,
    outcome: axesMissed.length === 0 ? "win" : axesCorrect.length === 0 ? "loss" : "partial",
    axesCorrect,
    axesMissed,
    xpEarned,
    finishedPrice: quote?.price ?? 0,
  }
}
