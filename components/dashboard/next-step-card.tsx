"use client"

import * as React from "react"
import Link from "next/link"

import { Lightbulb, X } from "@/lib/icons"

export interface NextStepCardProps {
  symbol: string
}

/**
 * "More ways to trade X" nudge tied to the symbol the user just traded.
 * Links to the options buy/sell screen for that symbol — futures and
 * prediction markets aren't built in this prototype, so the card leads
 * with the one destination that's real. Dismissal is local-only (not
 * persisted), since it's a lightweight "got it" nudge rather than an
 * account-signal to-do.
 */
export function NextStepCard({ symbol }: NextStepCardProps) {
  const [dismissed, setDismissed] = React.useState(false)
  if (dismissed) return null

  return (
    <Link
      href={`/symbol/${symbol}/options`}
      className="relative flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 py-3.5 pr-9 pl-4 transition-colors hover:bg-warning/15"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
        <Lightbulb className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-label uppercase tracking-wide text-warning">
          More ways to trade {symbol}
        </span>
        <span className="type-body text-foreground">
          Buy and sell options, trade futures or prediction markets.
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDismissed(true)
        }}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </Link>
  )
}
