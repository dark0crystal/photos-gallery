"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TRACKS, type Track } from "@/lib/music";

// ─── Types ────────────────────────────────────────────────────────────────────

type RepeatMode = "none" | "one" | "all";

type MusicCtx = {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isModalOpen: boolean;
  // actions
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  goToTrack: (index: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  openModal: () => void;
  closeModal: () => void;
};

const MusicContext = createContext<MusicCtx>({} as MusicCtx);
export const useMusicContext = () => useContext(MusicContext);

// ─── Provider ────────────────────────────────────────────────────────────────

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create the Audio element once on the client
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.8;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Load track whenever currentIndex changes
  useEffect(() => {
    const audio = audioRef.current;
    const track = TRACKS[currentIndex];
    if (!audio || !track?.src) return;

    audio.src = track.src;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Attach/detach audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      const nextIdx = isShuffle
        ? Math.floor(Math.random() * TRACKS.length)
        : currentIndex + 1;

      if (nextIdx >= TRACKS.length) {
        if (repeatMode === "all") {
          setCurrentIndex(0);
          audio.play().catch(() => {});
        } else {
          setIsPlaying(false);
        }
      } else {
        setCurrentIndex(nextIdx);
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex, repeatMode, isShuffle]);

  // Sync play/pause state with audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const next = useCallback(() => {
    const nextIdx = isShuffle
      ? Math.floor(Math.random() * TRACKS.length)
      : (currentIndex + 1) % TRACKS.length;
    setCurrentIndex(nextIdx);
    setIsPlaying(true);
  }, [currentIndex, isShuffle]);

  const prev = useCallback(() => {
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const prevIdx =
      currentIndex === 0 ? TRACKS.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIdx);
    setIsPlaying(true);
  }, [currentIndex, currentTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const goToTrack = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffle((s) => !s), []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((m) =>
      m === "none" ? "all" : m === "all" ? "one" : "none"
    );
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <MusicContext.Provider
      value={{
        tracks: TRACKS,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        isModalOpen,
        toggle,
        next,
        prev,
        seekTo,
        setVolume,
        goToTrack,
        toggleShuffle,
        toggleRepeat,
        openModal,
        closeModal,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}
