import { usePractice } from "@/components/providers/practice-provider"
import { Progress } from "@/components/ui/progress"

const XP_PER_LEVEL = 3000

export function PayoutScreen() {
  const { xp, level, streak, resolvedTrades } = usePractice()
  const lastTrade = resolvedTrades[resolvedTrades.length - 1]
  const xpIntoLevel = xp % XP_PER_LEVEL

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="type-hero text-priority-gold">+{lastTrade?.xpEarned ?? 0} XP</span>
        <span className="type-body text-muted-foreground">
          {lastTrade ? `${lastTrade.axesCorrect.length} of ${lastTrade.axesCorrect.length + lastTrade.axesMissed.length} axes paid.` : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Where it came from</span>
        <div className="flex flex-col rounded-lg glass-card px-4">
          {lastTrade?.axesCorrect.map((axis) => (
            <div key={axis} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <span className="type-body capitalize text-foreground">{axis}</span>
              <span className="type-body-strong tabular-nums text-priority-gold">+20</span>
            </div>
          ))}
          {lastTrade?.axesMissed.map((axis) => (
            <div key={axis} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <span className="type-body capitalize text-muted-foreground">{axis}</span>
              <span className="type-body-strong tabular-nums text-muted-foreground">0</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-body-strong text-foreground">Level {level}</span>
          <span className="type-label tabular-nums text-muted-foreground">{xpIntoLevel} / {XP_PER_LEVEL} XP</span>
        </div>
        <Progress
          value={(xpIntoLevel / XP_PER_LEVEL) * 100}
          aria-label={`Level ${level} progress`}
          aria-valuetext={`${xpIntoLevel} of ${XP_PER_LEVEL} XP toward level ${level + 1}`}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-priority-gold/30 bg-priority-gold-surface px-4 py-3">
        <div className="flex flex-col">
          <span className="type-body-strong text-priority-gold">{streak} resolved in a row</span>
          <span className="type-label text-priority-gold/80">3 more for Ten Straight</span>
        </div>
      </div>
    </div>
  )
}
