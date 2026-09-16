import { cn } from "cn"

import { usePractice, type DirectionThesis } from "@/components/providers/practice-provider"
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
  const { chosenDirection, setDirection } = usePractice()
  const selected = chosenDirection ?? "rallies"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">Direction</h1>
        <p className="type-body text-muted-foreground">rally, sell off, flat, or an outsized move</p>
      </div>

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
                "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left",
                isSelected ? "border-positive bg-positive/10" : "border-transparent bg-muted"
              )}
            >
              <Icon className="size-5 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <span className="type-body-strong text-foreground">{option.label}</span>
                <span className="type-label text-muted-foreground">{option.sublabel}</span>
              </div>
              {isSelected && <Check className="size-5 shrink-0 text-positive" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
