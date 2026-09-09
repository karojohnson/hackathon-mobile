"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  AreaSeries,
  CandlestickSeries,
  LineSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts"

import { cn } from "cn"

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

export interface FinancialChartProps {
  data: FinancialChartPoint[]
  variant?: FinancialChartVariant
  /** Tints a line/area series positive or negative (defaults to auto from first/last value). */
  trend?: "positive" | "negative" | "neutral"
  height?: number
  className?: string
}

function readVar(name: string) {
  if (typeof window === "undefined") return ""
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
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
}: FinancialChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<IChartApi | null>(null)
  const seriesRef = React.useRef<ISeriesApi<"Line" | "Area" | "Candlestick"> | null>(null)
  const { resolvedTheme } = useTheme()

  const resolvedTrend: "positive" | "negative" | "neutral" =
    trend ??
    (() => {
      const first = data[0]
      const last = data[data.length - 1]
      const firstValue = first?.value ?? first?.close ?? 0
      const lastValue = last?.value ?? last?.close ?? 0
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
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        visible: variant === "candlestick",
      },
      crosshair: {
        vertLine: { color: border, labelBackgroundColor: border },
        horzLine: { color: border, labelBackgroundColor: border },
      },
      handleScroll: false,
      handleScale: false,
    })
    chartRef.current = chart

    if (variant === "candlestick") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: positive,
        downColor: negative,
        borderVisible: false,
        wickUpColor: positive,
        wickDownColor: negative,
      })
      series.setData(toSeriesData(data) as CandlestickData[])
      seriesRef.current = series
    } else if (variant === "area") {
      const series = chart.addSeries(AreaSeries, {
        lineColor: accentColor,
        topColor: `${accentColor}33`,
        bottomColor: `${accentColor}00`,
        lineWidth: 2,
      })
      series.setData(toSeriesData(data) as LineData[])
      seriesRef.current = series
    } else {
      const series = chart.addSeries(LineSeries, {
        color: accentColor,
        lineWidth: 2,
      })
      series.setData(toSeriesData(data) as LineData[])
      seriesRef.current = series
    }

    chart.timeScale().fitContent()

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      chart.resize(entry.contentRect.width, height)
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [data, variant, resolvedTrend, height, resolvedTheme])

  return <div ref={containerRef} className={cn("w-full", className)} />
}
