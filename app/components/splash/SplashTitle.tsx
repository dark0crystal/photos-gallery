"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { allProjects } from "@/lib/gallery-projects";
import styles from "./splash.module.css";

const SOURCES = allProjects.map((p) => p.src);
const INTERVAL_MS = 1100;
const EASE = [0.22, 1, 0.36, 1] as const;
const TITLE = "معرض الأعمال";

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  duration: 0.42,
};

type SplashTitleProps = {
  active: boolean;
};

export default function SplashTitle({ active }: SplashTitleProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || SOURCES.length < 2) return;

    const ms = reduced ? 2200 : INTERVAL_MS;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SOURCES.length);
    }, ms);

    return () => window.clearInterval(id);
  }, [active, reduced]);

  if (SOURCES.length === 0) return null;

  const src = SOURCES[index % SOURCES.length];

  return (
    <div className={styles.titleStack}>
      <div className={styles.frame} aria-hidden>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={src}
            className={styles.frameSlide}
            initial={FADE.initial}
            animate={FADE.animate}
            exit={FADE.exit}
            transition={{ duration: FADE.duration, ease: EASE }}
          >
            <Image
              src={src}
              alt=""
              fill
              className={styles.frameImg}
              sizes="(max-width: 520px) 72px, 104px"
              priority={index < 2}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <h1 className={styles.nameTitle} lang="ar">
        {TITLE}
      </h1>
    </div>
  );
}
