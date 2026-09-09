"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"

import { InterestQuiz } from "@/components/onboarding/interest-quiz"
import { CuratedList } from "@/components/onboarding/curated-list"
import { PickTrade } from "@/components/onboarding/pick-trade"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { additionalChoices, curateWatchlist, symbolsForInterests } from "@/data/interests"
import { transitions } from "@/lib/motion"

type Step = "quiz" | "list" | "pickTrade"

const EXTRA_CHOICES_COUNT = 10

export function OnboardingOverlay() {
  const router = useRouter()
  const { quizDismissed, watchlist, setInterests, addToWatchlist, dismissQuiz } = useOnboarding()
  const [step, setStep] = React.useState<Step>("quiz")
  const [pickedInterests, setPickedInterests] = React.useState<string[]>([])

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
        <AnimatePresence mode="wait">
          {step === "quiz" && (
            <motion.div
              key="quiz"
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={transitions.standard}
            >
              <InterestQuiz
                initialSelected={pickedInterests}
                onContinue={(ids) => {
                  setPickedInterests(ids)
                  setInterests(ids)
                  setStep("list")
                }}
                onSkip={dismissQuiz}
              />
            </motion.div>
          )}
          {step === "list" && (
            <motion.div
              key="list"
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={transitions.standard}
            >
              <CuratedList
                symbols={candidateSymbols}
                defaultChecked={defaultWatchlist}
                onConfirm={(symbols) => {
                  addToWatchlist(symbols)
                  setStep("pickTrade")
                }}
                onSkip={dismissQuiz}
                onBack={() => setStep("quiz")}
              />
            </motion.div>
          )}
          {step === "pickTrade" && (
            <motion.div
              key="pickTrade"
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={transitions.standard}
            >
              <PickTrade
                symbols={watchlist}
                onPick={(symbol) => {
                  dismissQuiz()
                  router.push(`/symbol/${symbol}`)
                }}
                onSkip={dismissQuiz}
                onBack={() => setStep("list")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
