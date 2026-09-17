import * as React from "react"

import { BottomNav } from "@/components/mobile/bottom-nav"
import { PracticeBanner } from "@/components/practice/practice-banner"
import { ChevronRight } from "@/lib/icons"

export interface PracticeShellProps {
  children: React.ReactNode
  footer: React.ReactNode
  activeTabIndex: number
  onActiveTabChange: (index: number) => void
  /**
   * Steps back one screen in flow order. Omitted on the first screen, where
   * there is nowhere to go back to — the row still renders at its fixed
   * height so content doesn't jump between screen 01 and the rest.
   *
   * Navigation only: stepping back does not rewind an unlock or a resolved
   * trade. Walking the flow forward again re-applies them, which is fine for
   * a demo and keeps the provider from needing an undo stack.
   */
  onBack?: () => void
}

/**
 * Shared wrapper every Practice screen renders inside. Owns the
 * background-bleed pattern (see docs/superpowers/specs/2026-09-16-chapter-2-
 * practice-tab-design.md "Background & banner") so no individual screen
 * repeats it, the PracticeBanner overlay, the back row, the scrollable body,
 * the pinned footer CTA row, and the persistent app-level bottom nav.
 */
export function PracticeShell({
  children,
  footer,
  activeTabIndex,
  onActiveTabChange,
  onBack,
}: PracticeShellProps) {
  /*
   * No top padding here: PracticeBanner is sticky and sits in normal flow,
   * so its own h-24 reserves the space that a pt-24 used to. Keeping both
   * would double it.
   */
  return (
    <div className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col">
      {/*
        Same accent-blue wash the dashboard runs (see `.dashboard-top-glow`),
        anchored above the banner so it bleeds up behind the status bar and
        down through the header — Chapter 2 shares a bottom nav with the
        dashboard, so it should share its canvas rather than sitting on a
        flat one. `-top-14` cancels the shell's own pt-14-equivalent bleed.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-14 h-141 practice-top-glow" />
      <PracticeBanner />

      {/*
        Fixed-height row so screen 01 (no back target) reserves the same space
        as every other screen and nothing below it shifts. h-12 against a
        ~24px control centres to 12px of clearance above and below, so the
        chevron is not crowded against the banner or the content. Matches Prototype
        1's control in app/symbol/[symbol]/page.tsx: same rotated chevron,
        same `type-body` muted label, so the two prototypes read as one app.
      */}
      <div className="relative flex h-12 shrink-0 items-center px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="type-body flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight className="size-4 rotate-180" aria-hidden />
            Back
          </button>
        ) : null}
      </div>

      <div className="relative flex flex-1 flex-col gap-6 px-4 pb-4">{children}</div>

      {/*
        Footer and nav are one sticky unit rather than two separately-pinned
        elements. Pinning them apart made the CTA's resting place depend on
        whether that screen's content happened to overflow: short screens got
        `mt-auto` (12px above the nav), tall ones got the footer's own
        `sticky bottom-14` (flush against it), and the button visibly shifted
        as you moved through the flow. As one group the gap is always the
        footer's own pb-3, in every PhoneFrame height mode — including
        "auto", where nothing scrolls and sticky is inert.

        Anchoring at the bottom also means a two-button footer (graduation)
        grows upward, so the bottom-most button sits where every other
        screen's single button does.
      */}
      <div className="sticky bottom-0 z-10 mt-auto flex flex-col">
        {/*
          Dissolve-into-the-CTA footer rather than a bordered bar: `glass-nav`
          drew a hard rule right above the bottom nav's own hard rule, stacking
          two seams. The gradient is the same one the onboarding steps use, and
          the generous pt- gives it room to actually read as a fade.
        */}
        <div className="glass-sheet-fade flex flex-col gap-2 px-4 pt-12 pb-3">{footer}</div>
        <BottomNav activeIndex={activeTabIndex} onActiveChange={onActiveTabChange} className="inset-x-0" />
      </div>
    </div>
  )
}
