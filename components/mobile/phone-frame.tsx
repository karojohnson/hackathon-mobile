/**
 * Wraps every route in an iPhone Pro-style mockup (393x852 — the iPhone
 * 15/16 Pro logical point size) instead of a responsive full-window layout,
 * so the prototype always presents as a phone regardless of browser window
 * size. Complements the fixed frame used for one-off checks in
 * app/prototype-kit (which reuses this same component now).
 *
 * The scroll container carries `[contain:layout]`, making it the containing
 * block for `fixed` positioned descendants (bottom nav, full-screen
 * overlays) — they clip to the screen instead of the real browser viewport.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-muted p-6">
      <div className="relative rounded-[64px] bg-neutral-900 p-3 shadow-2xl">
        <div className="relative h-[852px] w-[393px] overflow-hidden rounded-[52px] bg-background">
          <div className="h-full w-full overflow-x-hidden overflow-y-auto [contain:layout]">
            {children}
          </div>

          {/* Dynamic Island */}
          <div className="pointer-events-none absolute top-2.5 left-1/2 z-50 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
          {/* Home indicator */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/40" />
        </div>
      </div>
    </div>
  )
}
