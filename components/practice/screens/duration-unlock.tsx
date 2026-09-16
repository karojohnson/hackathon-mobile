import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { expirations } from "@/data/mock-options-data"
import { DURATION_TIER_EXPIRATIONS, catalystsFor, practiceQuoteFor } from "@/data/mock-practice-data"
import { AXIS_LABEL, AXIS_SUBLABEL } from "@/lib/practice-flow"
import { Check, Lock, Unlock } from "@/lib/icons"

const AXES = ["direction", "duration", "distance", "volatility"] as const

/**
 * "Duration unlocked" — the Figma frame `05 Tier up`.
 *
 * The expirations are the point of the screen, and they used to be static
 * cards: the tier that supposedly unlocks the date was the one screen
 * where the date couldn't be set. They're now the real control, bound to
 * `expirationId`, so the choice made here is the one every later screen
 * prices against.
 *
 * Each row also says whether the contract outlives the symbol's next
 * catalyst. That's the blue note Figma puts at the bottom of this frame
 * ("event vs expiration · whether the trade outlives the catalyst") turned
 * into something per-row — a picker with no reason to prefer one date is
 * still not a decision, however tappable it is.
 */
export function DurationUnlockScreen() {
  const { symbol, unlockedAxes, expirationId, setExpirationId } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const catalyst = catalystsFor(symbol)
  const leadEvent = catalyst.events[0]

  const open = expirations.slice(0, DURATION_TIER_EXPIRATIONS)
  const stillLocked = expirations.slice(DURATION_TIER_EXPIRATIONS)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-1 text-center">
        <Unlock className="size-6 text-priority-gold" />
        <h1 className="type-title text-foreground">Duration</h1>
        <p className="type-label text-muted-foreground">by when? · theta · expiration</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-priority-gold">Now open on the chain</span>

        <div role="radiogroup" aria-label="Expiration" className="flex flex-col gap-2">
          {open.map((expiration) => {
            const selected = expiration.id === expirationId
            const coversEvent = expiration.daysOut >= leadEvent.daysOut
            return (
              <button
                key={expiration.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setExpirationId(expiration.id)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg border px-3.5 py-3 text-center transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  selected ? "border-accent-blue bg-accent-blue/12" : "glass-card"
                )}
              >
                <span className="type-body-strong tabular-nums text-foreground">
                  {expiration.label} ({expiration.daysOut})
                </span>
                <span className="type-label tabular-nums text-muted-foreground">
                  IV: {expiration.impliedVolatility}% · {expiration.cadence}
                </span>
                <span className={cn("type-label", coversEvent ? "text-positive" : "text-partial")}>
                  {coversEvent
                    ? `covers ${leadEvent.date} ${leadEvent.label.toLowerCase()}`
                    : `expires before ${leadEvent.date} ${leadEvent.label.toLowerCase()}`}
                </span>
              </button>
            )
          })}

          {stillLocked.map((expiration) => (
            <div
              key={expiration.id}
              className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-3"
            >
              <Lock className="size-3.5 text-muted-foreground/60" />
              <span className="type-label tabular-nums text-muted-foreground/60">
                {expiration.label} ({expiration.daysOut}) · next tier
              </span>
            </div>
          ))}
        </div>

        <span className="type-label text-muted-foreground">
          {quote.symbol} at ${quote.price.toFixed(2)} · implied move ± {catalyst.impliedMovePercent}%
        </span>
      </div>

      <div className="flex flex-col gap-1 rounded-lg bg-priority-blue-surface! p-4">
        <span className="type-body text-foreground">Event vs expiration</span>
        <span className="type-label text-muted-foreground">whether the trade outlives the catalyst</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Drill down</span>
          {/* One notch per tier, filled as far as the customer has got. */}
          <div className="flex items-center gap-1.5" aria-hidden>
            {AXES.map((axis) => (
              <span
                key={axis}
                className={cn(
                  "size-2 rounded-full",
                  axis === "duration"
                    ? "bg-priority-gold"
                    : unlockedAxes.includes(axis)
                      ? "bg-positive"
                      : "border border-muted-foreground/40"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-lg glass-card px-4">
          {AXES.map((axis) => {
            const isNew = axis === "duration"
            const unlocked = unlockedAxes.includes(axis) || isNew
            return (
              <div
                key={axis}
                className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {isNew ? (
                    <Unlock className="size-4 shrink-0 text-priority-gold" />
                  ) : unlocked ? (
                    <Check className="size-4 shrink-0 text-positive" />
                  ) : (
                    <Lock className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className={cn("type-body", unlocked ? "text-foreground" : "text-muted-foreground/60")}>
                      {AXIS_LABEL[axis]}
                    </span>
                    <span className="type-label text-muted-foreground">{AXIS_SUBLABEL[axis]}</span>
                  </div>
                </div>
                <span className={cn("type-label shrink-0", isNew ? "text-priority-gold" : "text-muted-foreground")}>
                  {isNew ? "new" : unlocked ? "done" : "locked"}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
