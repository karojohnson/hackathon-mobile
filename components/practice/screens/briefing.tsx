import { cn } from "cn"

import { usePractice } from "@/components/providers/practice-provider"
import { SIGNALS, catalystsFor, practiceQuoteFor } from "@/data/mock-practice-data"

export function BriefingScreen() {
  const { symbol, unlockedAxes } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const catalyst = catalystsFor(symbol)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="type-title text-foreground">What&apos;s coming</h1>
        <p className="type-body text-muted-foreground">
          {symbol} · next 30 days · implied move ± {catalyst.impliedMovePercent}%
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">On the calendar</span>
        {/*
          Card layout is Figma node 41:282 / 41:306 exactly: a 46px stacked
          month/day column, then the event with its axis tags (and, on the
          focal row, the expiration note), then a stacked days-out count.
          Gaps, padding and the design's own type sizes are used verbatim —
          an earlier pass mapped them onto this project's type scale, which
          made the tags 12px instead of 8px and wrapped them onto a second
          line, changing the card's whole shape.

          Colours are ours, not the design's: `glass-card` for the resting
          row and accent-blue for the focal one, where the design uses flat
          #252525 and gold. Gold is spoken for by the practice flag and the
          XP language, so a gold row here would read as a reward.
        */}
        {catalyst.events.map((event) => {
          const [month, day] = event.date.split(" ")
          const focus = event.focus === true
          return (
            <div
              key={event.label}
              className={cn(
                "flex items-start gap-[11px] rounded-xl border p-3",
                focus ? "border-accent-blue bg-accent-blue/12" : "glass-card"
              )}
            >
              <div className="flex w-9 shrink-0 flex-col gap-px">
                <span className="type-label font-bold uppercase tracking-[0.8px] text-muted-foreground/70">
                  {month}
                </span>
                <span
                  className={cn(
                    "text-[18px] font-medium leading-tight tabular-nums",
                    focus ? "text-accent-blue" : "text-muted-foreground"
                  )}
                >
                  {day}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span
                  className={cn(
                    "type-body",
                    focus ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                  )}
                >
                  {event.label}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {event.informs.map((axis) => (
                    <span
                      key={axis}
                      className="type-label rounded-md bg-muted px-1 py-0.5 font-bold uppercase tracking-[0.8px] text-muted-foreground"
                    >
                      {axis}
                    </span>
                  ))}
                </div>
                {event.note && (
                  <span className="type-label text-accent-blue">{event.note}</span>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-px">
                <span
                  className={cn(
                    "type-label tabular-nums",
                    focus ? "text-accent-blue" : "text-muted-foreground"
                  )}
                >
                  {event.daysOut}
                </span>
                <span className="type-label text-muted-foreground/70">days out</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Signals</span>
        {/*
          Per Figma node 122:263 each row pairs the signal with the axis it
          informs, plus a lock state and the tier that opens it. Listing the
          axis names alone lost the pairing, which is the teaching point.

          Kept inside one glass card rather than the design's bare rows with
          top rules, to match the grouped-list treatment used elsewhere on
          this screen and in the dashboard.
        */}
        <div className="flex flex-col rounded-lg glass-card px-4">
          {SIGNALS.map((signal) => {
            const open = unlockedAxes.includes(signal.informs)
            return (
              <div
                key={signal.id}
                className="flex items-center gap-2.5 border-b border-border py-2.5 last:border-b-0"
              >
                {/* Exported from Figma; gold/grey is baked into each file. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={open ? "/icons/signal-unlocked.svg" : "/icons/signal-locked.svg"}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 shrink-0"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={cn("type-body", open ? "text-foreground" : "text-muted-foreground/60")}>
                    {signal.label}
                  </span>
                  <span className="type-label text-muted-foreground/70">
                    └ informs {signal.informs}
                  </span>
                </div>
                <span
                  className={cn(
                    "type-label shrink-0 tabular-nums",
                    open ? "text-priority-gold" : "text-muted-foreground/60"
                  )}
                >
                  {open ? "open" : `tier ${signal.tier}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {quote && (
        <p className="type-label text-muted-foreground">
          {quote.symbol} is at ${quote.price.toFixed(2)}, {quote.changePercent >= 0 ? "up" : "down"}{" "}
          {Math.abs(quote.changePercent).toFixed(2)}% today.
        </p>
      )}
    </div>
  )
}
