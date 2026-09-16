"use client"

import * as React from "react"
import { cn } from "cn"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { formatCurrency } from "@/lib/format"
import { formatVolume, type QuoteStats } from "@/lib/quote-stats"

interface StatField {
  key: keyof QuoteStats
  label: string
  tldr: string
  detail: string
}

const fields: StatField[] = [
  {
    key: "week52High",
    label: "52-wk high",
    tldr: "The highest price this stock has traded at over the past year.",
    detail:
      "It's just a data point, not a ceiling. The stock can trade above it once a new high is set. Traders watch it as a reference: trading close to it signals strong momentum, while trading far below it can mean the stock is out of favor.",
  },
  {
    key: "week52Low",
    label: "52-wk low",
    tldr: "The lowest price this stock has traded at over the past year.",
    detail:
      "It's just a data point, not a floor the stock is guaranteed to respect. Sitting near it isn't automatically \"cheap\": it often means something (weak earnings, bad news) pushed sellers to keep stepping in.",
  },
  {
    key: "dayHigh",
    label: "Day's high",
    tldr: "The highest price this stock has hit today.",
    detail:
      "It resets every morning at the open and can update multiple times before the close. The gap between it and the current price is a quick read on how far the stock has pulled back from its best moment of the session.",
  },
  {
    key: "dayLow",
    label: "Day's low",
    tldr: "The lowest price this stock has hit today.",
    detail:
      "Same idea as the day's high, just the other direction: the worst price the stock has traded at since the market opened. If the current price is sitting right on it, selling pressure may still be active.",
  },
  {
    key: "open",
    label: "Open",
    tldr: "The price this stock started trading at today.",
    detail:
      "Set by the first trade of the session, it doesn't have to match yesterday's close: overnight news can push it noticeably higher or lower (a \"gap\"). Comparing the current price to the open shows how it's moved since trading began today.",
  },
  {
    key: "volume",
    label: "Volume",
    tldr: "How many shares have changed hands today.",
    detail:
      "It's a running total that only grows until the market closes, then resets the next day. Higher-than-usual volume often shows up around news or big price moves, while low volume can mean a move isn't backed by much real trading interest.",
  },
]

export function QuoteStatsGrid({ stats }: { stats: QuoteStats }) {
  const [openField, setOpenField] = React.useState<StatField | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 rounded-lg glass-card">
        {fields.map((field, i) => (
          <div
            key={field.key}
            className={cn(
              "flex flex-col gap-0.5 px-3 py-2",
              i % 2 === 0 && "border-r border-(--glass-border-shade)",
              i < fields.length - 2 && "border-b border-(--glass-border-shade)"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenField(field)}
              className="type-label w-fit text-left text-muted-foreground underline decoration-dotted underline-offset-4"
            >
              {field.label}
            </button>
            <span className="type-body-strong tabular-nums text-foreground">
              {field.key === "volume" ? formatVolume(stats.volume) : formatCurrency(stats[field.key])}
            </span>
          </div>
        ))}
      </div>

      <Drawer
        showSwipeHandle
        open={openField != null}
        onOpenChange={(open) => {
          if (!open) setOpenField(null)
        }}
      >
        <DrawerContent className="glass-sheet">
          {openField && (
            <>
              <DrawerHeader>
                <DrawerTitle>{openField.label}</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-3 px-4 pb-10">
                <p className="type-body-strong text-foreground">{openField.tldr}</p>
                <p className="type-body text-muted-foreground">{openField.detail}</p>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
