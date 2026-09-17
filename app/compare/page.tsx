"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

import { PhoneFrame } from "@/components/mobile/phone-frame"
import { PracticeShell } from "@/components/practice/practice-shell"
import { ColdStartScreen } from "@/components/practice/screens/cold-start"
import { PayoutScreen } from "@/components/practice/screens/payout"
import { ResolutionScreen } from "@/components/practice/screens/resolution"
import { ColdStartScreenBefore } from "@/components/practice/before/cold-start"
import { PayoutScreenBefore } from "@/components/practice/before/payout"
import { ResolutionScreenBefore } from "@/components/practice/before/resolution"
import {
  PracticeProvider,
  type PracticeState,
  type ResolvedTrade,
  type ScreenId,
} from "@/components/providers/practice-provider"
import { PRACTICE_TAB_INDEX } from "@/components/providers/prototype-provider"
import { Button } from "@/components/ui/button"
import { PRACTICE_FOOTER_CTAS } from "@/lib/practice-flow"
import { ChevronRight } from "@/lib/icons"

/**
 * Before / after, one screen per row.
 *
 * Both columns render live components on this one dev server, rather than
 * iframing the original server: the redesign changed global CSS, so a
 * cross-server comparison would be comparing two stylesheets as well as
 * two component trees, and a cropped cross-origin iframe can't be scrolled
 * or interacted with anyway.
 *
 * The "before" column renders the vendored copies in
 * components/practice/before/, extracted verbatim from git HEAD. They use
 * `.glass-card-before`, which holds the pre-redesign card declarations, so
 * the left column is not quietly improved by the retuned live
 * `.glass-card`. Everything else they touch is unchanged by this pass.
 *
 * Rows are added here as screens are converted — see PAIRS.
 */

/** The scripted first-pass resolution, same seed the contact sheet uses. */
const SCRIPTED_TRADE: ResolvedTrade = {
  id: "0",
  symbol: "AAPL",
  outcome: "partial",
  axisResults: [
    { axis: "direction", correct: true, xp: 20 },
    { axis: "duration", correct: true, xp: 20 },
    {
      axis: "distance",
      correct: false,
      xp: 0,
      note: "Implied move was 7.2%. You set the floor at 235. It moved 11.0%.",
    },
    { axis: "volatility", correct: true, xp: 30 },
  ],
  xpEarned: 70,
  finishedPrice: 268.43,
  dayOfWindow: 12,
  windowDays: 14,
  gapNote: "gapped +11.0% on Sep 22 q4 earnings",
  verdictLine: "Distance was the miss.",
  contractHeadline: "The contract paid. Your read didn't.",
  lossNote: "Floor held at 235. You kept the $150 credit.",
}

interface Pair {
  id: ScreenId
  title: string
  /** What to look at, so the row isn't just two pictures. */
  changes: string[]
  before: React.ComponentType
  after: React.ComponentType
  seed?: Partial<PracticeState>
}

const PAIRS: Pair[] = [
  {
    id: "cold-start",
    title: "Worth a look",
    changes: [
      "Ticker promoted to .type-figure (20px) — it was 14px, the same size as the price beside it",
      "Catalyst is a Badge instead of a third line of 12px grey — it's the reason the symbol is here",
      "Selected card keeps its original blue wash, but gains elevation — the border, badge and shadow carry selection instead of a heavier fill",
      "Cards take a press state (.row-selectable)",
    ],
    before: ColdStartScreenBefore,
    after: ColdStartScreen,
  },
  {
    id: "resolution",
    title: "How it resolved",
    changes: [
      "Score to .type-display (28px), XP to .type-figure (20px) — both were 24px/14px and lost to the price above",
      "Per-axis XP to 20px gold; correct/missed become success/error Badges",
      "The miss explanation gets the card's full width instead of the ~200px column beside the badge",
      "Orange cut from four uses to one — only the verdict line. The X and the Missed badge already carry the failure",
      "Table keeps the original glass-card background, padding and row rhythm",
      "Fits a 390x844 frame with no scroll; the original overflowed by 90px",
    ],
    before: ResolutionScreenBefore,
    after: ResolutionScreen,
    seed: { resolvedTrades: [SCRIPTED_TRADE] },
  },
  {
    id: "payout",
    title: "The payout",
    changes: [
      "The earned figure counts up over a single gold bloom — it used to arrive fully formed",
      "Level bar goes from a 2px hairline to an 8px sunken track with a lit gold fill",
      "Per-axis XP to .type-figure; Level to .type-figure",
      "Level meter moved above the breakdown — \"+70 XP\" and \"the bar moved\" are cause and effect, and four rows sat between them",
      "Streak card raised above the plain content card it used to match",
    ],
    before: PayoutScreenBefore,
    after: PayoutScreen,
    seed: { resolvedTrades: [SCRIPTED_TRADE], streak: 7 },
  },
]

function Phone({
  id,
  seed,
  Screen,
}: {
  id: ScreenId
  seed?: Partial<PracticeState>
  Screen: React.ComponentType
}) {
  const ctas = PRACTICE_FOOTER_CTAS[id]

  return (
    <PracticeProvider persist={false} seed={{ ...seed, currentScreen: id }}>
      <PhoneFrame splash={false} height="full">
        <PracticeShell
          activeTabIndex={PRACTICE_TAB_INDEX}
          onActiveTabChange={() => {}}
          // Inert, but present on every tile — the live flow gives screen
          // 01 a back control too (it exits to the dashboard).
          onBack={() => {}}
          footer={
            <>
              {ctas.map((cta) => (
                // Inert, like the contact sheet's: a tile always shows the
                // screen it is labelled with.
                <Button
                  key={cta.label}
                  size="lg"
                  variant={cta.emphasis === "secondary" ? "ghost" : "default"}
                  className="h-11! w-full"
                  onClick={() => {}}
                >
                  {cta.label}
                </Button>
              ))}
            </>
          }
        >
          <Screen />
        </PracticeShell>
      </PhoneFrame>
    </PracticeProvider>
  )
}

function ColumnLabel({ side }: { side: "before" | "after" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "type-eyebrow rounded px-1.5 py-1",
          side === "before"
            ? "bg-badge-secondary-surface text-badge-secondary-text"
            : "bg-badge-success-surface text-badge-success-text"
        )}
      >
        {side}
      </span>
      <span className="type-label text-muted-foreground">
        {side === "before" ? "git HEAD" : "this branch"}
      </span>
    </div>
  )
}

export default function ComparePage() {
  const [dim, setDim] = React.useState(false)

  return (
    <div className="min-h-dvh bg-muted">
      <header className="sticky top-0 z-50 flex flex-col gap-3 glass-nav px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link href="/" className="type-label flex w-fit items-center gap-1 text-muted-foreground">
              <ChevronRight className="size-3.5 rotate-180" />
              Back to the prototype
            </Link>
            <h1 className="type-title text-foreground">Prototype 2: before / after</h1>
            <p className="type-body text-muted-foreground">
              {PAIRS.length} of 14 screens redesigned so far. Both columns are live components on this
              server. The footer CTAs don&apos;t navigate.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg glass-card p-1">
            <Button size="sm" variant={dim ? "ghost" : "default"} onClick={() => setDim(false)}>
              Both
            </Button>
            {/* Dimming the left column makes the redesign readable on its
                own without losing the reference beside it. */}
            <Button size="sm" variant={dim ? "default" : "ghost"} onClick={() => setDim(true)}>
              Focus after
            </Button>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1.5">
          {PAIRS.map((pair, i) => (
            <a
              key={pair.id}
              href={`#${pair.id}`}
              className="type-label rounded-md glass-card px-2 py-1 font-mono text-muted-foreground transition-colors hover:text-foreground"
            >
              {String(i + 1).padStart(2, "0")} {pair.id}
            </a>
          ))}
        </nav>
      </header>

      <div className="flex flex-col gap-12 px-8 py-8">
        {PAIRS.map((pair, i) => (
          <section key={pair.id} id={pair.id} className="flex scroll-mt-52 flex-col gap-4">
            <header className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="type-label tabular-nums text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="type-figure text-foreground">{pair.title}</h2>
                <code className="type-label rounded-md glass-card px-1.5 py-0.5 font-mono text-muted-foreground">
                  {pair.id}
                </code>
              </div>
              <ul className="flex max-w-[70ch] list-disc flex-col gap-1 pl-4">
                {pair.changes.map((change) => (
                  <li key={change} className="type-label text-muted-foreground">
                    {change}
                  </li>
                ))}
              </ul>
            </header>

            <div className="flex flex-wrap items-start gap-6">
              <div
                className={cn(
                  "flex flex-col gap-2 transition-opacity duration-300",
                  dim && "opacity-35 hover:opacity-100"
                )}
              >
                <ColumnLabel side="before" />
                <Phone id={pair.id} seed={pair.seed} Screen={pair.before} />
              </div>
              <div className="flex flex-col gap-2">
                <ColumnLabel side="after" />
                <Phone id={pair.id} seed={pair.seed} Screen={pair.after} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
