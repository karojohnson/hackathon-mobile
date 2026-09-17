"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import type { TrackStop } from "@/data/mock-options-data"
import { transitions } from "@/lib/motion"

export interface StrikeDialProps {
  /** Every step the dial can reach, with the strike each one produces. */
  track: TrackStop[]
  value: number
  onChange: (step: number) => void
  className?: string
}

/**
 * The strike dial — one thumb, one concept: how far from today's price you
 * are willing to sell.
 *
 * Built around three pieces of design feedback.
 *
 * The track is anchored on strike prices rather than an abstract 50/70/90
 * probability scale: you drag across the strikes you would actually be
 * selling, and the probability of profit is reported back from the pricing
 * model rather than being the thing you set.
 *
 * There is exactly one control. An earlier version stacked a slider, a row
 * of tappable strike buttons and a row of leg chips, which read as three
 * controls describing one value. The strikes are now passive tick labels
 * belonging to this slider, and the legs are named once, in the trade
 * summary below. Multi-leg structures keep the single thumb: an iron condor
 * moves all four legs together, because distance is the one thing being
 * set.
 *
 * The rail is segmented rather than continuous because the stops are
 * discrete — there is no strike between 225 and 220 to land on. Segments
 * behind the thumb light up, the rest stay dark, and the thumb springs
 * between stops so a snap feels magnetic instead of instant.
 *
 * Mechanically this is a native range input, held at `opacity-0` on top of
 * the drawn rail. That buys pointer drag, arrow keys, Home/End and correct
 * screen-reader semantics from the platform, and `step={1}` does the
 * snapping. The input spans the full width while the rail is inset by half
 * a thumb, which is exactly the inset the native thumb's own travel has —
 * so the pointer position under your finger and the dot you can see agree.
 *
 * The one cost of that arrangement: the visible thumb is a sibling of the
 * real control rather than the control itself, so it can't pick up focus
 * with a CSS `peer-` variant (those need a sibling selector and the dot is
 * nested a level in). Engagement is tracked in state instead, which also
 * gives the dot something to grow into while you're dragging it.
 */
export function StrikeDial({ track, value, onChange, className }: StrikeDialProps) {
  const min = track[0]?.step ?? 1
  const max = track[track.length - 1]?.step ?? 5
  const current = track.find((t) => t.step === value) ?? track[0]

  /** Fraction along the rail for stop `i`, 0 at the first stop and 1 at the last. */
  const fractionFor = (i: number) => (track.length > 1 ? i / (track.length - 1) : 0.5)
  const activeIndex = Math.max(
    0,
    track.findIndex((t) => t.step === value)
  )

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
          // The dial is the only control on the screen; unnamed it announces
          // as a slider reading "3", with no clue that it picks a strike.
          aria-label="Short strike"
          aria-valuetext={current ? `${current.strike}, ${current.pop}% probability of profit` : `${value}`}
          className={cn(
            "absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0",
            // Sized, not hidden: the invisible native thumb is what maps a
            // touch position to a step, so its width has to match the inset
            // of the rail drawn underneath.
            "[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none",
            "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:border-0"
          )}
        />

        <div className="pointer-events-none absolute inset-x-1.5 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1">
            {track.slice(0, -1).map((stop, i) => (
              <span
                key={`segment-${stop.step}`}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-200",
                  i < activeIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          <motion.span
            initial={false}
            animate={{ left: `${fractionFor(activeIndex) * 100}%`, scale: engaged ? 1.2 : 1 }}
            transition={transitions.spring}
            style={{ x: "-50%", y: "-50%" }}
            className={cn(
              "absolute top-1/2 block size-3 rounded-full border border-ring bg-white",
              "ring-ring/50 transition-shadow",
              engaged && "ring-3"
            )}
          />
        </div>
      </div>

      {/* Tick labels for the slider above, not a second control — the slider
          announces the strike and its probability, so these are decoration
          to a screen reader. */}
      <div aria-hidden="true" className="relative mx-1.5 h-4">
        {track.map((stop, i) => (
          <span
            key={`tick-${stop.step}`}
            style={{ left: `${fractionFor(i) * 100}%` }}
            className={cn(
              "absolute top-0 -translate-x-1/2 type-label tabular-nums transition-colors duration-200",
              stop.step === value ? "text-foreground" : "text-muted-foreground/50"
            )}
          >
            {stop.strike}
          </span>
        ))}
      </div>
    </div>
  )
}
