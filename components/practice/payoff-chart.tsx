"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import { transitions } from "@/lib/motion"
import {
  levelDepth,
  profitGeometry,
  ZERO_FRACTION,
} from "@/lib/payoff-geometry"

export interface PayoffChartPoint {
  strike: number
  /**
   * Vertical position as a normalised level in [-1, 1], NOT a dollar
   * amount. `1` is the top of the plot, `0` is the zero line, `-1` is the
   * bottom. Callers supply constants per structure; see `shapeFor` in
   * data/mock-options-data.ts.
   */
  level: number
}

export interface PayoffChartProps {
  /**
   * Ascending by strike, at least 2 points — drawn as a connected line.
   *
   * Levels, not P/L. This chart is a shape diagram: it teaches where a
   * structure wins and loses across the price axis, and the one thing it
   * must never do is restate a dollar figure as a height, because then the
   * plateau moves vertically as you drag and the horizontal story — the
   * profitable range widening — is lost inside a shape that is also
   * growing and shrinking. The dollar figures live under the chart, where
   * they stay exact.
   */
  points: PayoffChartPoint[]
  breakevens: number[]
  /**
   * Price window to draw in. Required, and the caller must hold it constant
   * across dial stops.
   *
   * This used to be derived from `points` on every render, which quietly
   * defeated the whole screen: the payoff of a 50%, 70% and 90% spread
   * differ mostly by where they sit on the price axis, so re-fitting the
   * axis to the data renormalised that difference away and drew the same
   * picture at all three stops, to within a pixel.
   */
  xDomain: [number, number]
  /** Underlying's current price, drawn as a labelled marker. */
  spot?: number
  /** Strikes to mark along the baseline. */
  strikes?: number[]
  height?: number
  className?: string
}

const WIDTH = 320
/**
 * No horizontal padding inside the viewBox. The SVG is instead inset by
 * half a dial thumb in CSS (`mx-1.5`), which is exactly the inset of the
 * segmented rail below it — so the price axis begins and ends on the same
 * two pixels as the control that drives it, at any width. Padding in
 * viewBox units could not do that: the SVG scales, so a fixed 22 units
 * lands on a different number of CSS pixels at every container width.
 */
const PAD_X = 0
const PLOT_TOP = 28

/**
 * Payoff diagram — a straight-line approximation of the real step function,
 * good enough to teach the shape. Gains render above the zero line in the
 * positive color, losses below it in the negative color.
 *
 * Vertically this is normalised, not scaled. Points carry a level in
 * [-1, 1] and the three heights that matter — the top of the plot, the
 * zero line and the bottom — are fixed for the life of the chart. Nothing
 * about maxGain, maxLoss, the credit or the selected stop reaches a Y
 * coordinate. Drag the dial and only X moves.
 */
export function PayoffChart({
  points,
  breakevens,
  xDomain,
  spot,
  strikes = [],
  height = 148,
  className,
}: PayoffChartProps) {
  const clipIdBase = React.useId()
  const aboveZeroClipId = `${clipIdBase}-above-zero`
  const belowZeroClipId = `${clipIdBase}-below-zero`

  const plotBottom = height - 28
  const labelBaseline = height - 8
  const [minStrike, maxStrike] = xDomain
  const strikeRange = maxStrike - minStrike || 1

  const clamp = (n: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, n))

  function xFor(strike: number) {
    const t = (strike - minStrike) / strikeRange
    return PAD_X + clamp(t, 0, 1) * (WIDTH - PAD_X * 2)
  }

  // Three fixed heights, derived from the plot band and nothing else.
  const zeroY = PLOT_TOP + ZERO_FRACTION * (plotBottom - PLOT_TOP)

  function yFor(level: number) {
    return PLOT_TOP + levelDepth(level) * (plotBottom - PLOT_TOP)
  }

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.strike)},${yFor(p.level)}`)
    .join(" ")
  const fillPath = `${linePath} L${xFor(maxStrike)},${zeroY} L${xFor(minStrike)},${zeroY} Z`

  /*
   * Everything that marks where the structure turns profitable is read off
   * the drawn line, not passed in beside it, and it is read by the same
   * helper the strike dial uses. That shared call is what puts the dial's
   * handle directly under this chart's breakeven dot.
   *
   * The alternative was to place the dot and the band at the true
   * breakeven price. That cannot be made to agree with a rigid arm: the
   * arm's zero crossing sits at a fixed fraction of its width, while the
   * real breakeven walks towards the short strike as the credit shrinks.
   * Feeding both into one picture either bends the arm (a vertex at the
   * breakeven, which is what made the slope change between stops) or
   * leaves a dot floating off the line. The breakeven *prices* are still
   * the real ones, in the labels and in the summary under the chart.
   */
  const geometry = profitGeometry(points, xDomain)
  const axisLeft = xFor(minStrike)
  const axisSpan = xFor(maxStrike) - axisLeft
  const atFraction = (f: number) => axisLeft + f * axisSpan
  const crossings = geometry.crossings.map(atFraction)
  const bands = geometry.bands.map(
    ([from, to]) => [atFraction(from), atFraction(to)] as [number, number]
  )

  /*
   * Motion interpolates `d` only when both paths have the same command
   * count. That holds while you move the dial inside one thesis, but
   * switching thesis swaps a 4-point spread for a 6-point condor — so the
   * shape is keyed on the count and remounts instead of tweening between
   * mismatched paths.
   */
  const shapeKey = points.length

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      // `overflow-visible` because the axis now runs edge to edge: a
      // breakeven label near either end, and the 2px stroke itself, would
      // otherwise be clipped by the viewBox.
      className={cn(
        "mx-1.5 block h-auto w-[calc(100%-0.75rem)] overflow-visible",
        className
      )}
      role="img"
      aria-label={`Payoff diagram between ${minStrike.toFixed(0)} and ${maxStrike.toFixed(0)}, breaking even at ${breakevens.join(" and ")}`}
    >
      <defs>
        <clipPath id={aboveZeroClipId}>
          <rect x={0} y={0} width={WIDTH} height={zeroY} />
        </clipPath>
        <clipPath id={belowZeroClipId}>
          <rect x={0} y={zeroY} width={WIDTH} height={plotBottom - zeroY} />
        </clipPath>
      </defs>

      {bands.map(([from, to], i) => (
        <motion.rect
          key={`zone-${i}`}
          initial={false}
          animate={{ x: from, width: Math.max(0, to - from) }}
          transition={transitions.standard}
          y={PLOT_TOP - 10}
          height={plotBottom - PLOT_TOP + 10}
          fill="var(--positive)"
          fillOpacity={0.1}
        />
      ))}

      <line
        x1={PAD_X}
        x2={WIDTH - PAD_X}
        y1={zeroY}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeDasharray="4 4"
      />

      {/* Strike markers, unlabelled — the numbers that matter are the breakevens below. */}
      {strikes.map((s) => (
        <line
          key={`strike-${s}`}
          x1={xFor(s)}
          x2={xFor(s)}
          y1={plotBottom - 4}
          y2={plotBottom + 2}
          stroke="currentColor"
          strokeOpacity={0.3}
        />
      ))}

      <g key={shapeKey}>
        {/* Fill is clipped at the zero line so gains render in the positive color and losses in the negative color, instead of one color across the whole domain. */}
        <motion.path
          initial={false}
          animate={{ d: fillPath }}
          transition={transitions.standard}
          fill="var(--positive)"
          fillOpacity={0.16}
          clipPath={`url(#${aboveZeroClipId})`}
        />
        <motion.path
          initial={false}
          animate={{ d: fillPath }}
          transition={transitions.standard}
          fill="var(--negative)"
          fillOpacity={0.16}
          clipPath={`url(#${belowZeroClipId})`}
        />
        <motion.path
          initial={false}
          animate={{ d: linePath }}
          transition={transitions.standard}
          fill="none"
          stroke="var(--positive)"
          strokeWidth={2}
          strokeLinejoin="round"
          clipPath={`url(#${aboveZeroClipId})`}
        />
        <motion.path
          initial={false}
          animate={{ d: linePath }}
          transition={transitions.standard}
          fill="none"
          stroke="var(--negative)"
          strokeWidth={2}
          strokeLinejoin="round"
          clipPath={`url(#${belowZeroClipId})`}
        />
      </g>

      {spot !== undefined && (
        <g>
          <motion.line
            initial={false}
            animate={{ x1: xFor(spot), x2: xFor(spot) }}
            transition={transitions.standard}
            y1={PLOT_TOP - 10}
            y2={plotBottom}
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeDasharray="2 3"
          />
          <motion.text
            initial={false}
            animate={{ x: xFor(spot) }}
            transition={transitions.standard}
            y={PLOT_TOP - 16}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] tabular-nums"
          >
            now {spot.toFixed(0)}
          </motion.text>
        </g>
      )}

      {/* Marked where the line actually crosses zero, labelled with the
          real breakeven price. */}
      {breakevens.map((b, i) => {
        const markerX = crossings[i] ?? xFor(b)
        return (
          <g key={b}>
            <motion.circle
              initial={false}
              animate={{ cx: markerX }}
              transition={transitions.standard}
              cy={zeroY}
              r={3.5}
              fill="var(--positive)"
            />
            <motion.text
              initial={false}
              animate={{ x: markerX }}
              transition={transitions.standard}
              y={labelBaseline}
              textAnchor={
                breakevens.length > 1 ? (i === 0 ? "start" : "end") : "middle"
              }
              className="fill-muted-foreground text-[9px] tabular-nums"
            >
              {b.toFixed(b < 100 ? 2 : 0)}
            </motion.text>
          </g>
        )
      })}
    </svg>
  )
}
