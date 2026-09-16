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
  /*
   * pt-29 (116px) below = the banner's own 96px (h-24) plus 20px of
   * breathing room, so content clears the banner instead of starting flush
   * against it. The banner is absolutely positioned, so this padding is the
   * only thing holding content off it: change the banner's height and this
   * changes too.
   */
  return (
    <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col pt-29">
      {/*
        Same accent-blue wash the dashboard runs (see `.dashboard-top-glow`),
        anchored above the banner so it bleeds up behind the status bar and
        down through the header — Chapter 2 shares a bottom nav with the
        dashboard, so it should share its canvas rather than sitting on a
        flat one. `-top-14` cancels the shell's own pt-14-equivalent bleed.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-14 h-141 practice-top-glow" />
      <PracticeBanner />
      <div className="relative flex flex-1 flex-col gap-6 px-4 pb-4">{children}</div>
      {/*
        Dissolve-into-the-CTA footer rather than a bordered bar: `glass-nav`
        drew a hard rule right above the bottom nav's own hard rule, stacking
        two seams. The gradient is the same one the onboarding steps use, and
        the generous pt- gives it room to actually read as a fade.
      */}
      <div className="glass-sheet-fade sticky bottom-14 mt-auto flex flex-col gap-2 px-4 pt-12 pb-3">{footer}</div>
      <BottomNav
        activeIndex={activeTabIndex}
        onActiveChange={onActiveTabChange}
        className="sticky inset-x-0 bottom-0 z-10"
      />
    </div>
  )
}
