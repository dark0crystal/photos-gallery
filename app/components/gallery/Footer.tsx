"use client";

import React from "react";
import { useGalleryContext } from "./GalleryProjectsContext";

const Footer = () => {
  const { footerLabel } = useGalleryContext();

  return (
    <footer className="bg-background py-6 mt-16">
      <div className="container mx-auto text-center">
        <p className="text-sm text-foreground/75">{footerLabel}</p>
      </div>
    </footer>
  );
};

export default Footer;
