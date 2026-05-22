"use client";

import { useMusicContext } from "./MusicContext";
import { MusicModal } from "./MusicModal";
import styles from "./music.module.css";

/** Animated bars icon — visible and bouncing when playing. */
function Bars({ active }: { active: boolean }) {
  return (
    <span className={`${styles.bars} ${active ? styles.barsActive : ""}`} aria-hidden>
      <span className={styles.bar} style={{ "--delay": "0s" } as React.CSSProperties} />
      <span className={styles.bar} style={{ "--delay": "0.15s" } as React.CSSProperties} />
      <span className={styles.bar} style={{ "--delay": "0.3s" } as React.CSSProperties} />
      <span className={styles.bar} style={{ "--delay": "0.1s" } as React.CSSProperties} />
    </span>
  );
}

/** The fixed music pill button shown across all pages. */
export default function MusicButton() {
  const { isPlaying, openModal, isModalOpen, tracks, currentIndex } = useMusicContext();
  const track = tracks[currentIndex];

  return (
    <>
      <button
        type="button"
        aria-label={isPlaying ? `الآن يعزف: ${track?.title}` : "فتح مشغّل الموسيقى"}
        onClick={openModal}
        className={styles.navBtn}
      >
        <Bars active={isPlaying} />
        <span className={styles.navBtnLabel}>
          {isPlaying && track ? track.title : "الموسيقى"}
        </span>
      </button>

      {isModalOpen && <MusicModal />}
    </>
  );
}
