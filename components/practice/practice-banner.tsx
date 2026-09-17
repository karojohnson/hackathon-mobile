import { ChevronRight } from "@/lib/icons"

export interface PracticeBannerProps {
  /**
   * Steps back one screen in flow order. Omitted on the first screen,
   * where there is nowhere to go back to — the centred flag stays put
   * either way, so no space is reserved for the missing control.
   */
  onBack?: () => void
}

/**
 * The chapter's app bar: back on the left, the simulation flag centred,
 * nothing on the right.
 *
 * `-top-14` (-56px), not `top-0`: PhoneFrame's scroller carries pt-14 to
 * clear the Dynamic Island, and this has to bleed up behind it. Because it
 * is in normal flow, its h-24 is what holds content off it — PracticeShell
 * has no pt of its own.
 *
 * Height (h-24 = 96px) is the 54px status-bar zone (matching StatusBar's
 * own h-13.5) plus ~42px for the bar itself. Token from docs/token-map.md:
 * --priority-gold.
 *
 * Two things this replaced, and why:
 *
 * The bar used to carry a left-aligned gold "Practice" and a right-aligned
 * grey "Simulated · Nothing here trades" — two unrelated labels pinned to
 * opposite edges, saying the same thing twice in two vocabularies. With the
 * right-hand caption gone, the centred word has to carry the reassurance on
 * its own, which is why it reads SIMULATION rather than the product's name
 * for the mode. Note the flow still says "Practice" everywhere else (the
 * Bites tab, the CTA copy, PRACTICE_* constants, the Figma frames), so this
 * is deliberately the one place the plainer word is used.
 *
 * The back control used to sit in its own 48px row underneath, a whole
 * band of chrome holding one 20px control. Folding it in here is the
 * standard app-bar arrangement and gives every screen in the chapter that
 * 48px back.
 *
 * `pointer-events-none` stays on the container so the bar never eats taps
 * meant for content scrolling under it; the button opts back in.
 */
export function PracticeBanner({ onBack }: PracticeBannerProps) {
  return (
    <div className="glass-banner pointer-events-none sticky -top-14 z-30 flex h-24 shrink-0 flex-col">
      <div className="h-13.5 shrink-0" aria-hidden />
      <div className="relative flex flex-1 items-center px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="type-body pointer-events-auto relative z-10 flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight className="size-4 rotate-180" aria-hidden />
            Back
          </button>
        ) : null}

        {/*
          Absolutely centred rather than laid out between the back control
          and a spacer, so the flag sits on the screen's centre line whether
          or not there is a back button beside it. Otherwise it would shift
          sideways between screen 01 and the rest.
        */}
        <span className="type-label absolute left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap uppercase text-priority-gold">
          {/*
            Exported from Figma (the "ipoEducation" glyph) rather than
            substituted with a Lucide stand-in, so it is the real mark. Its
            gold is baked into the file at #f3ca56, which is exactly what
            --priority-gold resolves to in the dark theme.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/practice.svg" alt="" width={20} height={20} className="size-5 shrink-0" />
          Simulation
        </span>
      </div>
    </div>
  )
}
