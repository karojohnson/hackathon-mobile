/**
 * Shared accent styling for dashboard "banner" nudges (account-signal
 * to-dos, customer-preference spotlights) — per the Figma banner component,
 * adapted to lean blue/gray rather than full severity color-coding.
 */
export type BannerAccent = "blue" | "gray"

export const bannerAccentClasses: Record<BannerAccent, { bar: string; title: string }> = {
  blue: { bar: "bg-focus", title: "text-focus" },
  gray: { bar: "bg-muted-foreground", title: "text-muted-foreground" },
}
