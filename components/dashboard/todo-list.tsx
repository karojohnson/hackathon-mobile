"use client"

import Link from "next/link"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { BannerCard } from "@/components/dashboard/banner-card"
import { bannerAccentClasses } from "@/lib/banner-accent"
import { todoDefs } from "@/data/demo-todos"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import type { TodoFlags } from "@/components/providers/onboarding-provider"

export interface TodoListProps {
  todos: TodoFlags
}

export function TodoList({ todos }: TodoListProps) {
  const { setTodoFlag, watchlist } = useOnboarding()
  const active = todoDefs.filter((def) => todos[def.key])
  if (active.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h2 className="type-label uppercase tracking-wide text-muted-foreground">To do</h2>
      {active.map((def) => {
        // "Place a trade" is the one nudge with a real destination — the
        // rest are settings a customer would flip elsewhere, so their CTA
        // just resolves the nudge for this prototype.
        const isTradeCta = def.key === "fundedNeverTraded"

        return (
          <BannerCard key={def.key} accent={def.accent}>
            <div className="flex flex-col gap-0.5">
              <span className={cn("type-body-strong", bannerAccentClasses[def.accent].title)}>
                {def.title}
              </span>
              <span className="type-body text-muted-foreground">{def.description}</span>
            </div>
            <Button
              size="lg"
              className="h-11! w-full"
              {...(isTradeCta
                ? { render: <Link href={`/symbol/${watchlist[0] ?? "AAPL"}`} /> }
                : { onClick: () => setTodoFlag(def.key, false) })}
            >
              {def.cta}
            </Button>
          </BannerCard>
        )
      })}
    </section>
  )
}
