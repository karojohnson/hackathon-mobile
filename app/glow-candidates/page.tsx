"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

import { PhoneFrame } from "@/components/mobile/phone-frame"
import { InterestQuiz } from "@/components/onboarding/interest-quiz"
import { PracticeShell } from "@/components/practice/practice-shell"
import { ColdStartScreen } from "@/components/practice/screens/cold-start"
import { PracticeProvider } from "@/components/providers/practice-provider"
import { PRACTICE_TAB_INDEX } from "@/components/providers/prototype-provider"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "@/lib/icons"

/**
 * Throwaway comparison page for picking the background-wash colour. Renders
 * the real `.quiz-top-glow` (Prototype 1 onboarding, 24%) and
 * `.practice-top-glow` (Prototype 2, 31%) surfaces once per candidate, on
 * the real screens, so the choice is made in context rather than against a
 * swatch.
 *
 * Each column overrides only the two glow utilities, scoped by a
 * `data-glow` attribute — nothing in app/globals.css is touched, so this
 * page can be deleted once the shade is chosen without unpicking anything.
 * `.dashboard-top-glow` is deliberately absent: the dashboard keeps its blue.
 *
 * Registered as a BARE_ROUTE in components/demo/demo-stage.tsx.
 */

interface Candidate {
  key: string
  label: string
  hex: string
  note: string
}

const CANDIDATES: Candidate[] = [
  { key: "blue", label: "Current", hex: "#5e9fd3", note: "today's --accent-blue, for reference" },
  { key: "a", label: "A · brick red", hex: "#c8453a", note: "tonal sibling of the blue" },
  { key: "b", label: "B · negative", hex: "#fc4138", note: "existing --negative token" },
  { key: "c", label: "C · priority red", hex: "#b32836", note: "existing --priority-red token" },
  { key: "d", label: "D · deep oxblood", hex: "#8f2a22", note: "closest to the reference shot" },
]

/**
 * Same gradient geometry and same stop percentages as the real utilities in
 * app/globals.css — only the colour differs, so what you compare here is
 * purely the hue.
 */
function overrideCss({ key, hex }: Candidate) {
  const stops = (peak: number, mid: number) => `
      color-mix(in oklch, ${hex} ${peak}%, transparent) 0%,
      color-mix(in oklch, ${hex} ${mid}%, transparent) 35%,
      color-mix(in oklch, ${hex} 0%, transparent) 70%`

  return `
[data-glow="${key}"] .quiz-top-glow {
  background: radial-gradient(140% 100% at 50% 0%,${stops(24, 10)});
}
[data-glow="${key}"] .practice-top-glow {
  background: radial-gradient(220% 120% at 100% 0%,${stops(31, 13)});
}`
}

/**
 * Scales a full 417x876 device down so all five candidates fit on screen at
 * once — comparing washes means seeing them side by side, not scrolling
 * between them. `zoom` (not `transform: scale`) so the scaled frame still
 * takes its reduced size in layout instead of overlapping its neighbours.
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

/** Prototype 2's cold-start screen — carries `.practice-top-glow` at 31%. */
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

/**
 * Prototype 1's onboarding step 1 — carries `.quiz-top-glow` at 24%. The
 * `glass-sheet` wrapper is what OnboardingOverlay puts around it in the
 * real flow, reproduced here so the wash sits on the same surface.
 */
function OnboardingTile() {
  return (
    <div className="glass-sheet flex h-full min-h-0 flex-col">
      <InterestQuiz onContinue={() => {}} onSkip={() => {}} />
    </div>
  )
}

export default function GlowCandidatesPage() {
  const [zoom, setZoom] = React.useState(0.58)

  return (
    <div className="min-h-dvh bg-muted">
      <style>{CANDIDATES.map(overrideCss).join("\n")}</style>

      <header className="sticky top-0 z-50 flex flex-wrap items-end justify-between gap-4 glass-nav px-8 py-5">
        <div className="flex flex-col gap-1">
          <Link href="/" className="type-label flex w-fit items-center gap-1 text-muted-foreground">
            <ChevronRight className="size-3.5 rotate-180" />
            Back to the prototype
          </Link>
          <h1 className="type-title text-foreground">Background wash: red candidates</h1>
          <p className="type-body text-muted-foreground">
            Real screens, real glow geometry. Top row is Prototype 2 at 31%, bottom row is
            Prototype 1 onboarding at 24%. The dashboard keeps its blue either way.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg glass-card p-1">
          {[
            { label: "Fit all five", value: 0.58 },
            { label: "Larger", value: 0.8 },
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
      </header>

      <div className="flex flex-col gap-10 overflow-x-auto px-8 py-8">
        {(
          [
            { title: "Prototype 2 · practice-top-glow · 31%", Tile: PracticeTile },
            { title: "Prototype 1 · quiz-top-glow · 24%", Tile: OnboardingTile },
          ] as const
        ).map(({ title, Tile }) => (
          <section key={title} className="flex flex-col gap-3">
            <h2 className="type-label uppercase tracking-wide text-muted-foreground">{title}</h2>
            <div className="flex items-start gap-6">
              {CANDIDATES.map((candidate) => (
                <div key={candidate.key} className="flex shrink-0 flex-col gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-3 shrink-0 rounded-full"
                        style={{ background: candidate.hex }}
                      />
                      <span className="type-body-strong text-foreground">{candidate.label}</span>
                      <code className="type-label font-mono text-muted-foreground/70">
                        {candidate.hex}
                      </code>
                    </div>
                    <span className="type-label text-muted-foreground/70">{candidate.note}</span>
                  </div>
                  <div
                    data-glow={candidate.key}
                    className={cn(
                      "overflow-hidden rounded-[64px]",
                      // The reference column is the untouched blue.
                      candidate.key === "blue" && "opacity-95"
                    )}
                  >
                    <ScaledFrame zoom={zoom}>
                      <Tile />
                    </ScaledFrame>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
