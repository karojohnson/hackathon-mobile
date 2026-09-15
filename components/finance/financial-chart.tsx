"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  AreaSeries,
  CandlestickSeries,
  LineSeries,
  LineStyle,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts"

import { cn } from "cn"
import { formatNewsDate, formatPercent } from "@/lib/format"

export type FinancialChartVariant = "line" | "area" | "candlestick"

export interface FinancialChartPoint {
  /** Unix seconds (UTC). */
  time: number
  value?: number
  open?: number
  high?: number
  low?: number
  close?: number
}

function toSeriesData(points: FinancialChartPoint[]) {
  return points.map((point) => ({
    ...point,
    time: point.time as UTCTimestamp,
  }))
}

function pointValue(point: FinancialChartPoint | undefined) {
  return point?.value ?? point?.close
}

interface PriceLabel {
  price: number
  y: number
}

interface TimeLabel {
  text: string
}

interface HoverPoint {
  x: number
  y: number
  time: number
  value: number
}

export interface FinancialChartProps {
  data: FinancialChartPoint[]
  variant?: FinancialChartVariant
  /** Tints a line/area series positive or negative (defaults to auto from first/last value). */
  trend?: "positive" | "negative" | "neutral"
  height?: number
  className?: string
  /**
   * Fires as the user scrubs the chart (mouse move / touch drag over it),
   * with the value at the crosshair's position — `null` once the crosshair
   * leaves the chart. Lets a consumer (e.g. the trading screen's price
   * header) track the pointer instead of always showing the latest price.
   */
  onCrosshairMove?: (point: { time: number; value: number } | null) => void
  /**
   * Shows subtle grid lines (day-boundary verticals, price-level
   * horizontals) for orientation on bigger charts. Off by default — this
   * component also renders as a tiny sparkline (watchlist rows, curated
   * list) where gridlines would just be clutter.
   */
  showGrid?: boolean
  /**
   * Shows 3-4 muted price levels along the right edge — a beginner-friendly
   * stand-in for a full price axis, not a real one (no axis line/ticks).
   */
  showPriceLabels?: boolean
  /** Shows a few muted date labels (first/middle/last of `data`) along the bottom. */
  showTimeLabels?: boolean
  /**
   * Draws a dotted line at `currentPrice` with a small price label on the
   * right edge. Pass the quote's authoritative current price here rather
   * than relying on the series' own last data point, since mock/real data
   * can lag slightly behind the live quote.
   */
  currentPrice?: number
  /**
   * Shows a small dot + compact tooltip (date, price, % change from the
   * start of `data`) as the user hovers or drags across the chart.
   */
  interactive?: boolean
}

function readVar(name: string) {
  if (typeof window === "undefined") return ""
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * `--glass-border-shade` (the delicate grey used for card borders and the
 * stats-grid dividers) is a `color-mix(in oklch, ...)` expression. Reading
 * it as a custom property returns that literal, unresolved string, and even
 * resolving it via a real element's computed style can come back as a raw
 * `oklch(...)` string in modern Chrome — which neither the chart's color
 * parser nor a canvas `fillStyle` round-trip normalizes back to rgb. So
 * rather than resolve the CSS expression, replicate it numerically: blend
 * `--border` toward transparent at the same ratio dark theme uses (30%),
 * producing a plain `rgba()` string every consumer can parse.
 */
function hexToRgba(hex: string, alpha: number) {
  const shorthand = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex)
  const full = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  const match = full ?? (shorthand ? [shorthand[0], ...shorthand.slice(1).map((c) => c + c)] : null)
  if (!match) return hex
  const [r, g, b] = match.slice(1).map((part) => parseInt(part, 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Reusable, mobile-first wrapper around TradingView Lightweight Charts.
 * Resizes with its container, follows the app's light/dark theme, and takes
 * mock or real time-series data. Keep this generic — build screen-specific
 * chart logic (e.g. range selectors) around it, not inside it.
 */
export function FinancialChart({
  data,
  variant = "area",
  trend,
  height = 220,
  className,
  onCrosshairMove,
  showGrid = false,
  showPriceLabels = false,
  showTimeLabels = false,
  currentPrice,
  interactive = false,
}: FinancialChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<IChartApi | null>(null)
  const seriesRef = React.useRef<ISeriesApi<"Line" | "Area" | "Candlestick"> | null>(null)
  const { resolvedTheme } = useTheme()

  const [priceLabels, setPriceLabels] = React.useState<PriceLabel[]>([])
  const [timeLabels, setTimeLabels] = React.useState<TimeLabel[]>([])
  const [lastValueY, setLastValueY] = React.useState<number | null>(null)
  const [hover, setHover] = React.useState<HoverPoint | null>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)

  // Ref, not a dependency of the setup effect below — an inline callback
  // prop shouldn't tear down and recreate the whole chart every render.
  const onCrosshairMoveRef = React.useRef(onCrosshairMove)
  React.useEffect(() => {
    onCrosshairMoveRef.current = onCrosshairMove
  }, [onCrosshairMove])

  const resolvedTrend: "positive" | "negative" | "neutral" =
    trend ??
    (() => {
      const first = data[0]
      const last = data[data.length - 1]
      const firstValue = pointValue(first) ?? 0
      const lastValue = pointValue(last) ?? 0
      if (lastValue > firstValue) return "positive"
      if (lastValue < firstValue) return "negative"
      return "neutral"
    })()

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const foreground = readVar("--foreground") || "#ffffff"
    const border = readVar("--border") || "#444444"
    const positive = readVar("--positive") || "#2db26a"
    const negative = readVar("--negative") || "#fc4138"
    const muted = readVar("--muted-foreground") || "#afafaa"
    const gridColor = hexToRgba(border, 0.3)
    const accentColor =
      resolvedTrend === "negative" ? negative : resolvedTrend === "positive" ? positive : foreground

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: muted,
        fontFamily: "var(--font-sans)",
        // TradingView's license requires this attribution unless it's
        // otherwise present on the page; only suppress it on sparklines too
        // small to render it legibly (e.g. a 32px watchlist row chart).
        attributionLogo: height > 60,
      },
      grid: {
        vertLines: { visible: showGrid, color: gridColor },
        horzLines: { visible: showGrid, color: gridColor },
      },
      rightPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        visible: variant === "candlestick",
      },
      crosshair: {
        vertLine: { color: border, width: 1, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
      handleScroll: false,
      handleScale: false,
    })
    chartRef.current = chart

    const seriesCommon = { priceLineVisible: false, lastValueVisible: false }

    if (variant === "candlestick") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: positive,
        downColor: negative,
        borderVisible: false,
        wickUpColor: positive,
        wickDownColor: negative,
        ...seriesCommon,
      })
      series.setData(toSeriesData(data) as CandlestickData[])
      seriesRef.current = series
    } else if (variant === "area") {
      const series = chart.addSeries(AreaSeries, {
        lineColor: accentColor,
        topColor: `${accentColor}33`,
        bottomColor: `${accentColor}00`,
        lineWidth: 2,
        ...seriesCommon,
      })
      series.setData(toSeriesData(data) as LineData[])
      seriesRef.current = series
    } else {
      const series = chart.addSeries(LineSeries, {
        color: accentColor,
        lineWidth: 2,
        ...seriesCommon,
      })
      series.setData(toSeriesData(data) as LineData[])
      seriesRef.current = series
    }

    if (currentPrice !== undefined) {
      seriesRef.current?.createPriceLine({
        price: currentPrice,
        color: accentColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: false,
        lineVisible: true,
      })
    }

    chart.timeScale().fitContent()

    function updateOverlays() {
      const series = seriesRef.current
      if (!series || data.length === 0) return

      const rawCurrentPriceY =
        currentPrice !== undefined ? series.priceToCoordinate(currentPrice) : null
      // Clamp away from the top/bottom edges so the label never overlaps
      // the date row (bottom) or gets clipped off-canvas (top).
      const currentPriceY =
        rawCurrentPriceY === null ? null : Math.min(Math.max(Number(rawCurrentPriceY), 12), height - 22)
      setLastValueY(currentPriceY)

      if (showPriceLabels) {
        const values = data.map((point) => pointValue(point) ?? 0)
        const max = Math.max(...values)
        const min = Math.min(...values)
        const step = (max - min) / 3
        const levels = step > 0 ? [max, max - step, max - 2 * step, min] : [max]
        // Skip a level that would sit on top of the current-price label, or
        // right in the bottom strip reserved for the date labels — rather
        // than render overlapping text.
        const labels = levels
          .map((price) => {
            const y = series.priceToCoordinate(price)
            if (y === null) return null
            const coord = Number(y)
            if (currentPriceY !== null && Math.abs(coord - Number(currentPriceY)) < 14) return null
            if (coord > height - 24) return null
            return { price: Math.round(price), y: coord }
          })
          .filter((label): label is PriceLabel => label !== null)
        setPriceLabels(labels)
      }

      if (showTimeLabels) {
        const lastIndex = data.length - 1
        const indices =
          data.length > 2 ? [0, Math.floor(lastIndex / 2), lastIndex] : Array.from({ length: data.length }, (_, i) => i)
        setTimeLabels(indices.map((i) => ({ text: formatNewsDate(data[i].time) })))
      }
    }

    updateOverlays()
    setContainerWidth(container.clientWidth)

    chart.subscribeCrosshairMove((param) => {
      const callback = onCrosshairMoveRef.current
      const series = seriesRef.current

      if (!param.time || !series || !param.point) {
        callback?.(null)
        if (interactive) setHover(null)
        return
      }

      const point = param.seriesData.get(series) as { value?: number; close?: number } | undefined
      const value = point?.value ?? point?.close
      if (value === undefined) {
        callback?.(null)
        if (interactive) setHover(null)
        return
      }

      callback?.({ time: param.time as number, value })
      if (interactive) {
        setHover({ x: param.point.x, y: param.point.y, time: param.time as number, value })
      }
    })

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      chart.resize(entry.contentRect.width, height)
      updateOverlays()
      setContainerWidth(entry.contentRect.width)
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [data, variant, resolvedTrend, height, resolvedTheme, showGrid, showPriceLabels, showTimeLabels, currentPrice, interactive])

  const baseline = pointValue(data[0])
  const hoverChangePercent =
    hover && baseline ? ((hover.value - baseline) / baseline) * 100 : null

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {showPriceLabels &&
        priceLabels.map((label) => (
          <span
            key={label.price}
            className="type-label pointer-events-none absolute right-1 -translate-y-1/2 rounded bg-background/55 px-1 text-muted-foreground"
            style={{ top: label.y }}
          >
            ${label.price}
          </span>
        ))}

      {showTimeLabels && timeLabels.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 -bottom-2 flex items-center justify-between pr-2">
          {timeLabels.map((label, i) => (
            <span key={label.text + i} className="type-label text-muted-foreground">
              {label.text}
            </span>
          ))}
        </div>
      )}

      {currentPrice !== undefined && lastValueY !== null && (
        <span
          className={cn(
            "type-label pointer-events-none absolute right-1 z-10 -translate-y-1/2 rounded bg-background/70 px-1 font-semibold",
            resolvedTrend === "negative" ? "text-negative" : "text-positive"
          )}
          style={{ top: lastValueY }}
        >
          ${currentPrice.toFixed(2)}
        </span>
      )}

      {interactive && hover && hoverChangePercent !== null && (
        <>
          <div
            className={cn(
              "pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background",
              resolvedTrend === "negative" ? "bg-negative" : "bg-positive"
            )}
            style={{ left: hover.x, top: hover.y }}
          />
          <div
            className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-[calc(100%+10px)] flex-col items-center gap-0.5 rounded-md bg-popover px-2 py-1.5 text-center shadow-lg"
            style={{
              left: Math.min(Math.max(hover.x, 36), (containerWidth || hover.x) - 36),
              top: hover.y,
            }}
          >
            <span className="type-label text-muted-foreground">{formatNewsDate(hover.time)}</span>
            <span className="type-body-strong text-foreground">${hover.value.toFixed(2)}</span>
            <span className={cn("type-label", hoverChangePercent >= 0 ? "text-positive" : "text-negative")}>
              {formatPercent(hoverChangePercent)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
