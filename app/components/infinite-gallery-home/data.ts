import {
  allProjects,
  type PhotographerSlug,
} from "@/lib/gallery-projects";

export type GalleryTile = {
  title: string;
  src: string;
  photographerId: PhotographerSlug;
  /** width / height */
  aspectRatio: number;
};

/** All photos from both photographers — aspect ratios match file pixels. */
export const infiniteGalleryTiles: GalleryTile[] = allProjects.map((p) => ({
  title: p.title,
  src: p.src,
  photographerId: p.photographerId,
  aspectRatio: p.width / Math.max(p.height, 1),
}));
