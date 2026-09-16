import { STORAGE_KEY } from "@/components/providers/onboarding-provider"
import { PRACTICE_STORAGE_KEY } from "@/components/providers/practice-provider"
import type { PrototypeId } from "@/components/providers/prototype-provider"

/**
 * Clears the persisted state of just the prototype being demoed, leaving the
 * other one's progress — and the active-prototype selection itself — intact.
 * Still reloads, because Chapter 1's onboarding overlay only replays from a
 * fresh mount; the persisted tab index is what lands you back in the same
 * prototype afterwards.
 */
export function resetDemo(prototype: PrototypeId) {
  try {
    window.localStorage.removeItem(prototype === 2 ? PRACTICE_STORAGE_KEY : STORAGE_KEY)
  } catch {
    // ignore
  }
  window.location.assign("/")
}
