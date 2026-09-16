import * as React from "react"

import { BottomNav } from "@/components/mobile/bottom-nav"
import { PracticeBanner } from "@/components/practice/practice-banner"

export interface PracticeShellProps {
  children: React.ReactNode
  footer: React.ReactNode
  activeTabIndex: number
  onActiveTabChange: (index: number) => void
}

/**
 * Shared wrapper every Practice screen renders inside. Owns the
 * background-bleed pattern (see docs/superpowers/specs/2026-09-16-chapter-2-
 * practice-tab-design.md "Background & banner") so no individual screen
 * repeats it, the PracticeBanner overlay, the scrollable body, the pinned
 * footer CTA row, and the persistent app-level bottom nav.
 */
export function PracticeShell({ children, footer, activeTabIndex, onActiveTabChange }: PracticeShellProps) {
  return (
    <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col pt-24">
      <PracticeBanner />
      <div className="flex flex-1 flex-col gap-6 px-4 pb-4">{children}</div>
      <div className="glass-nav sticky bottom-14 -mx-4 mt-auto flex flex-col gap-2 px-4 pt-3 pb-3">{footer}</div>
      <BottomNav
        activeIndex={activeTabIndex}
        onActiveChange={onActiveTabChange}
        className="sticky inset-x-0 bottom-0 z-10"
      />
    </div>
  )
}
