"use client"

import * as React from "react"

export type ScreenId =
  | "cold-start"
  | "briefing"
  | "direction"
  | "dial-in"
  | "open-trades"
  | "resolution"
  | "payout"
  | "duration-unlock"
  | "distance-drill"
  | "dial-in-all-four"
  | "chain"
  | "record"
  | "earned"
  | "graduation"

export type Axis = "direction" | "duration" | "distance" | "volatility"
export type DirectionThesis = "rallies" | "sellsOff" | "flat" | "outsized"

/**
 * One axis's verdict on a resolved trade.
 *
 * This replaced a pair of `axesCorrect`/`axesMissed` string arrays. Those
 * could say which axes paid but had nowhere to hang the two things the
 * Figma resolution frame leads with: what each axis was actually worth
 * (they aren't all 20 XP), and why the missed one missed. Splitting a
 * verdict across two arrays also meant every consumer re-derived the
 * ordering, and none of them agreed on it.
 */
export interface AxisResult {
  axis: Axis
  correct: boolean
  xp: number
  /** Why this axis missed, in the design's voice. Only set on a miss. */
  note?: string
}

export interface ResolvedTrade {
  id: string
  symbol: string
  outcome: "win" | "loss" | "partial"
  axisResults: AxisResult[]
  xpEarned: number
  finishedPrice: number
  /** "day 28 of your 30-day window" — the slow clock the chapter runs on. */
  dayOfWindow: number
  windowDays: number
  /** The move that decided it, e.g. "gapped +11.0% on Sep 22 earnings". */
  gapNote: string
  /** One-line verdict, e.g. "Distance was the miss." */
  verdictLine: string
  /** The closing card's headline, e.g. "The contract needed all four." */
  contractHeadline: string
  /** What it cost, e.g. "Top breached. Max loss $320." Empty on a clean win. */
  lossNote: string
}

export function axesCorrect(trade: ResolvedTrade): AxisResult[] {
  return trade.axisResults.filter((r) => r.correct)
}

export function axesMissed(trade: ResolvedTrade): AxisResult[] {
  return trade.axisResults.filter((r) => !r.correct)
}

export interface PracticeState {
  currentScreen: ScreenId
  symbol: string
  chosenDirection: DirectionThesis | null
  /**
   * How many strikes out of the money the short leg sits, 1 to 5. The dial
   * the customer drags moves this, and probability of profit is derived
   * from it rather than the other way round.
   *
   * One field for all four structures on purpose: it means the same thing
   * for a vertical, a condor and a strangle, so the control reads the same
   * way whichever Direction you picked. See `strategyFor`.
   */
  strikeStep: number
  /** The expiration selected on the Duration screen, id from `expirations`. */
  expirationId: string
  unlockedAxes: Axis[]
  xp: number
  level: number
  streak: number
  resolvedTrades: ResolvedTrade[]
  structuresEarned: string[]
}

interface PracticeContextValue extends PracticeState {
  goTo: (screen: ScreenId) => void
  /**
   * Steps back to whatever screen was actually visited last, returning
   * false when there is nothing to pop so the caller can fall back to
   * flow order.
   *
   * Flow order alone is wrong the moment the chapter is walked in
   * anything but a straight line. "Skip ahead to your record" jumps from
   * Duration to Record, and a back control reading the static order sent
   * you to the chain, a screen the presenter had just deliberately
   * skipped.
   */
  goBack: () => boolean
  setSymbol: (symbol: string) => void
  setDirection: (thesis: DirectionThesis) => void
  setStrikeStep: (step: number) => void
  setExpirationId: (id: string) => void
  unlockAxis: (axis: Axis) => void
  resolveTrade: (trade: Omit<ResolvedTrade, "id">) => void
}

const PracticeContext = React.createContext<PracticeContextValue | null>(null)

/*
 * Bumped to v4. v2 sessions hold `symbol: "ZNTH"`, which no longer exists
 * in PRACTICE_QUOTES since Chapter 2 moved to real tickers; v2 and v3 both
 * hold a dial field that no longer exists (`dialStop: 70`, then
 * `shortStrikeIndex`/`condorWidthIndex`). Either would hydrate over
 * `strikeStep` as a nonsense value, or leave it absent entirely and send
 * `strategyFor` a NaN step.
 *
 * Deliberately NOT bumped for the centred default below. Bumping would
 * make every existing session open on the middle stop, but it also throws
 * away that session's screen, XP and resolved trades, which resets the
 * prototype mid-demo. A fresh learner gets the centred default from
 * `initialState`; a returning session keeps where it was. The opening
 * state of the lesson is not worth someone's place in the flow.
 */
export const PRACTICE_STORAGE_KEY = "hackathon-practice-state-v4"

export const XP_PER_LEVEL = 3000

const initialState: PracticeState = {
  currentScreen: "cold-start",
  symbol: "AAPL",
  chosenDirection: "rallies",
  strikeStep: 2,
  expirationId: "14d",
  unlockedAxes: ["direction"],
  xp: 2840,
  level: 7,
  streak: 6,
  resolvedTrades: [],
  structuresEarned: ["put-spread", "call-spread", "iron-condor", "straddle"],
}

export interface PracticeProviderProps {
  children: React.ReactNode
  /**
   * Starting state, merged over the defaults. Only read on mount — later
   * changes to this object are ignored, same as React's own `defaultValue`.
   */
  seed?: Partial<PracticeState>
  /**
   * Whether this provider reads and writes `PRACTICE_STORAGE_KEY`. Defaults
   * to true (the live clickable prototype, which should survive a refresh).
   *
   * The screen gallery at /practice-screens mounts one provider per screen
   * on a single page, so it passes `false`: fourteen providers sharing one
   * storage key would race each other on every write and would also hydrate
   * away the per-tile `seed` — and worse, would overwrite whatever progress
   * the real prototype had saved just by opening the gallery.
   */
  persist?: boolean
}

export function PracticeProvider({
  children,
  seed,
  persist = true,
}: PracticeProviderProps) {
  const [state, setState] = React.useState<PracticeState>(() => ({
    ...initialState,
    ...seed,
  }))

  React.useEffect(() => {
    if (!persist) return
    try {
      const raw = window.localStorage.getItem(PRACTICE_STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync read of localStorage on mount, not a derived-state loop
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }))
    } catch {
      // ignore malformed/unavailable storage — falls back to defaults
    }
  }, [persist])

  const skippedFirstWrite = React.useRef(false)
  React.useEffect(() => {
    if (!persist) return
    if (!skippedFirstWrite.current) {
      skippedFirstWrite.current = true
      return
    }
    try {
      window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [state, persist])

  /*
   * Visited screens, most recent last. A ref rather than part of
   * `PracticeState` because it is navigation, not progress: it should not
   * be persisted, and a reload landing with an empty stack simply falls
   * back to flow order, which is the behaviour this replaces.
   *
   * `screenRef` mirrors the current screen so `goTo` can record what it is
   * leaving without depending on state, which would rebuild the callback
   * on every navigation.
   */
  const historyRef = React.useRef<ScreenId[]>([])
  const screenRef = React.useRef<ScreenId>(state.currentScreen)
  React.useEffect(() => {
    screenRef.current = state.currentScreen
  }, [state.currentScreen])

  const goTo = React.useCallback((screen: ScreenId) => {
    // Re-selecting the screen you are on is not a step you can go back from.
    if (screen !== screenRef.current) historyRef.current.push(screenRef.current)
    setState((prev) => ({ ...prev, currentScreen: screen }))
  }, [])

  const goBack = React.useCallback(() => {
    const previous = historyRef.current.pop()
    if (previous === undefined) return false
    setState((prev) => ({ ...prev, currentScreen: previous }))
    return true
  }, [])

  const setSymbol = React.useCallback((symbol: string) => {
    setState((prev) => ({ ...prev, symbol }))
  }, [])

  const setDirection = React.useCallback((thesis: DirectionThesis) => {
    setState((prev) => ({ ...prev, chosenDirection: thesis }))
  }, [])

  const setStrikeStep = React.useCallback((step: number) => {
    setState((prev) => ({ ...prev, strikeStep: step }))
  }, [])

  const setExpirationId = React.useCallback((id: string) => {
    setState((prev) => ({ ...prev, expirationId: id }))
  }, [])

  const unlockAxis = React.useCallback((axis: Axis) => {
    setState((prev) =>
      prev.unlockedAxes.includes(axis)
        ? prev
        : { ...prev, unlockedAxes: [...prev.unlockedAxes, axis] }
    )
  }, [])

  const resolveTrade = React.useCallback((trade: Omit<ResolvedTrade, "id">) => {
    setState((prev) => {
      const totalXp = prev.xp + trade.xpEarned
      const levelsGained = Math.floor(totalXp / XP_PER_LEVEL)
      return {
        ...prev,
        resolvedTrades: [
          ...prev.resolvedTrades,
          { ...trade, id: String(prev.resolvedTrades.length) },
        ],
        xp: totalXp % XP_PER_LEVEL,
        level: prev.level + levelsGained,
        streak: trade.outcome === "loss" ? 0 : prev.streak + 1,
      }
    })
  }, [])

  const value = React.useMemo<PracticeContextValue>(
    () => ({
      ...state,
      goTo,
      goBack,
      setSymbol,
      setDirection,
      setStrikeStep,
      setExpirationId,
      unlockAxis,
      resolveTrade,
    }),
    [
      state,
      goTo,
      goBack,
      setSymbol,
      setDirection,
      setStrikeStep,
      setExpirationId,
      unlockAxis,
      resolveTrade,
    ]
  )

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  )
}

export function usePractice() {
  const ctx = React.useContext(PracticeContext)
  if (!ctx) throw new Error("usePractice must be used within PracticeProvider")
  return ctx
}
