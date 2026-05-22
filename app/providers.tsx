"use client";

import { ThemeProvider } from "@/app/components/theme/ThemeProvider";
import ThemeToggle from "@/app/components/theme/ThemeToggle";
import { TransitionProvider } from "./components/transitions/TransitionContext";
import { PageWrapper } from "./components/transitions/PageWrapper";
import { MusicProvider } from "./components/music/MusicContext";
import MusicButton from "./components/music/MusicButton";
import SplashGate from "./components/splash/SplashGate";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MusicProvider>
        {/*
         * SplashGate wraps EVERYTHING — including the nav buttons.
         * The overlay and the buttons now share the same stacking context,
         * so overlay z-index 200 correctly beats the buttons' z-index 100.
         *
         * Before: SplashGate was inside PageWrapper (initial opacity: 0),
         * so the buttons outside PageWrapper flashed over the splash for ~0.6 s.
         */}
        <SplashGate>
          <TransitionProvider>
            <PageWrapper>{children}</PageWrapper>
          </TransitionProvider>
          <nav className="nav-bar" aria-label="أدوات">
            <ThemeToggle />
            <MusicButton />
          </nav>
        </SplashGate>
      </MusicProvider>
    </ThemeProvider>
  );
}
