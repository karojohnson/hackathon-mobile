/**
 * Docked-at-top "this is practice, not a real trade" flag. Sits behind
 * the shared `<StatusBar />` (rendered separately by PhoneFrame) rather
 * than duplicating the clock/icons — this is just the info row beneath it.
 * Height (h-24 = 96px) is the 54px status-bar zone (matches StatusBar's own
 * h-13.5) plus ~42px for the info row. Token from docs/token-map.md
 * (already bridged in app/globals.css): --priority-gold.
 *
 * Deliberately has no background or bottom border of its own: an opaque
 * gold-to-elevated block cut the shell's accent-blue wash off with a hard
 * seam and made Chapter 2 read as a different product than the dashboard.
 * Gold now survives only as the text/dot colour, which is all the "nothing
 * here trades" flag actually needs to do.
 */
export function PracticeBanner() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-24 flex-col">
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
