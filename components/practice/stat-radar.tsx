import { cn } from "cn"

import type { Axis } from "@/components/providers/practice-provider"

/*
 * Geometry lifted from the Figma "radar" frame (node 41:233): a 342x196
 * box whose grid is a 152px-wide diamond — so a 76px radius — centred at
 * (171, 98), with four rings at 25/50/75/100 and the axis labels sitting
 * outside it. The viewBox keeps those exact numbers rather than
 * normalising them, so a measurement taken off the Figma frame maps onto
 * this file one-to-one.
 */
const WIDTH = 342
const HEIGHT = 196
const CX = 171
const CY = 98
const RADIUS = 76

/** Ring radii as a share of the outer diamond, outermost last. */
const RINGS = [0.25, 0.5, 0.75, 1]

const AXES: Axis[] = ["direction", "duration", "distance", "volatility"]

/** Screen angles, clockwise from straight up. Matches the Figma labels. */
const AXIS_ANGLE_DEG: Record<Axis, number> = {
  direction: -90,
  duration: 0,
  distance: 90,
  volatility: 180,
}

const AXIS_LABEL: Record<Axis, string> = {
  direction: "DIRECTION",
  duration: "DURATION",
  distance: "DISTANCE",
  volatility: "VOLATILITY",
}

function pointFor(axis: Axis, fraction: number) {
  const angle = (AXIS_ANGLE_DEG[axis] * Math.PI) / 180
  const r = fraction * RADIUS
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) }
}

function polygonFor(fraction: number) {
  return AXES.map((axis) => {
    const { x, y } = pointFor(axis, fraction)
    return `${x},${y}`
  }).join(" ")
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value)) / 100
}

export interface StatRadarProps {
  /** 0–100 per axis. */
  values: Record<Axis, number>
  className?: string
}

export function StatRadar({ values, className }: StatRadarProps) {
  const dataPolygon = AXES.map((axis) => {
    const { x, y } = pointFor(axis, clamp(values[axis]))
    return `${x},${y}`
  }).join(" ")

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn("w-full overflow-visible", className)}
      role="img"
      aria-label={AXES.map((axis) => `${AXIS_LABEL[axis].toLowerCase()} ${values[axis]}%`).join(", ")}
    >
      {/*
        Rings fade outward so the centre of the diamond stays the densest
        part of the drawing. A single uniform opacity made the 25% ring
        disappear against the fill and the 100% ring fight the labels.
      */}
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={polygonFor(ring)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.06 + ring * 0.08}
          strokeWidth={1}
        />
      ))}

      <line x1={CX} y1={CY - RADIUS} x2={CX} y2={CY + RADIUS} stroke="currentColor" strokeOpacity={0.1} />
      <line x1={CX - RADIUS} y1={CY} x2={CX + RADIUS} y2={CY} stroke="currentColor" strokeOpacity={0.1} />

      <polygon
        points={dataPolygon}
        fill="var(--positive)"
        fillOpacity={0.22}
        stroke="var(--positive)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {AXES.map((axis) => {
        const { x, y } = pointFor(axis, clamp(values[axis]))
        return <circle key={axis} cx={x} cy={y} r={4} fill="var(--positive)" />
      })}

      {/*
        Labels hang off the outside of the diamond rather than tracking the
        vertices, so they hold still as the shape breathes. The horizontal
        pair anchors start/end; the vertical pair centres. The 6px gap
        off the diamond's edge is Figma's, not a guess — at the 32px I
        first used, the captions drifted away from the shape they label.
        Sized in user
        units (not a `.type-*` class) so the captions scale with the
        viewBox instead of drifting out of the drawing on wide screens.
      */}
      <g fontSize={9} fontWeight={700} letterSpacing={0.9} className="fill-muted-foreground">
        <text x={CX} y={CY - RADIUS - 7} textAnchor="middle">
          {AXIS_LABEL.direction}
        </text>
        <text x={CX + RADIUS + 6} y={CY + 4} textAnchor="start">
          {AXIS_LABEL.duration}
        </text>
        <text x={CX} y={CY + RADIUS + 15} textAnchor="middle">
          {AXIS_LABEL.distance}
        </text>
        <text x={CX - RADIUS - 6} y={CY + 4} textAnchor="end">
          {AXIS_LABEL.volatility}
        </text>
      </g>
    </svg>
  )
}
