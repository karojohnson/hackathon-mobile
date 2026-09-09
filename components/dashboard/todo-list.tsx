"use client"

import Link from "next/link"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { todoDefs, type TodoDef } from "@/data/demo-todos"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import type { TodoFlags } from "@/components/providers/onboarding-provider"

export interface TodoListProps {
  todos: TodoFlags
}

const accentClasses: Record<TodoDef["accent"], { bar: string; title: string }> = {
  blue: { bar: "bg-focus", title: "text-focus" },
  gray: { bar: "bg-muted-foreground", title: "text-muted-foreground" },
}

export function TodoList({ todos }: TodoListProps) {
  const { setTodoFlag, watchlist } = useOnboarding()
  const active = todoDefs.filter((def) => todos[def.key])
  if (active.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h2 className="type-label uppercase tracking-wide text-muted-foreground">To do</h2>
      {active.map((def) => {
        const accent = accentClasses[def.accent]
        // "Place a trade" is the one nudge with a real destination — the
        // rest are settings a customer would flip elsewhere, so their CTA
        // just resolves the nudge for this prototype.
        const isTradeCta = def.key === "fundedNeverTraded"

        return (
          <div
            key={def.key}
            className="relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface py-3 pr-3 pl-5"
          >
            <span className={cn("absolute inset-y-0 left-0 w-1", accent.bar)} aria-hidden />
            <div className="flex flex-col gap-0.5">
              <span className={cn("type-body-strong", accent.title)}>{def.title}</span>
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
          </div>
        )
      })}
    </section>
  )
}
