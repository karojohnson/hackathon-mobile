"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import { transitions } from "@/lib/motion"

export interface PayoffChartPoint {
  strike: number
  value: number
}

export interface PayoffChartProps {
  /** Ascending by strike, at least 2 points — drawn as a connected line. */
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
  /** P/L window, same rule — constant across stops, or the shape can't flatten. */
  yDomain: [number, number]
  /**
   * Price bands where the structure makes money, shaded behind everything.
   * A real element of Figma `06 Dial in - all four tiers` (node 2:14),
   * which draws the condor's profit zone as a green band between its
   * breakevens. Two bands for a long strangle, which pays at both edges.
   */
  profitZones?: [number, number][]
  /** Underlying's current price, drawn as a labelled marker. */
  spot?: number
  /** Strikes to mark along the baseline. */
  strikes?: number[]
  height?: number
  className?: string
}

const WIDTH = 320
const PAD_X = 22
const PLOT_TOP = 28

/**
 * Payoff diagram — a straight-line approximation of the real step function,
 * good enough to teach the shape. Gains render above the zero line in the
 * positive color, losses below it in the negative color.
 */
export function PayoffChart({
  points,
  breakevens,
  xDomain,
  yDomain,
  profitZones = [],
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
  const [minValue, maxValue] = yDomain
  const strikeRange = maxStrike - minStrike || 1
  const valueRange = maxValue - minValue || 1

  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

  function xFor(strike: number) {
    const t = (strike - minStrike) / strikeRange
    return PAD_X + clamp(t, 0, 1) * (WIDTH - PAD_X * 2)
  }
  function yFor(value: number) {
    const t = (value - minValue) / valueRange
    return plotBottom - clamp(t, 0, 1) * (plotBottom - PLOT_TOP)
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.strike)},${yFor(p.value)}`).join(" ")
  const zeroY = yFor(0)
  const fillPath = `${linePath} L${xFor(maxStrike)},${zeroY} L${xFor(minStrike)},${zeroY} Z`

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
      className={cn("w-full", className)}
      role="img"
      aria-label={`Payoff diagram between ${minStrike} and ${maxStrike}, breaking even at ${breakevens.join(" and ")}`}
    >
      <defs>
        <clipPath id={aboveZeroClipId}>
          <rect x={0} y={0} width={WIDTH} height={zeroY} />
        </clipPath>
        <clipPath id={belowZeroClipId}>
          <rect x={0} y={zeroY} width={WIDTH} height={plotBottom - zeroY} />
        </clipPath>
      </defs>

      {profitZones.map(([from, to]) => (
        <motion.rect
          key={`zone-${from}-${to}`}
          initial={false}
          animate={{ x: xFor(from), width: Math.max(0, xFor(to) - xFor(from)) }}
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

      {breakevens.map((b, i) => (
        <g key={b}>
          <motion.circle
            initial={false}
            animate={{ cx: xFor(b) }}
            transition={transitions.standard}
            cy={zeroY}
            r={3.5}
            fill="var(--positive)"
          />
          <motion.text
            initial={false}
            animate={{ x: xFor(b) }}
            transition={transitions.standard}
            y={labelBaseline}
            textAnchor={breakevens.length > 1 ? (i === 0 ? "start" : "end") : "middle"}
            className="fill-muted-foreground text-[9px] tabular-nums"
          >
            {b.toFixed(b < 100 ? 2 : 0)}
          </motion.text>
        </g>
      ))}
    </svg>
  )
}
