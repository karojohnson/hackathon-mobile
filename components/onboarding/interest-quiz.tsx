"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { interests } from "@/data/interests"

export interface InterestQuizProps {
  onContinue: (selectedIds: string[]) => void
  onSkip: () => void
}

export function InterestQuiz({ onContinue, onSkip }: InterestQuizProps) {
  const [selected, setSelected] = React.useState<string[]>([])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pt-10 pb-6">
      <div className="flex flex-col gap-1.5">
        <span className="type-label text-muted-foreground">Quick one before we start</span>
        <h1 className="type-title text-foreground">What are you interested in?</h1>
        <p className="type-body text-muted-foreground">
          Pick a few — we&apos;ll use it to shape what you see first. You can always change this later.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {interests.map((interest) => {
          const isSelected = selected.includes(interest.id)
          return (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggle(interest.id)}
              className={cn(
                "flex flex-col gap-1 rounded-xl border px-4 py-3.5 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:bg-muted"
              )}
            >
              <span className="type-body-strong">{interest.label}</span>
              <span
                className={cn(
                  "type-label",
                  isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                {interest.blurb}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3">
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
