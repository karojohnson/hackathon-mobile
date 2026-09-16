import { cn } from "cn"

import { usePractice, type DirectionThesis } from "@/components/providers/practice-provider"
import { catalystsFor } from "@/data/mock-practice-data"
import { Check, Minus, TrendingDown, TrendingUp, Zap } from "@/lib/icons"

const OPTIONS: { id: DirectionThesis; label: string; sublabel: string; icon: typeof TrendingUp }[] = [
  { id: "rallies", label: "It rallies", sublabel: "you'd want upside exposure", icon: TrendingUp },
  { id: "sellsOff", label: "It sells off", sublabel: "you'd want downside exposure", icon: TrendingDown },
  { id: "flat", label: "It stays flat", sublabel: "you'd sell premium and let time work", icon: Minus },
  {
    id: "outsized",
    label: "It makes an outsized move",
    sublabel: "earnings, macro, political · you'd buy movement, not direction",
    icon: Zap,
  },
]

export function DirectionScreen() {
  const { symbol, chosenDirection, setDirection } = usePractice()
  const selected = chosenDirection ?? "rallies"
  const catalyst = catalystsFor(symbol)
  // The same event the briefing calendar accents, so the two screens agree.
  const focusEvent = catalyst.events.find((event) => event.focus) ?? catalyst.events[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="type-title text-foreground">Direction</h1>
        <p className="type-body text-muted-foreground">rally, sell off, flat, or an outsized move</p>
      </div>

      {/*
        "From the briefing" carry-forward, Figma node 76:271. Without it this
        screen never names the symbol at all — you pick a thesis about an
        unnamed stock with no reference to the catalyst that made it
        interesting. Metrics are the design's; the accent is accent-blue
        rather than its gold, which is reserved here for the practice flag.
      */}
      {focusEvent && (
        <div className="flex flex-col gap-1 rounded-xl border border-accent-blue bg-accent-blue/12 px-[13px] py-[11px]">
          <div className="flex items-center gap-2">
            <span className="type-label font-bold tracking-[1px] text-accent-blue">
              From the briefing
            </span>
            <span className="type-label ml-auto tabular-nums text-muted-foreground/70">
              {focusEvent.daysOut} days out
            </span>
          </div>
          <span className="type-body font-medium text-foreground">
            {focusEvent.label} {focusEvent.date} · implied move ± {catalyst.impliedMovePercent}%
          </span>
        </div>
      )}

      <span className="type-label uppercase tracking-wide text-muted-foreground">What do you think happens</span>

      <div className="flex flex-col gap-2.5">
        {OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = option.id === selected
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setDirection(option.id)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                isSelected ? "border-accent-blue bg-accent-blue/12" : "glass-card"
              )}
            >
              <Icon className="size-5 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <span className="type-body-strong text-foreground">{option.label}</span>
                <span className="type-label text-muted-foreground">{option.sublabel}</span>
              </div>
              {isSelected && <Check className="size-5 shrink-0 text-accent-blue" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
