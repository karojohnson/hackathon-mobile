"use client"

import * as React from "react"

export type PrototypeId = 1 | 2

// The bottom-nav tab index for the "Practice" tab, i.e. Prototype 2 (Chapter 2).
export const PRACTICE_TAB_INDEX = 5

export const PROTOTYPE_STORAGE_KEY = "hackathon-active-prototype-v1"

export interface PrototypeContextValue {
  activeTab: number
  setActiveTab: (index: number) => void
  activePrototype: PrototypeId
  setActivePrototype: (prototype: PrototypeId) => void
}

const PrototypeContext = React.createContext<PrototypeContextValue | null>(null)

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState(0)

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)
      const parsed = raw === null ? NaN : Number.parseInt(raw, 10)
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 5) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync read of localStorage on mount, not a derived-state loop
        setActiveTab(parsed)
      }
    } catch {
      // ignore malformed/unavailable storage — falls back to the default tab
    }
  }, [])

  const skippedFirstWrite = React.useRef(false)
  React.useEffect(() => {
    if (!skippedFirstWrite.current) {
      skippedFirstWrite.current = true
      return
    }
    try {
      window.localStorage.setItem(PROTOTYPE_STORAGE_KEY, String(activeTab))
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [activeTab])

  const setActivePrototype = React.useCallback((prototype: PrototypeId) => {
    setActiveTab(prototype === 2 ? PRACTICE_TAB_INDEX : 0)
  }, [])

  const value = React.useMemo<PrototypeContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      activePrototype: activeTab === PRACTICE_TAB_INDEX ? 2 : 1,
      setActivePrototype,
    }),
    [activeTab, setActivePrototype]
  )

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
}

export function usePrototype() {
  const ctx = React.useContext(PrototypeContext)
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider")
  return ctx
}
