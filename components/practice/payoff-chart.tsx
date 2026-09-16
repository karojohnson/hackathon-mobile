"use client"

import * as React from "react"
import { cn } from "cn"

export interface PayoffChartPoint {
  strike: number
  value: number
}

export interface PayoffChartProps {
  /** Ascending by strike, at least 2 points — drawn as a connected line. */
  points: PayoffChartPoint[]
  /**
   * Fixed axis domains, supplied by the caller rather than derived from
   * `points`.
   *
   * This is the whole reason the curve visibly moves. The chart used to take
   * its domain from its own points, so it re-normalised on every change and
   * the hockey stick was pixel-identical at every dial stop — only the
   * (invisible) axis numbers differed. Holding the domain still across all
   * stops is what makes the kink and the profit band slide.
   */
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  /**
   * The winning region, shaded as one green band. `profitTo` defaults to the
   * right edge — a short put spread wins all the way up, but an iron condor
   * wins only between its two breakevens, so that one passes both.
   */
  profitFrom: number
  profitTo?: number
  /**
   * Draggable handle on the zero line, labelled with the short strike. Omit
   * on screens where the chart is a readout rather than the control.
   */
  handleAt?: number
  handleLabel?: string
  /**
   * Called with the strike under the pointer while the handle (or the panel)
   * is dragged. The caller snaps it to its nearest real stop, so this chart
   * stays presentational and holds no state of its own.
   */
  onScrub?: (strike: number) => void
  /** Nudge one stop left/right from the keyboard, for the handle's a11y. */
  onStep?: (direction: -1 | 1) => void
  className?: string
}

const HEIGHT = 150
/**
 * Zero sits above centre, matching the design (56.25 of 150). A short put
 * spread's loss leg is deeper than its gain leg, so the extra room belongs
 * below the line.
 */
const ZERO_PCT = 37.5

/**
 * Payoff diagram for the Dial-in screens — a straight-line approximation of
 * the real step function, enough to teach the shape.
 *
 * The design marks this panel "[THE CONTROL]": the handle on the zero line
 * is draggable and is the primary way to move the strike, with the slider
 * below as the secondary control. Both drive the same value in the caller.
 *
 * Profit is shown as one green vertical band covering the winning region,
 * which is what the design does. An earlier version filled the area between
 * the curve and the zero line in green above / red below, built from a
 * single polygon closed across the whole domain — for a multi-segment curve
 * that polygon spanned regions the curve never entered, so it painted large
 * red blocks either side instead of shading that followed the line. There is
 * deliberately no red fill now; loss is conveyed by the curve dropping below
 * the zero line and by the red max-loss figure in the readout.
 */
export function PayoffChart({
  points,
  xMin,
  xMax,
  yMin,
  yMax,
  profitFrom,
  profitTo,
  handleAt,
  handleLabel,
  onScrub,
  onStep,
  className,
}: PayoffChartProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)

  const xPct = (strike: number) => ((strike - xMin) / (xMax - xMin || 1)) * 100
  const yPct = (value: number) => {
    if (value >= 0) return ZERO_PCT - (value / (yMax || 1)) * ZERO_PCT
    return ZERO_PCT + (value / (yMin || -1)) * (100 - ZERO_PCT)
  }

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xPct(p.strike)},${yPct(p.value)}`)
    .join(" ")

  const scrubFromClientX = React.useCallback(
    (clientX: number) => {
      const el = panelRef.current
      if (!el || !onScrub) return
      const rect = el.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      onScrub(xMin + ratio * (xMax - xMin))
    },
    [onScrub, xMin, xMax]
  )

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        ref={panelRef}
        className="relative w-full overflow-hidden rounded-xl bg-surface-glass-sunken"
        style={{ height: HEIGHT }}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          scrubFromClientX(e.clientX)
        }}
        onPointerMove={(e) => dragging.current && scrubFromClientX(e.clientX)}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
      >
        {/* Profit zone: everything right of breakeven wins. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 bg-positive/20"
          style={{
            left: `${xPct(profitFrom)}%`,
            right: `${100 - xPct(profitTo ?? xMax)}%`,
          }}
        />

        {/* Zero line. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/25"
          style={{ top: `${ZERO_PCT}%` }}
        />

        {/*
          preserveAspectRatio="none" so the curve stretches to the panel: this
          is a schematic, and a distorted slope is fine. The handle and label
          are HTML rather than SVG so the circle stays round and the label
          stays exactly 12px Inter.
        */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <path
            d={linePath}
            fill="none"
            stroke="var(--positive)"
            strokeWidth={0.7}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {handleAt !== undefined && handleLabel !== undefined && (
          <>
            <button
              type="button"
              role="slider"
              aria-label="Short strike"
              aria-valuenow={handleAt}
              aria-valuemin={xMin}
              aria-valuemax={xMax}
              aria-valuetext={handleLabel}
              onKeyDown={(e) => {
                if (!onStep) return
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault()
                  onStep(-1)
                }
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault()
                  onStep(1)
                }
              }}
              className={cn(
                "absolute size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full",
                "border-2 border-background bg-positive",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              )}
              style={{ left: `${xPct(handleAt)}%`, top: `${ZERO_PCT}%` }}
            />

            <span
              className="type-label pointer-events-none absolute -translate-x-1/2 tabular-nums text-positive"
              style={{ left: `${xPct(handleAt)}%`, bottom: 6 }}
            >
              {handleLabel}
            </span>
          </>
        )}

      </div>
    </div>
  )
}
