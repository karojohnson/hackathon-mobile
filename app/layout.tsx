import type { Metadata } from "next"
import localFont from "next/font/local"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { OnboardingProvider } from "@/components/providers/onboarding-provider"
import { PrototypeProvider } from "@/components/providers/prototype-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DemoStage } from "@/components/demo/demo-stage"
import { cn } from "@/lib/utils";

// tastytrade brand typeface (see docs/token-map.md) — variable weight, one file.
const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
})

const robotoMono = localFont({
  src: "./fonts/RobotoMono-Regular.woff2",
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "tastytrade · Bites",
  description: "Chapter 2 prototype — learn options by placing simulated trades.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", robotoMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>
          <OnboardingProvider>
            <PrototypeProvider>
              <TooltipProvider>
                <DemoStage>{children}</DemoStage>
              </TooltipProvider>
            </PrototypeProvider>
          </OnboardingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
