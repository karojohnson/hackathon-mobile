"use client"

import * as React from "react"

import { watchlist as allQuotes, type Position } from "@/data/mock-market-data"

export type ProductPreference = "stocks" | "options" | "etfs" | "predictions"

export interface PreferenceWeights {
  stocks: number
  options: number
  etfs: number
  predictions: number
}

export interface TodoFlags {
  fundedNeverTraded: boolean
  futuresNotEnabled: boolean
  twoFactorNotEnabled: boolean
  watchlistSkipped: boolean
}

export type OnboardingStep = "quiz" | "list" | "pickTrade"

export interface OnboardingState {
  interests: string[]
  watchlist: string[]
  positions: Position[]
  lastTradedSymbol: string | null
  quizDismissed: boolean
  /**
   * Which onboarding step to resume at — lives here (not local component
   * state) so it survives navigating away to a symbol page and back. The
   * onboarding overlay only ever unmounts/remounts when the route changes
   * away from "/" and back, which would otherwise reset a local step state
   * to "quiz" every time, even if the customer had reached "pickTrade".
   */
  onboardingStep: OnboardingStep
  preferenceWeights: PreferenceWeights
  todos: TodoFlags
  predictionsEnabled: boolean
}

interface OnboardingContextValue extends OnboardingState {
  setInterests: (ids: string[]) => void
  addToWatchlist: (symbols: string[]) => void
  dismissQuiz: () => void
  setOnboardingStep: (step: OnboardingStep) => void
  placeTrade: (symbol: string, quantity: number) => void
  setPreferenceWeights: (weights: PreferenceWeights) => void
  setTodoFlag: (key: keyof TodoFlags, value: boolean) => void
  enablePredictions: () => void
  dominantPreference: ProductPreference
}

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null)

const STORAGE_KEY = "hackathon-onboarding-state-v1"

const initialState: OnboardingState = {
  interests: [],
  watchlist: [],
  positions: [],
  lastTradedSymbol: null,
  quizDismissed: false,
  onboardingStep: "quiz",
  preferenceWeights: { stocks: 70, options: 15, etfs: 10, predictions: 5 },
  todos: {
    fundedNeverTraded: false,
    futuresNotEnabled: false,
    twoFactorNotEnabled: false,
    watchlistSkipped: false,
  },
  predictionsEnabled: false,
}

function dominantOf(weights: PreferenceWeights): ProductPreference {
  let best: ProductPreference = "stocks"
  let bestValue = -Infinity
  for (const key of Object.keys(weights) as ProductPreference[]) {
    if (weights[key] > bestValue) {
      bestValue = weights[key]
      best = key
    }
  }
  return best
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<OnboardingState>(initialState)

  // Demo mechanic requires state to survive a real browser reload (the
  // "change the numbers, reload the app" walkthrough) — read once on mount
  // (client-only, after hydration, to avoid an SSR mismatch), then keep
  // every change synced back to localStorage.
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync read of localStorage on mount, not a derived-state loop
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }))
    } catch {
      // ignore malformed/unavailable storage — falls back to defaults
    }
  }, [])

  // Skip the very first write: on mount this effect would otherwise fire
  // with the still-default `state` (the read-effect's merge above hasn't
  // caused a re-render yet) and clobber whatever was actually saved.
  const skippedFirstWrite = React.useRef(false)
  React.useEffect(() => {
    if (!skippedFirstWrite.current) {
      skippedFirstWrite.current = true
      return
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [state])

  const setInterests = React.useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, interests: ids }))
  }, [])

  const addToWatchlist = React.useCallback((symbols: string[]) => {
    setState((prev) => ({
      ...prev,
      watchlist: Array.from(new Set([...prev.watchlist, ...symbols])),
    }))
  }, [])

  const dismissQuiz = React.useCallback(() => {
    setState((prev) => ({ ...prev, quizDismissed: true }))
  }, [])

  const setOnboardingStep = React.useCallback((step: OnboardingStep) => {
    setState((prev) => ({ ...prev, onboardingStep: step }))
  }, [])

  const placeTrade = React.useCallback((symbol: string, quantity: number) => {
    const quote = allQuotes.find((q) => q.symbol === symbol)
    if (!quote) return
    const position: Position = {
      symbol: quote.symbol,
      name: quote.name,
      quantity,
      avgCost: quote.price,
      price: quote.price,
      marketValue: Number((quote.price * quantity).toFixed(2)),
      changePercent: 0,
    }
    setState((prev) => ({
      ...prev,
      positions: [...prev.positions.filter((p) => p.symbol !== symbol), position],
      lastTradedSymbol: symbol,
    }))
  }, [])

  const setPreferenceWeights = React.useCallback((weights: PreferenceWeights) => {
    setState((prev) => ({ ...prev, preferenceWeights: weights }))
  }, [])

  const setTodoFlag = React.useCallback((key: keyof TodoFlags, value: boolean) => {
    setState((prev) => ({ ...prev, todos: { ...prev.todos, [key]: value } }))
  }, [])

  const enablePredictions = React.useCallback(() => {
    setState((prev) => ({ ...prev, predictionsEnabled: true }))
  }, [])

  const value = React.useMemo<OnboardingContextValue>(
    () => ({
      ...state,
      setInterests,
      addToWatchlist,
      dismissQuiz,
      setOnboardingStep,
      placeTrade,
      setPreferenceWeights,
      setTodoFlag,
      enablePredictions,
      dominantPreference: dominantOf(state.preferenceWeights),
    }),
    [
      state,
      setInterests,
      addToWatchlist,
      dismissQuiz,
      setOnboardingStep,
      placeTrade,
      setPreferenceWeights,
      setTodoFlag,
      enablePredictions,
    ]
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const ctx = React.useContext(OnboardingContext)
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider")
  return ctx
}
