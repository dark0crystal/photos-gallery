"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { allProjects } from "@/lib/gallery-projects";
import styles from "./splash.module.css";

const SOURCES = allProjects.map((p) => p.src);

const INTERVAL_MS = 1100;

type EffectVariant = {
  initial: Record<string, number>;
  animate: Record<string, number>;
  exit: Record<string, number>;
  duration: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

const EFFECTS: EffectVariant[] = [
  {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    duration: 0.42,
  },
  {
    initial: { opacity: 0, x: 36 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -36 },
    duration: 0.48,
  },
  {
    initial: { opacity: 0, x: -36 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 36 },
    duration: 0.48,
  },
  {
    initial: { opacity: 0, scale: 1.2 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.88 },
    duration: 0.5,
  },
  {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -28 },
    duration: 0.45,
  },
  {
    initial: { opacity: 0, rotate: -4, scale: 1.08 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 4, scale: 0.92 },
    duration: 0.52,
  },
];

const FADE_ONLY: EffectVariant = EFFECTS[0];

export default function SplashImageRotator({ active }: { active: boolean }) {
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
  const effect = reduced ? FADE_ONLY : EFFECTS[index % EFFECTS.length];

  return (
    <div className={styles.frame} aria-hidden>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${src}-${index}`}
          className={styles.frameSlide}
          initial={effect.initial}
          animate={effect.animate}
          exit={effect.exit}
          transition={{ duration: effect.duration, ease: EASE }}
        >
          <Image
            src={src}
            alt=""
            fill
            className={styles.frameImg}
            sizes="(max-width: 520px) 88px, 136px"
            priority={index < 2}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
