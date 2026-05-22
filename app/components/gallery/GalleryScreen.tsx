"use client";

import React from "react";
import type { Project } from "@/lib/gallery-projects";
import { GalleryProvider } from "./GalleryProjectsContext";
import { TransitionLink } from "@/app/components/transitions/TransitionLink";
import Footer from "./Footer";
import Galleries from "./Galleries";
import GalleryMotion from "./GalleryMotion";
import TitleMotion from "./TitleMotion";
import homeStyles from "./gallery-home-link.module.css";

export default function GalleryScreen({
  projects,
  marqueeTitle,
  footerLabel,
}: {
  projects: Project[];
  marqueeTitle: string;
  footerLabel: string;
}) {
  return (
    <GalleryProvider
      projects={projects}
      marqueeTitle={marqueeTitle}
      footerLabel={footerLabel}
    >
      <div className="relative isolate min-h-screen bg-background">
        <TransitionLink href="/" className={homeStyles.homeLink}>
          الرئيسية
        </TransitionLink>
        <GalleryMotion />
        <TitleMotion />
        <Galleries />
        <Footer />
      </div>
    </GalleryProvider>
  );
}
