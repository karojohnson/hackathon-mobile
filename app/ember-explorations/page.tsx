"use client"

import * as React from "react"
import Link from "next/link"

import { PhoneFrame } from "@/components/mobile/phone-frame"
import { InterestQuiz } from "@/components/onboarding/interest-quiz"
import { PracticeShell } from "@/components/practice/practice-shell"
import { ColdStartScreen } from "@/components/practice/screens/cold-start"
import { PracticeProvider } from "@/components/providers/practice-provider"
import { PRACTICE_TAB_INDEX } from "@/components/providers/prototype-provider"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "@/lib/icons"

/**
 * "Tasty Ember" colour exploration — three candidate brand atmospheres for
 * the onboarding flow, on the real screens, at the real glow geometry.
 *
 * Colour only. No layout, component, spacing, typography or content change:
 * every tile renders the same unmodified `InterestQuiz` / `ColdStartScreen`,
 * and each column overrides nothing but the `background` of the two
 * ambient-wash utilities, scoped by a `data-ember` attribute.
 *
 * Colour roles held constant across all three (see the role notes rendered
 * on the page):
 *   - Atmosphere: a muted ember/brick family derived from tastytrade red,
 *     as a radial wash only — never a flat fill, never on a card.
 *   - Interaction: `--accent-blue` #5e9fd3 stays. Untouched here, which is
 *     why the step bar, the "interested" emphasis and the selected-card
 *     outlines are still blue in every tile.
 *   - Negative: `--negative` #fc4138 stays reserved for errors, destructive
 *     actions and negative market states. Deliberately absent as decoration.
 *   - Neutrals: cards, search, chips, dividers and nav are untouched
 *     charcoal/black/white/grey.
 *
 * `.dashboard-top-glow` is absent by design — the dashboard keeps its blue.
 * Registered as a BARE_ROUTE in components/demo/demo-stage.tsx.
 */

interface Exploration {
  key: string
  name: string
  tagline: string
  /** The colours the wash is built from, for the on-page spec. */
  swatches: string[]
  /** Peak opacity of the wash, as a rough perceived-intensity readout. */
  intensity: string
  /** `background` for `.quiz-top-glow` — centred, top-anchored, 24%-class. */
  quiz: string
  /** `background` for `.practice-top-glow` — corner-anchored, 31%-class. */
  practice: string
}

/**
 * Peak percentages differ per candidate on purpose: a darker core needs a
 * higher mix to land at the same *perceived* brightness. The target is the
 * brief's 15–25% perceived intensity in all three, not the same number.
 */
const EXPLORATIONS: Exploration[] = [
  {
    key: "ember",
    name: "A · Ember",
    tagline: "Muted brick red. The most directly tastytrade-derived of the three.",
    swatches: ["#b94a42"],
    intensity: "peak 26% · single hue",
    quiz: `radial-gradient(140% 100% at 50% 0%,
      color-mix(in oklch, #b94a42 26%, transparent) 0%,
      color-mix(in oklch, #b94a42 12%, transparent) 35%,
      transparent 70%)`,
    practice: `radial-gradient(220% 120% at 100% 0%,
      color-mix(in oklch, #b94a42 33%, transparent) 0%,
      color-mix(in oklch, #b94a42 15%, transparent) 35%,
      transparent 70%)`,
  },
  {
    key: "burgundy",
    name: "B · Deep Burgundy",
    tagline: "Darker and richer. Reads as depth rather than colour. The most understated.",
    swatches: ["#7c3038"],
    intensity: "peak 36% of a dark core · single hue",
    quiz: `radial-gradient(140% 100% at 50% 0%,
      color-mix(in oklch, #7c3038 36%, transparent) 0%,
      color-mix(in oklch, #7c3038 17%, transparent) 38%,
      transparent 72%)`,
    practice: `radial-gradient(220% 120% at 100% 0%,
      color-mix(in oklch, #7c3038 44%, transparent) 0%,
      color-mix(in oklch, #7c3038 21%, transparent) 38%,
      transparent 72%)`,
  },
  {
    key: "amber",
    name: "C · Ember to Warm Amber",
    tagline: "Brick falloff with a warm amber core. Reads as light entering the room.",
    swatches: ["#c9752f", "#a94740"],
    intensity: "amber core 20% over brick 24% · two layers",
    // Two stacked radials, not a multi-stop hue ramp: the amber is a small
    // hot core sitting inside a wider brick falloff, so it reads as one
    // light source rather than as a two-colour gradient.
    quiz: `radial-gradient(85% 65% at 50% -8%,
        color-mix(in oklch, #c9752f 20%, transparent) 0%,
        transparent 58%),
      radial-gradient(150% 105% at 50% 0%,
        color-mix(in oklch, #a94740 24%, transparent) 0%,
        color-mix(in oklch, #a94740 10%, transparent) 38%,
        transparent 72%)`,
    practice: `radial-gradient(120% 80% at 100% -6%,
        color-mix(in oklch, #c9752f 24%, transparent) 0%,
        transparent 58%),
      radial-gradient(230% 125% at 100% 0%,
        color-mix(in oklch, #a94740 30%, transparent) 0%,
        color-mix(in oklch, #a94740 13%, transparent) 38%,
        transparent 72%)`,
  },
]

/** Where the exploration is coming from, kept alongside for judgement. */
const REFERENCES: Exploration[] = [
  {
    key: "blue",
    name: "Today · accent blue",
    tagline: "What's shipping now.",
    swatches: ["#5e9fd3"],
    intensity: "peak 24%",
    quiz: `radial-gradient(140% 100% at 50% 0%,
      color-mix(in oklch, #5e9fd3 24%, transparent) 0%,
      color-mix(in oklch, #5e9fd3 10%, transparent) 35%,
      transparent 70%)`,
    practice: `radial-gradient(220% 120% at 100% 0%,
      color-mix(in oklch, #5e9fd3 31%, transparent) 0%,
      color-mix(in oklch, #5e9fd3 13%, transparent) 35%,
      transparent 70%)`,
  },
  {
    key: "negative",
    name: "Earlier pick · negative red",
    tagline: "The shade you liked, shown for calibration. Too close to the error token to keep.",
    swatches: ["#fc4138"],
    intensity: "peak 24%",
    quiz: `radial-gradient(140% 100% at 50% 0%,
      color-mix(in oklch, #fc4138 24%, transparent) 0%,
      color-mix(in oklch, #fc4138 10%, transparent) 35%,
      transparent 70%)`,
    practice: `radial-gradient(220% 120% at 100% 0%,
      color-mix(in oklch, #fc4138 31%, transparent) 0%,
      color-mix(in oklch, #fc4138 13%, transparent) 35%,
      transparent 70%)`,
  },
]

const ALL = [...EXPLORATIONS, ...REFERENCES]

function overrideCss(e: Exploration) {
  return `
[data-ember="${e.key}"] .quiz-top-glow { background: ${e.quiz}; }
[data-ember="${e.key}"] .practice-top-glow { background: ${e.practice}; }`
}

/**
 * `zoom` rather than `transform: scale` so a scaled device still occupies
 * its reduced size in layout instead of overlapping its neighbours.
 */
function ScaledFrame({ zoom, children }: { zoom: number; children: React.ReactNode }) {
  return (
    <div style={{ zoom }}>
      <PhoneFrame splash={false} height="full">
        {children}
      </PhoneFrame>
    </div>
  )
}

/**
 * Onboarding step 1. The `glass-sheet` wrapper is what OnboardingOverlay
 * puts around it in the real flow, reproduced so the wash sits on the same
 * surface it will ship on. Steps 2 and 3 share `.quiz-top-glow`, so
 * whatever wins here applies to them unchanged.
 */
function OnboardingTile() {
  return (
    <div className="glass-sheet flex h-full min-h-0 flex-col">
      <InterestQuiz onContinue={() => {}} onSkip={() => {}} />
    </div>
  )
}

function PracticeTile() {
  return (
    <PracticeProvider persist={false} seed={{ currentScreen: "cold-start" }}>
      <PracticeShell
        activeTabIndex={PRACTICE_TAB_INDEX}
        onActiveTabChange={() => {}}
        footer={
          <Button size="lg" className="h-11! w-full" onClick={() => {}}>
            See what&apos;s coming
          </Button>
        }
      >
        <ColdStartScreen />
      </PracticeShell>
    </PracticeProvider>
  )
}

function Column({
  exploration,
  zoom,
  children,
}: {
  exploration: Exploration
  zoom: number
  children: React.ReactNode
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2.5" style={{ width: 417 * zoom }}>
      {/* Fixed height so captions of different lengths don't push the
          devices to different baselines — washes are hard to compare when
          the tiles don't line up. */}
      <div className="flex min-h-28 flex-col gap-1">
        <div className="flex items-center gap-2">
          {exploration.swatches.map((hex) => (
            <span
              key={hex}
              aria-hidden
              className="size-3.5 shrink-0 rounded-full"
              style={{ background: hex }}
            />
          ))}
          <span className="type-body-strong text-foreground">{exploration.name}</span>
        </div>
        <p className="type-label text-muted-foreground">{exploration.tagline}</p>
        <p className="type-label font-mono text-muted-foreground/60">
          {exploration.swatches.join(" + ")} · {exploration.intensity}
        </p>
      </div>
      <div data-ember={exploration.key} className="overflow-hidden rounded-[64px]">
        <ScaledFrame zoom={zoom}>{children}</ScaledFrame>
      </div>
    </div>
  )
}

export default function EmberExplorationsPage() {
  const [zoom, setZoom] = React.useState(0.72)

  return (
    <div className="min-h-dvh bg-muted">
      <style>{ALL.map(overrideCss).join("\n")}</style>

      <header className="sticky top-0 z-50 flex flex-col gap-4 glass-nav px-8 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="type-label flex w-fit items-center gap-1 text-muted-foreground"
            >
              <ChevronRight className="size-3.5 rotate-180" />
              Back to the prototype
            </Link>
            <h1 className="type-title text-foreground">Tasty Ember: brand atmosphere</h1>
            <p className="type-body text-muted-foreground">
              Three ambient-wash directions on the unmodified onboarding screen. Colour only.
              Same layout, components, spacing, type and copy in every tile.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg glass-card p-1">
            {[
              { label: "Compare", value: 0.72 },
              { label: "Larger", value: 0.88 },
              { label: "Full size", value: 1 },
            ].map((step) => (
              <Button
                key={step.label}
                size="sm"
                variant={zoom === step.value ? "default" : "ghost"}
                onClick={() => setZoom(step.value)}
              >
                {step.label}
              </Button>
            ))}
          </div>
        </div>

        {/* The roles being held fixed, so the comparison is only about atmosphere. */}
        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
          {[
            { swatch: "#5e9fd3", label: "Interaction: unchanged", detail: "progress, selected, emphasis" },
            { swatch: "#fc4138", label: "Negative: reserved", detail: "errors, destructive, loss only" },
            { swatch: "#262626", label: "Neutral: ~85-90%", detail: "cards, search, chips, nav" },
          ].map((role) => (
            <div key={role.label} className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                style={{ background: role.swatch }}
              />
              <span className="type-label text-foreground">{role.label}</span>
              <span className="type-label text-muted-foreground/70">{role.detail}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-10 px-8 py-8">
        <section className="flex flex-col gap-3">
          <h2 className="type-label uppercase tracking-wide text-muted-foreground">
            Prototype 1 · onboarding step 1 · quiz-top-glow
          </h2>
          <div className="flex items-start gap-6 overflow-x-auto pb-2">
            {EXPLORATIONS.map((e) => (
              <Column key={e.key} exploration={e} zoom={zoom}>
                <OnboardingTile />
              </Column>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="type-label uppercase tracking-wide text-muted-foreground">
            Same three on Prototype 2 · practice-top-glow. Does it generalise?
          </h2>
          <div className="flex items-start gap-6 overflow-x-auto pb-2">
            {EXPLORATIONS.map((e) => (
              <Column key={e.key} exploration={e} zoom={0.58}>
                <PracticeTile />
              </Column>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="type-label uppercase tracking-wide text-muted-foreground">
            Reference: where this is coming from
          </h2>
          <div className="flex items-start gap-6 overflow-x-auto pb-2">
            {REFERENCES.map((e) => (
              <Column key={e.key} exploration={e} zoom={0.58}>
                <OnboardingTile />
              </Column>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
