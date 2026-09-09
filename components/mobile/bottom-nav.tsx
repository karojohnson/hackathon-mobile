"use client"

import * as React from "react"
import { cn } from "cn"

import { ArrowLeftRight, Compass, Home, LineChart, Wallet } from "@/lib/icons"

const items = [
  { label: "Home", icon: Home },
  { label: "Discover", icon: Compass },
  { label: "Trade", icon: ArrowLeftRight },
  { label: "Portfolio", icon: Wallet },
  { label: "Watchlist", icon: LineChart },
] as const

export interface BottomNavProps {
  className?: string
}

/**
 * Functional glass surface (section 11) — one of the few places translucency
 * is used. Ordinary content cards stay opaque.
 */
export function BottomNav({ className }: BottomNavProps) {
  const [active, setActive] = React.useState(0)

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
            onClick={() => setActive(index)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            <span className="type-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
