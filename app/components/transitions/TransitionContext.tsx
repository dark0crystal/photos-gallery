"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

// ─── Timing ──────────────────────────────────────────────────────────────────

const STRIPS = 5;
const IN_DUR  = 0.55;  // seconds — each strip closes
const OUT_DUR = 0.50;  // seconds — each strip opens
const STAGGER = 0.07;  // seconds between strips

// Navigate this many ms after the last strip finishes closing
const CLOSE_MS = Math.round((IN_DUR + STAGGER * (STRIPS - 1)) * 1000) + 80;
// Switch to idle this many ms after the last strip finishes opening
const OPEN_MS  = Math.round((OUT_DUR + STAGGER * (STRIPS - 1)) * 1000) + 100;

// ─── Context ─────────────────────────────────────────────────────────────────

type Ctx = { navigate: (href: string) => void };
const TransitionCtx = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionCtx);

// ─── Overlay ─────────────────────────────────────────────────────────────────

type Phase = "in" | "out";

function Strip({ index, phase }: { index: number; phase: Phase }) {
  const isIn = phase === "in";
  return (
    <motion.div
      aria-hidden
      // Start each strip parked below the viewport so there is no flash on first render
      initial={{ y: "105%" }}
      animate={{ y: isIn ? "0%" : "-105%" }}
      transition={{
        duration: isIn ? IN_DUR : OUT_DUR,
        // Closing: left-to-right stagger. Opening: right-to-left stagger.
        delay: isIn ? index * STAGGER : (STRIPS - 1 - index) * STAGGER,
        ease: isIn ? [0.76, 0, 0.24, 1] : [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${(index / STRIPS) * 100}%`,
        width: `${100 / STRIPS}%`,
        background: "var(--foreground)",
        willChange: "transform",
      }}
    />
  );
}

function TransitionOverlay({ phase }: { phase: Phase | null }) {
  if (!phase) return null;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        // Block interaction while transitioning
        pointerEvents: "all",
      }}
    >
      {Array.from({ length: STRIPS }, (_, i) => (
        <Strip key={i} index={i} phase={phase} />
      ))}
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const busy     = useRef(false);
  const [phase, setPhase] = useState<Phase | null>(null);

  // Pathname changed → navigation completed → play exit animation
  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    window.scrollTo(0, 0);

    if (busy.current) {
      setPhase("out");
      const t = setTimeout(() => {
        setPhase(null);
        busy.current = false;
      }, OPEN_MS);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname || busy.current) return;
      busy.current = true;

      // Phase 1 — strips close
      setPhase("in");

      // Phase 2 — navigate once strips fully cover the screen
      setTimeout(() => router.push(href), CLOSE_MS);
    },
    [pathname, router],
  );

  return (
    <TransitionCtx.Provider value={{ navigate }}>
      {children}
      <TransitionOverlay phase={phase} />
    </TransitionCtx.Provider>
  );
}
