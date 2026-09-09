import { cn } from "cn"

import { ArrowDownRight, ArrowUpRight } from "@/lib/icons"
import { formatPercent } from "@/lib/format"

export interface KpiCardProps {
  label: string
  value: string
  changePercent?: number
  className?: string
}

/**
 * Compact metric/KPI treatment — a DashboardCN-shaped pattern, hand-built
 * (see docs/design-foundation.md: the @dashboardcn registry is configured in
 * components.json but unreachable from this network today via Zscaler TLS
 * inspection). Swap for `@dashboardcn/kpi-card` once that's reachable.
 */
export function KpiCard({ label, value, changePercent, className }: KpiCardProps) {
  const trend = changePercent === undefined ? "neutral" : changePercent > 0 ? "positive" : changePercent < 0 ? "negative" : "neutral"

  return (
    <div className={cn("flex flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3", className)}>
      <span className="type-label text-muted-foreground">{label}</span>
      <span className="type-title text-foreground tabular-nums">{value}</span>
      {changePercent !== undefined && (
        <span
          className={cn(
            "type-label inline-flex items-center gap-0.5",
            trend === "positive" && "text-positive",
            trend === "negative" && "text-negative",
            trend === "neutral" && "text-muted-foreground"
          )}
        >
          {trend === "positive" && <ArrowUpRight className="size-3.5" />}
          {trend === "negative" && <ArrowDownRight className="size-3.5" />}
          {formatPercent(changePercent)}
        </span>
      )}
    </div>
  )
}
