/**
 * Decorative iOS-style status bar (time + cellular/wifi/battery), rendered
 * once at the PhoneFrame level so it appears on every screen. Purely
 * cosmetic — no real clock/connectivity state. Icons are hand-drawn to
 * match the real iOS glyph shapes (not generic Lucide stand-ins), sized
 * and centered to match the real iPhone 15/16 Pro status bar.
 */
export function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-13.5 items-center justify-between px-6 text-foreground">
      <span className="type-body-strong leading-none tabular-nums">9:41</span>
      <div className="flex items-center gap-1.25">
        <CellularIcon className="h-2.75 w-4.25" />
        <WifiIcon className="h-3 w-4" />
        <BatteryIcon className="h-3 w-6" />
      </div>
    </div>
  )
}

function CellularIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 17 12" fill="currentColor" className={className} aria-hidden>
      <rect x="0" y="7" width="3" height="5" rx="1" />
      <rect x="4.2" y="5" width="3" height="7" rx="1" />
      <rect x="8.4" y="3" width="3" height="9" rx="1" />
      <rect x="12.6" y="1" width="3" height="11" rx="1" />
    </svg>
  )
}

function WifiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 12" fill="currentColor" className={className} aria-hidden>
      <circle cx="8" cy="10.2" r="1.15" />
      <path d="M8 6.1c-1.42 0-2.75.53-3.77 1.46a.62.62 0 10.83.92A5.4 5.4 0 018 7.3c1.11 0 2.14.36 2.94 1.18a.62.62 0 00.9-.86A6.62 6.62 0 008 6.1z" />
      <path d="M8 3.2c-2.37 0-4.53.9-6.16 2.45a.62.62 0 10.85.9A7.77 7.77 0 018 4.44c1.98 0 3.79.75 5.31 2.11a.62.62 0 10.83-.92A9.01 9.01 0 008 3.2z" />
    </svg>
  )
}

function BatteryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 12" fill="none" className={className} aria-hidden>
      <rect
        x="0.75"
        y="0.75"
        width="19.5"
        height="10.5"
        rx="2.75"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
      <rect x="2.25" y="2.25" width="16.5" height="7.5" rx="1.5" fill="currentColor" />
      <path
        d="M21.5 4.25c.8.3 1.25 1.05 1.25 1.75s-.45 1.45-1.25 1.75z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  )
}
