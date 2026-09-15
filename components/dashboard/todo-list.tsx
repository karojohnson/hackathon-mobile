"use client"

import { useRouter } from "next/navigation"

import { SignalBanner } from "@/components/dashboard/signal-banner"
import { todoDefs } from "@/data/demo-todos"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import type { TodoFlags } from "@/components/providers/onboarding-provider"

export interface TodoListProps {
  todos: TodoFlags
}

export function TodoList({ todos }: TodoListProps) {
  const router = useRouter()
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
          <SignalBanner
            key={def.key}
            variant={def.variant}
            eyebrow={def.eyebrow}
            title={def.title}
            body={def.body}
            cta={def.cta}
            dismissible={def.dismissible}
            onAction={
              isTradeCta
                ? () => router.push(`/symbol/${watchlist[0] ?? "AAPL"}`)
                : () => setTodoFlag(def.key, false)
            }
            onDismiss={def.dismissible ? () => setTodoFlag(def.key, false) : undefined}
          />
        )
      })}
    </section>
  )
}
