"use client"

import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { formatCurrency } from "@/lib/format"
import { Minus, Plus } from "@/lib/icons"

type Mode = "deposit" | "withdraw"

const AMOUNT_STEP = 50

interface NetWorthSheetProps {
  cash: number
  onAdjustCash: (delta: number) => void
  children: React.ReactNode
}

/**
 * Deposit/withdraw sheet, opened by tapping the dashboard's net worth
 * summary (passed in as `children`, rendered as the drawer's own trigger —
 * same "trigger wraps the existing display" shape as OrderTypeSheet).
 */
export function NetWorthSheet({ cash, onAdjustCash, children }: NetWorthSheetProps) {
  const [mode, setMode] = React.useState<Mode>("deposit")
  const [amount, setAmount] = React.useState(AMOUNT_STEP)

  // Can't withdraw more than what's actually there.
  const maxWithdraw = Math.max(0, Math.floor(cash / AMOUNT_STEP) * AMOUNT_STEP)
  const canWithdraw = maxWithdraw >= AMOUNT_STEP
  const displayAmount = mode === "withdraw" ? Math.min(amount, maxWithdraw) : amount

  function handleOpenChange(open: boolean) {
    if (open) {
      setMode("deposit")
      setAmount(AMOUNT_STEP)
    }
  }

  function decrement() {
    setAmount((a) => Math.max(AMOUNT_STEP, a - AMOUNT_STEP))
  }

  function increment() {
    setAmount((a) => (mode === "withdraw" ? Math.min(a + AMOUNT_STEP, maxWithdraw) : a + AMOUNT_STEP))
  }

  function handleConfirm() {
    if (mode === "withdraw" && displayAmount <= 0) return
    onAdjustCash(mode === "deposit" ? displayAmount : -displayAmount)
  }

  return (
    <Drawer showSwipeHandle onOpenChange={handleOpenChange}>
      <DrawerTrigger className="flex w-full flex-col items-start rounded-lg text-left transition-colors hover:bg-muted/40 active:bg-muted/60">
        {children}
      </DrawerTrigger>

      <DrawerContent className="glass-sheet">
        <DrawerHeader>
          <DrawerTitle>Manage cash</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pt-2">
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList className="w-full">
              <TabsTrigger value="deposit" className="flex-1">
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex-1" disabled={!canWithdraw}>
                Withdraw
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center justify-between rounded-lg bg-muted px-2 py-2">
            <button
              type="button"
              onClick={decrement}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-background/60"
              aria-label="Decrease amount"
            >
              <Minus className="size-5" />
            </button>
            <span className="type-hero text-foreground tabular-nums">{formatCurrency(displayAmount)}</span>
            <button
              type="button"
              onClick={increment}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-background/60"
              aria-label="Increase amount"
            >
              <Plus className="size-5" />
            </button>
          </div>

          <span className="type-label text-muted-foreground">Cash available: {formatCurrency(cash)}</span>
        </div>

        <DrawerFooter className="mt-6 pb-10">
          <DrawerClose
            className={buttonVariants({ className: "w-full" })}
            disabled={mode === "withdraw" && !canWithdraw}
            onClick={handleConfirm}
          >
            {mode === "deposit" ? "Confirm deposit" : "Confirm withdrawal"}
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
