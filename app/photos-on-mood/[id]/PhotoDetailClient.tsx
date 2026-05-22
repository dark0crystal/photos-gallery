"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TransitionLink } from "@/app/components/transitions/TransitionLink";

const EASE = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay, ease: EASE },
  };
}

type Props = {
  src: string;
  width: number;
  height: number;
  title: string;
  photographerLabel: string;
  description: string;
  backHref: string;
};

export default function PhotoDetailClient({
  src,
  width,
  height,
  title,
  photographerLabel,
  description,
  backHref,
}: Props) {
  const aspect = width / height;
  const isPortrait = aspect < 1;

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        minHeight: "100dvh",
        background: "var(--background)",
        color: "var(--foreground)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top bar ── */}
      <motion.nav
        {...fadeUp(0.05)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "max(1.1rem, env(safe-area-inset-top)) clamp(1.25rem, 4vw, 2.5rem) 1rem",
          borderBottom: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
        }}
      >
        <TransitionLink
          href={backHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.72rem",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "inherit",
            opacity: 0.65,
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}
        >
          ← رجوع
        </TransitionLink>

        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 500,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            opacity: 0.4,
          }}
        >
          معرض الأعمال
        </span>
      </motion.nav>

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(2rem, 5vh, 4rem) clamp(1.25rem, 5vw, 3rem)",
          gap: "clamp(2rem, 4vh, 3rem)",
        }}
      >
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
          style={{
            width: "100%",
            maxWidth: isPortrait ? "min(480px, 90vw)" : "min(820px, 90vw)",
            position: "relative",
            boxShadow: "0 20px 60px color-mix(in oklab, var(--foreground) 12%, transparent)",
          }}
        >
          <Image
            src={src}
            alt={title}
            width={width}
            height={height}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 820px"
            priority
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </motion.div>

        {/* Metadata */}
        <div
          style={{
            width: "100%",
            maxWidth: isPortrait ? "min(480px, 90vw)" : "min(820px, 90vw)",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(0.85rem, 2vw, 1.25rem)",
          }}
        >
          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, originX: 1 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.65, delay: 0.55, ease: EASE }}
            style={{
              height: "1px",
              background: "color-mix(in oklab, var(--foreground) 18%, transparent)",
              transformOrigin: "right",
            }}
          />

          {/* Title row */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <motion.h1
              {...fadeUp(0.6)}
              style={{
                margin: 0,
                fontSize: "clamp(1.25rem, 3.5vw, 2rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {title}
            </motion.h1>

            <motion.span
              {...fadeUp(0.68)}
              style={{
                fontSize: "clamp(0.72rem, 1.8vw, 0.88rem)",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: 0.5,
                flexShrink: 0,
              }}
            >
              {photographerLabel}
            </motion.span>
          </div>

          {/* Description */}
          <motion.p
            {...fadeUp(0.78)}
            style={{
              margin: 0,
              fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
              fontWeight: 400,
              lineHeight: 1.85,
              opacity: 0.72,
              maxWidth: "65ch",
            }}
          >
            {description}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
