/**
 * The one place that knows how a payoff shape maps onto a chart.
 *
 * Both the payoff chart and the strike dial draw the same structure against
 * the same price axis: the chart draws the shape, the dial draws a 1-D
 * projection of where that shape is above zero. The dial's handle has to
 * land directly under the chart's breakeven dot, which only holds if both
 * compute that point the same way. So the level-to-height mapping and the
 * zero crossings live here, in axis fractions, and each caller scales them
 * into its own box.
 *
 * Everything returned is a fraction of the price axis, 0 at the left edge
 * of the window and 1 at the right. No pixels, no viewBox units.
 */

export interface PayoffLevelPoint {
  strike: number
  /** Normalised height in [-1, 1]. See PayoffPoint in data/mock-options-data.ts. */
  level: number
}

/**
 * Where the zero line sits inside the plot band, as a fraction from the
 * top. A constant, never computed: it is the same at every dial stop and
 * for every structure, which is what keeps the line still while the
 * strikes move underneath it.
 *
 * Slightly above the middle because more structures spend more of their
 * axis losing than winning, so the extra room belongs below.
 */
export const ZERO_FRACTION = 0.44

/**
 * Depth of `level` as a fraction from the top of the plot band: 0 at the
 * top, ZERO_FRACTION at the zero line, 1 at the floor.
 *
 * Piecewise on purpose. Level 1 and level -1 are both "as far as the chart
 * goes", but the zero line is not halfway between them, so the two sides
 * get different scales. That kink is why a zero crossing has to be solved
 * in this space rather than in level space: solving `level = 0` puts the
 * point a pixel or two off the line that actually gets drawn.
 */
export function levelDepth(level: number): number {
  const l = Math.min(1, Math.max(-1, level))
  return l >= 0
    ? ZERO_FRACTION * (1 - l)
    : ZERO_FRACTION + -l * (1 - ZERO_FRACTION)
}

export interface ProfitGeometry {
  /** Axis fractions where the drawn line crosses zero, left to right. */
  crossings: number[]
  /** Axis fraction ranges where the structure is above zero, left to right. */
  bands: [number, number][]
}

/**
 * The zero crossings and profitable bands of a payoff polyline.
 *
 * `points` must be ascending by strike and carry levels, not dollars.
 */
export function profitGeometry(
  points: PayoffLevelPoint[],
  xDomain: [number, number]
): ProfitGeometry {
  const [min, max] = xDomain
  const span = max - min || 1
  const fractionFor = (strike: number) =>
    Math.min(1, Math.max(0, (strike - min) / span))

  const crossings: number[] = []
  const bands: [number, number][] = []
  let open: number | null =
    points[0] && points[0].level > 0 ? fractionFor(points[0].strike) : null

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    if (a.level > 0 === b.level > 0) continue
    const ax = fractionFor(a.strike)
    const bx = fractionFor(b.strike)
    const ad = levelDepth(a.level)
    const bd = levelDepth(b.level)
    const crossing = ax + ((ZERO_FRACTION - ad) / (bd - ad)) * (bx - ax)
    crossings.push(crossing)
    if (b.level > 0) open = crossing
    else {
      bands.push([open ?? ax, crossing])
      open = null
    }
  }
  if (open !== null) {
    bands.push([open, fractionFor(points[points.length - 1].strike)])
  }

  return { crossings, bands }
}
