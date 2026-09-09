import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { todoDefs } from "@/data/demo-todos"
import type { TodoFlags } from "@/components/providers/onboarding-provider"

export interface TodoListProps {
  todos: TodoFlags
}

/**
 * Demo stand-in for account-signal nudges (see the "dynamic dashboard"
 * north-star memory) — flags are toggled manually from the presenter's
 * control sidebar, not derived from real backend state.
 */
export function TodoList({ todos }: TodoListProps) {
  const active = todoDefs.filter((def) => todos[def.key])
  if (active.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h2 className="type-label uppercase tracking-wide text-muted-foreground">To do</h2>
      {active.map((def) => (
        <Alert key={def.key}>
          <AlertTitle>{def.title}</AlertTitle>
          <AlertDescription>{def.description}</AlertDescription>
        </Alert>
      ))}
    </section>
  )
}
