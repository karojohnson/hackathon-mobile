"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import type { TrackStop } from "@/data/mock-options-data"
import { transitions } from "@/lib/motion"

/** Gap between rail segments, in px. Must match the `gap-1.5` below. */
const SEGMENT_GAP = 6
/** Diameter of the visible handle, in px. */
const THUMB_SIZE = 16
/** How many segments either side of the thumb's own segment stay lit. */
const LIT_RADIUS = 1

export interface SpreadRailProps {
  /** Every step the rail can reach, with the strike each one produces. */
  track: TrackStop[]
  value: number
  onChange: (step: number) => void
  className?: string
}

/**
 * The spread card's strike rail.
 *
 * Deliberately NOT `StrikeDial`. The dial under a payoff chart is a
 * different instrument in a different context and keeps its own treatment;
 * this one belongs to the spread card and borrows the visual language of
 * the two-handle call spread control instead. Sharing one component across
 * both is what forced a single look on two surfaces that do not want one,
 * so they are separate on purpose. Do not merge them back.
 *
 * What it takes from the call spread control: a rail of short rounded
 * segments with even gaps, dark outside the selection and white around it,
 * and a solid white circular handle sitting on top. Not a browser range
 * track, and no blue outline at rest.
 *
 * What it does not take: the second handle. That control positions two
 * legs independently. Here the width is fixed at five points and the whole
 * structure slides as a unit, so one handle carries the whole spread. A
 * later spread-width lesson can reintroduce the second.
 *
 * The bright band is three segments centred on the handle, so it reads as
 * local emphasis rather than extent. Two things it is deliberately not. It
 * is not a fill from the left edge to the thumb, which would read as "you
 * are 40% of the way through something" when nothing is being completed.
 * And it is not a band running from the thumb out to the long strike,
 * which would draw the five-point width on a rail whose only question is
 * where the spread sits. The rail answers "where is my spread"; the
 * sentence above and the pills below answer "what legs does that make".
 *
 * Geometry. Each strike sits at the CENTRE of a segment rather than on a
 * seam between two, which is why there are `2n - 1` segments for `n`
 * strikes: segment `2i` belongs to strike `i` and the odd ones between are
 * spaces. Centring matters because the handle is wider than a gap, so a
 * handle parked on a seam swallows it and the lit segments either side
 * fuse into one long capsule, which is the progress bar all over again.
 * Centred, the handle sits inside its own segment and every gap stays
 * visible at every value. Segment widths, gaps and positions are identical
 * at every stop; only the dot, the lit band and the lit tick label move.
 *
 * Mechanically this is a native range input, held at `opacity-0` on top of
 * the drawn rail. That buys pointer drag, arrow keys, Home/End and correct
 * screen-reader semantics from the platform, and `step={1}` does the
 * snapping. A native range thumb travels inset by half its own width, so
 * for the pointer and the visible dot to agree the native thumb is sized
 * to one segment (`--rail-hit`) rather than to the dot: that puts its
 * travel between the first and last segment centres, which is exactly
 * where the drawn handle goes. Hence the measured rail width, which is the
 * one thing here that cannot be done in CSS.
 */
export function SpreadRail({
  track,
  value,
  onChange,
  className,
}: SpreadRailProps) {
  const min = track[0]?.step ?? 1
  const max = track[track.length - 1]?.step ?? 5
  const current = track.find((t) => t.step === value) ?? track[0]
  const activeIndex = Math.max(
    0,
    track.findIndex((t) => t.step === value)
  )

  const segmentCount = Math.max(1, track.length * 2 - 1)

  /*
   * The rail is fluid (the card owns its width), but the native thumb has
   * to be sized in px to land on segment centres, so the width is measured
   * rather than assumed. Layout effect, not effect: the dot would
   * otherwise paint at 0 for a frame and then jump.
   */
  const railRef = React.useRef<HTMLDivElement>(null)
  const [railWidth, setRailWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = railRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) =>
      setRailWidth(entry.contentRect.width)
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const segmentWidth =
    railWidth > 0
      ? (railWidth - (segmentCount - 1) * SEGMENT_GAP) / segmentCount
      : 0
  /** Centre of the segment belonging to stop `i`, in px from the rail's left edge. */
  const centerFor = (i: number) =>
    i * 2 * (segmentWidth + SEGMENT_GAP) + segmentWidth / 2

  const litFrom = activeIndex * 2 - LIT_RADIUS
  const litTo = activeIndex * 2 + LIT_RADIUS

  const [engaged, setEngaged] = React.useState(false)

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative h-9">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
          onFocus={() => setEngaged(true)}
          onBlur={() => setEngaged(false)}
          onPointerDown={() => setEngaged(true)}
          onPointerUp={() => setEngaged(false)}
          onPointerCancel={() => setEngaged(false)}
          // Unnamed it announces as a slider reading "3", with no clue that
          // it picks a strike.
          aria-label="Short strike"
          aria-valuetext={
            current
              ? `${current.strike}, ${current.pop}% probability of profit`
              : `${value}`
          }
          style={{ "--rail-hit": `${segmentWidth}px` } as React.CSSProperties}
          className={cn(
            "absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0",
            // Sized, not hidden: the invisible native thumb is what maps a
            // touch position to a step, and one segment wide is what makes
            // its travel run centre-to-centre. See the note above.
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:[width:var(--rail-hit)]",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:[width:var(--rail-hit)]"
          )}
        />

        <div
          ref={railRef}
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
        >
          <div className="flex items-center gap-1.5">
            {Array.from({ length: segmentCount }, (_, segment) => (
              <span
                key={`segment-${segment}`}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-200",
                  segment >= litFrom && segment <= litTo
                    ? "bg-foreground"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          <motion.span
            initial={false}
            animate={{
              left: centerFor(activeIndex),
              scale: engaged ? 1.15 : 1,
            }}
            transition={transitions.spring}
            style={{
              x: "-50%",
              y: "-50%",
              width: THUMB_SIZE,
              height: THUMB_SIZE,
            }}
            className={cn(
              // Solid, borderless disc. A blue outline on a white dot
              // sitting on a dark rail reads as a focus state that never
              // goes away, so the ring is kept for engagement only.
              "absolute top-1/2 block rounded-full bg-foreground",
              "ring-ring/50 transition-shadow",
              engaged && "ring-3"
            )}
          />
        </div>
      </div>

      {/* Tick labels for the slider above, not a second control: the slider
          announces the strike and its probability, so these are decoration
          to a screen reader. */}
      <div aria-hidden="true" className="relative h-4">
        {track.map((stop, i) => (
          <span
            key={`tick-${stop.step}`}
            style={{ left: centerFor(i) }}
            className={cn(
              "type-label absolute top-0 -translate-x-1/2 tabular-nums transition-colors duration-200",
              stop.step === value
                ? "text-foreground"
                : "text-muted-foreground/50"
            )}
          >
            {stop.strike}
          </span>
        ))}
      </div>
    </div>
  )
}
