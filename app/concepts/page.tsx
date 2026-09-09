"use client"

import Link from "next/link"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardConceptA } from "@/components/dashboard/dashboard-concept-a"
import { DashboardConceptB } from "@/components/dashboard/dashboard-concept-b"
import { ChevronRight } from "@/lib/icons"

/**
 * Part 2 of the spec: static/exploratory dashboard concepts, for
 * conversation, not part of the main clickable path (Part 1 is `/`).
 */
export default function ConceptsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-col gap-3 px-4 pt-8">
        <Link href="/" className="type-label flex w-fit items-center gap-1 text-muted-foreground">
          <ChevronRight className="size-3.5 rotate-180" />
          Dashboard
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="type-title text-foreground">Dashboard concepts</h1>
          <p className="type-body text-muted-foreground">
            Two exploratory directions for discussion — static, not wired up.
          </p>
        </div>
      </div>

      <Tabs defaultValue="a" className="flex flex-1 flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="a" className="flex-1">
            Concept A · Narrative
          </TabsTrigger>
          <TabsTrigger value="b" className="flex-1">
            Concept B · At a glance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">
          <DashboardConceptA />
        </TabsContent>
        <TabsContent value="b">
          <DashboardConceptB />
        </TabsContent>
      </Tabs>
    </div>
  )
}
