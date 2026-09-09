import { cn } from "cn"

export interface AllocationSlice {
  label: string
  percent: number
  colorClassName: string
}

export interface AllocationBarProps {
  slices: AllocationSlice[]
  className?: string
}

/**
 * Portfolio allocation pattern — a DashboardCN-shaped example, hand-built for
 * the same reason as KpiCard (see its comment / docs/design-foundation.md).
 */
export function AllocationBar({ slices, className }: AllocationBarProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {slices.map((slice) => (
          <div
            key={slice.label}
            className={cn("h-full", slice.colorClassName)}
            style={{ width: `${slice.percent}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", slice.colorClassName)} />
            <span className="type-label text-muted-foreground">
              {slice.label} <span className="text-foreground">{slice.percent}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
