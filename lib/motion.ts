import type { Transition } from "motion/react"

/**
 * Shared Motion (motion/react) transition presets. Keep this list short and
 * reach for one of these instead of inlining ad hoc transitions, so motion
 * feel stays consistent and easy to retune globally during the hackathon.
 */
export const transitions = {
  /** Quick UI feedback: toggles, selection state, small reveals. */
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
  /** Default for most page/element transitions. */
  standard: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
  /** Physical, springy motion for drags, chart reveals, number ticks. */
  spring: { type: "spring", stiffness: 400, damping: 32 } satisfies Transition,
  /** Bottom sheets / drawers sliding in from an edge. */
  sheet: { type: "spring", stiffness: 380, damping: 38 } satisfies Transition,
} as const

export type TransitionName = keyof typeof transitions
