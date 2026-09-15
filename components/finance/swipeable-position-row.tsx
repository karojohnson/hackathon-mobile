"use client"

import * as React from "react"
import { animate, motion, useMotionValue } from "motion/react"
import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import type { Position } from "@/data/mock-market-data"
import { formatCurrency, formatPercent } from "@/lib/format"
import { Minus, Pencil, Plus, X } from "@/lib/icons"
import { transitions } from "@/lib/motion"

const ACTION_WIDTH = 72
const REVEAL_WIDTH = ACTION_WIDTH * 2

export interface SwipeablePositionRowProps {
  position: Position
  onEditQuantity: (quantity: number) => void
  onClosePosition: () => void
}

/**
 * Position row with an iOS-style swipe-left reveal: a pencil (edit) and X
 * (close) action pair sit behind the row content, exposed by dragging it
 * left. Edit opens a quantity-stepper sheet; close removes the position
 * immediately — this is mock data, not a real brokerage close order, so no
 * confirmation step per the hackathon's "don't build exhaustive edge cases"
 * guidance.
 */
export function SwipeablePositionRow({ position, onEditQuantity, onClosePosition }: SwipeablePositionRowProps) {
  const x = useMotionValue(0)
  const [editOpen, setEditOpen] = React.useState(false)
  const [quantity, setQuantity] = React.useState(position.quantity)

  function close() {
    animate(x, 0, transitions.spring)
  }

  function handleEditOpen() {
    setQuantity(position.quantity)
    setEditOpen(true)
  }

  function handleSaveEdit() {
    onEditQuantity(quantity)
    setEditOpen(false)
    close()
  }

  return (
    <div className="relative overflow-hidden rounded-[14px]">
      <div className="absolute inset-y-0 right-0 flex">
        <button
          type="button"
          onClick={handleEditOpen}
          aria-label={`Edit ${position.symbol} position`}
          className="flex w-18 items-center justify-center bg-muted text-foreground transition-colors hover:bg-muted/80"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClosePosition}
          aria-label={`Close ${position.symbol} position`}
          className="flex w-18 items-center justify-center bg-negative text-white transition-colors hover:bg-negative/90"
        >
          <X className="size-4" />
        </button>
      </div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        onDragEnd={(_, info) => {
          const shouldOpen = x.get() < -REVEAL_WIDTH / 2 || info.velocity.x < -400
          animate(x, shouldOpen ? -REVEAL_WIDTH : 0, transitions.spring)
        }}
        onTap={() => {
          if (x.get() < 0) close()
        }}
        className="glass-row-surface relative flex items-center justify-between gap-3 rounded-[14px] p-3.5 transition-colors hover:bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.06)]"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="type-body-strong text-foreground">{position.symbol}</span>
          <span className="type-label truncate text-(--text-2)">
            {position.quantity} {position.quantity === 1 ? "share" : "shares"} · avg ${position.avgCost.toFixed(2)}
          </span>
        </div>
        <div className="flex w-24 shrink-0 flex-col items-end">
          <span className="type-body-strong tabular-nums text-(--price)">{formatCurrency(position.marketValue)}</span>
          <span
            className={cn(
              "type-label tabular-nums",
              position.changePercent >= 0 ? "text-(--gain)" : "text-(--loss)"
            )}
          >
            {formatPercent(position.changePercent)}
          </span>
        </div>
      </motion.div>

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent className="glass-sheet">
          <DrawerHeader>
            <DrawerTitle>Edit {position.symbol}</DrawerTitle>
          </DrawerHeader>

          <div className="flex items-center justify-between px-4 pt-2">
            <span className="type-body text-muted-foreground">Shares</span>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-1 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex size-8 items-center justify-center rounded-md text-foreground hover:bg-background/60"
                aria-label="Decrease shares"
              >
                <Minus className="size-4" />
              </button>
              <span className="type-body-strong w-10 text-center tabular-nums text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex size-8 items-center justify-center rounded-md text-foreground hover:bg-background/60"
                aria-label="Increase shares"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <span className="type-label px-4 pt-2 text-muted-foreground">
            New market value: {formatCurrency(Number((position.price * quantity).toFixed(2)))}
          </span>

          <DrawerFooter className="mt-6 pb-10">
            <button type="button" onClick={handleSaveEdit} className={buttonVariants({ className: "w-full" })}>
              Save
            </button>
            <DrawerClose className={buttonVariants({ variant: "outline", className: "w-full" })}>Cancel</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
