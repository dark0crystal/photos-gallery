"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Shuffle,
  Repeat,
  RepeatOnce,
  SpeakerLow,
  SpeakerHigh,
  X,
} from "@phosphor-icons/react";
import { useMusicContext } from "./MusicContext";
import styles from "./music.module.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Seek bar ─────────────────────────────────────────────────────────────────

function SeekBar() {
  const { currentTime, duration, seekTo } = useMusicContext();
  const progress = duration > 0 ? currentTime / duration : 0;
  const barRef = useRef<HTMLDivElement>(null);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(1, pct)) * duration);
  }

  return (
    <div className={styles.seekWrap}>
      <div
        ref={barRef}
        className={styles.seekTrack}
        onClick={handleClick}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
      >
        <div className={styles.seekFill} style={{ width: `${progress * 100}%` }} />
        <div className={styles.seekThumb} style={{ left: `${progress * 100}%` }} />
      </div>
      <div className={styles.seekTimes}>
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(duration - currentTime)}</span>
      </div>
    </div>
  );
}

// ─── Track list ───────────────────────────────────────────────────────────────

function TrackList() {
  const { tracks, currentIndex, isPlaying, goToTrack } = useMusicContext();

  return (
    <div className={styles.trackList}>
      {tracks.map((t, i) => {
        const active = i === currentIndex;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => goToTrack(i)}
            className={`${styles.trackItem} ${active ? styles.trackItemActive : ""}`}
          >
            <div className={styles.trackCover}>
              <Image src={t.cover} alt={t.title} fill sizes="40px" style={{ objectFit: "cover" }} />
              {active && isPlaying && (
                <div className={styles.trackPlayingOverlay}>
                  <span className={`${styles.bars} ${styles.barsActive} ${styles.barsSmall}`} aria-hidden>
                    <span className={styles.bar} style={{ "--delay": "0s" } as React.CSSProperties} />
                    <span className={styles.bar} style={{ "--delay": "0.2s" } as React.CSSProperties} />
                    <span className={styles.bar} style={{ "--delay": "0.1s" } as React.CSSProperties} />
                  </span>
                </div>
              )}
            </div>

            <div className={styles.trackMeta}>
              <span className={`${styles.trackTitle} ${active ? styles.trackTitleActive : ""}`}>
                {t.title}
              </span>
              <span className={styles.trackArtist}>{t.artist}</span>
            </div>

            {active && (
              <div className={styles.trackActiveDot} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Album art — draggable to skip tracks ────────────────────────────────────

function AlbumArt() {
  const { tracks, currentIndex, isPlaying, next, prev } = useMusicContext();
  const [dragDir, setDragDir] = useState<"left" | "right" | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-120, 0, 120], [-6, 0, 6]);
  const scale = useTransform(x, [-120, 0, 120], [0.93, 1, 0.93]);

  const track = tracks[currentIndex];

  return (
    <div className={styles.albumWrap}>
      <AnimatePresence mode="popLayout" initial={false} custom={dragDir}>
        <motion.div
          key={currentIndex}
          className={styles.albumArt}
          custom={dragDir}
          variants={{
            initial: (dir: "left" | "right" | null) => ({
              x: dir === "left" ? 80 : dir === "right" ? -80 : 0,
              opacity: 0,
              scale: 0.9,
            }),
            animate: { x: 0, opacity: 1, scale: 1 },
            exit: (dir: "left" | "right" | null) => ({
              x: dir === "left" ? -80 : dir === "right" ? 80 : 0,
              opacity: 0,
              scale: 0.9,
            }),
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ x, rotate, scale }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.x < -55) {
              setDragDir("left");
              next();
            } else if (info.offset.x > 55) {
              setDragDir("right");
              prev();
            }
          }}
        >
          {track?.cover && (
            <Image
              src={track.cover}
              alt={track.title}
              fill
              sizes="380px"
              style={{ objectFit: "cover" }}
              priority
            />
          )}

          {/* Spinning vinyl shine when playing */}
          {isPlaying && (
            <motion.div
              className={styles.albumShine}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Swipe hint dots */}
      <div className={styles.swipeHint} aria-hidden>
        {tracks.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function MusicModal() {
  const {
    tracks,
    currentIndex,
    isPlaying,
    volume,
    isShuffle,
    repeatMode,
    toggle,
    next,
    prev,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    closeModal,
  } = useMusicContext();

  const track = tracks[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="مشغّل الموسيقى"
        className={styles.card}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button
          type="button"
          className={styles.backdrop}
          onClick={closeModal}
          aria-label="إغلاق"
          tabIndex={-1}
        />

        <motion.div
          className={styles.cardContent}
          style={{ transformOrigin: "50% 0%" }}
          initial={{ scale: 0.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.05, opacity: 0 }}
          transition={{
            scale: {
              type: "spring",
              stiffness: 240,
              damping: 24,
              mass: 0.7,
            },
            opacity: { duration: 0.22, ease: "easeOut" },
          }}
        >
          {/* Ambient blurred album art — clipped inside the card */}
          {track?.cover && (
            <div
              className={styles.cardBg}
              style={{ backgroundImage: `url(${track.cover})` }}
            />
          )}
          <div className={styles.cardBgOverlay} />

          {/* Ongoing iridescent shader overlay */}
          <div className={styles.shaderOverlay} aria-hidden />

          {/* One-shot light-sweep on entry */}
          <motion.div
            className={styles.shaderSweep}
            initial={{ x: "-110%", skewX: -18 }}
            animate={{ x: "210%", skewX: -18 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />

          {/* ── All visible content sits above the shader layers (z-index 10) ── */}
          <div className={styles.cardBody}>
            {/* Close handle */}
            <div className={styles.handle} aria-hidden />
            <button
              type="button"
              onClick={closeModal}
              className={styles.closeBtn}
              aria-label="إغلاق"
            >
              <X size={16} weight="bold" />
            </button>

            {/* Album art with drag-to-skip */}
            <AlbumArt />

            {/* Track info */}
            <div className={styles.trackInfo}>
              <div>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={`title-${currentIndex}`}
                    className={styles.nowTitle}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {track?.title ?? "—"}
                  </motion.h2>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`artist-${currentIndex}`}
                    className={styles.nowArtist}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                  >
                    {track?.artist ?? "—"}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Seek bar */}
            <SeekBar />

            {/* Main controls */}
            <div className={styles.controls}>
              <button
                type="button"
                onClick={toggleShuffle}
                className={`${styles.ctrlBtn} ${isShuffle ? styles.ctrlBtnActive : ""}`}
                aria-label="تشغيل عشوائي"
              >
                <Shuffle size={22} weight={isShuffle ? "fill" : "regular"} />
              </button>

              <button type="button" onClick={prev} className={styles.ctrlBtn} aria-label="السابق">
                <SkipBack size={30} weight="fill" />
              </button>

              <button type="button" onClick={toggle} className={styles.ctrlBtnPlay} aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}>
                {isPlaying
                  ? <Pause size={28} weight="fill" />
                  : <Play  size={28} weight="fill" />}
              </button>

              <button type="button" onClick={next} className={styles.ctrlBtn} aria-label="التالي">
                <SkipForward size={30} weight="fill" />
              </button>

              <button
                type="button"
                onClick={toggleRepeat}
                className={`${styles.ctrlBtn} ${repeatMode !== "none" ? styles.ctrlBtnActive : ""}`}
                aria-label="تكرار"
              >
                {repeatMode === "one"
                  ? <RepeatOnce size={22} weight="fill" />
                  : <Repeat    size={22} weight={repeatMode === "all" ? "fill" : "regular"} />}
              </button>
            </div>

            {/* Volume */}
            <div className={styles.volumeRow}>
              <SpeakerLow size={18} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className={styles.volumeSlider}
                aria-label="مستوى الصوت"
                style={{ "--vol": `${volume * 100}%` } as React.CSSProperties}
              />
              <SpeakerHigh size={18} />
            </div>

            {/* Track list */}
            <TrackList />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
