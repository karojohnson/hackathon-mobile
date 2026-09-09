"use client"

import { cn } from "cn"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/format"
import { formatVolume, type QuoteStats } from "@/lib/quote-stats"

interface StatField {
  key: keyof QuoteStats
  label: string
  explainer: string
}

const fields: StatField[] = [
  {
    key: "week52High",
    label: "52-wk high",
    explainer: "The highest price this stock has traded at over the past year.",
  },
  {
    key: "week52Low",
    label: "52-wk low",
    explainer: "The lowest price this stock has traded at over the past year.",
  },
  { key: "dayHigh", label: "Day's high", explainer: "The highest price this stock has hit today." },
  { key: "dayLow", label: "Day's low", explainer: "The lowest price this stock has hit today." },
  { key: "open", label: "Open", explainer: "The price this stock started trading at today." },
  { key: "volume", label: "Volume", explainer: "How many shares have changed hands today." },
]

export function QuoteStatsGrid({ stats }: { stats: QuoteStats }) {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-border bg-surface">
      {fields.map((field, i) => (
        <div
          key={field.key}
          className={cn(
            "flex flex-col gap-0.5 px-3 py-2",
            i % 2 === 0 && "border-r border-border",
            i < fields.length - 2 && "border-b border-border"
          )}
        >
          <Tooltip>
            <TooltipTrigger className="type-label w-fit text-muted-foreground underline decoration-dotted underline-offset-4">
              {field.label}
            </TooltipTrigger>
            <TooltipContent>{field.explainer}</TooltipContent>
          </Tooltip>
          <span className="type-body-strong tabular-nums text-foreground">
            {field.key === "volume" ? formatVolume(stats.volume) : formatCurrency(stats[field.key])}
          </span>
        </div>
      ))}
    </div>
  )
}
