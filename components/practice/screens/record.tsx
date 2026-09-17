import { StatRadar } from "@/components/practice/stat-radar"
import { LockedGlyph, StructureGlyph } from "@/components/practice/structure-glyph"
import { usePractice } from "@/components/providers/practice-provider"
import {
  ALL_STRUCTURES,
  AXIS_RECORDS,
  NEXT_STRUCTURE_UNLOCK,
  PRACTICE_HISTORY,
  type AxisRecord,
  type StructureShape,
} from "@/data/mock-practice-data"
import type { Axis } from "@/components/providers/practice-provider"

/**
 * Tier colouring. The pill's text colour and the bar underneath it are
 * always the same hue, so the row reads as one judgement rather than as a
 * label and an unrelated bar.
 *
 * UNPROVEN is `--partial` (orange) rather than `--negative` for the same
 * reason the resolution screen scores a 2-of-4 orange: too few samples is
 * not a failing grade, and red would code it as one.
 */
const TIER_STYLE: Record<AxisRecord["tier"], { text: string; pill: string; bar: string }> = {
  SHARP: { text: "text-positive", pill: "bg-positive/18", bar: "bg-positive" },
  SOLID: { text: "text-positive", pill: "bg-positive/18", bar: "bg-positive" },
  DEVELOPING: { text: "text-priority-gold", pill: "bg-priority-gold/15", bar: "bg-priority-gold" },
  UNPROVEN: { text: "text-partial", pill: "bg-partial/15", bar: "bg-partial" },
}

/**
 * Cabinet order: earned first, then the one the XP bar is currently paying
 * toward, then everything still locked.
 *
 * `ALL_STRUCTURES` is in teaching order, which would scatter the four
 * earned slots through the grid and drop the gold "next" slot wherever the
 * jade lizard happens to sit. Sorting by state instead makes the two rows
 * read left to right as progress, which is the only thing the cabinet is
 * there to say.
 */
function cabinetSlots(earned: string[]) {
  const isEarned = (id: StructureShape) => earned.includes(id)
  const isNext = (id: StructureShape) => id === NEXT_STRUCTURE_UNLOCK.id && !isEarned(id)

  return [
    ...ALL_STRUCTURES.filter((s) => isEarned(s.id)).map((s) => ({ ...s, state: "earned" as const })),
    ...ALL_STRUCTURES.filter((s) => isNext(s.id)).map((s) => ({ ...s, state: "next" as const })),
    ...ALL_STRUCTURES.filter((s) => !isEarned(s.id) && !isNext(s.id)).map((s) => ({
      ...s,
      state: "locked" as const,
    })),
  ]
}

function StatRow({ record }: { record: AxisRecord }) {
  const tier = TIER_STYLE[record.tier]

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="type-body font-medium text-foreground">{record.label}</span>
        <span className="type-label min-w-0 truncate text-muted-foreground/65">└ {record.sublabel}</span>
        <span className="ml-auto" />
        <span
          className={`type-label shrink-0 rounded-md px-1.5 py-0.5 font-bold tracking-wider uppercase ${tier.pill} ${tier.text}`}
        >
          {record.tier}
        </span>
        <span className="type-mono shrink-0 text-[15px] font-medium text-foreground">{record.value}%</span>
        <span className="type-mono type-label shrink-0 text-muted-foreground/65">(n={record.n})</span>
      </div>
      <div
        className="h-[7px] w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={record.value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${record.label}, ${record.tier.toLowerCase()}, over ${record.n} resolved trades`}
      >
        <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${record.value}%` }} />
      </div>
    </div>
  )
}

export function RecordScreen() {
  const { level, xp, resolvedTrades, structuresEarned } = usePractice()

  const totalResolved = PRACTICE_HISTORY.resolvedTrades + resolvedTrades.length
  const radarValues = Object.fromEntries(AXIS_RECORDS.map((r) => [r.id, r.value])) as Record<Axis, number>
  const weakest = AXIS_RECORDS.reduce((low, r) => (r.value < low.value ? r : low))
  const slots = cabinetSlots(structuresEarned)
  const xpToUnlock = Math.max(0, NEXT_STRUCTURE_UNLOCK.atXp - xp)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start gap-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-title text-foreground">Your record</h1>
          <span className="type-label text-muted-foreground/65">
            └ {totalResolved} resolved trades since {PRACTICE_HISTORY.since}
          </span>
        </div>
        <div className="ml-auto flex flex-col items-end gap-0.5">
          <span className="type-body-strong text-priority-gold">LVL {level}</span>
          <span className="type-mono type-label text-muted-foreground">{xp.toLocaleString("en-US")} XP</span>
        </div>
      </header>

      <StatRadar values={radarValues} className="text-foreground" />

      <div className="flex flex-col gap-4">
        {AXIS_RECORDS.map((record) => (
          <StatRow key={record.id} record={record} />
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-xl bg-priority-blue/18 p-3.5">
        <span className="type-body font-medium text-foreground">{weakest.label} is your weakest stat.</span>
        <span className="type-label text-muted-foreground">
          Only {weakest.n} of {totalResolved} resolved trades tested it, so there is not much evidence yet.
        </span>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="type-label font-bold tracking-[0.13em] text-muted-foreground/65 uppercase">
            Structures earned
          </span>
          <span className="type-mono type-label ml-auto text-muted-foreground">
            {structuresEarned.length} / {ALL_STRUCTURES.length}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-[7px]">
          {slots.map((slot) => {
            if (slot.state === "locked") {
              return (
                <div
                  key={slot.id}
                  className="flex h-10 items-center justify-center rounded-[9px] bg-elevated-surface"
                  title="Locked"
                >
                  {/* 12px, matching the Figma `locked` instance. The glyph stacks an
                      outline, a shackle and a solid body, so it is drawn to read
                      small and faint — scaled up, the filled body dominates and it
                      turns into a dark blob with a handle. */}
                  <LockedGlyph className="size-3 text-muted-foreground/50" />
                  <span className="sr-only">Locked structure</span>
                </div>
              )
            }
            const isNext = slot.state === "next"
            return (
              <div
                key={slot.id}
                title={slot.label}
                className={
                  isNext
                    ? "flex h-10 items-center justify-center rounded-[9px] border-[1.5px] border-priority-gold bg-priority-gold/12"
                    : "flex h-10 items-center justify-center rounded-[9px] border border-border/50 bg-elevated-surface"
                }
              >
                <StructureGlyph
                  shape={slot.id}
                  className={isNext ? "size-4 text-priority-gold" : "size-4 text-foreground"}
                />
                <span className="sr-only">
                  {slot.label}
                  {isNext ? " (next up)" : " (earned)"}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 pt-0.5">
          <StructureGlyph shape={NEXT_STRUCTURE_UNLOCK.id} className="size-3.5 text-priority-gold" />
          <span className="type-label text-priority-gold">
            {NEXT_STRUCTURE_UNLOCK.label} unlocks at {NEXT_STRUCTURE_UNLOCK.atXp.toLocaleString("en-US")} XP
          </span>
          <span className="type-mono type-label ml-auto text-muted-foreground">{xpToUnlock} to go</span>
        </div>
      </section>
    </div>
  )
}
