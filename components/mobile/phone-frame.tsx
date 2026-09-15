"use client"

import * as React from "react"

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
 * The scroll container carries `[contain:layout]`, making it the containing
 * block for `fixed` positioned descendants (bottom nav, full-screen
 * overlays) — they clip to the screen instead of the real browser viewport.
 * That only holds for descendants still in this DOM subtree, though — see
 * `usePhoneViewport` above for the portaled-content case.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null)

  return (
    <div
      className="relative aspect-417/876 h-[min(876px,calc(100dvh-3rem))] overflow-hidden rounded-[64px] border-12 border-neutral-900 bg-background shadow-2xl"
      style={{ maxWidth: "417px" }}
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
        ref={setViewport}
        className="h-full w-full overflow-x-hidden overflow-y-auto pt-14 outline-hidden [contain:layout]"
      >
        <PhoneViewportContext.Provider value={viewport}>
          <AppSplashGate>{children}</AppSplashGate>
        </PhoneViewportContext.Provider>
      </div>

      <StatusBar />

      {/* Dynamic Island */}
      <div className="pointer-events-none absolute top-2.5 left-1/2 z-50 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
      {/* Home indicator */}
      <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/40" />
    </div>
  )
}
