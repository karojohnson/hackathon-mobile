import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { SignalBanner } from "@/components/dashboard/signal-banner"
import { TodoList } from "@/components/dashboard/todo-list"
import { PreferenceSpotlight } from "@/components/dashboard/preference-spotlight"
import { NextStepCard } from "@/components/dashboard/next-step-card"
import { ChevronRight } from "@/lib/icons"

/**
 * Fixed-width tile — 393px matches the phone mockup's screen width
 * (`components/mobile/phone-frame.tsx`) so a banner sits at the exact width
 * it'd render at on a real screen, even loose on a wide desktop page.
 */
function Section({
  title,
  source,
  children,
}: {
  title: string
  source: string
  children: React.ReactNode
}) {
  return (
    <section className="flex w-98.25 shrink-0 flex-col gap-3 rounded-2xl glass-card p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="type-label uppercase tracking-wide text-muted-foreground">{title}</h2>
        <span className="type-label font-mono text-muted-foreground/70">{source}</span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Variant({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="type-label text-muted-foreground/80">{label}</span>
      {children}
    </div>
  )
}

/**
 * Every banner variant used anywhere in the app's dashboards, gathered on
 * one page for reference — not a screen in the product itself. Reuses the
 * real components/data wherever a variant doesn't depend on shared
 * OnboardingProvider state, so this stays accurate as those change.
 */
export default function BannersPage() {
  return (
    <div className="min-h-dvh bg-muted px-8 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 pb-8">
        <Link href="/" className="type-body flex w-fit items-center gap-1 text-muted-foreground">
          <ChevronRight className="size-4 rotate-180" />
          Dashboard
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="type-title text-foreground">All banners</h1>
          <p className="type-body text-muted-foreground">
            Every banner variant shown across the dashboards, in one place — each at the exact
            width it renders at on the phone mockup.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-wrap items-start gap-6">
        <Section title="Account-signal to-dos" source="todo-list.tsx · demo-todos.ts">
          <TodoList
            todos={{
              fundedNeverTraded: true,
              futuresNotEnabled: true,
              twoFactorNotEnabled: true,
              watchlistSkipped: true,
            }}
          />
        </Section>

        <Section title="Preference spotlight" source="preference-spotlight.tsx">
          <Variant label="options">
            <PreferenceSpotlight preference="options" />
          </Variant>
          <Variant label="etfs">
            <PreferenceSpotlight preference="etfs" />
          </Variant>
          <Variant label="stocks — renders nothing (watchlist/positions already cover it)">
            <div className="rounded-lg border border-dashed border-border p-3 text-center">
              <span className="type-label text-muted-foreground/70">null</span>
            </div>
          </Variant>
        </Section>

        <Section title="Prediction market card" source="prediction-market-card.tsx">
          <Variant label="predictionsEnabled: false">
            <SignalBanner
              variant="blue"
              eyebrow="Prediction market"
              badge="Live"
              badgeTone="live"
              title="Will AAPL close above $245 by Friday?"
              meter={52}
              cta="Enable prediction markets"
            />
          </Variant>
          <Variant label="predictionsEnabled: true">
            <SignalBanner
              variant="blue"
              eyebrow="Prediction market"
              badge="Live"
              badgeTone="live"
              title="Will AAPL close above $245 by Friday?"
              meter={52}
              cta="Trade this market"
            />
          </Variant>
        </Section>

        <Section title="Severity banner" source="dashboard-concept-a.tsx">
          <Variant label="variant: red, emphasis (in use — Concept A's manual-review nudge)">
            <SignalBanner
              variant="red"
              emphasis
              eyebrow="Action needed"
              badge="Do this first"
              title="Finish your ID check"
              body="Your application needs a quick manual review. This is the most important thing to do right now."
              cta="Re-upload photo ID"
              ctaTone="neutral"
            />
          </Variant>
          <Variant label="variant: gray (lower priority, not currently used anywhere)">
            <SignalBanner
              variant="gray"
              eyebrow="Heads up"
              title="Nothing urgent right now"
              body="Same banner shell, quieter priority — no dashboard uses this combination yet."
              cta="Review"
            />
          </Variant>
        </Section>

        <Section title="More ways to trade" source="next-step-card.tsx · used in dashboard-concept-a.tsx">
          <NextStepCard symbol="AAPL" />
        </Section>

        <Section title="The deliberate non-banner" source="dashboard-concept-b.tsx">
          <Variant label="Concept B intentionally skips a loud banner in favor of a small badge">
            <div className="flex items-center justify-between rounded-lg glass-card p-4">
              <span className="type-body text-muted-foreground">Net worth header row</span>
              <Badge variant="outline" className="border-warning/40 text-warning">
                1 action needed
              </Badge>
            </div>
          </Variant>
        </Section>
      </div>
    </div>
  )
}
