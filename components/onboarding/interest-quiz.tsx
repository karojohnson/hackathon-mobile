"use client"

import * as React from "react"
import { cn } from "cn"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { categories, type Category, type Subcategory } from "@/data/interests"
import { Check, Plus, Search } from "@/lib/icons"
import { StepProgress } from "@/components/onboarding/step-progress"

export interface InterestQuizProps {
  initialSelected?: string[]
  onContinue: (selectedIds: string[]) => void
  onSkip: () => void
}

const MIN_SELECTIONS = 3

function matchesQuery(subcategory: Subcategory, query: string) {
  return subcategory.label.toLowerCase().includes(query)
}

function SubcategoryPill({
  subcategory,
  isSelected,
  onToggle,
}: {
  subcategory: Subcategory
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={cn(
        "group flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-left transition-colors",
        isSelected
          ? "border-accent-blue bg-accent-blue text-background"
          : "border-border bg-surface text-foreground hover:border-accent-blue hover:bg-muted"
      )}
    >
      <span className="type-body-strong">{subcategory.label}</span>
      {isSelected ? (
        <Check className="size-4 shrink-0" />
      ) : (
        <Plus className="size-4 shrink-0 text-muted-foreground group-hover:text-accent-blue" />
      )}
    </button>
  )
}

function CategorySection({
  category,
  query,
  selected,
  onToggle,
  isOpen,
}: {
  category: Category
  query: string
  selected: string[]
  onToggle: (id: string) => void
  isOpen: boolean
}) {
  const Icon = category.icon
  const visibleSubcategories = query
    ? category.subcategories.filter((s) => matchesQuery(s, query))
    : category.subcategories
  const selectedCount = category.subcategories.filter((s) => selected.includes(s.id)).length
  const isAccented = isOpen || selectedCount > 0

  if (query && visibleSubcategories.length === 0) return null

  return (
    <AccordionItem value={category.id} className="rounded-lg glass-card px-4">
      <AccordionTrigger
        className={cn(
          "items-center py-3 hover:no-underline [&>svg]:size-5",
          isOpen && "**:data-[slot=accordion-trigger-icon]:text-foreground"
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              isAccented ? "bg-foreground text-background" : "bg-muted text-foreground"
            )}
          >
            {selectedCount > 0 ? (
              <span className="type-body-strong tabular-nums">{selectedCount}</span>
            ) : (
              <Icon className="size-4.5" />
            )}
          </span>
          <span className="type-body-strong text-foreground">{category.label}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-wrap gap-2 pt-1 pb-3">
          {visibleSubcategories.map((subcategory) => (
            <SubcategoryPill
              key={subcategory.id}
              subcategory={subcategory}
              isSelected={selected.includes(subcategory.id)}
              onToggle={() => onToggle(subcategory.id)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function InterestQuiz({ initialSelected = [], onContinue, onSkip }: InterestQuizProps) {
  const [selected, setSelected] = React.useState<string[]>(initialSelected)
  const [query, setQuery] = React.useState("")
  const normalizedQuery = query.trim().toLowerCase()

  // Only the first category is open on landing; a search in progress
  // overrides this so every category with a match expands to show it.
  const [openValues, setOpenValues] = React.useState<string[]>([categories[0].id])
  const isSearching = normalizedQuery.length > 0
  const searchOpenValues = isSearching
    ? categories
        .filter((c) => c.subcategories.some((s) => matchesQuery(s, normalizedQuery)))
        .map((c) => c.id)
    : null

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden pt-16">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 quiz-top-glow" />

      <div className="flex flex-col px-6">
        <StepProgress current={1} className="mb-6" />
        <div className="flex flex-col gap-1.5">
          <h1 className="type-title text-foreground">
            What are you <span className="text-accent-blue">interested</span> in?
          </h1>
          <p className="type-body text-muted-foreground">
            Pick a few — go broad, go specific, or mix and match. We&apos;ll use it to shape
            what you see first, and you can always change it later.{" "}
            <button
              type="button"
              onClick={onSkip}
              className="text-foreground"
            >
              Skip
            </button>
          </p>
        </div>
      </div>

      <div className="px-6 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword"
            className="h-11 rounded-full border-border bg-surface pl-9"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4">
        <Accordion
          multiple={isSearching}
          value={searchOpenValues ?? openValues}
          onValueChange={(value) => setOpenValues(value as string[])}
          className="gap-3"
        >
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              query={normalizedQuery}
              selected={selected}
              onToggle={toggle}
              isOpen={(searchOpenValues ?? openValues).includes(category.id)}
            />
          ))}
        </Accordion>
      </div>

      <div aria-hidden className="pointer-events-none -mt-32 h-32 shrink-0 glass-sheet-fade" />

      <div className="flex flex-col gap-3 px-6 pb-10">
        <Button
          size="lg"
          className="h-11! w-full"
          disabled={selected.length < MIN_SELECTIONS}
          onClick={() => onContinue(selected)}
        >
          {selected.length < MIN_SELECTIONS
            ? `${selected.length}/${MIN_SELECTIONS} selected`
            : "Continue"}
        </Button>
      </div>
    </div>
  )
}
