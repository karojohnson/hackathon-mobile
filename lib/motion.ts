import type { Transition } from "motion/react"

/**
 * Shared Motion (motion/react) transition presets. Keep this list short and
 * reach for one of these instead of inlining ad hoc transitions, so motion
 * feel stays consistent and easy to retune globally during the hackathon.
 */
export const transitions = {
  /** Quick UI feedback: toggles, selection state, small reveals. */
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
  /**
   * Tap acknowledgement on a selectable row or control — shorter than
   * `fast`, because a press that takes 150ms to register reads as lag
   * rather than as feedback. Chapter 2's selectable rows (ticker chips,
   * direction options, expiration rows, chain strikes) transitioned colour
   * only, so a tap on a row that was already selected did nothing at all.
   */
  press: { duration: 0.12, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
  /** Default for most page/element transitions. */
  standard: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
  /** Physical, springy motion for drags, chart reveals, number ticks. */
  spring: { type: "spring", stiffness: 400, damping: 32 } satisfies Transition,
  /** Bottom sheets / drawers sliding in from an edge. */
  sheet: { type: "spring", stiffness: 380, damping: 38 } satisfies Transition,
  /**
   * Numbers ticking up to a target. Longer and flatter than `standard`,
   * because a count-up read at spring speed is a blur rather than a number
   * you can watch arrive. Used imperatively via `animate()` on a motion
   * value, so callers must check `useReducedMotion()` themselves — the
   * `<MotionConfig reducedMotion="user">` in theme-provider.tsx only covers
   * declarative `<motion.*>` components.
   */
  countUp: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
} as const

export type TransitionName = keyof typeof transitions
