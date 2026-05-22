"use client";

import Image from "next/image";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { infiniteGalleryTiles } from "./data";
import styles from "./infinite-gallery-home.module.css";
import { computeScatterLayout } from "./scatterLayout";

/** Drag pan sensitivity */
const DRAG_SENS = 2;
/** Wheel/trackpad step strength */
const WHEEL_MULT = 2.65;

/** Lets scroll listeners ignore our own scroll updates (cleared next frame). */
function applyProgrammaticScroll(
  pane: HTMLDivElement,
  guardRef: React.MutableRefObject<boolean>,
  left: number,
  top: number
) {
  guardRef.current = true;
  pane.scrollLeft = left;
  pane.scrollTop = top;
  requestAnimationFrame(() => {
    guardRef.current = false;
  });
}

function wrapScrollTarget(
  pane: HTMLDivElement,
  target: { left: number; top: number },
  periodW: number,
  periodH: number
) {
  const maxL = Math.max(0, pane.scrollWidth - pane.clientWidth);
  const maxT = Math.max(0, pane.scrollHeight - pane.clientHeight);

  target.left = Math.min(maxL, Math.max(0, target.left));
  target.top = Math.min(maxT, Math.max(0, target.top));

  const pw = Math.max(periodW, 1);
  const ph = Math.max(periodH, 1);

  if (maxL >= pw) {
    const threshold = Math.min(pw * 0.42, maxL * 0.38);
    if (target.left <= threshold) {
      target.left = Math.min(maxL, target.left + pw);
    } else if (target.left >= maxL - threshold) {
      target.left = Math.max(0, target.left - pw);
    }
  }

  if (maxT >= ph) {
    const threshold = Math.min(ph * 0.42, maxT * 0.38);
    if (target.top <= threshold) {
      target.top = Math.min(maxT, target.top + ph);
    } else if (target.top >= maxT - threshold) {
      target.top = Math.max(0, target.top - ph);
    }
  }
}

function wheelPixels(e: WheelEvent, pane: HTMLDivElement): { dx: number; dy: number } {
  let dx = e.deltaX;
  let dy = e.deltaY;
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    dx *= 16;
    dy *= 16;
  } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    dx *= pane.clientWidth;
    dy *= pane.clientHeight;
  }
  return { dx, dy };
}

const PATCH_GRID = [-1, 0, 1].flatMap((cy) =>
  [-1, 0, 1].map((cx) => ({ cx, cy, key: `${cx},${cy}` }))
);

function PatchContent({
  patchW,
  patchH,
  placements,
  priorityImages,
}: {
  patchW: number;
  patchH: number;
  placements: ReturnType<typeof computeScatterLayout>["placements"];
  priorityImages: boolean;
}) {
  return (
    <div
      className={styles.patchScatter}
      style={{ width: patchW, height: patchH }}
    >
      {infiniteGalleryTiles.map((item, index) => {
        const box = placements[index];
        if (!box) return null;
        return (
          <Link
            key={`${item.src}-${index}`}
            href={`/the-gallery?photographer=${item.photographerId}`}
            prefetch={false}
            className={styles.tileScatter}
            scroll
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div
              className={styles.tileFigure}
              style={{ height: box.imageHeight }}
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 42vw, 320px"
                className={styles.tileImg}
                draggable={false}
                priority={priorityImages && index < 6}
              />
            </div>
            <p className={styles.tileCaption}>{item.title}</p>
          </Link>
        );
      })}
    </div>
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export default function InfiniteGalleryHome() {
  const reducedMotion = useReducedMotion();

  const [viewportSize, setViewportSize] = useState({ w: 1280, h: 800 });

  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTargetRef = useRef({ left: 0, top: 0 });
  const desiredScrollRef = useRef({ left: 0, top: 0 });
  const programmaticScrollRef = useRef(false);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setViewportSize({
        w: Math.max(Math.round(r.width), 320),
        h: Math.max(Math.round(r.height), 400),
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { patchW, patchH, placements } = useMemo(
    () =>
      computeScatterLayout(
        infiniteGalleryTiles,
        viewportSize.w,
        viewportSize.h
      ),
    [viewportSize.w, viewportSize.h]
  );

  const period = useMemo(() => {
    const w = Math.max(patchW, 400);
    const h = Math.max(patchH, 400);
    return { w, h };
  }, [patchW, patchH]);

  const canvasW = period.w * 3;
  const canvasH = period.h * 3;

  useLayoutEffect(() => {
    const pane = scrollRef.current;
    if (!pane) return;

    const center = () => {
      const maxLeft = Math.max(0, pane.scrollWidth - pane.clientWidth);
      const maxTop = Math.max(0, pane.scrollHeight - pane.clientHeight);
      pane.scrollLeft = maxLeft / 2;
      pane.scrollTop = maxTop / 2;
      scrollTargetRef.current.left = pane.scrollLeft;
      scrollTargetRef.current.top = pane.scrollTop;
      desiredScrollRef.current.left = pane.scrollLeft;
      desiredScrollRef.current.top = pane.scrollTop;
    };

    queueMicrotask(center);
    requestAnimationFrame(center);
  }, [canvasW, canvasH]);

  /** Period-wrap so panning feels unlimited (tiles repeat identically each period). */
  useEffect(() => {
    const pane = scrollRef.current;
    if (!pane) return;

    const pw = period.w;
    const ph = period.h;
    const target = scrollTargetRef.current;

    const onScroll = () => {
      if (programmaticScrollRef.current) return;
      target.left = pane.scrollLeft;
      target.top = pane.scrollTop;
      wrapScrollTarget(pane, target, pw, ph);
      if (
        pane.scrollLeft !== target.left ||
        pane.scrollTop !== target.top
      ) {
        applyProgrammaticScroll(
          pane,
          programmaticScrollRef,
          target.left,
          target.top
        );
      }
      desiredScrollRef.current.left = pane.scrollLeft;
      desiredScrollRef.current.top = pane.scrollTop;
      scrollTargetRef.current.left = pane.scrollLeft;
      scrollTargetRef.current.top = pane.scrollTop;
    };

    pane.addEventListener("scroll", onScroll, { passive: true });
    return () => pane.removeEventListener("scroll", onScroll);
  }, [canvasW, canvasH, period.w, period.h]);

  useEffect(() => {
    const pane = scrollRef.current;
    if (!pane || reducedMotion) return;

    const pw = period.w;
    const ph = period.h;
    const tgt = scrollTargetRef.current;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const { dx, dy } = wheelPixels(e, pane);
      tgt.left = pane.scrollLeft + dx * WHEEL_MULT;
      tgt.top = pane.scrollTop + dy * WHEEL_MULT;
      wrapScrollTarget(pane, tgt, pw, ph);

      applyProgrammaticScroll(pane, programmaticScrollRef, tgt.left, tgt.top);

      desiredScrollRef.current.left = tgt.left;
      desiredScrollRef.current.top = tgt.top;
      scrollTargetRef.current.left = tgt.left;
      scrollTargetRef.current.top = tgt.top;
    };

    pane.addEventListener("wheel", onWheel, { passive: false });
    return () => pane.removeEventListener("wheel", onWheel);
  }, [canvasW, canvasH, reducedMotion, period.w, period.h]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest("a")) return;

    const pane = scrollRef.current;
    if (pane) {
      scrollTargetRef.current.left = pane.scrollLeft;
      scrollTargetRef.current.top = pane.scrollTop;
      desiredScrollRef.current.left = pane.scrollLeft;
      desiredScrollRef.current.top = pane.scrollTop;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      const sens = reducedMotion ? DRAG_SENS * 0.65 : DRAG_SENS;
      const pane = scrollRef.current;

      if (!pane) return;

      const tgt = scrollTargetRef.current;
      tgt.left = pane.scrollLeft - dx * sens;
      tgt.top = pane.scrollTop - dy * sens;
      wrapScrollTarget(pane, tgt, period.w, period.h);

      applyProgrammaticScroll(pane, programmaticScrollRef, tgt.left, tgt.top);

      desiredScrollRef.current.left = pane.scrollLeft;
      desiredScrollRef.current.top = pane.scrollTop;
    },
    [reducedMotion, period.w, period.h]
  );

  const endDrag = useCallback(() => {
    dragRef.current.active = false;
    setDragging(false);
  }, []);

  const rootClass = [
    styles.viewport,
    dragging ? styles.dragging : "",
    reducedMotion ? styles.viewportReducedMotion : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={viewportRef}
      className={rootClass}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="application"
      aria-label="معرض الأعمال — مرّر أو اسحب للتنقل. اختر صورة لفتح معرض المصور."
    >
      <div className={styles.scrollStack}>
        <div ref={scrollRef} className={styles.scrollXY}>
          <div
            className={styles.scrollInner}
            style={{
              width: canvasW,
              height: canvasH,
            }}
          >
            {PATCH_GRID.map(({ cx, cy, key }) => (
              <div
                key={key}
                className={styles.patch}
                style={{
                  left: (cx + 1) * period.w,
                  top: (cy + 1) * period.h,
                  width: period.w,
                  height: period.h,
                }}
              >
                <PatchContent
                  patchW={period.w}
                  patchH={period.h}
                  placements={placements}
                  priorityImages={cx === 0 && cy === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.vignetteRadial} aria-hidden />
      <div className={styles.edgeHue} aria-hidden />
      <div className={styles.vignette} aria-hidden />
    </div>
  );
}
