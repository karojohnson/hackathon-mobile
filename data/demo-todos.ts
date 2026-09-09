import type { TodoFlags } from "@/components/providers/onboarding-provider"

/**
 * Demo stand-ins for account-signal nudges a real backend would compute
 * (funding/trading history, access level, security settings, etc.) — see
 * the "dynamic dashboard" north-star memory. Toggled manually from
 * /demo for this prototype rather than derived from real state.
 */
export interface TodoDef {
  key: keyof TodoFlags
  title: string
  description: string
  /** Full-width CTA button label. */
  cta: string
  /**
   * Banner accent — most nudges lean blue (informational, opportunity) or
   * gray (informational, lower-priority); not severity-coded yet.
   */
  accent: "blue" | "gray"
}

export const todoDefs: TodoDef[] = [
  {
    key: "fundedNeverTraded",
    title: "You've funded your account but haven't traded yet",
    description: "Your watchlist is ready whenever you are.",
    cta: "Place a trade",
    accent: "blue",
  },
  {
    key: "futuresNotEnabled",
    title: "Your account qualifies for futures",
    description: "You have a high enough access level — want to turn it on?",
    cta: "Turn on futures",
    accent: "blue",
  },
  {
    key: "twoFactorNotEnabled",
    title: "Turn on two-factor authentication",
    description: "Add an extra layer of security to your account.",
    cta: "Turn on 2FA",
    accent: "gray",
  },
  {
    key: "watchlistSkipped",
    title: "You skipped building a watchlist",
    description: "Tell us what you're interested in to get personalized picks.",
    cta: "Build your watchlist",
    accent: "gray",
  },
]
