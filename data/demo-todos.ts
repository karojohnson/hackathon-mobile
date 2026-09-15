import type { TodoFlags } from "@/components/providers/onboarding-provider"
import type { SignalBannerVariant } from "@/components/dashboard/signal-banner"

/**
 * Demo stand-ins for account-signal nudges a real backend would compute
 * (funding/trading history, access level, security settings, etc.) — see
 * the "dynamic dashboard" north-star memory. Toggled manually from
 * /demo for this prototype rather than derived from real state.
 */
export interface TodoDef {
  key: keyof TodoFlags
  variant: SignalBannerVariant
  eyebrow: string
  title: string
  body?: string
  /** Full-width CTA button label. */
  cta: string
  dismissible?: boolean
}

export const todoDefs: TodoDef[] = [
  {
    key: "fundedNeverTraded",
    variant: "blue",
    eyebrow: "Get started",
    title: "You've funded your account",
    body: "Your watchlist is ready whenever you are.",
    cta: "Place a trade",
  },
  {
    key: "futuresNotEnabled",
    variant: "blue",
    eyebrow: "Unlock",
    title: "Your account qualifies for futures",
    cta: "Turn on futures",
  },
  {
    key: "twoFactorNotEnabled",
    variant: "gray",
    eyebrow: "Security",
    title: "Turn on two-factor auth",
    cta: "Turn on 2FA",
    dismissible: true,
  },
  {
    key: "watchlistSkipped",
    variant: "gray",
    eyebrow: "Personalize",
    title: "Build your watchlist",
    cta: "Build your watchlist",
  },
]
