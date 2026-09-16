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
   * pt-29 (116px) below = the banner's own 96px (h-24) plus 20px of breathing
   * room, so content clears the banner instead of starting flush against it.
   * The banner is absolutely positioned, so this padding is the only thing
   * holding content off it: change the banner's height and this changes too.
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
        CTA row and bottom nav are ONE sticky block, pinned at bottom-0.

        They used to stick separately — the footer at `bottom-14` (56px) and
        the nav at `bottom-0` — but the nav is intrinsically 66px tall (py-2
        around a 20px icon and a 10px label), not 56px. So on any screen tall
        enough to scroll, the footer stuck 10px too low and overlapped the
        nav, leaving a 3px gap under the button; on screens short enough that
        `mt-auto` placed the footer instead, the gap was the intended 12px.
        Hence the inconsistency between screens.

        Gluing them together removes the offset entirely, so there is no nav
        height to keep in sync and nothing to drift when the nav changes. The
        footer's own `pb-3` is now the single source of the 12px gap above the
        nav, identical on all 14 screens in both regimes.

        The fade is a dissolve rather than a bordered bar: `glass-nav` here
        drew a hard rule directly above the nav's own rule, stacking two
        seams. The generous `pt-12` gives the gradient room to read.
      */}
      <div className="sticky bottom-0 z-10 mt-auto">
        <div className="glass-sheet-fade flex flex-col gap-2 px-4 pt-12 pb-3">{footer}</div>
        <BottomNav activeIndex={activeTabIndex} onActiveChange={onActiveTabChange} />
      </div>
    </div>
  )
}
