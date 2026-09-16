import { cn } from "cn"

import { Slider } from "@/components/ui/slider"
import type { DialStop } from "@/components/providers/practice-provider"

const STOPS: DialStop[] = [50, 70, 90]

export interface DialSliderProps {
  value: DialStop
  onChange: (value: DialStop) => void
  className?: string
}

/** Single-thumb slider snapped to the 3 built "chance this works" stops. */
export function DialSlider({ value, onChange, className }: DialSliderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Slider
        value={[value]}
        min={50}
        max={90}
        step={20}
        onValueChange={(v) => onChange((Array.isArray(v) ? v[0] : v) as DialStop)}
      />
      <div className="flex justify-between px-0.5">
        {STOPS.map((stop) => (
          <span
            key={stop}
            className={cn("type-label tabular-nums", stop === value ? "text-foreground" : "text-muted-foreground/50")}
          >
            {stop}%
          </span>
        ))}
      </div>
    </div>
  )
}
