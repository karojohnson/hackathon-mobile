"use client"

import * as React from "react"
import { AnimatePresence } from "motion/react"

import { SplashScreen } from "@/components/splash/splash-screen"

const SPLASH_DURATION_MS = 3000

/**
 * Gates the rest of the app behind a 3-second splash. Mounted once at the
 * layout level (inside PhoneFrame, which persists across client-side route
 * changes in the App Router) so this only ever fires on a real page
 * load/refresh, not every time you navigate between routes.
 */
export function AppSplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>
      {!showSplash && children}
    </>
  )
}
