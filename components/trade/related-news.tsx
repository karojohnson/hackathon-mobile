"use client"

import * as React from "react"
import { cn } from "cn"

import { newsFor } from "@/data/mock-news-data"
import { formatNewsDate } from "@/lib/format"
import { Newspaper } from "@/lib/icons"

const THUMBNAIL_CLASS = "aspect-square h-full w-auto shrink-0 object-cover"

function NewsThumbnail({ url }: { url?: string }) {
  const [errored, setErrored] = React.useState(false)

  if (!url || errored) {
    return (
      <div className={cn(THUMBNAIL_CLASS, "flex items-center justify-center bg-muted text-muted-foreground")}>
        <Newspaper className="size-6" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external editorial photo, not a local asset next/image can optimize
    <img src={url} alt="" className={THUMBNAIL_CLASS} onError={() => setErrored(true)} />
  )
}

export function RelatedNews({ symbol, name }: { symbol: string; name: string }) {
  const items = newsFor(symbol, name)

  return (
    <div className="flex flex-col gap-2">
      <span className="type-label uppercase tracking-wide text-muted-foreground">Related news</span>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex h-24 items-stretch overflow-hidden rounded-lg glass-card">
            <NewsThumbnail url={item.thumbnailUrl} />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 p-3">
              <span className="type-body-strong line-clamp-2 text-foreground">{item.headline}</span>
              <span className="type-label text-muted-foreground">
                {item.source} · {formatNewsDate(item.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
