import { cn } from "cn"

import type { Axis } from "@/components/providers/practice-provider"
import { Lock } from "@/lib/icons"

const AXIS_LABEL: Record<Axis, string> = {
  direction: "Direction",
  duration: "Duration",
  distance: "Distance",
  volatility: "Volatility",
}

export interface AxisTagProps {
  axis: Axis
  unlocked: boolean
  className?: string
}

export function AxisTag({ axis, unlocked, className }: AxisTagProps) {
  return (
    <span
      className={cn(
        "type-label inline-flex items-center gap-1 rounded-md bg-surface-glass-sunken px-1.5 py-1 uppercase tracking-wide",
        unlocked ? "text-foreground" : "text-muted-foreground/60",
        className
      )}
    >
      {!unlocked && <Lock className="size-3" />}
      {AXIS_LABEL[axis]}
    </span>
  )
}
