"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  useOnboarding,
  type PreferenceWeights,
  type TodoFlags,
} from "@/components/providers/onboarding-provider"
import { todoDefs } from "@/data/demo-todos"

const weightLabels: Record<keyof PreferenceWeights, string> = {
  stocks: "Stocks",
  options: "Options",
  etfs: "ETFs",
  predictions: "Prediction markets",
}

/**
 * Lives outside the phone mockup entirely — a presenter's control deck, not
 * part of the simulated product. Shares the same OnboardingProvider as the
 * phone content, so every change here reflects on the dashboard instantly,
 * no reload needed (localStorage persistence still covers an actual browser
 * refresh). See the "dynamic dashboard" north-star memory this stands in for.
 */
export function ControlSidebar() {
  const { preferenceWeights, setPreferenceWeights, todos, setTodoFlag, dominantPreference } =
    useOnboarding()
  const pathname = usePathname()

  function setWeight(key: keyof PreferenceWeights, value: number) {
    setPreferenceWeights({ ...preferenceWeights, [key]: value })
  }

  function resetDemo() {
    try {
      window.localStorage.removeItem("hackathon-onboarding-state-v1")
    } catch {
      // ignore
    }
    window.location.assign("/")
  }

  return (
    <div className="flex h-[876px] w-[340px] flex-col gap-5 overflow-y-auto rounded-2xl border border-border bg-surface p-5 text-sm">
      <div className="flex flex-col gap-1">
        <span className="type-label uppercase tracking-wide text-muted-foreground">
          Presenter view
        </span>
        <h1 className="type-title text-foreground">Demo controls</h1>
        <p className="type-body text-muted-foreground">
          Not part of the product — reshapes the phone live as you demo it.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">
            Customer preferences
          </span>
        </div>
        <p className="type-label text-foreground">
          Dominant: <span className="type-body-strong">{weightLabels[dominantPreference]}</span>
        </p>

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

      <section className="flex flex-col gap-1 rounded-lg border border-border bg-background p-4">
        <span className="type-label mb-2 uppercase tracking-wide text-muted-foreground">
          Account signals (to-do nudges)
        </span>
        {todoDefs.map((def) => (
          <div
            key={def.key}
            className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
          >
            <span className="type-body text-foreground">{def.title}</span>
            <Switch
              checked={todos[def.key as keyof TodoFlags]}
              onCheckedChange={(checked) => setTodoFlag(def.key as keyof TodoFlags, checked)}
            />
          </div>
        ))}
      </section>

      <div className="mt-auto flex flex-col gap-2">
        <Link
          href={pathname === "/concepts" ? "/" : "/concepts"}
          className={buttonVariants({ variant: "secondary" })}
        >
          {pathname === "/concepts" ? "Back to dashboard" : "View dashboard concepts"}
        </Link>
        <Button variant="ghost" onClick={resetDemo}>
          Reset demo
        </Button>
      </div>
    </div>
  )
}
