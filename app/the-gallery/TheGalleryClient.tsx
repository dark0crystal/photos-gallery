"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import GalleryScreen from "@/app/components/gallery/GalleryScreen";
import {
  GALLERY_FOOTER,
  marqueeTitleFor,
  parsePhotographerParam,
  projectsForGalleryDisplay,
} from "@/lib/gallery-projects";

export default function TheGalleryClient() {
  const searchParams = useSearchParams();
  const slug = parsePhotographerParam(searchParams.get("photographer"));

  const projects = useMemo(() => projectsForGalleryDisplay(slug), [slug]);
  const title = useMemo(() => marqueeTitleFor(slug), [slug]);

  return (
    <GalleryScreen
      projects={projects}
      marqueeTitle={title}
      footerLabel={GALLERY_FOOTER}
    />
  );
}
