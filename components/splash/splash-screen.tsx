"use client"

import { motion } from "motion/react"
import { useTheme } from "next-themes"
import { cn } from "cn"

import type { PrototypeId } from "@/components/providers/prototype-provider"
import { transitions } from "@/lib/motion"

/**
 * Each prototype launches under its own brand: Chapter 1 is tastytrade,
 * Chapter 2 (Bites) is tastybites. File naming names the theme they're FOR,
 * not their own color: logo-dark.svg has a white wordmark (for dark
 * backgrounds), logo-light.svg has a black wordmark (for light ones).
 *
 * The widths differ because the two lockups carry different amounts of
 * mark: the tastytrade cherry is a big glyph next to its wordmark, while the
 * bites cookie is a small one, so matching the raw widths would leave the
 * bites wordmark reading smaller.
 */
const BRANDS = {
  1: { name: "tastytrade", slug: "logo", width: "w-56" },
  2: { name: "tastybites", slug: "logo-bites", width: "w-64" },
} satisfies Record<PrototypeId, { name: string; slug: string; width: string }>

export interface SplashScreenProps {
  /** Which prototype is launching — picks the brand shown. */
  prototype: PrototypeId
  /**
   * False while the active prototype is still unknown (see `hydrated` in
   * prototype-provider). The background covers the screen either way; only
   * the logo waits, so a reload straight into Bites never flashes the
   * tastytrade cherry for a frame before correcting itself.
   *
   * It also keeps the `src` off the server-rendered markup entirely, which
   * is what stops the theme from tripping a hydration mismatch: the server
   * has no idea whether it's rendering into a light or dark session, so it
   * would always guess dark and be corrected on the client in light mode.
   */
  logoReady: boolean
}

/**
 * App-launch splash — logo centered on the background, shown when a
 * prototype starts (see AppSplashGate, mounted at the layout level so it
 * doesn't re-trigger on client-side navigation between routes).
 */
export function SplashScreen({ prototype, logoReady }: SplashScreenProps) {
  const { resolvedTheme } = useTheme()
  const brand = BRANDS[prototype]
  const logoSrc = `/branding/${brand.slug}-${resolvedTheme === "light" ? "light" : "dark"}.svg`

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={transitions.standard}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, no need for next/image here */}
      <img
        src={logoReady ? logoSrc : undefined}
        alt={brand.name}
        className={cn(
          brand.width,
          "transition-opacity duration-200",
          logoReady ? "opacity-100" : "opacity-0"
        )}
      />
    </motion.div>
  )
}
