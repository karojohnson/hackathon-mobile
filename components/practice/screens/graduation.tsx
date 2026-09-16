"use client"

import { motion, useReducedMotion } from "motion/react"

import { CountUp } from "@/components/practice/count-up"
import { StructureGlyph } from "@/components/practice/structure-glyph"
import { usePractice } from "@/components/providers/practice-provider"
import { expirationFor, strategyFor } from "@/data/mock-options-data"
import { GLYPH_FOR, practiceQuoteFor } from "@/data/mock-practice-data"
import { formatCurrency } from "@/lib/format"
import { AlertTriangle, ArrowRight, ExternalLink } from "@/lib/icons"
import { transitions } from "@/lib/motion"

/**
 * "Practice → Live" — the Figma frame `08 Graduation` (node 2:18), and the
 * top of the feedback ladder: the one screen in Chapter 2 that gets the
 * full celebration treatment.
 *
 * The argument the screen makes is evidential rather than congratulatory.
 * It does not say "well done"; it says you have made this exact trade
 * fourteen times and been right 71% of the time, so here it is again with
 * real money behind it. That is why the two figures count up and nothing
 * else does — the numbers *are* the reward, so they're the thing that
 * arrives rather than a badge wrapped around them.
 *
 * The ticket is deliberately the only outlined card in the chapter.
 * Everything else the customer has touched is `glass-card`; this one is
 * real money, so it stops looking like the practice surface.
 */

/** Blocks reveal in causal order: the claim, the offer, the ticket, the warning. */
const REVEAL = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

const PIECES = 14
const CONFETTI_COLORS = ["var(--positive)", "var(--priority-gold)", "var(--priority-blue)"]

/**
 * Fourteen pieces, scattered deterministically and computed once at module
 * load rather than per render.
 *
 * Not `Math.random()`, for two reasons. It would produce different values
 * on the server render and the client one, so the burst would hydrate
 * mismatched; and the repo's `react-hooks/purity` rule rejects impure
 * calls during render outright. A golden-ratio walk off the index gives an
 * even, non-repeating spread with neither problem.
 *
 * Fourteen and not two hundred: on a 390px frame a dense burst reads as
 * noise and costs frames.
 */
const CONFETTI_PIECES = Array.from({ length: PIECES }, (_, i) => {
  const scatter = (salt: number) => ((i + 1) * 0.6180339887 * salt) % 1
  return {
    id: i,
    x: (scatter(1) - 0.5) * 240,
    rotate: (scatter(2) - 0.5) * 360,
    delay: scatter(3) * 0.15,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }
})

/**
 * Reserved for this screen alone — it fires at most once per run through
 * the chapter, which is the only budget under which it isn't noise.
 * `aria-hidden` because it carries nothing the text doesn't already say,
 * which is also why returning null under reduced motion loses nothing.
 */
function Confetti() {
  const reduced = useReducedMotion()

  if (reduced) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {CONFETTI_PIECES.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute left-1/2 top-1/4 size-2 rounded-[1px]"
          style={{ backgroundColor: piece.color }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: piece.x, y: 320, rotate: piece.rotate }}
          transition={{ duration: 1.1, delay: piece.delay, ease: [0.2, 0.6, 0.4, 1] }}
        />
      ))}
    </div>
  )
}

/*
 * The practice history the screen reports, so one in-session resolution
 * nudges the hit rate rather than redefining it. A customer who resolves a
 * trade and watches 71% become 100% has learned the wrong thing about
 * sample size.
 */
const PRIOR_TRADES = 14
const PRIOR_WINS = 10

export function GraduationScreen() {
  const { symbol, strikeStep, chosenDirection, expirationId, resolvedTrades } = usePractice()
  const quote = practiceQuoteFor(symbol)
  const expiration = expirationFor(expirationId)
  // Same entry point the dial screens use, so the ticket describes the
  // trade in the words the customer just built it in — including picking
  // the structure off their own direction rather than assuming a bullish
  // one. Someone who said "it sells off" graduates on a call spread.
  const strategy = strategyFor(quote.price, expiration.daysOut, strikeStep, chosenDirection ?? "rallies")

  const totalTrades = PRIOR_TRADES + resolvedTrades.length
  const totalWins = PRIOR_WINS + resolvedTrades.filter((t) => t.outcome !== "loss").length
  const hitRate = Math.round((totalWins / totalTrades) * 100)

  const shorts = strategy.parts.filter((leg) => leg.role === "short")
  const longs = strategy.parts.filter((leg) => leg.role === "long")

  return (
    <div className="relative flex flex-col gap-5">
      <Confetti />

      {/* Full-bleed band, so the handover reads as crossing a line rather
          than as one more label in the stack. */}
      <div className="-mx-4 -mt-2 flex items-center gap-2 border-b border-border px-4 pb-3">
        <span className="type-label uppercase tracking-wide text-muted-foreground">Practice</span>
        <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="type-label uppercase tracking-wide text-foreground">Live</span>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.12 }}
        className="flex flex-col gap-5"
      >
        <motion.div variants={REVEAL} transition={transitions.standard} className="flex flex-col gap-1">
          <p className="type-body flex flex-wrap items-baseline gap-x-2 text-foreground">
            You have made this trade
            <span className="type-title text-foreground">
              <CountUp to={totalTrades} /> times
            </span>
          </p>
          <p className="type-body flex flex-wrap items-baseline gap-x-2 text-foreground">
            and been right
            <span className="type-title text-positive">
              <CountUp to={hitRate} suffix="%" />
            </span>
          </p>
          <span className="type-label text-muted-foreground">your hit rate on this kind of trade</span>
        </motion.div>

        <motion.p
          variants={REVEAL}
          transition={transitions.standard}
          className="type-body-strong border-l-2 border-priority-gold pl-3 text-foreground"
        >
          The same trade, with real money behind it.
        </motion.p>

        <motion.div
          variants={REVEAL}
          transition={transitions.standard}
          className="flex flex-col rounded-xl border border-foreground/35 px-4"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border py-3">
            <div className="flex min-w-0 items-center gap-2">
              <StructureGlyph shape={GLYPH_FOR[strategy.id]} className="size-5 shrink-0 text-foreground" />
              <span className="type-body-strong truncate text-foreground">{strategy.label}</span>
            </div>
            <span className="type-label shrink-0 text-muted-foreground">{symbol}</span>
          </div>

          {shorts.map((leg) => (
            <div
              key={`short-${leg.strike}-${leg.type}`}
              className="flex items-center justify-between gap-2 border-b border-border py-2.5"
            >
              <span className="type-body text-muted-foreground">Sell</span>
              <span className="type-body-strong tabular-nums text-foreground">
                {leg.strike} {leg.type}
              </span>
            </div>
          ))}

          {longs.map((leg) => (
            <div
              key={`long-${leg.strike}-${leg.type}`}
              className="flex items-center justify-between gap-2 border-b border-border py-2.5"
            >
              <span className="type-body text-muted-foreground">Buy</span>
              <span className="type-body-strong tabular-nums text-foreground">
                {leg.strike} {leg.type}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between gap-2 border-b border-border py-2.5">
            <span className="type-body text-muted-foreground">Expires</span>
            <span className="type-body-strong text-foreground">{expiration.label}</span>
          </div>

          {/* Figma puts quantity on the ticket and it belongs there: it's
              the one line that turns a described structure into an order. */}
          <div className="flex items-center justify-between gap-2 border-b border-border py-2.5">
            <span className="type-body text-muted-foreground">Quantity</span>
            <span className="type-body-strong tabular-nums text-foreground">1 contract</span>
          </div>

          <div className="flex items-start justify-between gap-2 py-3">
            <div className="flex flex-col">
              <span className="type-body text-muted-foreground">Most you can lose</span>
              <span className="type-label text-muted-foreground">max loss</span>
            </div>
            <span className="type-body-strong tabular-nums text-negative">
              {formatCurrency(strategy.maxLoss)}
            </span>
          </div>
        </motion.div>

        <motion.div variants={REVEAL} transition={transitions.standard} className="flex flex-col gap-4">
          <span className="type-label flex items-center gap-2 text-priority-gold">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
            Real money. Sized to what you actually hold.
          </span>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="type-body text-foreground">Simulated practice ends here.</span>
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-lg glass-card"
            >
              <ExternalLink className="size-4 text-muted-foreground" />
            </span>
          </div>
        </motion.div>
      </motion.div>

      <p className="type-label text-center text-muted-foreground">This is a prototype. No real money moves.</p>
    </div>
  )
}
