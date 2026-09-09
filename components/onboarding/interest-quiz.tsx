"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { interests, type Interest } from "@/data/interests"

export interface InterestQuizProps {
  initialSelected?: string[]
  onContinue: (selectedIds: string[]) => void
  onSkip: () => void
}

const vibeInterests = interests.filter((i) => i.tier === "vibe")
const sectorInterests = interests.filter((i) => i.tier === "sector")

function InterestChip({
  interest,
  isSelected,
  onToggle,
}: {
  interest: Interest
  isSelected: boolean
  onToggle: () => void
}) {
  const Icon = interest.icon

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex flex-col gap-2 rounded-xl border px-4 py-3.5 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("size-5", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
      <span className="type-body-strong">{interest.label}</span>
      <span className={cn("type-label", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
        {interest.blurb}
      </span>
    </button>
  )
}

export function InterestQuiz({ initialSelected = [], onContinue, onSkip }: InterestQuizProps) {
  const [selected, setSelected] = React.useState<string[]>(initialSelected)

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-10">
      <div className="flex flex-col gap-1.5 px-6">
        <span className="type-label text-muted-foreground">Quick one before we start</span>
        <h1 className="type-title text-foreground">What are you interested in?</h1>
        <p className="type-body text-muted-foreground">
          Pick a few — go broad, go specific, or mix and match. We&apos;ll use it to shape
          what you see first, and you can always change it later.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <span className="type-label uppercase tracking-wide text-muted-foreground">
              Big picture
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {vibeInterests.map((interest) => (
                <InterestChip
                  key={interest.id}
                  interest={interest}
                  isSelected={selected.includes(interest.id)}
                  onToggle={() => toggle(interest.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="type-label uppercase tracking-wide text-muted-foreground">
              By sector
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {sectorInterests.map((interest) => (
                <InterestChip
                  key={interest.id}
                  interest={interest}
                  isSelected={selected.includes(interest.id)}
                  onToggle={() => toggle(interest.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6">
        <Button size="lg" disabled={selected.length === 0} onClick={() => onContinue(selected)}>
          Continue
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="type-label self-center text-muted-foreground underline-offset-2 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
