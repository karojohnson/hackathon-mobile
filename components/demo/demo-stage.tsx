"use client"

import * as React from "react"

import { PhoneFrame } from "@/components/mobile/phone-frame"
import { ControlSidebar } from "@/components/demo/control-sidebar"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "@/lib/icons"

/**
 * The whole-page stage: the phone mockup and the presenter's control deck
 * side by side, both children of the same OnboardingProvider (mounted in
 * app/layout.tsx) so slider/toggle changes reach the phone instantly. The
 * whole control deck can be hidden — not just its individual sections — for
 * moments in a live demo where it shouldn't be visible at all.
 */
export function DemoStage({ children }: { children: React.ReactNode }) {
  const [showControls, setShowControls] = React.useState(false)

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
      <PhoneFrame>{children}</PhoneFrame>
      {showControls && <ControlSidebar />}
    </div>
  )
}
