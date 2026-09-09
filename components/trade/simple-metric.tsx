"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface SimpleMetricProps {
  label: string
  value: string
  /**
   * One-line plain-language definition. Open design question (see spec):
   * whether every metric gets one of these, or only the less-obvious ones —
   * for now every metric has one, err on the side of over-explaining for a
   * true beginner.
   */
  explainer: string
}

export function SimpleMetric({ label, value, explainer }: SimpleMetricProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <Tooltip>
        <TooltipTrigger className="type-body text-muted-foreground underline decoration-dotted underline-offset-4">
          {label}
        </TooltipTrigger>
        <TooltipContent>{explainer}</TooltipContent>
      </Tooltip>
      <span className="type-body-strong tabular-nums text-foreground">{value}</span>
    </div>
  )
}
