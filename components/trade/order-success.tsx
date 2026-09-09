"use client"

import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Check } from "@/lib/icons"
import { formatCurrency } from "@/lib/format"
import { transitions } from "@/lib/motion"

export interface OrderSuccessProps {
  symbol: string
  name: string
  quantity: number
  estimatedCost: number
  onDone: () => void
  /** Singular unit noun for the quantity — "share" (default) or "contract". */
  unitLabel?: string
}

export function OrderSuccess({
  symbol,
  name,
  quantity,
  estimatedCost,
  onDone,
  unitLabel = "share",
}: OrderSuccessProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={transitions.spring}
        className="flex size-16 items-center justify-center rounded-full bg-positive/15"
      >
        <Check className="size-8 text-positive" />
      </motion.div>
      <div className="flex flex-col gap-1.5">
        <h1 className="type-title text-foreground">Order placed</h1>
        <p className="type-body text-muted-foreground">
          You bought {quantity} {quantity === 1 ? unitLabel : `${unitLabel}s`} of {symbol} ·{" "}
          {name} for {formatCurrency(estimatedCost)}.
        </p>
        <p className="type-label text-muted-foreground">That&apos;s your first trade. Nicely done.</p>
      </div>
      <Button size="lg" className="w-full" onClick={onDone}>
        View dashboard
      </Button>
    </div>
  )
}
