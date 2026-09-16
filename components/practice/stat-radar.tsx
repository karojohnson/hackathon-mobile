import { cn } from "cn"

import type { Axis } from "@/components/providers/practice-provider"

const AXES: Axis[] = ["direction", "duration", "distance", "volatility"]
const AXIS_ANGLE_DEG: Record<Axis, number> = { direction: -90, duration: 0, distance: 90, volatility: 180 }
const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 80

function pointFor(axis: Axis, value: number) {
  const angle = (AXIS_ANGLE_DEG[axis] * Math.PI) / 180
  const r = (Math.max(0, Math.min(100, value)) / 100) * RADIUS
  return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`
}

export interface StatRadarProps {
  /** 0–100 per axis. */
  values: Record<Axis, number>
  className?: string
}

export function StatRadar({ values, className }: StatRadarProps) {
  const polygon = AXES.map((a) => pointFor(a, values[a])).join(" ")
  const gridPolygon = AXES.map((a) => pointFor(a, 100)).join(" ")

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={cn("w-full", className)}>
      <polygon points={gridPolygon} fill="none" stroke="currentColor" strokeOpacity={0.15} />
      <polygon points={polygon} fill="var(--positive)" fillOpacity={0.25} stroke="var(--positive)" strokeWidth={2} />
    </svg>
  )
}
