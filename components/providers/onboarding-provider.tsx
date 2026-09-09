"use client"

import * as React from "react"

import { watchlist as allQuotes, type Position } from "@/data/mock-market-data"

export interface OnboardingState {
  interests: string[]
  watchlist: string[]
  positions: Position[]
  lastTradedSymbol: string | null
  quizDismissed: boolean
}

interface OnboardingContextValue extends OnboardingState {
  setInterests: (ids: string[]) => void
  addToWatchlist: (symbols: string[]) => void
  dismissQuiz: () => void
  placeTrade: (symbol: string, quantity: number) => void
}

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null)

const initialState: OnboardingState = {
  interests: [],
  watchlist: [],
  positions: [],
  lastTradedSymbol: null,
  quizDismissed: false,
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<OnboardingState>(initialState)

  const setInterests = React.useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, interests: ids }))
  }, [])

  const addToWatchlist = React.useCallback((symbols: string[]) => {
    setState((prev) => ({
      ...prev,
      watchlist: Array.from(new Set([...prev.watchlist, ...symbols])),
      quizDismissed: true,
    }))
  }, [])

  const dismissQuiz = React.useCallback(() => {
    setState((prev) => ({ ...prev, quizDismissed: true }))
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

  const value = React.useMemo<OnboardingContextValue>(
    () => ({ ...state, setInterests, addToWatchlist, dismissQuiz, placeTrade }),
    [state, setInterests, addToWatchlist, dismissQuiz, placeTrade]
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const ctx = React.useContext(OnboardingContext)
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider")
  return ctx
}
