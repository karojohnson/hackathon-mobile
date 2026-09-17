"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import type { TrackStop } from "@/data/mock-options-data"
import { transitions } from "@/lib/motion"
import { profitGeometry } from "@/lib/payoff-geometry"

export interface StrikeDialProps {
  /** Every step the dial can reach, with the strike and payoff each one produces. */
  track: TrackStop[]
  value: number
  onChange: (step: number) => void
  /**
   * The price window the payoff chart above is drawn in. The dial shares
   * it, which is the whole point of this control.
   */
  xDomain: [number, number]
  /**
   * What the handles stand for.
   *
   * `band` (the default) puts them on the profit range's edges, mirroring
   * the green band in the chart directly above. Every screen with a chart
   * uses it, because the dial is then a 1-D projection of that chart.
   *
   * `legs` puts them on the structure's own strikes instead, for a screen
   * with no chart above it to mirror. It exists because a *debit* spread
   * breaks the band model: its breakeven is `long strike + debit`, the
   * long leg is pinned at the money, and pushing the short leg out grows
   * the debit by almost as much as the strike moves. The band edge creeps
   * a few points while the strike travels twenty, so the handle barely
   * moves and the control reads as broken. The strike the dial actually
   * sets is not a band edge at all there: past it you still profit, you
   * are simply capped.
   */
  marks?: "band" | "legs"
  className?: string
}

/**
 * Inset of the rail from the dial's full width, in pixels.
 *
 * Must equal the payoff chart's own inset (that SVG carries `mx-1.5`, with
 * no padding inside its viewBox, so its price axis spans exactly its box).
 * Matching the two insets is what makes a given price land on the same
 * screen column in both, and therefore what puts this dial's handle
 * directly under the chart's breakeven dot. Change one and the alignment
 * is gone.
 */
const RAIL_INSET_PX = 6

/** Dashes in the rail. A rhythm, not a count of anything. */
const DASH_COUNT = 9

/**
 * The strike dial: a range control over the price axis of the chart above
 * it.
 *
 * ## What it is
 *
 * The rail is the same price window as the payoff chart, at the same
 * inset, so the two line up column for column. The bright run between the
 * handles is the structure's profitable range, which makes this control a
 * 1-D projection of the green band in the chart: the handles sit exactly
 * under the chart's breakeven dots, and moving the dial widens or narrows
 * the bright run the way it widens or narrows the band.
 *
 * That is why the handle is not on a strike. It is on the breakeven, which
 * is where winning actually begins, and which is the point the chart marks
 * too.
 *
 * ## One degree of freedom, two handles
 *
 * A short put spread wins from its breakeven upward, so its range has one
 * real edge and one that runs off the end of the window. The real edge
 * drags; the open end is drawn as a pinned cap, because a range with one
 * handle missing reads as unfinished rather than as open-ended. An iron
 * condor has two real edges and both move, but they move together: the
 * dial still sets one thing, distance, and the spread width stays fixed.
 *
 * Handles are placed at every boundary of the profitable range, so the
 * structure decides how many there are. Nothing here is special-cased per
 * strategy.
 *
 * ## Dashes
 *
 * A fixed rhythm of nine, uniform and evenly spaced, lit when the dash's
 * centre falls inside the profitable range. They are decoration for the
 * axis, not a count of the five stops: an earlier version drew one segment
 * per strike, which was legible but could not also carry the range, and
 * the range is the thing being taught.
 *
 * The lit set changes as the dial moves, which is intended here and is not
 * the progress fill that was removed earlier. A fill from the left edge to
 * the thumb claims you are part-way through something. A lit run between
 * two handles states where you win, which is the lesson.
 *
 * ## Mechanics
 *
 * Pointer input is handled here rather than by the native range input,
 * because the input's travel runs end to end while these handles sit at
 * breakevens somewhere inside the window. A press maps to a price, and the
 * stop chosen is the one whose nearest range edge is closest to it, so
 * dragging carries whichever handle you grabbed. The range input stays,
 * visually hidden, for arrow keys, Home/End and screen-reader semantics.
 *
 * `initial={false}` on the handles renders them at their current positions
 * rather than animating in from the left on every mount.
 */
export function StrikeDial({
  track,
  value,
  onChange,
  xDomain,
  marks = "band",
  className,
}: StrikeDialProps) {
  const min = track[0]?.step ?? 1
  const max = track[track.length - 1]?.step ?? 5
  const current = track.find((t) => t.step === value) ?? track[0]

  const [minStrike, maxStrike] = xDomain
  const span = maxStrike - minStrike || 1
  /** Axis fraction of a price, matching the chart's mapping exactly. */
  const fractionFor = (price: number) =>
    Math.min(1, Math.max(0, (price - minStrike) / span))

  /**
   * An axis fraction as a CSS offset inside this dial.
   *
   * The rail is inset by RAIL_INSET_PX at both ends, so fraction `f` of the
   * rail is `inset + f * (width - 2 * inset)`. Percentages resolve against
   * the full width, hence the correction term.
   */
  const positionFor = (f: number) =>
    `calc(${RAIL_INSET_PX}px + ${f * 100}% - ${(f * RAIL_INSET_PX * 2).toFixed(3)}px)`

  /** Range edges, as axis fractions, for a given stop. */
  const edgesFor = React.useCallback(
    (stop: TrackStop) => {
      const { bands } = profitGeometry(stop.points, xDomain)
      const edges: number[] = []
      for (const [from, to] of bands) {
        if (!edges.includes(from)) edges.push(from)
        if (!edges.includes(to)) edges.push(to)
      }
      return edges.sort((a, b) => a - b)
    },
    [xDomain]
  )

  const { bands } = profitGeometry(current?.points ?? [], xDomain)
  /*
   * In `legs` mode both legs of the spread are drawn, but only the anchor
   * moves — the wing is pinned at the money. Sorted so the pair renders
   * left to right whichever side of the money the structure sits on.
   */
  const edges =
    marks === "legs" && current
      ? [fractionFor(current.wingStrike), fractionFor(current.strike)].sort((a, b) => a - b)
      : edgesFor(current)

  const rail = React.useRef<HTMLDivElement>(null)
  const [engaged, setEngaged] = React.useState(false)

  /**
   * Edges that actually travel with the stop.
   *
   * A structure that wins all the way to one end of the window closes its
   * band on the window boundary, so `profitGeometry` hands back an edge at
   * exactly 0 or 1 — and that number is identical for every stop, because
   * the window is held constant across the whole track.
   *
   * Hit-testing against it breaks the dial. Once the pointer is nearer the
   * shared boundary than any stop's moving breakeven, all five stops tie on
   * the same gap and the strict `<` below awards it to whichever comes
   * first in `track`, which is always step 1. Dragging a call spread right
   * therefore climbed 1..5 and then snapped back to 1 partway across; a put
   * spread had a dead right half for the same reason. The condor was fine
   * only because both of its edges move.
   *
   * The pinned end is drawn (see the cap below) but is not a handle, so it
   * has no business being a target. The fallback keeps a stop reachable in
   * the degenerate case where it has no moving edge at all.
   */
  const PINNED = 1e-6
  function grabbableEdgesFor(stop: TrackStop) {
    /*
     * In `legs` mode only the anchor moves between stops; the wing is the
     * same price at every one. Hit-testing a constant would give every
     * stop an identical gap and award it to whichever came first in
     * `track` — the exact fault the boundary filter below exists to stop.
     * So the anchor is the only target.
     */
    if (marks === "legs") return [fractionFor(stop.strike)]
    const all = edgesFor(stop)
    const moving = all.filter((edge) => edge > PINNED && edge < 1 - PINNED)
    return moving.length > 0 ? moving : all
  }

  /**
   * The stop whose nearest moving range edge is closest to the pointer.
   * Works for a one-edged spread and a two-edged condor without knowing
   * which it has.
   */
  function stepFromPointer(clientX: number) {
    const box = rail.current?.getBoundingClientRect()
    if (!box || box.width === 0) return value
    const at = (clientX - box.left) / box.width
    let best = value
    let bestGap = Number.POSITIVE_INFINITY
    for (const stop of track) {
      for (const edge of grabbableEdgesFor(stop)) {
        const gap = Math.abs(edge - at)
        if (gap < bestGap) {
          bestGap = gap
          best = stop.step
        }
      }
    }
    return best
  }

  function trackPointer(event: React.PointerEvent) {
    const next = stepFromPointer(event.clientX)
    if (next !== value) onChange(next)
  }

  /** Whether a dash's centre sits inside the profitable range. */
  const dashLit = (i: number) => {
    const centre = (i + 0.5) / DASH_COUNT
    return bands.some(([from, to]) => centre >= from && centre <= to)
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        // `touch-none` so dragging the dial doesn't scroll the screen under it.
        className="relative h-9 cursor-pointer touch-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          setEngaged(true)
          trackPointer(event)
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          trackPointer(event)
        }}
        onPointerUp={() => setEngaged(false)}
        onPointerCancel={() => setEngaged(false)}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
          onFocus={() => setEngaged(true)}
          onBlur={() => setEngaged(false)}
          // The dial is the only control on the screen; unnamed it announces
          // as a slider reading "3", with no clue that it picks a strike.
          aria-label="Short strike"
          aria-valuetext={
            current
              ? `${current.strike}, ${current.pop}% probability of profit`
              : `${value}`
          }
          className="sr-only"
        />

        <div
          ref={rail}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2"
          style={{ left: RAIL_INSET_PX, right: RAIL_INSET_PX }}
        >
          <div className="flex items-center gap-1.5">
            {Array.from({ length: DASH_COUNT }, (_, i) => (
              <span
                key={`dash-${i}`}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-200",
                  dashLit(i) ? "bg-foreground" : "bg-muted"
                )}
              />
            ))}
          </div>

          {edges.map((edge, i) => (
            <motion.span
              key={`handle-${i}`}
              initial={false}
              animate={{
                left: `${edge * 100}%`,
                scale: engaged ? 1.15 : 1,
              }}
              transition={transitions.spring}
              style={{ x: "-50%", y: "-50%" }}
              className={cn(
                // Solid, borderless disc. A blue outline on a white dot
                // sitting on a neutral rail reads as a focus state that
                // never goes away, so the ring is kept for engagement only.
                "absolute top-1/2 block size-4 rounded-full bg-foreground",
                "ring-ring/50 transition-shadow",
                engaged && "ring-3"
              )}
            />
          ))}
        </div>
      </div>

      {/*
        The strike the dial is setting, under its own handle.

        Only in `legs` mode, where the handle *is* the strike, so the
        number and the point it names coincide. Under `band` the handle
        sits on the breakeven and the chart above already labels it, so a
        strike here would be a second number a few pixels off a different
        quantity — which is exactly how this read wrong before.
      */}
      {marks === "legs" && current && (
        <div aria-hidden="true" className="relative h-4">
          <span
            style={{ left: positionFor(fractionFor(current.strike)) }}
            className="type-label absolute top-0 -translate-x-1/2 text-foreground tabular-nums"
          >
            {current.strike}
          </span>
        </div>
      )}
    </div>
  )
}
