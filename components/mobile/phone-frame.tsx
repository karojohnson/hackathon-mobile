"use client"

import * as React from "react"
import { cn } from "cn"

import { AppSplashGate } from "@/components/splash/app-splash-gate"
import { StatusBar } from "@/components/mobile/status-bar"

const PhoneViewportContext = React.createContext<HTMLDivElement | null>(null)

/**
 * The phone frame's own scroll viewport (the `[contain:layout]` element
 * below) — pass to a Portal's `container` prop so portaled content (sheets,
 * dialogs, popovers) mounts as a real DOM descendant of it and clips to the
 * phone screen, instead of Base UI's default of portaling to `document.body`
 * (a sibling of the whole demo stage, so `position: fixed` content inside it
 * escapes to the real browser viewport rather than the mockup). `null`
 * outside a PhoneFrame.
 */
export function usePhoneViewport() {
  return React.useContext(PhoneViewportContext)
}

/**
 * The bare iPhone Pro-style device bezel (393x852 — the iPhone 15/16 Pro
 * logical point size). Positioning/centering on the page is the caller's
 * job (see components/demo/demo-stage.tsx) so this can be reused standalone
 * (e.g. app/prototype-kit).
 *
 * Bezel and screen are a single element (border + overflow-hidden on the
 * same box), not two nested rounded divs — two independently-clipped
 * rounded corners can mismatch by a subpixel at the curve, showing up as a
 * seam right where the bezel meets the screen. A border's radius and the
 * content-clip radius are computed together as one curve, so there's
 * nothing to seam.
 *
 * The outer screen div carries `[contain:layout]`, making it the containing
 * block for `fixed` positioned descendants (bottom nav, full-screen
 * overlays) — they clip to the screen instead of the real browser viewport.
 * That only holds for descendants still in this DOM subtree, though — see
 * `usePhoneViewport` above for the portaled-content case.
 *
 * That containing-block div must stay static rather than also being the
 * `overflow-y-auto` scroller: a `contain:layout` box that scrolls carries
 * its `fixed` descendants along with it (they're positioned relative to its
 * scrolled content, not a stationary viewport), so a portaled bottom sheet
 * would drift out of place — or dim only part of the screen — depending on
 * how far the page happened to be scrolled when it opened. The actual page
 * content scrolls in the nested div below instead, so sheets/overlays stay
 * pinned to the screen no matter the scroll position.
 */
export interface PhoneFrameProps {
  children: React.ReactNode
  /**
   * Whether the 3-second launch splash plays. The clickable prototype wants
   * it; the screen gallery at /practice-screens does not — fourteen tiles
   * each covering themselves with a cherry for three seconds is just a wait.
   */
  splash?: boolean
  /**
   * `"fit"` (default) shrinks to the browser viewport so the whole device is
   * visible on a laptop. `"full"` pins the device to its true 876px so tiles
   * in a scrolling gallery are all the same size regardless of window height.
   * `"auto"` drops the device height entirely and grows to fit the content —
   * for reviewing a long screen end to end without scrolling inside the
   * bezel. Nothing scrolls in `"auto"`, so it is a review mode, not a
   * faithful device preview.
   */
  height?: "fit" | "full" | "auto"
}

export function PhoneFrame({ children, splash = true, height = "fit" }: PhoneFrameProps) {
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null)
  const content = splash ? <AppSplashGate>{children}</AppSplashGate> : children
  const isAuto = height === "auto"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[64px] border-12 border-neutral-900 bg-background shadow-2xl",
        isAuto ? "w-[417px]" : "aspect-417/876",
        height === "full" && "h-[876px]",
        height === "fit" && "h-[min(876px,calc(100dvh-3rem))]"
      )}
      style={{ maxWidth: "417px" }}
    >
      <div
        ref={setViewport}
        className={cn("relative w-full overflow-hidden [contain:layout]", !isAuto && "h-full")}
      >
        {/*
          pt-14 (56px) pushes every page's content down below the status
          bar/Dynamic Island uniformly (the status bar itself is 54px) — a
          single shift here instead of per-page padding tweaks. Safe against
          the splash screen's own `absolute inset-0` overlay: that resolves
          against this container's padding box, so the space above it during
          the splash is just more of the same bg-background, not a visible gap.
        */}
        <div
          className={cn(
            "w-full overflow-x-hidden pt-14 outline-hidden",
            // In "auto" the device has no height of its own, so a page
            // shorter than a real screen would leave bare bg below its
            // bottom nav. Floor it at one screen and stretch the page to
            // fill that floor, the way `h-full` does in the other modes.
            isAuto ? "flex min-h-[876px] flex-col *:flex-1" : "h-full overflow-y-auto"
          )}
        >
          <PhoneViewportContext.Provider value={viewport}>{content}</PhoneViewportContext.Provider>
        </div>
      </div>

      <StatusBar />

      {/* Dynamic Island */}
      <div className="pointer-events-none absolute top-2.5 left-1/2 z-50 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
      {/* Home indicator */}
      <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/40" />
    </div>
  )
}
