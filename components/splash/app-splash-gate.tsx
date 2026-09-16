"use client"

import * as React from "react"
import { AnimatePresence } from "motion/react"

import { SplashScreen } from "@/components/splash/splash-screen"
import { usePrototype } from "@/components/providers/prototype-provider"

const SPLASH_DURATION_MS = 3000

/**
 * Gates the rest of the app behind a 3-second splash, branded for whichever
 * prototype is starting. Mounted once at the layout level (inside
 * PhoneFrame, which persists across client-side route changes in the App
 * Router) so it only fires when a prototype actually launches: a real page
 * load/refresh, or the presenter toggle switching chapters. Tapping between
 * tabs inside the app doesn't replay it.
 */
export function AppSplashGate({ children }: { children: React.ReactNode }) {
  const { activePrototype, hydrated, launchCount } = usePrototype()
  const [showSplash, setShowSplash] = React.useState(true)

  // Replay on every launch. Resetting state during render (rather than in an
  // effect) is React's documented pattern for "a prop changed, start over" —
  // it re-renders before painting, so the app never flashes behind a splash
  // that's about to come back up.
  const [lastLaunch, setLastLaunch] = React.useState(launchCount)
  if (lastLaunch !== launchCount) {
    setLastLaunch(launchCount)
    setShowSplash(true)
  }

  React.useEffect(() => {
    if (!showSplash) {
      return
    }
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [showSplash, launchCount])

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen key="splash" prototype={activePrototype} logoReady={hydrated} />
        )}
      </AnimatePresence>
      {!showSplash && children}
    </>
  )
}
