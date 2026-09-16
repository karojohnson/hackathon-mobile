"use client"

import * as React from "react"
import { cn } from "cn"

import { Activity, ArrowLeftRight, LineChart, Sparkles, Wallet } from "@/lib/icons"

/**
 * Five tabs, matching the Figma tab bar, and shared by both prototypes so
 * Chapter 2 doesn't read as a different product than the dashboard.
 *
 * Only two of these actually branch: `Bites` renders the practice tab, and
 * everything else renders the dashboard (see app/page.tsx). That's why the
 * labels are chosen for what the one dashboard screen actually contains —
 * its own section headings are "Watchlist" and "Positions" — rather than
 * for an information architecture that doesn't exist yet.
 *
 * Dropped from the previous six: Home (a label for "everything else" when
 * there's one screen), Discover (Bites owns "worth a look" now, and two
 * tabs for one intent dilutes both), and Portfolio (same concept as
 * Positions; Figma and the dashboard heading both say Positions).
 */
const items = [
  { label: "Watchlist", icon: LineChart },
  { label: "Positions", icon: Wallet },
  { label: "Trade", icon: ArrowLeftRight },
  { label: "Activity", icon: Activity },
  { label: "Bites", icon: Sparkles },
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
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            <span className="type-label leading-tight">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
