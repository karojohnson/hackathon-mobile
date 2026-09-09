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
}

export const todoDefs: TodoDef[] = [
  {
    key: "fundedNeverTraded",
    title: "You've funded your account but haven't traded yet",
    description: "Your watchlist is ready whenever you are.",
  },
  {
    key: "futuresNotEnabled",
    title: "Your account qualifies for futures",
    description: "You have a high enough access level — want to turn it on?",
  },
  {
    key: "twoFactorNotEnabled",
    title: "Turn on two-factor authentication",
    description: "Add an extra layer of security to your account.",
  },
  {
    key: "watchlistSkipped",
    title: "You skipped building a watchlist",
    description: "Tell us what you're interested in to get personalized picks.",
  },
]
