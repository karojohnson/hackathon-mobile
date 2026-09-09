import { BatteryFull, Signal, Wifi } from "@/lib/icons"

/**
 * Decorative iOS-style status bar (time + signal/wifi/battery), rendered
 * once at the PhoneFrame level so it appears on every screen. Purely
 * cosmetic — no real clock/connectivity state.
 */
export function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-7 pt-3 text-foreground">
      <span className="type-body-strong tabular-nums">9:41</span>
      <div className="flex items-center gap-1">
        <Signal className="size-4" />
        <Wifi className="size-4" />
        <BatteryFull className="size-5" />
      </div>
    </div>
  )
}
