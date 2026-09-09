"use client"

import * as React from "react"

import { logoUrlFor } from "@/data/company-logos"

export interface TickerAvatarProps {
  symbol: string
  size?: number
  className?: string
}

/**
 * Circular per-company logo, fetched from TradingView's public logo CDN.
 * Falls back to a plain monogram (no logo for ETFs like SPY, or if the
 * image fails to load).
 */
export function TickerAvatar({ symbol, size = 36, className }: TickerAvatarProps) {
  const url = logoUrlFor(symbol)
  const [errored, setErrored] = React.useState(false)
  const showFallback = !url || errored

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {!showFallback && (
        // eslint-disable-next-line @next/next/no-img-element -- external per-company logo, not a local asset next/image can optimize
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      )}
      {showFallback && (
        <span className="type-label font-bold text-foreground">{symbol.slice(0, 2)}</span>
      )}
    </div>
  )
}
