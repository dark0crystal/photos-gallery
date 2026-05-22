"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./globals.module.css";
import Image from "next/image";
import { useGalleryContext } from "./GalleryProjectsContext";

/** Indices into `projects` for each motion layer (same count as original gallery). */
const PROJECT_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;

const GallryMotion = () => {
  const { projects } = useGalleryContext();
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5a = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale5b = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6a = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);
  const scale6b = useTransform(scrollYProgress, [0, 1], [1, 6]);

  const scales = [scale4, scale5a, scale5b, scale6a, scale8, scale9, scale6b];

  const pictures = PROJECT_INDICES.map((picIndex, i) => {
    const src = projects[picIndex % Math.max(projects.length, 1)]?.src;
    return src ? { src, scale: scales[i] } : null;
  }).filter(Boolean) as { src: string; scale: (typeof scales)[0] }[];

  return (
    <>
      <div ref={targetRef} className={styles.container}>
        <div className={styles.sticky}>
          {pictures.map(({ src, scale }, index: number) => (
            <motion.div key={`${src}-${index}`} className={styles.el} style={{ scale }}>
              <div className={styles.imageContainer}>
                <Image alt="" fill src={src} className={styles.img} sizes="80vw" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="h-[20vh]" />
    </>
  );
};

export default GallryMotion;
