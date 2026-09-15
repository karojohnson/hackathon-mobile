import { cn } from "cn"

export const ONBOARDING_STEP_COUNT = 4

export interface StepProgressProps {
  /** 1-indexed — the 4th step is the actual buy screen, outside this flow. */
  current: number
  className?: string
}

export function StepProgress({ current, className }: StepProgressProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: ONBOARDING_STEP_COUNT }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={cn("h-1 flex-1 rounded-full", step <= current ? "bg-accent-blue" : "bg-border")}
        />
      ))}
    </div>
  )
}
