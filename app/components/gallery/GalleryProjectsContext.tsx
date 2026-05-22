"use client";

import React, { createContext, useContext } from "react";
import type { Project } from "@/lib/gallery-projects";

export type GalleryContextValue = {
  projects: Project[];
  marqueeTitle: string;
  footerLabel: string;
};

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function GalleryProvider({
  projects,
  marqueeTitle,
  footerLabel,
  children,
}: {
  projects: Project[];
  marqueeTitle: string;
  footerLabel: string;
  children: React.ReactNode;
}) {
  return (
    <GalleryContext.Provider value={{ projects, marqueeTitle, footerLabel }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGalleryContext(): GalleryContextValue {
  const ctx = useContext(GalleryContext);
  if (!ctx) {
    throw new Error("useGalleryContext must be used inside GalleryProvider");
  }
  return ctx;
}
