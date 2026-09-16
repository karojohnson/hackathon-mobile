/**
 * Docked-at-top "this is practice, not a real trade" flag. Sits behind
 * the shared `<StatusBar />` (rendered separately by PhoneFrame) rather
 * than duplicating the clock/icons — this is just the info row beneath it.
 * Height (h-24 = 96px) is the 54px status-bar zone (matches StatusBar's own
 * h-13.5) plus ~42px for the info row. Token from docs/token-map.md
 * (already bridged in app/globals.css): --priority-gold.
 *
 * Styling copied from Figma node 249:5363 (tastytrade Practice Tab file):
 * `.glass-banner` fill stack, the 20px exported education glyph beside an
 * uppercase gold "Practice", and a neutral-grey right-hand caption. See
 * app/globals.css for the fill itself.
 *
 * Two things that differ from an earlier hand-rolled version, both matching
 * the design: the label is not bold (weight 525, which `.type-label` already
 * is) and has no extra letter-spacing, and the caption is muted grey rather
 * than gold, so only the flag itself carries colour.
 */
export function PracticeBanner() {
  return (
    <div className="glass-banner pointer-events-none absolute inset-x-0 top-0 z-30 flex h-24 flex-col">
      <div className="h-13.5 shrink-0" aria-hidden />
      <div className="flex flex-1 items-center justify-between px-4">
        <span className="type-label inline-flex items-center gap-1.5 uppercase text-priority-gold">
          {/*
            Exported from Figma (the "ipoEducation" glyph) rather than
            substituted with a Lucide stand-in, so it is the real mark. Its
            gold is baked into the file at #f3ca56, which is exactly what
            --priority-gold resolves to in the dark theme.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/practice.svg" alt="" width={20} height={20} className="size-5 shrink-0" />
          Practice
        </span>
        <span className="type-label text-muted-foreground">Simulated · Nothing here trades</span>
      </div>
    </div>
  )
}
