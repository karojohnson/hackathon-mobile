import { PhoneFrame } from "@/components/mobile/phone-frame"
import { ControlSidebar } from "@/components/demo/control-sidebar"

/**
 * The whole-page stage: the phone mockup and the presenter's control deck
 * side by side, both children of the same OnboardingProvider (mounted in
 * app/layout.tsx) so slider/toggle changes reach the phone instantly.
 */
export function DemoStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center gap-8 bg-muted p-6">
      <PhoneFrame>{children}</PhoneFrame>
      <ControlSidebar />
    </div>
  )
}
