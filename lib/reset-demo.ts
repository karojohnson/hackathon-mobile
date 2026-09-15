import { STORAGE_KEY } from "@/components/providers/onboarding-provider"

/** Clears persisted onboarding/demo state and reloads to the dashboard root. */
export function resetDemo() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  window.location.assign("/")
}
