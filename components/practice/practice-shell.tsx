"use client"

import * as React from "react"

import { BottomNav } from "@/components/mobile/bottom-nav"
import { PracticeBanner } from "@/components/practice/practice-banner"

export interface PracticeShellProps {
  children: React.ReactNode
  footer: React.ReactNode
  activeTabIndex: number
  onActiveTabChange: (index: number) => void
  /**
   * Steps back one screen in flow order. Omitted on the first screen,
   * where there is nowhere to go back to. Passed straight through to the
   * app bar, which is where the control lives — it used to sit in a 48px
   * row of its own beneath the banner.
   *
   * Navigation only: stepping back does not rewind an unlock or a resolved
   * trade. Walking the flow forward again re-applies them, which is fine for
   * a demo and keeps the provider from needing an undo stack.
   */
  onBack?: () => void
  /**
   * Changes whenever a different screen is shown. On change the surrounding
   * scroller is sent back to the top.
   *
   * Screens swap inside one persistent scroll container (PhoneFrame's), so
   * React replaces the children and the container keeps whatever scrollTop
   * it had — step forward from the bottom of a long screen and the next one
   * opens halfway down, past its own heading. Pass the screen id here.
   *
   * Omitted by the review harnesses, where each tile renders one fixed
   * screen and there is nothing to reset.
   */
  scrollResetKey?: string
}

/**
 * Nearest ancestor that actually scrolls. The shell doesn't own its
 * scroller — PhoneFrame does — and it sits a few levels up, so this walks
 * rather than assuming a depth. `scrollHeight > clientHeight` is part of
 * the test: the frame has a second `overflow-hidden` box in between that
 * would otherwise match on overflow alone.
 */
function scrollableAncestor(node: HTMLElement | null) {
  for (let el = node?.parentElement ?? null; el; el = el.parentElement) {
    const overflowY = window.getComputedStyle(el).overflowY
    if (/auto|scroll/.test(overflowY) && el.scrollHeight > el.clientHeight) return el
  }
  return null
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
  scrollResetKey,
}: PracticeShellProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollResetKey === undefined) return
    // Instant, not smooth: this is a page change, not a movement to follow.
    scrollableAncestor(rootRef.current)?.scrollTo({ top: 0, behavior: "auto" })
  }, [scrollResetKey])
  /*
   * No top padding here: PracticeBanner is sticky and sits in normal flow,
   * so its own h-24 reserves the space that a pt-24 used to. Keeping both
   * would double it.
   */
  return (
    <div ref={rootRef} className="glass-sheet -mt-14 relative flex min-h-[calc(100%+3.5rem)] flex-col">
      {/*
        Same accent-blue wash the dashboard runs (see `.dashboard-top-glow`),
        anchored above the banner so it bleeds up behind the status bar and
        down through the header — Chapter 2 shares a bottom nav with the
        dashboard, so it should share its canvas rather than sitting on a
        flat one. `-top-14` cancels the shell's own pt-14-equivalent bleed.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-14 h-141 practice-top-glow" />
      <PracticeBanner onBack={onBack} />

      {/*
        pt-6 is the app bar's clearance. The 48px back row used to supply it
        as a side effect of holding the chevron; with the control folded
        into the bar there is nothing between the bar and the first heading
        but this. 24px, matching the 24px the content clears the pinned CTA
        by at the other end, so the body sits in a symmetrical inset. One
        value for every screen, so nothing shifts stepping through the flow.
      */}
      <div className="relative flex flex-1 flex-col gap-6 px-4 pt-6 pb-3">{children}</div>

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
          two seams.

          The gradient hangs *above* the strip as an overlay rather than being
          the strip's own background. As a background it needed 48px of
          padding above the button for the fade to read, and padding is
          layout — so every screen in the chapter carried 48px of dead space
          between its last element and its CTA, plus the content's own 16px.
          Scrolled to the bottom, that read as the button having drifted away
          from the screen. As an overlay the fade is the same 48px tall and
          costs nothing, leaving a deliberate 24px: the content's pb-3 plus
          this strip's pt-3.
        */}
        <div className="footer-base relative flex flex-col gap-2 px-4 pt-3 pb-3">
          <div
            aria-hidden
            className="glass-sheet-fade pointer-events-none absolute inset-x-0 bottom-full h-12"
          />
          {footer}
        </div>
        <BottomNav activeIndex={activeTabIndex} onActiveChange={onActiveTabChange} className="inset-x-0" />
      </div>
    </div>
  )
}
