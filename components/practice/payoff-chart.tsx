import { cn } from "cn"

export interface PayoffChartPoint {
  strike: number
  value: number
}

export interface PayoffChartProps {
  /** Ascending by strike, at least 2 points — drawn as a connected step line. */
  points: PayoffChartPoint[]
  breakevens: number[]
  height?: number
  className?: string
}

const WIDTH = 300
const PAD = 20

/** Simplified payoff diagram — a straight-line approximation of the real step function, good enough to teach the shape. */
export function PayoffChart({ points, breakevens, height = 120, className }: PayoffChartProps) {
  const strikes = points.map((p) => p.strike)
  const values = points.map((p) => p.value)
  const minStrike = Math.min(...strikes)
  const maxStrike = Math.max(...strikes)
  const minValue = Math.min(...values, 0)
  const maxValue = Math.max(...values, 0)
  const strikeRange = maxStrike - minStrike || 1
  const valueRange = maxValue - minValue || 1

  function xFor(strike: number) {
    return PAD + ((strike - minStrike) / strikeRange) * (WIDTH - PAD * 2)
  }
  function yFor(value: number) {
    return height - PAD - ((value - minValue) / valueRange) * (height - PAD * 2)
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.strike)},${yFor(p.value)}`).join(" ")
  const zeroY = yFor(0)
  const fillPath = `${linePath} L${xFor(maxStrike)},${zeroY} L${xFor(minStrike)},${zeroY} Z`

  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} className={cn("w-full", className)} preserveAspectRatio="none">
      <line x1={PAD} x2={WIDTH - PAD} y1={zeroY} y2={zeroY} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 4" />
      <path d={fillPath} fill="var(--positive)" fillOpacity={0.15} />
      <path d={linePath} fill="none" stroke="var(--positive)" strokeWidth={2} />
      {breakevens.map((b) => (
        <circle key={b} cx={xFor(b)} cy={zeroY} r={4} fill="var(--positive)" />
      ))}
    </svg>
  )
}
