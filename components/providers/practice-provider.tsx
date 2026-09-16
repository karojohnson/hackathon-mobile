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
export type DialStop = 50 | 70 | 90

export interface ResolvedTrade {
  id: string
  symbol: string
  outcome: "win" | "loss" | "partial"
  axesCorrect: Axis[]
  axesMissed: Axis[]
  xpEarned: number
  finishedPrice: number
}

export interface PracticeState {
  currentScreen: ScreenId
  symbol: string
  chosenDirection: DirectionThesis | null
  dialStop: DialStop
  unlockedAxes: Axis[]
  xp: number
  level: number
  streak: number
  resolvedTrades: ResolvedTrade[]
  structuresEarned: string[]
}

interface PracticeContextValue extends PracticeState {
  goTo: (screen: ScreenId) => void
  setSymbol: (symbol: string) => void
  setDirection: (thesis: DirectionThesis) => void
  setDialStop: (stop: DialStop) => void
  unlockAxis: (axis: Axis) => void
  resolveTrade: (trade: Omit<ResolvedTrade, "id">) => void
}

const PracticeContext = React.createContext<PracticeContextValue | null>(null)

export const PRACTICE_STORAGE_KEY = "hackathon-practice-state-v1"

const XP_PER_LEVEL = 3000

const initialState: PracticeState = {
  currentScreen: "cold-start",
  symbol: "AAPL",
  chosenDirection: "rallies",
  dialStop: 70,
  unlockedAxes: ["direction"],
  xp: 2840,
  level: 7,
  streak: 6,
  resolvedTrades: [],
  structuresEarned: ["put-spread", "call-spread", "iron-condor", "straddle"],
}

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<PracticeState>(initialState)

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRACTICE_STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync read of localStorage on mount, not a derived-state loop
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }))
    } catch {
      // ignore malformed/unavailable storage — falls back to defaults
    }
  }, [])

  const skippedFirstWrite = React.useRef(false)
  React.useEffect(() => {
    if (!skippedFirstWrite.current) {
      skippedFirstWrite.current = true
      return
    }
    try {
      window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [state])

  const goTo = React.useCallback((screen: ScreenId) => {
    setState((prev) => ({ ...prev, currentScreen: screen }))
  }, [])

  const setSymbol = React.useCallback((symbol: string) => {
    setState((prev) => ({ ...prev, symbol }))
  }, [])

  const setDirection = React.useCallback((thesis: DirectionThesis) => {
    setState((prev) => ({ ...prev, chosenDirection: thesis }))
  }, [])

  const setDialStop = React.useCallback((stop: DialStop) => {
    setState((prev) => ({ ...prev, dialStop: stop }))
  }, [])

  const unlockAxis = React.useCallback((axis: Axis) => {
    setState((prev) =>
      prev.unlockedAxes.includes(axis) ? prev : { ...prev, unlockedAxes: [...prev.unlockedAxes, axis] }
    )
  }, [])

  const resolveTrade = React.useCallback((trade: Omit<ResolvedTrade, "id">) => {
    setState((prev) => {
      const totalXp = prev.xp + trade.xpEarned
      const levelsGained = Math.floor(totalXp / XP_PER_LEVEL)
      return {
        ...prev,
        resolvedTrades: [...prev.resolvedTrades, { ...trade, id: String(prev.resolvedTrades.length) }],
        xp: totalXp % XP_PER_LEVEL,
        level: prev.level + levelsGained,
        streak: trade.outcome === "loss" ? 0 : prev.streak + 1,
      }
    })
  }, [])

  const value = React.useMemo<PracticeContextValue>(
    () => ({ ...state, goTo, setSymbol, setDirection, setDialStop, unlockAxis, resolveTrade }),
    [state, goTo, setSymbol, setDirection, setDialStop, unlockAxis, resolveTrade]
  )

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>
}

export function usePractice() {
  const ctx = React.useContext(PracticeContext)
  if (!ctx) throw new Error("usePractice must be used within PracticeProvider")
  return ctx
}
