import { ChevronRight } from "@/lib/icons"

export interface NextStepCardProps {
  symbol: string
}

/**
 * Static copy, no real link — "more ways to trade X" nudge tied to the
 * symbol the user just traded (prediction markets / single-stock futures on
 * the same name), per the follow-up call. Doesn't need to go anywhere real
 * for this prototype.
 */
export function NextStepCard({ symbol }: NextStepCardProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3.5 text-left transition-colors hover:bg-muted"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-body-strong text-foreground">More ways to trade {symbol}</span>
        <span className="type-label text-muted-foreground">
          Prediction markets, single-stock futures, and more on {symbol}.
        </span>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}
