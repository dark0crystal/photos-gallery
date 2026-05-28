"use client";

import Image from "next/image";
import { TransitionLink } from "../transitions/TransitionLink";
import {
  computeScatterLayout,
  hashString,
  type ScatterPlacement,
} from "@/app/components/infinite-gallery-home/scatterLayout";
import type { MotionValue } from "framer-motion";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PhotographerSlug, Project } from "@/lib/gallery-projects";

function depthForSrc(src: string, i: number): number {
  const h = hashString(`${src}:${i}`);
  return 22 + (h % 800) / 20;
}

/** Shift placements into a tight box so scale-to-fit never clips tiles on wide desktop stages. */
function fitPlacementsToPatch(
  placements: ScatterPlacement[],
  padding = 16
): { placements: ScatterPlacement[]; patchW: number; patchH: number } {
  if (placements.length === 0) {
    return { placements, patchW: 0, patchH: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of placements) {
    minX = Math.min(minX, p.left);
    maxX = Math.max(maxX, p.left + p.width);
    minY = Math.min(minY, p.top);
    maxY = Math.max(maxY, p.top + p.imageHeight);
  }

  const dx = padding - minX;
  const dy = padding - minY;
  const fitted = placements.map((p) => ({
    ...p,
    left: p.left + dx,
    top: p.top + dy,
  }));

  return {
    placements: fitted,
    patchW: Math.ceil(maxX - minX + padding * 2),
    patchH: Math.ceil(maxY - minY + padding * 2),
  };
}

function ParallaxTile({
  pl,
  project,
  sx,
  sy,
  depth,
  reduced,
  priority,
  index,
}: {
  pl: ScatterPlacement;
  project: Project;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  depth: number;
  reduced: boolean;
  priority: boolean;
  index: number;
}) {
  const x = useTransform(sx, (v) => (reduced ? 0 : v * depth));
  const y = useTransform(sy, (v) => (reduced ? 0 : v * depth));

  return (
    <motion.figure
      className="absolute z-[2] m-0"
      style={{
        left: pl.left,
        top: pl.top,
        width: pl.width,
        height: pl.imageHeight,
        x,
        y,
        willChange: reduced ? undefined : "transform",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: "easeOut" }}
    >
      <TransitionLink
        href={`/photos-on-mood/${project.slug}`}
        className="relative block size-full overflow-hidden"
      >
        <Image
          src={project.src}
          alt={project.title}
          width={project.width}
          height={project.height}
          className="h-full w-full object-cover"
          sizes="(max-width: 768px) 34vw, 22vw"
          draggable={false}
          priority={priority}
        />
      </TransitionLink>
    </motion.figure>
  );
}

type LayoutState = {
  patchW: number;
  patchH: number;
  placements: ScatterPlacement[];
};

function buildLayout(
  projects: Project[],
  vw: number,
  vh: number
): LayoutState | null {
  if (projects.length === 0 || vw < 120 || vh < 120) return null;

  const { placements: rawPl } = computeScatterLayout(
    projects.map((p) => ({
      src: p.src,
      aspectRatio: p.width / Math.max(p.height, 1),
    })),
    vw,
    vh,
    0,
    768
  );

  return fitPlacementsToPatch(rawPl);
}

export function PhotographerCollage({
  slug,
  projects,
}: {
  slug: PhotographerSlug;
  projects: Project[];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<LayoutState | null>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const reduced = !!useReducedMotion();
  const [iosHint, setIosHint] = useState(false);
  const iosCleanup = useRef<(() => void) | null>(null);

  // Clean up iOS gyroscope listener on unmount
  useEffect(() => () => { iosCleanup.current?.(); }, []);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const stiffness = reduced ? 520 : 90;
  const damping = reduced ? 105 : 18;
  const sx = useSpring(rawX, { stiffness, damping, mass: 0.38 });
  const sy = useSpring(rawY, { stiffness, damping, mass: 0.38 });

  const projectSig = projects.map((p) => p.src).join("\0");

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      setStageSize({ w, h });
      setLayout(buildLayout(projects, w, h));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [projectSig, projects]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || reduced) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      let nx = (e.clientX - cx) / (r.width * 0.20);
      let ny = (e.clientY - cy) / (r.height * 0.20);
      nx = Math.max(-1, Math.min(1, nx));
      ny = Math.max(-1, Math.min(1, ny));
      rawX.set(nx);
      rawY.set(ny);
    };

    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [rawX, rawY, reduced]);

  // Gyroscope parallax — mobile/tablet only
  useEffect(() => {
    if (typeof window === "undefined" || reduced) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    let base = { beta: 0, gamma: 0, calibrated: false };

    const onOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      if (!base.calibrated) {
        base.beta = beta;
        base.gamma = gamma;
        base.calibrated = true;
      }
      rawX.set(Math.max(-1, Math.min(1, (gamma - base.gamma) / 20)));
      rawY.set(Math.max(-1, Math.min(1, (beta - base.beta) / 20)));
    };

    const recalibrate = () => {
      base = { beta: 0, gamma: 0, calibrated: false };
    };

    const start = () => {
      window.addEventListener("deviceorientation", onOrientation, { passive: true });
      window.addEventListener("orientationchange", recalibrate, { passive: true });
    };

    // iOS 13+ requires an explicit user gesture — show Arabic prompt button
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function") {
      iosCleanup.current = () => {
        window.removeEventListener("deviceorientation", onOrientation);
        window.removeEventListener("orientationchange", recalibrate);
      };
      setIosHint(true);
      return iosCleanup.current;
    }

    start();
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("orientationchange", recalibrate);
    };
  }, [rawX, rawY, reduced]);

  let computedScale =
    layout && stageSize.w > 0 && stageSize.h > 0
      ? Math.min(
          stageSize.w / layout.patchW,
          stageSize.h / layout.patchH,
          1
        ) * 0.94
      : 1;

  if (!Number.isFinite(computedScale) || computedScale <= 0) computedScale = 1;

  const scaledW = layout ? layout.patchW * computedScale : 0;
  const scaledH = layout ? layout.patchH * computedScale : 0;

  const handleIosMotion = async () => {
    setIosHint(false);
    try {
      const res = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      if (res !== "granted") return;
      let base = { beta: 0, gamma: 0, calibrated: false };
      const onOri = (e: DeviceOrientationEvent) => {
        const beta = e.beta ?? 0;
        const gamma = e.gamma ?? 0;
        if (!base.calibrated) { base.beta = beta; base.gamma = gamma; base.calibrated = true; }
        rawX.set(Math.max(-1, Math.min(1, (gamma - base.gamma) / 20)));
        rawY.set(Math.max(-1, Math.min(1, (beta - base.beta) / 20)));
      };
      const recalib = () => { base = { beta: 0, gamma: 0, calibrated: false }; };
      window.addEventListener("deviceorientation", onOri, { passive: true });
      window.addEventListener("orientationchange", recalib, { passive: true });
      iosCleanup.current = () => {
        window.removeEventListener("deviceorientation", onOri);
        window.removeEventListener("orientationchange", recalib);
      };
    } catch {}
  };

  if (!layout) {
    return (
      <div
        ref={stageRef}
        className="relative min-h-[min(58dvh,560px)] w-full flex-1"
      />
    );
  }

  return (
    <div
      ref={stageRef}
      className="relative min-h-[min(58dvh,560px)] w-full flex-1 overflow-hidden touch-pan-y"
    >
      {iosHint && (
        <button
          onClick={handleIosMotion}
          className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-foreground/10 px-4 py-2 text-sm text-foreground backdrop-blur-sm border border-foreground/15"
          dir="rtl"
        >
          اضغط للسماح بحركة الجهاز
        </button>
      )}
      <div className="absolute inset-0 z-[1] flex items-center justify-center overflow-hidden">
        {/* Outer box matches visual size so scale() does not reserve unscaled width (desktop clip). */}
        <div
          className="relative shrink-0"
          style={{ width: scaledW, height: scaledH }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: layout.patchW,
              height: layout.patchH,
              transform: `scale(${computedScale})`,
            }}
          >
            {layout.placements.map((pl, i) => (
              <ParallaxTile
                key={projects[i]?.src ?? i}
                pl={pl}
                project={projects[i]!}
                sx={sx}
                sy={sy}
                reduced={reduced}
                depth={depthForSrc(projects[i]!.src, i)}
                priority={i < 6}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
