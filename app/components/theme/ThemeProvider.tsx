"use client";

import { applyThemeToDocument } from "@/lib/apply-theme";
import { THEME_STORAGE_KEY, type SiteTheme } from "@/lib/theme-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type { SiteTheme } from "@/lib/theme-storage";

type ThemeContextValue = {
  theme: SiteTheme;
  /** True after client has applied stored or system preference (avoids stale SSR default). */
  ready: boolean;
  setTheme: (t: SiteTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): SiteTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

function resolveTheme(): SiteTheme {
  const stored = readStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>("dark");
  const [ready, setReady] = useState(false);
  const animateNextRef = useRef(false);

  useLayoutEffect(() => {
    const resolved = resolveTheme();
    applyThemeToDocument(resolved, { animate: false });
    queueMicrotask(() => {
      setThemeState(resolved);
      setReady(true);
      animateNextRef.current = true;
    });
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    applyThemeToDocument(theme, { animate: animateNextRef.current });
  }, [theme, ready]);

  const setTheme = useCallback((t: SiteTheme) => setThemeState(t), []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, ready, setTheme, toggleTheme }),
    [theme, ready, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
