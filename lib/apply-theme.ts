import { THEME_STORAGE_KEY, type SiteTheme } from "@/lib/theme-storage";

const TRANSITION_MS = 720;

export function applyThemeToDocument(
  theme: SiteTheme,
  options?: { animate?: boolean }
): void {
  const root = document.documentElement;

  const apply = () => {
    root.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  };

  if (!options?.animate) {
    apply();
    return;
  }

  root.classList.add("theme-transition");

  const finish = () => {
    root.classList.remove("theme-transition");
  };

  if (typeof document.startViewTransition === "function") {
    const transition = document.startViewTransition(apply);
    transition.finished.then(finish).catch(finish);
    return;
  }

  apply();
  window.setTimeout(finish, TRANSITION_MS);
}
