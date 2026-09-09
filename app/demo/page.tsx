"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useOnboarding, type PreferenceWeights, type TodoFlags } from "@/components/providers/onboarding-provider"
import { todoDefs } from "@/data/demo-todos"
import { ChevronRight } from "@/lib/icons"

const weightLabels: Record<keyof PreferenceWeights, string> = {
  stocks: "Stocks",
  options: "Options",
  etfs: "ETFs",
  predictions: "Prediction markets",
}

/**
 * Demo-only control panel — stands in for the real backend signals
 * described in the "dynamic dashboard" north-star memory (product-type
 * engagement, account-completion state). Not part of the real product;
 * lets a presenter reshape the dashboard live without a backend.
 */
export default function DemoPage() {
  const { preferenceWeights, setPreferenceWeights, todos, setTodoFlag, dominantPreference } = useOnboarding()

  function setWeight(key: keyof PreferenceWeights, value: number) {
    setPreferenceWeights({ ...preferenceWeights, [key]: value })
  }

  return (
    <div className="flex min-h-full flex-col gap-6 px-4 pt-8 pb-8">
      <Link href="/" className="type-label flex w-fit items-center gap-1 text-muted-foreground">
        <ChevronRight className="size-3.5 rotate-180" />
        Dashboard
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">Demo controls</h1>
        <p className="type-body text-muted-foreground">
          Not a real product screen — reshapes the dashboard live for the demo.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">
            Customer preferences
          </span>
          <span className="type-label text-foreground">Dominant: {weightLabels[dominantPreference]}</span>
        </div>

        {(Object.keys(weightLabels) as (keyof PreferenceWeights)[]).map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="type-body text-foreground">{weightLabels[key]}</span>
              <span className="type-body-strong tabular-nums text-foreground">
                {preferenceWeights[key]}
              </span>
            </div>
            <Slider
              value={[preferenceWeights[key]]}
              onValueChange={(value) => setWeight(key, Array.isArray(value) ? value[0] : value)}
              min={0}
              max={100}
              step={5}
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
        <span className="type-label mb-2 uppercase tracking-wide text-muted-foreground">
          Account signals (to-do nudges)
        </span>
        {todoDefs.map((def) => (
          <div
            key={def.key}
            className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
          >
            <div className="flex min-w-0 flex-col">
              <span className="type-body text-foreground">{def.title}</span>
            </div>
            <Switch
              checked={todos[def.key as keyof TodoFlags]}
              onCheckedChange={(checked) => setTodoFlag(def.key as keyof TodoFlags, checked)}
            />
          </div>
        ))}
      </section>

      <Button size="lg" onClick={() => window.location.assign("/")}>
        Reload dashboard
      </Button>
    </div>
  )
}
