const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const currencyCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

/**
 * Whole dollars, no cents — for summary figures where the cents are noise
 * (e.g. "most you can lose $320" on the open-trades card, matching Figma).
 * Precise option P/L keeps `formatCurrency` and its cents.
 */
const currencyWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function formatCurrencyWhole(value: number) {
  return currencyWhole.format(value)
}

export function formatCurrency(value: number) {
  return currency.format(value)
}

export function formatSignedCurrency(value: number) {
  const formatted = currencyCompact.format(Math.abs(value))
  return value < 0 ? `-${formatted}` : `+${formatted}`
}

export function formatPercent(value: number) {
  const formatted = `${Math.abs(value).toFixed(2)}%`
  return value < 0 ? `-${formatted}` : `+${formatted}`
}

const newsDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

/** Formats a unix-seconds timestamp as e.g. "Sep 8", for news/activity feeds. */
export function formatNewsDate(timestampSeconds: number) {
  return newsDate.format(new Date(timestampSeconds * 1000))
}
