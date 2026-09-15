const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const currencyCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

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
