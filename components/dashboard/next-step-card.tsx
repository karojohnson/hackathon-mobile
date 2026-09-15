"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { SignalBanner } from "@/components/dashboard/signal-banner"

export interface NextStepCardProps {
  symbol: string
}

/**
 * "More ways to trade" nudge tied to the symbol the user just traded.
 * Links to the options buy/sell screen for that symbol — futures and
 * prediction markets aren't built in this prototype, so it leads with the
 * one destination that's real. Dismissal is local-only (not persisted),
 * since it's a lightweight "got it" nudge rather than an account-signal
 * to-do.
 */
export function NextStepCard({ symbol }: NextStepCardProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = React.useState(false)
  if (dismissed) return null

  return (
    <SignalBanner
      variant="gold"
      eyebrow="More ways to trade"
      title="Options, futures & prediction markets"
      body="Buy and sell options, trade futures or prediction markets."
      secondary="Explore"
      dismissible
      onSecondary={() => router.push(`/symbol/${symbol}/options`)}
      onDismiss={() => setDismissed(true)}
    />
  )
}
