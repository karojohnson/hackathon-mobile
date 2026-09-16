# Celebration recipes

Copy-adaptable React + Motion patterns for this prototype. Read
[`../SKILL.md`](../SKILL.md) first: these are the *how*, the skill file is the
*when*.

All of these assume the repo's existing setup:

```tsx
import { transitions } from "@/lib/motion"
import { motion } from "motion/react"
```

## A note on reduced motion in these snippets

`<MotionConfig reducedMotion="user">` in `components/theme-provider.tsx` handles
declarative `<motion.*>` components automatically: transform and layout
animations snap straight to their target value, while opacity and color
animations still play. You do not need to guard those by hand.

**It does not cover imperative `animate()` calls on a motion value.** The
count-up recipe below drives a `MotionValue` directly, so it checks
`useReducedMotion()` itself. Any recipe that animates imperatively must do the
same.

---

## 1. XP count-up

For the `payout` screen. Uses `.type-mono` so the figure does not reflow while
it counts.

```tsx
"use client"

import * as React from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"

export function XpCountUp({ from = 0, to }: { from?: number; to: number }) {
  const reduced = useReducedMotion()
  const count = useMotionValue(from)
  const text = useTransform(count, (v) => Math.round(v).toLocaleString())

  React.useEffect(() => {
    if (reduced) {
      count.set(to)
      return
    }

    const controls = animate(count, to, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    })

    return () => controls.stop()
  }, [count, reduced, to])

  return <motion.span className="type-mono tabular-nums">{text}</motion.span>
}
```

Why 0.9s and not a preset: count-ups need a longer, flatter curve than any of
the four presets provide. This is the documented exception. If you add a second
count-up, promote the curve into `lib/motion.ts` instead of copying it.

---

## 2. Level bar fill

Animates `scaleX`, never `width`. Layout-triggering properties jank on mobile
Safari.

```tsx
export function LevelBar({ xp, xpPerLevel }: { xp: number; xpPerLevel: number }) {
  const fraction = Math.min(1, xp / xpPerLevel)

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full origin-left rounded-full bg-positive"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: fraction }}
        transition={transitions.spring}
      />
    </div>
  )
}
```

Under reduced motion the bar appears already full rather than filling. That is
correct: the learner still sees the outcome. Pair it with the remainder label
from the `gamified-app` skill ("90 XP to the jade lizard") so the *meaning*
survives too.

---

## 3. Level-up overflow

When `resolveTrade()` pushes XP past `XP_PER_LEVEL`, the bar has to fill, empty,
and refill. Doing it in one step hides the level-up entirely.

```tsx
const LEVEL_UP_STAGES = { fill: 0.5, flip: 0.15, refill: 0.45 } as const

export function LevelUpBar({
  startXp,
  earnedXp,
  xpPerLevel,
}: {
  startXp: number
  earnedXp: number
  xpPerLevel: number
}) {
  const leveled = startXp + earnedXp >= xpPerLevel
  const remainder = (startXp + earnedXp) % xpPerLevel

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full origin-left rounded-full bg-positive"
        initial={{ scaleX: startXp / xpPerLevel }}
        animate={
          leveled
            ? { scaleX: [startXp / xpPerLevel, 1, 1, 0, remainder / xpPerLevel] }
            : { scaleX: (startXp + earnedXp) / xpPerLevel }
        }
        transition={
          leveled
            ? {
                duration:
                  LEVEL_UP_STAGES.fill + LEVEL_UP_STAGES.flip + LEVEL_UP_STAGES.refill,
                times: [0, 0.45, 0.55, 0.56, 1],
                ease: [0.16, 1, 0.3, 1],
              }
            : transitions.spring
        }
      />
    </div>
  )
}
```

The brief hold at `scaleX: 1` is what makes the level-up legible. Without it the
bar appears to reset for no reason.

---

## 4. Badge or structure reveal

For `earned`. This matches the existing treatment in
`components/trade/order-success.tsx`, deliberately: consistency across the two
success moments is worth more than novelty.

```tsx
<motion.div
  initial={{ scale: 0.6, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={transitions.spring}
  className="flex size-16 items-center justify-center rounded-full bg-positive/15"
>
  <Award className="size-8 text-positive" />
</motion.div>
```

Scale carries the pop, opacity carries the meaning. Under reduced motion the
scale is dropped and the fade still plays, so the badge still *arrives* rather
than having always been there.

Swap `--positive` for a `--priority-gold` pair when the badge is a rarity tier
rather than a pass/fail outcome.

---

## 5. Axis unlock

For `duration-unlock`, the most important reveal in chapter one. A locked chip
becomes live. Lead with color and opacity rather than transform, because this
one has to land even with Reduce Motion on.

```tsx
export function AxisChip({ axis, unlocked }: { axis: Axis; unlocked: boolean }) {
  return (
    <motion.button
      type="button"
      disabled={!unlocked}
      animate={{ opacity: unlocked ? 1 : 0.4 }}
      transition={transitions.standard}
      className={cn(
        "rounded-full border px-3 py-1.5 transition-colors",
        unlocked
          ? "border-positive/40 bg-positive/10 text-foreground"
          : "border-border bg-muted text-muted-foreground"
      )}
    >
      <span className="type-label">{AXIS_LABEL[axis]}</span>
      <span className="type-micro text-muted-foreground">{AXIS_SUBLABEL[axis]}</span>
    </motion.button>
  )
}
```

The chip is rendered at 0.4 opacity while locked, never removed from the DOM.
Per the `gamified-app` skill, hiding locked axes removes the ladder the learner
is climbing.

---

## 6. Confetti, no dependency

Reserve this for `graduation` only. It is the loudest thing in the app, so it
fires once per session at most.

```tsx
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

const PIECES = 14
const COLORS = ["var(--positive)", "var(--priority-gold)", "var(--priority-blue)"]

export function Confetti() {
  const reduced = useReducedMotion()
  const pieces = React.useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 240,
        rotate: (Math.random() - 0.5) * 360,
        delay: Math.random() * 0.15,
        color: COLORS[i % COLORS.length],
      })),
    []
  )

  if (reduced) {
    return null
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute left-1/2 top-1/3 size-2 rounded-[1px]"
          style={{ backgroundColor: piece.color }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: piece.x, y: 320, rotate: piece.rotate }}
          transition={{ duration: 1.1, delay: piece.delay, ease: [0.2, 0.6, 0.4, 1] }}
        />
      ))}
    </div>
  )
}
```

Fourteen pieces, not two hundred. On a 390px frame a dense burst reads as noise
and costs frames. `aria-hidden` because it carries no information. Returning
`null` under reduced motion is correct here only because the graduation screen
already states the outcome in text.

---

## 7. Staggered sequence

The payout moment is several facts, delivered in causal order.

```tsx
const REVEAL = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

<motion.div
  initial="hidden"
  animate="visible"
  transition={{ staggerChildren: 0.12 }}
>
  <motion.div variants={REVEAL} transition={transitions.standard}>{/* outcome */}</motion.div>
  <motion.div variants={REVEAL} transition={transitions.standard}>{/* xp earned */}</motion.div>
  <motion.div variants={REVEAL} transition={transitions.standard}>{/* level bar */}</motion.div>
  <motion.div variants={REVEAL} transition={transitions.standard}>{/* next reward */}</motion.div>
</motion.div>
```

Four children at 0.12s is roughly 0.5s of stagger plus the last child's own
0.3s. That sits inside the 1.2s budget. Adding a fifth row pushes it over, so
cut a row rather than shortening the stagger.

---

## 8. Haptics, safely

```ts
/**
 * Fire a vibration pattern if the platform has one.
 *
 * Safari on iOS does not implement navigator.vibrate at all, and this
 * prototype is demoed in a mobile web view, so on an iPhone this is a no-op.
 * Never let haptics carry a signal on their own: treat it as a bonus for
 * Android Chrome and make sure the screen already said everything.
 */
export function haptic(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return
  }

  try {
    navigator.vibrate(pattern)
  } catch {
    // Some browsers throw when the document has never been interacted with.
  }
}

export const HAPTIC = {
  tick: 8,
  confirm: 16,
  success: [12, 40, 24],
  levelUp: [16, 30, 16, 30, 40],
} as const
```

The pattern vocabulary follows the same rarity ladder as the visuals: `tick` is
shortest, `levelUp` is longest and is the only multi-pulse one that should fire
outside a resolve.
