import { Search, User } from "@/lib/icons"

/**
 * Top account header — visual composition only (per stakeholder
 * reference screenshot), not real content: a generic avatar/account
 * label instead of a real account number.
 */
export function AccountBar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-accent">
          <User className="size-5 text-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="type-body-strong text-foreground">Individual</span>
          <span className="type-label text-muted-foreground">Account ····4021</span>
        </div>
      </div>
      <button
        type="button"
        className="flex size-9 items-center justify-center rounded-full text-foreground hover:bg-muted"
        aria-label="Search"
      >
        <Search className="size-5" />
      </button>
    </div>
  )
}
