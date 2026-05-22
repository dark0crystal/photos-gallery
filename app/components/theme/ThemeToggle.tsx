"use client";

import { useTheme } from "@/app/components/theme/ThemeProvider";
import { ApertureIcon } from "@phosphor-icons/react";
import styles from "./theme-toggle.module.css";

const APERTURE = {
  light: "f/2.8",
  dark: "f/16",
} as const;

export default function ThemeToggle() {
  const { theme, ready, toggleTheme } = useTheme();
  const aperture = ready ? APERTURE[theme] : "—";
  const isLight = theme === "light";

  const label =
    theme === "dark"
      ? `التبديل إلى الوضع الفاتح، فتحة ${APERTURE.light}`
      : `التبديل إلى الوضع الداكن، فتحة ${APERTURE.dark}`;

  return (
    <button
      type="button"
      className={`theme-toggle ${styles.toggle} ${ready ? styles[theme] : styles.busy}`}
      onClick={toggleTheme}
      aria-pressed={isLight}
      aria-label={label}
      aria-busy={!ready}
      disabled={!ready}
    >
      <span className={styles.track}>
        <span className={styles.thumb}>
          <ApertureIcon
            className={styles.icon}
            size={30}
            weight="fill"
            aria-hidden
          />
        </span>
        <span className={styles.fStop}>{aperture}</span>
      </span>
    </button>
  );
}
