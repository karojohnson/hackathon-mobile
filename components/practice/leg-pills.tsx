import { cn } from "cn"

import type { StrategyLeg } from "@/data/mock-options-data"

export interface LegPillsProps {
  parts: StrategyLeg[]
  className?: string
}

/**
 * The legs a structure currently holds, as read-only pills.
 *
 * Output, not a control. These sit under the strike dial and restate what
 * the one thumb has selected, so they have to be legible as a consequence
 * of the dial rather than as a second thing to drag: plain spans, no
 * pointer cursor, no hover, focus or pressed state, no border to read as a
 * hit area, and a filled dot rather than an icon that might invite a tap.
 * A beginner moving one spread between strikes should never wonder whether
 * the pills are separately adjustable.
 *
 * Hidden from assistive tech on purpose. Every screen that uses this also
 * names both legs in prose directly above it ("sell the 230 put, buy the
 * 225 put"), and the dial itself announces the strike it has landed on, so
 * reading the pills as well would say the same thing a third time.
 */
export function LegPills({ parts, className }: LegPillsProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {parts.map((leg) => (
        <span
          key={`${leg.role}-${leg.type}-${leg.strike}`}
          className={cn(
            "type-label inline-flex cursor-default items-center gap-1.5 rounded-full px-2 py-0.5 tabular-nums select-none",
            leg.role === "short"
              ? "bg-negative/12 text-negative"
              : "bg-positive/12 text-positive"
          )}
        >
          <span className="size-1 rounded-full bg-current" />
          {leg.role === "short" ? "sell" : "buy"} {leg.strike} {leg.type}
        </span>
      ))}
    </div>
  )
}
