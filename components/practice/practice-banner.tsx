/**
 * Docked-at-top "this is practice, not a real trade" banner. Sits behind
 * the shared `<StatusBar />` (rendered separately by PhoneFrame) rather
 * than duplicating the clock/icons — this just supplies the gold gradient
 * background for that strip plus the info row beneath it. Height (h-24 =
 * 96px) is the 54px status-bar zone (matches StatusBar's own h-13.5) plus
 * ~42px for the info row. Tokens from docs/token-map.md (already bridged
 * in app/globals.css): --priority-gold / --priority-gold-surface.
 */
export function PracticeBanner() {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex h-24 flex-col border-b border-white/12 bg-linear-to-b from-priority-gold-surface to-elevated-surface">
      <div className="h-13.5 shrink-0" aria-hidden />
      <div className="flex flex-1 items-center justify-between px-4">
        <span className="type-label inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-priority-gold">
          <span className="size-1.5 rounded-full bg-priority-gold" aria-hidden />
          Practice
        </span>
        <span className="type-label text-priority-gold/80">simulated · nothing here trades</span>
      </div>
    </div>
  )
}
