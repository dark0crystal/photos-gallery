export const SPLASH_DISMISS_KEY = "portfolio-splash-dismissed";

export function isSplashDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SPLASH_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissSplashForever(): void {
  try {
    localStorage.setItem(SPLASH_DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}
