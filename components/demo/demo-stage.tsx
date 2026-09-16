"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { PhoneFrame } from "@/components/mobile/phone-frame"
import { ControlSidebar } from "@/components/demo/control-sidebar"
import { Button } from "@/components/ui/button"
import { usePrototype } from "@/components/providers/prototype-provider"
import { Eye, EyeOff, RotateCcw } from "@/lib/icons"
import { resetDemo } from "@/lib/reset-demo"

/** Routes that manage their own full-page layout instead of the phone mockup. */
const BARE_ROUTES = ["/banners"]

/**
 * The whole-page stage: the phone mockup and the presenter's control deck
 * side by side, both children of the same OnboardingProvider (mounted in
 * app/layout.tsx) so slider/toggle changes reach the phone instantly. The
 * whole control deck can be hidden — not just its individual sections — for
 * moments in a live demo where it shouldn't be visible at all.
 */
export function DemoStage({ children }: { children: React.ReactNode }) {
  const [showControls, setShowControls] = React.useState(false)
  const pathname = usePathname()
  const { activePrototype, setActivePrototype } = usePrototype()

  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>
  }

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center gap-8 bg-muted p-6">
      <Button
        variant="secondary"
        size="sm"
        className="fixed top-4 right-4 z-50 gap-1.5"
        onClick={() => setShowControls((v) => !v)}
      >
        {showControls ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {showControls ? "Hide presenter view" : "Show presenter view"}
      </Button>
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-background p-1">
          <Button
            variant={activePrototype === 1 ? "default" : "ghost"}
            size="sm"
            onClick={() => setActivePrototype(1)}
          >
            Prototype 1
          </Button>
          <Button
            variant={activePrototype === 2 ? "default" : "ghost"}
            size="sm"
            onClick={() => setActivePrototype(2)}
          >
            Prototype 2
          </Button>
        </div>
        {!showControls && (
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() => resetDemo(activePrototype)}
          >
            <RotateCcw className="size-4" />
            Reset Prototype {activePrototype}
          </Button>
        )}
      </div>
      <PhoneFrame>{children}</PhoneFrame>
      {showControls && <ControlSidebar />}
    </div>
  )
}
