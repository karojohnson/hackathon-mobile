import { StatRadar } from "@/components/practice/stat-radar"
import { usePractice } from "@/components/providers/practice-provider"
import { ALL_STRUCTURES } from "@/data/mock-practice-data"
import { Lock } from "@/lib/icons"

const AXES = [
  { id: "direction" as const, label: "Direction", sublabel: "delta", value: 71, tier: "SHARP" },
  { id: "duration" as const, label: "Duration", sublabel: "theta · expiration", value: 66, tier: "SOLID" },
  { id: "distance" as const, label: "Distance", sublabel: "strike selection", value: 54, tier: "DEVELOPING" },
  { id: "volatility" as const, label: "Volatility", sublabel: "vega · IV at entry", value: 48, tier: "UNPROVEN" },
]

export function RecordScreen() {
  const { level, xp, resolvedTrades, structuresEarned } = usePractice()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="type-title text-foreground">Your record</h1>
          <span className="type-label text-muted-foreground">{resolvedTrades.length} resolved trades this run</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="type-body-strong text-priority-gold">LVL {level}</span>
          <span className="type-label tabular-nums text-muted-foreground">{xp} XP</span>
        </div>
      </div>

      <StatRadar values={{ direction: 71, duration: 66, distance: 54, volatility: 48 }} />

      <div className="flex flex-col rounded-lg glass-card px-4">
        {AXES.map((axis) => (
          <div key={axis.id} className="flex flex-col gap-1 border-b border-border py-2.5 last:border-b-0">
            <div className="flex items-center justify-between">
              <span className="type-body text-foreground">{axis.label}</span>
              <div className="flex items-center gap-2">
                <span className="type-label text-muted-foreground">{axis.tier}</span>
                <span className="type-body-strong tabular-nums text-foreground">{axis.value}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-lg bg-priority-blue-surface! p-4">
        <span className="type-body-strong text-foreground">Volatility is your weakest stat.</span>
        <span className="type-label text-muted-foreground">Trade it more to bring it up.</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Structures earned</span>
          <span className="type-label tabular-nums text-muted-foreground">
            {structuresEarned.length} / {ALL_STRUCTURES.length}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {ALL_STRUCTURES.map((structure) => {
            const earned = structuresEarned.includes(structure.id)
            return (
              <div
                key={structure.id}
                className={
                  earned
                    ? "flex aspect-square items-center justify-center rounded-lg glass-card"
                    : "flex aspect-square items-center justify-center rounded-lg glass-card opacity-45"
                }
                title={structure.label}
              >
                {earned ? (
                  <span className="type-label text-foreground">{structure.label.slice(0, 2)}</span>
                ) : (
                  <Lock className="size-5 text-muted-foreground/50" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
