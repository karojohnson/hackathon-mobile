"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"

import { InterestQuiz } from "@/components/onboarding/interest-quiz"
import { CuratedList } from "@/components/onboarding/curated-list"
import { PickTrade } from "@/components/onboarding/pick-trade"
import { useOnboarding, type OnboardingStep } from "@/components/providers/onboarding-provider"
import { additionalChoices, curateWatchlist, symbolsForInterests } from "@/data/interests"
import { transitions } from "@/lib/motion"

const EXTRA_CHOICES_COUNT = 10

/**
 * Direction-aware slide: `custom` (1 = forward, -1 = backward) is set on
 * AnimatePresence itself, so it reaches the *exiting* step's variant too —
 * a plain per-step x value would only ever affect the step being entered,
 * since the exiting element renders with whatever props it had before
 * being removed.
 */
const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
}

export function OnboardingOverlay() {
  const router = useRouter()
  const {
    quizDismissed,
    watchlist,
    onboardingStep: step,
    setOnboardingStep,
    setInterests,
    addToWatchlist,
    dismissQuiz,
  } = useOnboarding()
  const [direction, setDirection] = React.useState(1)
  const [pickedInterests, setPickedInterests] = React.useState<string[]>([])

  function goTo(nextStep: OnboardingStep, dir: 1 | -1) {
    setDirection(dir)
    setOnboardingStep(nextStep)
  }

  if (quizDismissed) return null

  const defaultWatchlist = curateWatchlist(symbolsForInterests(pickedInterests))
  const extraChoices = additionalChoices(defaultWatchlist, EXTRA_CHOICES_COUNT)
  const candidateSymbols = [...defaultWatchlist, ...extraChoices]

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className="glass-sheet flex min-h-0 flex-1 flex-col"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          {step === "quiz" && (
            <motion.div
              key="quiz"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitions.standard}
              className="flex min-h-0 flex-1 flex-col"
            >
              <InterestQuiz
                initialSelected={pickedInterests}
                onContinue={(ids) => {
                  setPickedInterests(ids)
                  setInterests(ids)
                  goTo("list", 1)
                }}
                onSkip={dismissQuiz}
              />
            </motion.div>
          )}
          {step === "list" && (
            <motion.div
              key="list"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitions.standard}
              className="flex min-h-0 flex-1 flex-col"
            >
              <CuratedList
                symbols={candidateSymbols}
                defaultChecked={defaultWatchlist}
                onConfirm={(symbols) => {
                  addToWatchlist(symbols)
                  goTo("pickTrade", 1)
                }}
                onSkip={dismissQuiz}
                onBack={() => goTo("quiz", -1)}
              />
            </motion.div>
          )}
          {step === "pickTrade" && (
            <motion.div
              key="pickTrade"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitions.standard}
              className="flex min-h-0 flex-1 flex-col"
            >
              <PickTrade
                symbols={watchlist}
                onPick={(symbol) => {
                  // Don't dismiss the overlay here — the customer hasn't
                  // actually traded yet, just navigated to look at a
                  // symbol. Dismissal happens on a completed trade (see
                  // app/symbol/[symbol]/page.tsx), so backing out of the
                  // buy screen correctly resumes here, not the dashboard.
                  router.push(`/symbol/${symbol}`)
                }}
                onSkip={dismissQuiz}
                onBack={() => goTo("list", -1)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
