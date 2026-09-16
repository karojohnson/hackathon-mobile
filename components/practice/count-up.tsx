"use client"

import * as React from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { cn } from "cn"

import { transitions } from "@/lib/motion"

export interface CountUpProps {
  to: number
  from?: number
  /** Appended to the figure once it lands, e.g. "%". Counts as part of the text. */
  suffix?: string
  className?: string
}

/**
 * A number that ticks up to its target.
 *
 * Text is the one celebration channel that survives everything: it works
 * with transforms disabled, it needs no colour to be understood, and it is
 * the actual content rather than decoration around it. That makes a
 * count-up the right spine for the graduation screen's two hero figures,
 * where the claim being made — you have done this 14 times and been right
 * 71% of the time — is the whole reward.
 *
 * Drives a MotionValue imperatively, so unlike a declarative `<motion.*>`
 * it is NOT covered by `<MotionConfig reducedMotion="user">` and has to
 * check `useReducedMotion()` itself. With reduced motion on it sets the
 * final value immediately, which is correct: the figure is still there and
 * still says what it says.
 *
 * The motion value starts at the *target*, not at `from`, and is wound
 * back in a layout effect. That ordering matters on this screen: rendered
 * from zero, the server HTML reads "You have made this trade 0 times and
 * been right 0%" until hydration catches up — a false claim, on the one
 * screen that is asking someone to put real money behind it. Starting at
 * the target means the server and the no-JS fallback both state the true
 * figure, and the wind-back happens in `useLayoutEffect`, before the
 * browser paints, so the animation still plays from `from` with no flash.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

export function CountUp({ to, from = 0, suffix = "", className }: CountUpProps) {
  const reduced = useReducedMotion()
  const count = useMotionValue(to)
  const text = useTransform(count, (value) => `${Math.round(value).toLocaleString()}${suffix}`)

  useIsomorphicLayoutEffect(() => {
    if (reduced) {
      count.set(to)
      return
    }

    count.set(from)
    const controls = animate(count, to, transitions.countUp)
    return () => controls.stop()
  }, [count, from, reduced, to])

  return (
    <motion.span className={cn("tabular-nums", className)} aria-label={`${to}${suffix}`}>
      {text}
    </motion.span>
  )
}
