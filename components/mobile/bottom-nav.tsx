"use client"

import * as React from "react"
import { cn } from "cn"

import { ArrowLeftRight, Compass, Home, LineChart, Sparkles, Wallet } from "@/lib/icons"

const items = [
  { label: "Home", icon: Home },
  { label: "Discover", icon: Compass },
  { label: "Trade", icon: ArrowLeftRight },
  { label: "Portfolio", icon: Wallet },
  { label: "Watchlist", icon: LineChart },
  { label: "Practice", icon: Sparkles },
] as const

export interface BottomNavProps {
  className?: string
  /** Controlled active tab index. Omit to let the nav manage its own state (e.g. the static prototype-kit demo). */
  activeIndex?: number
  /** Required to actually change tabs when `activeIndex` is controlled from a parent. */
  onActiveChange?: (index: number) => void
}

/**
 * Functional glass surface (section 11) — one of the few places translucency
 * is used. Ordinary content cards stay opaque.
 */
export function BottomNav({ className, activeIndex, onActiveChange }: BottomNavProps) {
  const [internalActive, setInternalActive] = React.useState(0)
  const active = activeIndex ?? internalActive

  function handleClick(index: number) {
    if (onActiveChange) onActiveChange(index)
    else setInternalActive(index)
  }

  return (
    <nav
      className={cn(
        "glass-nav flex items-center justify-around px-2 py-2",
        className
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        const isActive = index === active
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(index)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg px-0.5 py-1.5 transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] leading-tight">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
