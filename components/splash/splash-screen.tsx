"use client"

import { motion } from "motion/react"
import { useTheme } from "next-themes"

import { transitions } from "@/lib/motion"

/**
 * App-launch splash — logo centered on the background, shown once per real
 * page load (see AppSplashGate, mounted at the layout level so it doesn't
 * re-trigger on client-side navigation between routes).
 */
export function SplashScreen() {
  const { resolvedTheme } = useTheme()
  // File naming names the theme they're FOR, not their own color:
  // logo-dark.svg has a white wordmark (for dark backgrounds), logo-light.svg
  // has a black wordmark (for light backgrounds).
  const logoSrc = resolvedTheme === "light" ? "/branding/logo-light.svg" : "/branding/logo-dark.svg"

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={transitions.standard}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, no need for next/image here */}
      <img src={logoSrc} alt="tastytrade" className="w-56" />
    </motion.div>
  )
}
