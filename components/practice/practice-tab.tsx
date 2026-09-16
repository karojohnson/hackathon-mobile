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
import { Button } from "@/components/ui/button"
import { PRACTICE_FOOTER_CTAS, computeResolution, type PracticeFooterCta } from "@/lib/practice-flow"

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
  const { currentScreen, goTo, unlockAxis, resolveTrade } = practice
  const ScreenComponent = SCREEN_COMPONENTS[currentScreen]
  const ctas = PRACTICE_FOOTER_CTAS[currentScreen]

  function handleCta(cta: PracticeFooterCta) {
    if (currentScreen === "duration-unlock") unlockAxis("duration")
    if (currentScreen === "distance-drill") {
      unlockAxis("distance")
      unlockAxis("volatility")
    }
    if (currentScreen === "resolution") resolveTrade(computeResolution(practice))
    goTo(cta.goTo)
  }

  return (
    <PracticeShell
      activeTabIndex={activeTabIndex}
      onActiveTabChange={onActiveTabChange}
      footer={
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
      }
    >
      <ScreenComponent />
    </PracticeShell>
  )
}
