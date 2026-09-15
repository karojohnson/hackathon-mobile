import type { ReactNode } from "react"
import { cn } from "cn"

export interface GlassShellProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

/**
 * Three-layer glass shell for position rows and the watchlist card (see
 * "Glass Card Treatments" spec): a gradient-outline wrapper, a blurred
 * glass surface inside it, then caller-supplied content padding.
 */
export function GlassShell({ children, className, contentClassName }: GlassShellProps) {
  return (
    <div className={cn("glass-shell-outer", className)}>
      <div className={cn("glass-shell-inner", contentClassName)}>{children}</div>
    </div>
  )
}
