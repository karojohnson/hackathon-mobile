import { StructureGlyph } from "@/components/practice/structure-glyph"
import { usePractice } from "@/components/providers/practice-provider"
import {
  CERTIFICATES,
  FEE_UNLOCKS,
  LOCKED_CERTIFICATE,
  OPTIONS_LEVEL,
  PRACTICE_HISTORY,
} from "@/data/mock-practice-data"
import { ArrowRight, Lock, Unlock } from "@/lib/icons"

export function EarnedScreen() {
  const { unlockedAxes, resolvedTrades, level } = usePractice()
  const totalResolved = PRACTICE_HISTORY.resolvedTrades + resolvedTrades.length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="type-title text-foreground">What this earned</h1>
        <span className="type-label text-muted-foreground">
          Level {level} · {unlockedAxes.length} tiers complete · {totalResolved} resolved trades
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-positive/40 bg-positive/10 p-4">
        <span className="type-label uppercase tracking-wide text-positive">Your real options level</span>
        {/*
          Old level, arrow, new level — the Figma treatment.
          A strikethrough on the 2 was the wrong metaphor: struck-out text
          reads as something withdrawn, corrected or no longer valid, and
          level 2 is none of those. It was earned, and it still counts —
          it has been superseded, which is a direction, not a deletion.
          The arrow says that, and it's also how the fee rows below draw
          their own before/after.
        */}
        <div className="flex items-center gap-3">
          <span className="type-hero tabular-nums text-muted-foreground/70">{OPTIONS_LEVEL.from}</span>
          <ArrowRight className="size-6 shrink-0 text-positive" aria-label="becomes" />
          <span className="type-hero tabular-nums text-positive">{OPTIONS_LEVEL.to}</span>
        </div>
        <span className="type-label text-muted-foreground">{OPTIONS_LEVEL.detail}</span>
        <div className="mt-1 flex flex-col gap-0.5 border-t border-positive/20 pt-2">
          <span className="type-body text-foreground">Submitted as evidence · {OPTIONS_LEVEL.submittedOn}</span>
          <span className="type-label text-muted-foreground">
            Evidence toward a review. Approval stays with the firm.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Fees</span>
        <div className="flex flex-col rounded-lg glass-card px-4">
          {FEE_UNLOCKS.map((fee) => {
            const unlocked = !fee.stillLocked && unlockedAxes.includes(fee.axis)
            return (
              <div
                key={fee.id}
                className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {unlocked ? (
                    <Unlock className="size-4 shrink-0 text-priority-gold" />
                  ) : (
                    <Lock className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className={unlocked ? "type-body text-foreground" : "type-body text-muted-foreground/60"}>
                      {fee.label}
                    </span>
                    <span className="type-label text-muted-foreground">{fee.sublabel}</span>
                  </div>
                </div>
                {/*
                  A price that genuinely no longer applies — unlike a level
                  that's been superseded — so the strikethrough is right here.
                */}
                <span className="flex shrink-0 items-baseline gap-2">
                  {unlocked && fee.before && (
                    <span className="type-label tabular-nums text-muted-foreground line-through">{fee.before}</span>
                  )}
                  <span className={unlocked ? "type-body-strong tabular-nums text-positive" : "type-label text-muted-foreground"}>
                    {unlocked ? fee.after : "locked"}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Certificates</span>
          <span className="type-label tabular-nums text-muted-foreground">
            {CERTIFICATES.length} / {CERTIFICATES.length + 1}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CERTIFICATES.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col gap-1 rounded-lg border border-priority-gold bg-priority-gold-surface p-3"
            >
              <StructureGlyph shape={cert.shape} className="size-5 text-priority-gold" />
              <span className="type-body-strong text-foreground">{cert.label}</span>
              <span className="type-label text-muted-foreground">{cert.earnedOn}</span>
            </div>
          ))}
          <div className="flex flex-col gap-1 rounded-lg glass-card p-3">
            <Lock className="size-5 text-muted-foreground/60" />
            <span className="type-body-strong text-muted-foreground/60">{LOCKED_CERTIFICATE.label}</span>
            <span className="type-label text-muted-foreground">locked</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-lg glass-card p-4">
        <span className="type-label uppercase tracking-wide text-muted-foreground">What tiers do not unlock</span>
        <div className="flex items-center justify-between gap-2 py-1">
          <span className="type-body flex items-center gap-2 text-muted-foreground">
            <Lock className="size-3.5 shrink-0" />
            Futures options
          </span>
          <span className="type-label shrink-0 text-muted-foreground">needs a futures-enabled account</span>
        </div>
        <div className="flex items-center justify-between gap-2 py-1">
          <span className="type-body flex items-center gap-2 text-muted-foreground">
            <Lock className="size-3.5 shrink-0" />
            Portfolio margin
          </span>
          <span className="type-label shrink-0 text-muted-foreground">needs $125,000 equity</span>
        </div>
      </div>

      <p className="type-label border-l-2 border-priority-gold pl-3 text-muted-foreground">
        Earned on trades, not on profit or loss.
      </p>
    </div>
  )
}
