"use client";

import { dismissSplashForever, isSplashDismissed } from "@/lib/splash-storage";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SplashTitle from "./SplashTitle";
import styles from "./splash.module.css";

type SplashGateProps = {
  children: React.ReactNode;
};

export default function SplashGate({ children }: SplashGateProps) {
  const reduced = useReducedMotion();
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    setShowSplash(!isSplashDismissed());
  }, []);

  const dismiss = useCallback(() => {
    setShowSplash(false);
  }, []);

  const dismissForever = useCallback(() => {
    dismissSplashForever();
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (!showSplash) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSplash, dismiss]);

  return (
    <>
      <AnimatePresence>
        {showSplash === true && (
          <motion.div
            className={styles.overlay}
            dir="rtl"
            lang="ar"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="ابدأ معرض الأعمال"
          >
            <button
              type="button"
              className={styles.skipSplash}
              onClick={dismissForever}
            >
              لا تعرض هذا مرة أخرى
            </button>
            <motion.div
              className={styles.stack}
              initial={{ opacity: 0, y: reduced ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.heroRow}>
                <div className={styles.copy}>
                  <a
                    href="https://www.instagram.com/_5lo_9/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.kicker}
                  >
                    صُمم وطوّر ب ❤️
                  </a>
                  <SplashTitle active={showSplash} />
                  <button
                    type="button"
                    className={styles.cta}
                    onClick={dismiss}
                    autoFocus
                  >
                    عشان تبدأ اضغط هنا
                  </button>
                </div>
              </div>

              <div className={styles.hints}>
                <p className={styles.hint}>*خليك فضولي وحرك الماوس في كل مكان</p>
                <p className={styles.hint}>*لأفضل تجربة جرب الكمبيوتر</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
