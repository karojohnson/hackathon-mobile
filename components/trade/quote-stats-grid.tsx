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
  details: string[]
}

const fields: StatField[] = [
  {
    key: "week52High",
    label: "52-wk high",
    tldr: "The highest price this stock has traded at over the past year.",
    details: [
      "This is a single trading print from sometime in the last 12 months, not a target or a ceiling — the stock can and does trade above it once a new high is set.",
      "Traders watch this level as a reference point: a stock trading close to its 52-week high is showing strong momentum, while one trading far below it may be out of favor or working through a slower stretch.",
      "Some traders treat a break above the 52-week high as a bullish signal (a \"breakout\"), since there's no recent trading history above that price to act as resistance.",
    ],
  },
  {
    key: "week52Low",
    label: "52-wk low",
    tldr: "The lowest price this stock has traded at over the past year.",
    details: [
      "Like the 52-week high, this is just a data point — the lowest print in the last 12 months, not a floor the stock is guaranteed to respect.",
      "A stock sitting near its 52-week low isn't automatically \"cheap\" — it often means something (weak earnings, bad news, a shrinking industry) pushed sellers to keep stepping in.",
      "Some traders watch this level as support — a price where buyers have shown up before — and pay attention if it breaks, since that can accelerate a decline.",
    ],
  },
  {
    key: "dayHigh",
    label: "Day's high",
    tldr: "The highest price this stock has hit today.",
    details: [
      "This resets every morning at the open and updates live as new trades print — a stock can set (and reset) its day's high many times before the market closes.",
      "The gap between the day's high and the current price gives a quick read on how much a stock has pulled back from its best moment of the session.",
      "A wide gap between the day's high and day's low usually means a more volatile session — more opportunity, but also more risk if you're trading around the swings.",
    ],
  },
  {
    key: "dayLow",
    label: "Day's low",
    tldr: "The lowest price this stock has hit today.",
    details: [
      "Same idea as the day's high, just the other direction — the worst price the stock has traded at since the market opened today.",
      "If the current price is sitting right on the day's low, that can mean selling pressure is still active right now, rather than the stock having already bounced back.",
      "Comparing the day's low to yesterday's close tells you how far the stock has actually fallen today, versus just how it's trading relative to itself intraday.",
    ],
  },
  {
    key: "open",
    label: "Open",
    tldr: "The price this stock started trading at today.",
    details: [
      "The open is set by the first trade of the regular session, and it doesn't have to match yesterday's closing price — news overnight (earnings, a headline, broader market moves) can push it to open noticeably higher or lower, a move called a \"gap.\"",
      "A gap up or down at the open often sets the tone for the rest of the day, though it's common for a stock to \"fill the gap\" and drift back toward the previous close as the session goes on.",
      "Comparing the current price to the open (rather than yesterday's close) shows you specifically how the stock has moved since trading began today.",
    ],
  },
  {
    key: "volume",
    label: "Volume",
    tldr: "How many shares have changed hands today.",
    details: [
      "Volume counts every share bought and sold today — it's a running total that only grows until the market closes, then resets the next day.",
      "Higher-than-usual volume often shows up around news, earnings, or big price moves — it's a rough signal of how much attention (and conviction) is behind a move.",
      "Low volume can mean a price move isn't backed by much real trading interest, and it also means wider spreads and less certainty that you'll get filled at the price you expect.",
    ],
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
                {openField.details.map((paragraph, i) => (
                  <p key={i} className="type-body text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
