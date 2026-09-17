"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

import { PhoneFrame } from "@/components/mobile/phone-frame"
import { PracticeShell } from "@/components/practice/practice-shell"
import { BriefingScreen } from "@/components/practice/screens/briefing"
import { ChainScreen } from "@/components/practice/screens/chain"
import { ColdStartScreen } from "@/components/practice/screens/cold-start"
import { DialInScreen } from "@/components/practice/screens/dial-in"
import { DialInAllFourScreen } from "@/components/practice/screens/dial-in-all-four"
import { DirectionScreen } from "@/components/practice/screens/direction"
import { DistanceDrillScreen } from "@/components/practice/screens/distance-drill"
import { DurationUnlockScreen } from "@/components/practice/screens/duration-unlock"
import { EarnedScreen } from "@/components/practice/screens/earned"
import { GraduationScreen } from "@/components/practice/screens/graduation"
import { OpenTradesScreen } from "@/components/practice/screens/open-trades"
import { PayoutScreen } from "@/components/practice/screens/payout"
import { RecordScreen } from "@/components/practice/screens/record"
import { ResolutionScreen } from "@/components/practice/screens/resolution"
import {
  PracticeProvider,
  type PracticeState,
  type ResolvedTrade,
  type ScreenId,
} from "@/components/providers/practice-provider"
import { PRACTICE_TAB_INDEX } from "@/components/providers/prototype-provider"
import { Button } from "@/components/ui/button"
import { PRACTICE_FOOTER_CTAS, previousScreen } from "@/lib/practice-flow"
import { ChevronRight } from "@/lib/icons"

/**
 * Every Prototype 2 (Chapter 2 / Practice) screen laid out on one page, in
 * flow order, outside the clickable prototype — a contact sheet for design
 * review and batch UI edits. Each tile is the real screen component in the
 * real PracticeShell, not a mock, so whatever you see here is what the
 * prototype renders.
 *
 * Two things differ from the clickable flow, both deliberate:
 *   - Each tile gets its own PracticeProvider with `persist={false}`, so the
 *     fourteen of them don't race on one localStorage key or wipe the
 *     prototype's saved progress just because you opened this page.
 *   - Footer CTAs render for layout fidelity but don't navigate — a tile
 *     always shows the screen it's labelled with.
 *
 * Tiles are still live: toggling a direction or a strike inside one updates
 * only that tile. Registered as a BARE_ROUTE in components/demo/demo-stage.tsx
 * so it renders full-page instead of inside the single phone mockup.
 */

/**
 * The resolution the flow produces on its scripted first pass (Distance is
 * the axis that's meant to miss) — see computeResolution in
 * lib/practice-flow.ts. Seeded into the post-resolution screens so they show
 * real numbers instead of zeroes.
 */
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

interface ScreenEntry {
  id: ScreenId
  /** Human name for the screen, for talking about it out loud. */
  title: string
  /** One line on what the screen is for. */
  note: string
  /** State this screen needs to render its fully-populated version. */
  seed?: Partial<PracticeState>
}

/**
 * Flow order, matching PRACTICE_SCREEN_ORDER in lib/practice-flow.ts.
 *
 * Seeds are chosen to show each screen's richest state rather than its
 * narratively-earliest one — a section that only appears once you have a
 * resolved trade is a section you can't design against if it's empty here.
 */
const SCREENS: ScreenEntry[] = [
  {
    id: "cold-start",
    title: "Worth a look",
    note: "Entry point. Four symbols with a catalyst this week.",
  },
  {
    id: "briefing",
    title: "What's coming",
    note: "The calendar and which of the four signals are open.",
  },
  {
    id: "direction",
    title: "Pick a direction",
    note: "The one axis a beginner is asked about first.",
  },
  {
    id: "dial-in",
    title: "Dial it in",
    note: "Probability dial and payoff shape for a short put spread.",
  },
  {
    id: "open-trades",
    title: "Your trades",
    note: "Open position plus the resolved-this-week list.",
    seed: { resolvedTrades: [SCRIPTED_TRADE], streak: 7 },
  },
  {
    id: "resolution",
    title: "How it resolved",
    note: "Per-axis scoring. Distance is the scripted miss.",
  },
  {
    id: "payout",
    title: "The payout",
    note: "XP breakdown, level progress, streak.",
    seed: { resolvedTrades: [SCRIPTED_TRADE], streak: 7 },
  },
  {
    id: "duration-unlock",
    title: "Duration unlocked",
    note: "Second axis opens; expirations become selectable.",
    seed: { unlockedAxes: ["direction", "duration"] },
  },
  {
    id: "distance-drill",
    title: "Distance drill",
    note: "Third axis: strike selection as a repeatable drill.",
    seed: { unlockedAxes: ["direction", "duration", "distance"] },
  },
  {
    id: "dial-in-all-four",
    title: "All four axes",
    note: "Iron condor with every column open.",
    seed: { unlockedAxes: ["direction", "duration", "distance", "volatility"] },
  },
  {
    id: "chain",
    title: "The real chain",
    note: "First look at an actual options chain.",
    seed: { unlockedAxes: ["direction", "duration", "distance", "volatility"] },
  },
  {
    id: "record",
    title: "Your record",
    note: "Radar of per-axis skill plus structures earned.",
    seed: {
      unlockedAxes: ["direction", "duration", "distance", "volatility"],
      resolvedTrades: [SCRIPTED_TRADE],
    },
  },
  {
    id: "earned",
    title: "What this earned",
    note: "Options level, fee unlocks, certificates.",
    seed: {
      unlockedAxes: ["direction", "duration", "distance", "volatility"],
      resolvedTrades: [SCRIPTED_TRADE],
    },
  },
  {
    id: "graduation",
    title: "Practice → Live",
    note: "The same trade, handed over with real money behind it.",
    seed: {
      unlockedAxes: ["direction", "duration", "distance", "volatility"],
      resolvedTrades: [SCRIPTED_TRADE],
    },
  },
]

const SCREEN_COMPONENTS: Record<ScreenId, React.ComponentType> = {
  "cold-start": ColdStartScreen,
  briefing: BriefingScreen,
  direction: DirectionScreen,
  "dial-in": DialInScreen,
  "open-trades": OpenTradesScreen,
  resolution: ResolutionScreen,
  payout: PayoutScreen,
  "duration-unlock": DurationUnlockScreen,
  "distance-drill": DistanceDrillScreen,
  "dial-in-all-four": DialInAllFourScreen,
  chain: ChainScreen,
  record: RecordScreen,
  earned: EarnedScreen,
  graduation: GraduationScreen,
}

type TileMode = "device" | "full"

function ScreenTile({ entry, index, mode }: { entry: ScreenEntry; index: number; mode: TileMode }) {
  const ScreenComponent = SCREEN_COMPONENTS[entry.id]
  const ctas = PRACTICE_FOOTER_CTAS[entry.id]
  const number = String(index + 1).padStart(2, "0")

  return (
    // scroll-mt clears the sticky header so a jump-link lands on the tile's
    // own label, not underneath the nav.
    <section id={entry.id} className="flex shrink-0 scroll-mt-52 flex-col gap-3">
      <header className="flex w-[417px] flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="type-label tabular-nums text-muted-foreground/60">{number}</span>
          <h2 className="type-lead-strong text-foreground">{entry.title}</h2>
          <code className="type-label rounded-md glass-card px-1.5 py-0.5 font-mono text-muted-foreground">
            {entry.id}
          </code>
        </div>
        <p className="type-label text-muted-foreground">{entry.note}</p>
        <p className="type-label font-mono text-muted-foreground/60">
          components/practice/screens/{entry.id}.tsx
        </p>
      </header>

      <PracticeProvider persist={false} seed={{ ...entry.seed, currentScreen: entry.id }}>
        <PhoneFrame splash={false} height={mode === "full" ? "auto" : "full"}>
          <PracticeShell
            activeTabIndex={PRACTICE_TAB_INDEX}
            onActiveTabChange={() => {}}
            // Inert like the CTAs below, but present/absent exactly as the
            // real flow has it, so a tile shows the chrome the screen ships
            // with — including screen 01's empty reserved row.
            onBack={previousScreen(entry.id) ? () => {} : undefined}
            footer={
              <>
                {ctas.map((cta) => (
                  <Button
                    key={cta.label}
                    size="lg"
                    variant={cta.emphasis === "secondary" ? "ghost" : "default"}
                    className="h-11! w-full"
                    // Inert on purpose — see the file header. A tile always
                    // shows the screen its label names.
                    onClick={() => {}}
                  >
                    {cta.label}
                  </Button>
                ))}
              </>
            }
          >
            <ScreenComponent />
          </PracticeShell>
        </PhoneFrame>
      </PracticeProvider>
    </section>
  )
}

export default function PracticeScreensPage() {
  const [mode, setMode] = React.useState<TileMode>("device")

  return (
    <div className="min-h-dvh bg-muted">
      <header className="sticky top-0 z-50 flex flex-col gap-3 glass-nav px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="type-label flex w-fit items-center gap-1 text-muted-foreground"
            >
              <ChevronRight className="size-3.5 rotate-180" />
              Back to the prototype
            </Link>
            <h1 className="type-title text-foreground">Prototype 2: all screens</h1>
            <p className="type-body text-muted-foreground">
              {SCREENS.length} Practice screens in flow order. Live components, not
              screenshots. The footer CTAs don&apos;t navigate.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg glass-card p-1">
            <Button
              size="sm"
              variant={mode === "device" ? "default" : "ghost"}
              onClick={() => setMode("device")}
            >
              Phone frames
            </Button>
            <Button
              size="sm"
              variant={mode === "full" ? "default" : "ghost"}
              onClick={() => setMode("full")}
            >
              Full height
            </Button>
          </div>
        </div>

        {/* Jump list — the fastest way to get to "screen 9" in a page this tall. */}
        <nav className="flex flex-wrap gap-1.5">
          {SCREENS.map((entry, i) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              className={cn(
                "type-label rounded-md glass-card px-2 py-1 font-mono text-muted-foreground",
                "transition-colors hover:text-foreground"
              )}
            >
              {String(i + 1).padStart(2, "0")} {entry.id}
            </a>
          ))}
        </nav>
      </header>

      <div className="flex flex-wrap items-start gap-x-10 gap-y-12 px-8 py-10">
        {SCREENS.map((entry, i) => (
          <ScreenTile key={entry.id} entry={entry} index={i} mode={mode} />
        ))}
      </div>
    </div>
  )
}
