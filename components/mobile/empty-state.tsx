import { cn } from "cn"
import type { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-6 py-10 text-center", className)}>
      <Icon className="size-8 text-muted-foreground" />
      <span className="type-body-strong text-foreground">{title}</span>
      <span className="type-body text-muted-foreground">{description}</span>
    </div>
  )
}
