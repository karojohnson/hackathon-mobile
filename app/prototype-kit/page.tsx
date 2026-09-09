"use client"

import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { FinancialChart } from "@/components/finance/financial-chart"
import { KpiCard } from "@/components/finance/kpi-card"
import { WatchlistRow } from "@/components/finance/watchlist-row"
import { AllocationBar } from "@/components/finance/allocation-bar"
import { BottomNav } from "@/components/mobile/bottom-nav"
import { EmptyState } from "@/components/mobile/empty-state"

import { portfolio, watchlist } from "@/data/mock-market-data"
import { formatCurrency, formatSignedCurrency, formatPercent } from "@/lib/format"
import { LineChart, Search } from "@/lib/icons"

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-label uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

export default function PrototypeKitPage() {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-muted py-10">
      {/* Neutral 390px mobile viewport frame */}
      <div className="relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[2.5rem] border border-border bg-background shadow-2xl">
        <div className="flex-1 space-y-8 overflow-y-auto px-4 pt-8 pb-28">
          <header className="flex flex-col gap-1">
            <h1 className="type-title text-foreground">prototype-kit</h1>
            <p className="type-body text-muted-foreground">
              Foundation check — not the hackathon solution.
            </p>
          </header>

          <Section title="Typography hierarchy">
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
              <span className="type-hero text-foreground">Aa</span>
              <span className="type-title text-foreground">Title / 20·650</span>
              <span className="type-body-strong text-foreground">Body strong / 14·650</span>
              <span className="type-body text-foreground">Body / 14·400</span>
              <span className="type-label text-muted-foreground">Label / 12·525</span>
            </div>
          </Section>

          <Section title="Financial hero number">
            <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
              <span className="type-label text-muted-foreground">Portfolio value</span>
              <span className="type-hero text-foreground">{formatCurrency(portfolio.totalValue)}</span>
              <span className={portfolio.todayChange >= 0 ? "type-body-strong text-positive" : "type-body-strong text-negative"}>
                {formatSignedCurrency(portfolio.todayChange)} ({formatPercent(portfolio.todayChangePercent)}) today
              </span>
              <div className="mt-2 h-20">
                <FinancialChart data={portfolio.history} variant="area" height={80} />
              </div>
            </div>
          </Section>

          <Section title="Buttons">
            <div className="flex gap-2">
              <Button variant="default" className="flex-1">
                Primary
              </Button>
              <Button variant="secondary" className="flex-1">
                Secondary
              </Button>
            </div>
          </Section>

          <Section title="Input">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search symbols" className="pl-8" />
            </div>
          </Section>

          <Section title="Segmented control">
            <Tabs defaultValue="stocks">
              <TabsList className="w-full">
                <TabsTrigger value="stocks" className="flex-1">
                  Stocks
                </TabsTrigger>
                <TabsTrigger value="options" className="flex-1">
                  Options
                </TabsTrigger>
                <TabsTrigger value="crypto" className="flex-1">
                  Crypto
                </TabsTrigger>
              </TabsList>
              <TabsContent value="stocks" className="type-body text-muted-foreground">
                Showing stocks.
              </TabsContent>
              <TabsContent value="options" className="type-body text-muted-foreground">
                Showing options.
              </TabsContent>
              <TabsContent value="crypto" className="type-body text-muted-foreground">
                Showing crypto.
              </TabsContent>
            </Tabs>
          </Section>

          <Section title="Badges & basic market values">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="outline" className="border-positive/30 text-positive">
                {formatPercent(2.41)}
              </Badge>
              <Badge variant="outline" className="border-negative/30 text-negative">
                {formatPercent(-1.08)}
              </Badge>
            </div>
          </Section>

          <Section title="Watchlist row">
            <div className="rounded-lg border border-border bg-surface px-4">
              {watchlist.slice(0, 3).map((quote) => (
                <WatchlistRow key={quote.symbol} quote={quote} />
              ))}
            </div>
          </Section>

          <Section title="Metric / KPI treatment">
            <div className="grid grid-cols-2 gap-2">
              <KpiCard label="Buying power" value={formatCurrency(portfolio.buyingPower)} />
              <KpiCard label="Today" value={formatSignedCurrency(portfolio.todayChange)} changePercent={portfolio.todayChangePercent} />
            </div>
          </Section>

          <Section title="Portfolio allocation">
            <AllocationBar
              slices={[
                { label: "Equities", percent: 58, colorClassName: "bg-positive" },
                { label: "ETFs", percent: 27, colorClassName: "bg-accent" },
                { label: "Cash", percent: 15, colorClassName: "bg-muted-foreground" },
              ]}
            />
          </Section>

          <Section title="Simple chart">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 flex items-center gap-2">
                <LineChart className="size-4 text-muted-foreground" />
                <span className="type-label text-muted-foreground">AAPL · 30D</span>
              </div>
              <FinancialChart data={watchlist[0].history} variant="line" height={120} />
            </div>
          </Section>

          <Section title="Bottom sheet & modal">
            <div className="flex gap-2">
              <Drawer>
                <DrawerTrigger className={buttonVariants({ variant: "secondary", className: "flex-1" })}>
                  Bottom sheet
                </DrawerTrigger>
                <DrawerContent className="glass-sheet">
                  <DrawerHeader>
                    <DrawerTitle>Quick trade</DrawerTitle>
                    <DrawerDescription>A bottom sheet using the glass-sheet material.</DrawerDescription>
                  </DrawerHeader>
                </DrawerContent>
              </Drawer>
              <Dialog>
                <DialogTrigger className={buttonVariants({ variant: "secondary", className: "flex-1" })}>
                  Dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm order</DialogTitle>
                    <DialogDescription>A standard modal dialog.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </Section>

          <Section title="Skeleton state">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </Section>

          <Section title="Empty state">
            <div className="rounded-lg border border-border bg-surface">
              <EmptyState icon={Search} title="No results" description="Try a different symbol or keyword." />
            </div>
          </Section>
        </div>

        {/* Floating glass control — distinct from the glass-nav below */}
        <button
          type="button"
          className="glass-floating type-label absolute right-4 bottom-24 z-10 rounded-full px-4 py-2 text-foreground"
        >
          + Trade
        </button>

        <BottomNav className="absolute inset-x-0 bottom-0" />
      </div>
    </div>
  )
}
