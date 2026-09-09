import { cn } from "cn"

import { bannerAccentClasses, type BannerAccent } from "@/lib/banner-accent"

export interface BannerCardProps {
  accent: BannerAccent
  className?: string
  children: React.ReactNode
}

/** Shared shell for dashboard banner nudges — rounded card + left accent bar. */
export function BannerCard({ accent, className, children }: BannerCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface py-3 pr-3 pl-5",
        className
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-1", bannerAccentClasses[accent].bar)}
        aria-hidden
      />
      {children}
    </div>
  )
}
