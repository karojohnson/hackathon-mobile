"use client"

import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Check, ChevronDown, Minus, Plus } from "@/lib/icons"

export type OrderType = "market" | "limit" | "stop"
export type TimeInForce = "day" | "gtc" | "gtd" | "gtc_ext"

const ORDER_TYPES: Array<{ value: OrderType; label: string; description: string }> = [
  { value: "market", label: "Market", description: "Fills right away at the current price." },
  { value: "limit", label: "Limit", description: "Only fills at your price or better." },
  { value: "stop", label: "Stop", description: "Becomes a market order once your price is hit." },
]

const TIME_IN_FORCE: Array<{ value: TimeInForce; label: string }> = [
  { value: "day", label: "Day" },
  { value: "gtc", label: "GTC" },
  { value: "gtd", label: "GTD" },
  { value: "gtc_ext", label: "GTC+Ext" },
]

function summaryLabel(orderType: OrderType, timeInForce: TimeInForce) {
  if (orderType === "market") return "Market"
  const typeLabel = orderType === "limit" ? "Limit" : "Stop"
  const tifLabel = TIME_IN_FORCE.find((option) => option.value === timeInForce)?.label ?? "Day"
  return `${typeLabel} · ${tifLabel}`
}

interface OrderTypeSheetProps {
  orderType: OrderType
  onOrderTypeChange: (value: OrderType) => void
  price: number
  onPriceChange: (value: number) => void
  timeInForce: TimeInForce
  onTimeInForceChange: (value: TimeInForce) => void
  gtdDate: string
  onGtdDateChange: (value: string) => void
}

export function OrderTypeSheet({
  orderType,
  onOrderTypeChange,
  price,
  onPriceChange,
  timeInForce,
  onTimeInForceChange,
  gtdDate,
  onGtdDateChange,
}: OrderTypeSheetProps) {
  const isMarket = orderType === "market"

  function handleOrderTypeChange(value: OrderType) {
    onOrderTypeChange(value)
    if (value === "market") onTimeInForceChange("day")
  }

  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger className="flex w-full items-center justify-between border-t border-border pt-3 text-left">
        <span className="type-body text-muted-foreground">Order type</span>
        <span className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5">
          <span className="type-body-strong text-foreground">{summaryLabel(orderType, timeInForce)}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </span>
      </DrawerTrigger>

      <DrawerContent className="glass-sheet">
        <DrawerHeader>
          <DrawerTitle>Order type</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-1 px-4 pt-2">
          {ORDER_TYPES.map((option) => {
            const selected = option.value === orderType
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOrderTypeChange(option.value)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  selected ? "border-foreground/20 bg-muted" : "border-transparent"
                )}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="type-body-strong text-foreground">{option.label}</span>
                  <span className="type-label text-muted-foreground">{option.description}</span>
                </span>
                {selected && <Check className="size-4 shrink-0 text-foreground" />}
              </button>
            )
          })}
        </div>

        {!isMarket && (
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="type-body text-muted-foreground">
              {orderType === "limit" ? "Limit price" : "Stop price"}
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-1 py-1">
              <button
                type="button"
                onClick={() => onPriceChange(Math.max(0.5, Number((price - 0.5).toFixed(2))))}
                className="flex size-8 items-center justify-center rounded-md text-foreground hover:bg-background/60"
                aria-label="Decrease price"
              >
                <Minus className="size-4" />
              </button>
              <span className="type-body-strong w-16 text-center tabular-nums text-foreground">
                ${price.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => onPriceChange(Number((price + 0.5).toFixed(2)))}
                className="flex size-8 items-center justify-center rounded-md text-foreground hover:bg-background/60"
                aria-label="Increase price"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        )}

        {!isMarket && (
          <div className="flex flex-col gap-2 px-4 pt-4">
            <span className="type-label uppercase tracking-wide text-muted-foreground">Time in force</span>
            <div className="grid grid-cols-4 gap-1.5">
              {TIME_IN_FORCE.map((option) => {
                const selected = option.value === timeInForce
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onTimeInForceChange(option.value)}
                    className={cn(
                      "type-label rounded-md border px-1.5 py-2 text-center transition-colors",
                      selected
                        ? "border-foreground/20 bg-muted text-foreground"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            {timeInForce === "gtd" && (
              <input
                type="date"
                value={gtdDate}
                onChange={(event) => onGtdDateChange(event.target.value)}
                className="type-body-strong rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              />
            )}
          </div>
        )}

        <DrawerFooter className="mt-6 pb-10">
          <DrawerClose className={buttonVariants({ className: "w-full" })}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
