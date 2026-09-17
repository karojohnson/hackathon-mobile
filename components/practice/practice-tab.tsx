"use client"

import * as React from "react"

import { PracticeShell } from "@/components/practice/practice-shell"
import { BriefingScreen } from "@/components/practice/screens/briefing"
import { ChainScreen } from "@/components/practice/screens/chain"
import { ColdStartScreen } from "@/components/practice/screens/cold-start"
import { DialInScreen } from "@/components/practice/screens/dial-in"
import { DialInAllFourScreen } from "@/components/practice/screens/dial-in-all-four"
import { DirectionScreen } from "@/components/practice/screens/direction"
import { DistanceDrillScreen } from "@/components/practice/screens/distance-drill"
import { DurationUnlockScreen } from "@/components/practice/screens/duration-unlock"
import { EarnedScreen } from "@/components/practice/screens/earned"
import { GraduationScreen } from "@/components/practice/screens/graduation"
import { OpenTradesScreen } from "@/components/practice/screens/open-trades"
import { PayoutScreen } from "@/components/practice/screens/payout"
import { RecordScreen } from "@/components/practice/screens/record"
import { ResolutionScreen } from "@/components/practice/screens/resolution"
import { usePractice, type ScreenId } from "@/components/providers/practice-provider"
import { expirations } from "@/data/mock-options-data"
import { Button } from "@/components/ui/button"
import {
  PRACTICE_FOOTER_CTAS,
  computeResolution,
  previousScreen,
  type PracticeFooterCta,
} from "@/lib/practice-flow"

const SCREEN_COMPONENTS: Record<ScreenId, React.ComponentType> = {
  "cold-start": ColdStartScreen,
  briefing: BriefingScreen,
  direction: DirectionScreen,
  "dial-in": DialInScreen,
  "open-trades": OpenTradesScreen,
  resolution: ResolutionScreen,
  payout: PayoutScreen,
  "duration-unlock": DurationUnlockScreen,
  "distance-drill": DistanceDrillScreen,
  "dial-in-all-four": DialInAllFourScreen,
  chain: ChainScreen,
  record: RecordScreen,
  earned: EarnedScreen,
  graduation: GraduationScreen,
}

export interface PracticeTabProps {
  activeTabIndex: number
  onActiveTabChange: (index: number) => void
}

export function PracticeTab({ activeTabIndex, onActiveTabChange }: PracticeTabProps) {
  const practice = usePractice()
  const { currentScreen, goTo, goBack, unlockAxis, resolveTrade, setExpirationId } = practice
  const ScreenComponent = SCREEN_COMPONENTS[currentScreen]
  const ctas = PRACTICE_FOOTER_CTAS[currentScreen]
  const back = previousScreen(currentScreen)

  function handleCta(cta: PracticeFooterCta) {
    /*
     * An in-place correction, not a step. It has to return before the
     * unlocks below: "Show me how" is the customer saying they are not
     * ready to move on, so advancing the tier on the way past would be
     * the opposite of what they asked for.
     */
    if (cta.action === "snap-expiration") {
      setExpirationId(expirations[0].id)
      return
    }

    if (currentScreen === "duration-unlock") unlockAxis("duration")
    /*
     * Distance *and* Volatility, because the next screen is the all-four
     * dial and it draws a check against every axis. Volatility had no
     * unlock point anywhere in the flow, so that screen's fourth check was
     * always a lie and the earned screen's "Index option surcharge" row
     * was permanently locked, even for someone who walked all fourteen
     * screens. The chapter compresses the last two tiers into one step;
     * this is where it happens.
     */
    if (currentScreen === "distance-drill") {
      unlockAxis("distance")
      unlockAxis("volatility")
    }
    if (currentScreen === "resolution") resolveTrade(computeResolution(practice))
    // The same two tiers, opened without being walked.
    if (cta.action === "unlock-remaining-tiers") {
      unlockAxis("distance")
      unlockAxis("volatility")
    }
    if (cta.goTo) goTo(cta.goTo)
  }

  return (
    <PracticeShell
      activeTabIndex={activeTabIndex}
      onActiveTabChange={onActiveTabChange}
      scrollResetKey={currentScreen}
      /*
       * Every screen gets a back control, including the first. Inside the
       * flow it steps back one screen; on `cold-start`, which has no
       * previous screen, it leaves the chapter for the dashboard — the
       * entry point of a nested flow should be exitable by the same
       * control that walks it, not a dead end you can only escape through
       * the bottom nav.
       */
      onBack={() => {
        // Retrace the real path first; flow order is only the fallback for
        // a fresh load, where there is nothing visited to go back to.
        if (goBack()) return
        if (back) goTo(back)
        else onActiveTabChange(0)
      }}
      footer={
        ctas.length === 0 ? null : (
          <>
            {ctas.map((cta) => (
              <Button
                key={cta.label}
                size="lg"
                variant={cta.emphasis === "secondary" ? "ghost" : "default"}
                className="h-11! w-full"
                onClick={() => handleCta(cta)}
              >
                {cta.label}
              </Button>
            ))}
          </>
        )
      }
    >
      <ScreenComponent />
    </PracticeShell>
  )
}
