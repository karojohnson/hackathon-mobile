---
name: game-feel
description: Celebration choreography and feedback discipline for this prototype. Use when a moment falls flat, when designing an unlock, badge reveal, level-up, progress fill, XP count-up, or streak milestone, or when auditing whether meaningful events actually reach the user. Web and mobile Safari, not native.
---

# Game Feel

Makes the meaningful moments land. The `gamified-app` skill decides *what* is
earned. This skill decides how the earning *feels*, and it is the discipline
layer: which events deserve feedback, on which channels, and how to check that
nothing important is silent.

Concrete React and Motion snippets live in
[`references/celebration-recipes.md`](references/celebration-recipes.md). Read
this file first, then pull the recipe you need.

## Core principles

### 1. Feedback scales with rarity

Ordered, weakest to strongest:

```
selection tick  <  action confirmed  <  axis correct  <  trade resolved
                <  axis unlocked  <  structure earned  <  level up  <  graduation
```

If the rarest event fires the same treatment as a routine one, the flow has no
climax. In this prototype `graduation` is the top of the ladder and should be
the only screen that gets the full treatment. If `dial-in` selection feedback
looks as loud as `earned`, the ladder is broken.

Budget check: count the distinct celebration treatments in the flow. More than
three or four and each one is worth less.

### 2. Match the channel to what is actually available

| Channel | Reaches | Availability here |
|---|---|---|
| Screen motion | Whoever is looking | Always. This is the primary channel. |
| Color and weight shift | Whoever is looking | Always, and survives reduced motion. |
| Haptics | Only the person holding the phone | **Unreliable. See below.** |
| Audio | The whole room | Not wired up, and a demo laptop is usually muted. |

**Haptics warning.** `navigator.vibrate()` is not supported in Safari on iOS, at
all. It works in Chrome on Android. This prototype is demoed on a phone-framed
mobile web view, so haptics will silently do nothing on an iPhone. Treat
vibration as a progressive enhancement that most viewers will never feel, and
never let it carry a signal on its own. The recipes file has a safe wrapper.

The practical consequence: **screen motion has to carry the whole climax.** You
cannot lean on a haptic thump to sell a level-up the way a native app would.

### 3. Reduced motion is already wired, do not fight it

Two halves, both already in place:

- CSS transitions and animations: the `prefers-reduced-motion` block in
  [`app/globals.css`](../../../app/globals.css)
- motion/react animations: `<MotionConfig reducedMotion="user">` in
  [`components/theme-provider.tsx`](../../../components/theme-provider.tsx)

`reducedMotion="user"` disables transform and layout animation while letting
opacity through. So a celebration built only from `scale` and `y` becomes
*nothing* for those users, and they get no feedback that they earned anything.

**Rule: every celebration needs a non-transform channel.** Pair motion with an
opacity fade, a color change, or a text change, so the moment still reads when
transforms are off. Verify by toggling Reduce Motion in the OS, not by assuming.

### 4. Use the shared presets

From [`lib/motion.ts`](../../../lib/motion.ts): `fast`, `standard`, `spring`,
`sheet`. Do not inline ad hoc durations. If a celebration genuinely needs
something outside these four, add it to the presets file so the feel stays
retunable in one place.

Rough mapping:

- `fast` (0.15s): selection ticks, chip toggles, small reveals
- `standard` (0.3s): screen and element transitions
- `spring` (400/32): the physical ones. Badge pops, number ticks, chart reveals.
  [`components/trade/order-success.tsx`](../../../components/trade/order-success.tsx)
  is the existing reference: `scale: 0.6 -> 1` on `transitions.spring`.
- `sheet` (380/38): drawers and bottom sheets

### 5. Stagger, do not dump

A level-up is several facts arriving at once: XP landed, bar filled, bar
overflowed, level incremented, new thing unlocked. Playing them simultaneously
reads as a single flash and the learner parses none of it.

Sequence them, roughly 80 to 150ms apart, in causal order. The learner should be
able to narrate what happened. Total budget for even the biggest moment is about
1.2s before it stops feeling like a reward and starts feeling like a wait, and
every celebration must be skippable by tapping through.

## The feedback audit

When something "feels flat", do not start adding animation. Audit first.

1. List every meaningful event in the flow. `PRACTICE_SCREEN_ORDER` in
   [`lib/practice-flow.ts`](../../../lib/practice-flow.ts) is the spine.
2. For each, write down what actually fires today, on which channel.
3. Flag the silent ones. Usually the problem is a rare event with routine
   feedback, not a missing animation.
4. Flag the inverted ones, where a common event is louder than a rare one.
5. Fix rarity ordering before adding anything new.

Most "flat" complaints are a ladder problem, not a polish problem.

## Where the moments are in this flow

| Screen | The moment | Treatment |
|---|---|---|
| `dial-in` | Strike lands in the profitable zone | `fast`, chip color shift |
| `open-trades` | Trade is live | Confirmation, already handled |
| `resolution` | Outcome revealed | Restraint. A loss here is a lesson, not a failure state. Do not punish it visually. |
| `payout` | XP counts up, bar fills | `spring` count-up plus bar fill. See recipes. |
| `duration-unlock` | A new axis opens | Locked chip becomes live. The single most important reveal in chapter one. |
| `earned` | A structure joins the trophy case | Badge reveal, `spring` |
| `graduation` | Top of the ladder | The one full-treatment moment |

## Anti-patterns

- Confetti on anything that happens more than once a session
- Celebrating a loss on `resolution`. The lesson is that the miss was
  informative. Ceremony there undercuts it.
- A celebration that blocks the CTA. The footer CTA stays reachable throughout.
- Infinite loops or pulsing that never settles. Every celebration ends.
- Animating `width`, `height`, `top`, or `left`. Use `transform` and `opacity`.
  Mobile Safari will jank on layout-triggering properties.
- Sound as the only channel for anything
- Motion that fires on every re-render instead of on the state change. Key the
  animation to the event, not the component mount.
