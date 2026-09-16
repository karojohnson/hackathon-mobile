import { usePractice } from "@/components/providers/practice-provider"
import { CERTIFICATES, FEE_UNLOCKS, LOCKED_CERTIFICATE } from "@/data/mock-practice-data"
import { Award, Lock, Unlock } from "@/lib/icons"

export function EarnedScreen() {
  const { unlockedAxes, resolvedTrades } = usePractice()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="type-title text-foreground">What this earned</h1>
        <span className="type-label text-muted-foreground">
          {unlockedAxes.length} tiers complete · {resolvedTrades.length} resolved trades
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-positive/40 bg-positive/10 p-4">
        <span className="type-label uppercase tracking-wide text-positive">Your real options level</span>
        <div className="flex items-baseline gap-2">
          <span className="type-hero text-muted-foreground line-through">2</span>
          <span className="type-hero text-positive">3</span>
        </div>
        <span className="type-label text-muted-foreground">long options → defined-risk spreads</span>
        <p className="type-label mt-1 border-t border-positive/20 pt-2 text-muted-foreground">
          Evidence toward a review. Approval stays with the firm.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Fees</span>
        <div className="flex flex-col rounded-lg glass-card px-4">
        {FEE_UNLOCKS.map((fee) => {
          const unlocked = unlockedAxes.includes(fee.axis)
          return (
            <div key={fee.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
              <div className="flex items-center gap-2">
                {unlocked ? <Unlock className="size-5 text-priority-gold" /> : <Lock className="size-5 text-muted-foreground" />}
                <div className="flex flex-col">
                  <span className={unlocked ? "type-body text-foreground" : "type-body text-muted-foreground/60"}>
                    {fee.label}
                  </span>
                  <span className="type-label text-muted-foreground">{fee.sublabel}</span>
                </div>
              </div>
              <span className="type-label text-muted-foreground">{unlocked ? fee.after : "locked"}</span>
            </div>
          )
        })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Certificates</span>
          <span className="type-label tabular-nums text-muted-foreground">{CERTIFICATES.length} / {CERTIFICATES.length + 1}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CERTIFICATES.map((cert) => (
            <div key={cert.id} className="flex flex-col gap-1 rounded-lg border border-priority-gold bg-priority-gold-surface p-3">
              <Award className="size-5 text-priority-gold" />
              <span className="type-body-strong text-foreground">{cert.label}</span>
              <span className="type-label text-muted-foreground">{cert.earnedOn}</span>
            </div>
          ))}
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg glass-card p-4 text-center">
            <Lock className="size-5 text-muted-foreground" />
            <span className="type-label text-muted-foreground">{LOCKED_CERTIFICATE.label}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-lg glass-card p-4">
        <span className="type-label uppercase tracking-wide text-muted-foreground">What tiers do not unlock</span>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Futures options</span>
          <span className="type-label text-muted-foreground">needs a futures-enabled account</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="type-body text-muted-foreground">Portfolio margin</span>
          <span className="type-label text-muted-foreground">needs $125,000 equity</span>
        </div>
      </div>

      <p className="type-label text-center text-muted-foreground">Earned on trades, not on profit or loss.</p>
    </div>
  )
}
