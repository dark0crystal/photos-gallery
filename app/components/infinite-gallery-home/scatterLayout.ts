/** Space reserved under each image for the caption line. */
export const SCATTER_CAPTION_RESERVE = 34;

export type ScatterPlacement = {
  left: number;
  top: number;
  width: number;
  /** Image area height (caption sits below). */
  imageHeight: number;
};

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/**
 * Prefer wider grids (min 3 cols) so images spread horizontally rather than
 * stacking in tall 2-column layouts that cause heavy overlap.
 */
function gridDimensions(n: number): { cols: number; rows: number } {
  let best = {
    cols: Math.ceil(Math.sqrt(n)),
    rows: Math.ceil(n / Math.ceil(Math.sqrt(n))),
  };
  let bestScore = Infinity;
  const mid = Math.ceil(Math.sqrt(n));
  // Minimum 3 columns — prevents the 2×4 layout for n=7 that piles images.
  const lo = Math.max(3, mid - 2);
  const hi = Math.min(n, mid + 8);

  for (let cols = lo; cols <= hi; cols++) {
    const rows = Math.ceil(n / cols);
    const waste = cols * rows - n;
    const ar = cols / Math.max(rows, 1);
    if (ar > 2.35 || ar < 1 / 2.35) continue;

    const squareBias = Math.abs(Math.log(ar));
    const score = waste * 100 + squareBias * 18;
    if (score < bestScore) {
      bestScore = score;
      best = { cols, rows };
    }
  }
  return best;
}

/**
 * Iterative separation pass — pushes significantly overlapping image pairs apart
 * along the cheaper axis. Allows small artistic overlaps (< 10% of smaller
 * image's area) but breaks up heavy clusters.
 */
function separatePlacements(
  placements: ScatterPlacement[],
  patchW: number,
  patchH: number
): ScatterPlacement[] {
  const result = placements.map((p) => ({ ...p }));
  const GAP = 10;

  for (let iter = 0; iter < 5; iter++) {
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];

        const ox =
          Math.min(a.left + a.width, b.left + b.width) -
          Math.max(a.left, b.left);
        const oy =
          Math.min(a.top + a.imageHeight, b.top + b.imageHeight) -
          Math.max(a.top, b.top);

        if (ox <= 0 || oy <= 0) continue;

        // Leave small corner overlaps intact (artistic effect)
        const smallArea = Math.min(
          a.width * a.imageHeight,
          b.width * b.imageHeight
        );
        if (ox * oy < smallArea * 0.10) continue;

        // Push along the axis that requires the smaller move
        if (ox <= oy) {
          const push = ox / 2 + GAP / 2;
          const dir =
            a.left + a.width / 2 < b.left + b.width / 2 ? 1 : -1;
          result[i] = {
            ...a,
            left: Math.max(0, Math.min(patchW - a.width, a.left - dir * push)),
          };
          result[j] = {
            ...b,
            left: Math.max(0, Math.min(patchW - b.width, b.left + dir * push)),
          };
        } else {
          const push = oy / 2 + GAP / 2;
          const dir =
            a.top + a.imageHeight / 2 < b.top + b.imageHeight / 2 ? 1 : -1;
          result[i] = {
            ...a,
            top: Math.max(
              0,
              Math.min(patchH - a.imageHeight, a.top - dir * push)
            ),
          };
          result[j] = {
            ...b,
            top: Math.max(
              0,
              Math.min(patchH - b.imageHeight, b.top + dir * push)
            ),
          };
        }
      }
    }
  }

  return result;
}

/**
 * Scatter images across the full stage area with dramatic size variation.
 *
 * Grid layout:
 *   - Minimum 3 columns to prevent narrow 2-column stacking (n=7 → 4×2 grid).
 *   - All cells equally likely (no center-bias) for even spatial coverage.
 *
 * Jitter:
 *   - ±32% cellW horizontally — keeps images in their column's half while still
 *     looking organic; adjacent columns won't heavily overlap.
 *   - ±37% cellH vertically — varies row placement without extreme bunching.
 *
 * Post-placement:
 *   - separatePlacements() runs 5 iterations to push significantly overlapping
 *     pairs apart, while leaving small artistic overlaps intact.
 */
export function computeScatterLayout(
  tiles: { src: string; aspectRatio: number }[],
  viewportW: number,
  viewportH: number,
  captionReserve = SCATTER_CAPTION_RESERVE,
  mobileMaxWidth = 768
): { patchW: number; patchH: number; placements: ScatterPlacement[] } {
  const n = tiles.length;
  if (n === 0) {
    return { patchW: 800, patchH: 600, placements: [] };
  }

  const vw = Math.max(viewportW, 320);
  const vh = Math.max(viewportH, 480);
  const isMobile = vw <= mobileMaxWidth;

  const { cols, rows } = gridDimensions(n);

  // Patch slightly larger than stage; scale factor in the component (~0.97)
  // makes the displayed patch fill ~94% of the stage in each dimension.
  const patchW = isMobile ? vw * 1.06 : vw * 1.03;
  const patchH = isMobile ? vh * 1.06 : vh * 1.03;

  const cellW = patchW / cols;
  const cellH = patchH / rows;

  // Distribute images across ALL cells, shuffled for even spatial coverage.
  const rngOrder = mulberry32(hashString("home-scatter-v5"));
  const assignedCells = shuffle(range(cols * rows), rngOrder).slice(0, n);

  // Base image width relative to the stage width (not cell width) so images
  // are consistently visible regardless of how the grid divides the space.
  const baseW = isMobile
    ? vw * 0.34
    : n <= 6
      ? vw * 0.28
      : vw * 0.22;

  // Three size tiers: 2 large, 2 small, 3 medium (for n = 7)
  const sizeMultipliers = [1.28, 0.52, 1.0, 1.28, 1.0, 0.52, 1.0];

  const rawPlacements: ScatterPlacement[] = [];

  for (let i = 0; i < n; i++) {
    const tile = tiles[i];
    const aspect = tile.aspectRatio;
    const cellIdx = assignedCells[i];
    const cx = cellIdx % cols;
    const cy = Math.floor(cellIdx / cols);

    const rng = mulberry32(hashString(tile.src) ^ (i * 0xf137));

    // Size from tier with ±8% variation
    const mult = sizeMultipliers[i % sizeMultipliers.length] ?? 1.0;
    let width = Math.min(baseW * mult * (0.92 + rng() * 0.16), patchW * 0.55);
    let imageHeight = width / aspect;

    // Cap very tall portrait images
    const maxH = patchH * 0.55;
    if (imageHeight > maxH) {
      imageHeight = maxH;
      width = imageHeight * aspect;
    }

    // Place at cell center then jitter:
    //   x ± 32% cellW — stays mostly in its column zone
    //   y ± 37% cellH — distributes rows without extreme bunching
    const idealLeft = (cx + 0.5) * cellW - width * 0.5;
    const idealTop = (cy + 0.5) * cellH - imageHeight * 0.5;

    const jx = (rng() - 0.5) * cellW * 0.64;
    const jy = (rng() - 0.5) * cellH * 0.74;

    const left = Math.max(0, Math.min(patchW - width, idealLeft + jx));
    const top = Math.max(
      0,
      Math.min(patchH - imageHeight - captionReserve, idealTop + jy)
    );

    rawPlacements.push({ left, top, width, imageHeight });
  }

  // Resolve heavy overlaps while keeping small artistic ones
  const placements = separatePlacements(rawPlacements, patchW, patchH);

  let maxRight = 0;
  let maxBottom = 0;
  for (const p of placements) {
    maxRight = Math.max(maxRight, p.left + p.width + 8);
    maxBottom = Math.max(maxBottom, p.top + p.imageHeight + captionReserve + 8);
  }

  return {
    patchW: Math.max(patchW, Math.ceil(maxRight)),
    patchH: Math.max(patchH, Math.ceil(maxBottom)),
    placements,
  };
}
