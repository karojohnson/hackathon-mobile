import { Newspaper, RefreshCw } from "@/lib/icons"

/**
 * Structural placeholder — composition only (per stakeholder reference
 * screenshot's News section), not real content. Swap `placeholderItems`
 * for real headlines when that's wired up.
 */
const placeholderItems = [
  { id: "n1", source: "Market Wire", date: "Today", headline: "Placeholder headline about a market move goes here." },
  { id: "n2", source: "Company News", date: "Today", headline: "Placeholder headline about a company update goes here." },
  { id: "n3", source: "Market Wire", date: "Yesterday", headline: "Placeholder headline about a sector trend goes here." },
]

export function NewsSection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="type-label uppercase tracking-wide text-muted-foreground">News</h2>
        <RefreshCw className="size-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col rounded-lg border border-border bg-surface px-4">
        {placeholderItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Newspaper className="size-5 text-muted-foreground" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="type-label text-muted-foreground">
                {item.source} · {item.date}
              </span>
              <span className="type-body line-clamp-2 text-foreground">{item.headline}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
