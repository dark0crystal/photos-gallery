import { hashString } from "@/app/components/infinite-gallery-home/scatterLayout";
import type { Project } from "@/lib/gallery-projects";

/** Home collage: up to 7 images per photographer section */
export const COLLAGE_MAX_IMAGES = 7;

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic subset so each reload matches (seeded by photographer slug).
 * When there are more than `COLLAGE_MAX_IMAGES`, picks a shuffled subset then
 * restores file order among the chosen indexes.
 */
export function pickCollageProjects(
  all: Project[],
  seed: string,
  max: number = COLLAGE_MAX_IMAGES
): Project[] {
  if (all.length <= max) return all;

  const rng = mulberry32(hashString(`collage-subset:${seed}`));
  const indices = all.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const chosen = indices
    .slice(0, max)
    .sort((a, b) => a - b);
  return chosen.map((i) => all[i]);
}
