"use client"

import { cn } from "cn"

import { Slider } from "@/components/ui/slider"
import type { StrategyLeg, TrackStop } from "@/data/mock-options-data"

export interface StrikeDialProps {
  /** Every step the dial can reach, with the strike each one produces. */
  track: TrackStop[]
  value: number
  onChange: (step: number) => void
  /** Every leg of the structure, so the wing isn't left implied. */
  parts: StrategyLeg[]
  className?: string
}

/**
 * The strike dial.
 *
 * Two things this is built around, both from design feedback on the
 * previous version. The track is anchored on strike prices rather than an
 * abstract 50/70/90 probability scale — you drag across the strikes you'd
 * actually be selling, and the probability of profit is reported back from
 * the pricing model rather than being the thing you set. And every leg is
 * drawn, not just the short one: a vertical showed only the strike it sold
 * and left the protective wing invisible, which is the leg that caps the
 * risk.
 */
export function StrikeDial({ track, value, onChange, parts, className }: StrikeDialProps) {
  const min = track[0]?.step ?? 1
  const max = track[track.length - 1]?.step ?? 5
  const current = track.find((t) => t.step === value) ?? track[0]

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        // Without these the control announces as an unnamed slider reading
        // "3", with no clue it picks a strike. These route to the nested
        // input; see slider.tsx.
        thumbLabel="Short strike"
        thumbValueText={() =>
          current ? `${current.strike}, ${current.pop}% probability of profit` : `${value}`
        }
        onValueChange={(v) => onChange((Array.isArray(v) ? v[0] : v) as number)}
      />

      <div className="flex justify-between px-0.5">
        {track.map((stop) => (
          <button
            key={stop.step}
            type="button"
            onClick={() => onChange(stop.step)}
            className={cn(
              "type-label tabular-nums transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              stop.step === value ? "text-foreground" : "text-muted-foreground/50"
            )}
            aria-label={`Short strike ${stop.strike}, ${stop.pop}% probability of profit`}
            aria-pressed={stop.step === value}
          >
            {stop.strike}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {parts.map((leg) => (
          <span
            key={`${leg.role}-${leg.type}-${leg.strike}`}
            className={cn(
              "rounded-full px-2 py-0.5 type-label tabular-nums",
              leg.role === "short" ? "bg-negative/12 text-negative" : "bg-positive/12 text-positive"
            )}
          >
            {leg.role === "short" ? "sell" : "buy"} {leg.strike} {leg.type}
          </span>
        ))}
      </div>
    </div>
  )
}
