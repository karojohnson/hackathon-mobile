import { usePractice } from "@/components/providers/practice-provider"

export function OpenTradesScreen() {
  const { symbol, streak, resolvedTrades } = usePractice()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="type-title text-foreground">Your trades</h1>
        <div className="flex flex-col items-end rounded-lg bg-muted px-3 py-2">
          <span className="type-body-strong tabular-nums text-priority-gold">{streak}</span>
          <span className="type-label text-muted-foreground">resolved in a row</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Open</span>
        <div className="flex flex-col gap-2 rounded-lg bg-muted p-3.5">
          <div className="flex items-center justify-between">
            <span className="type-body-strong text-foreground">{symbol}</span>
            <span className="type-label text-muted-foreground">resolves soon</span>
          </div>
          <span className="type-body text-muted-foreground">Short put spread</span>
        </div>
      </div>

      {resolvedTrades.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="type-label uppercase tracking-wide text-muted-foreground">Resolved this week</span>
          {resolvedTrades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
              <span className="type-body-strong text-foreground">{trade.symbol}</span>
              <span className="type-label text-muted-foreground">
                {trade.axesCorrect.length} of {trade.axesCorrect.length + trade.axesMissed.length}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
