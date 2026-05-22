"use client";

import { type ComponentProps, type MouseEvent } from "react";
import { usePageTransition } from "./TransitionContext";

type Props = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  /** Accepted for API compatibility with next/link — ignored. */
  prefetch?: boolean;
};

/**
 * Drop-in replacement for next/link that triggers the page-transition curtain
 * before navigating. Falls back to normal behaviour for external links,
 * modifier-key clicks (new tab), and non-left-button clicks.
 */
export function TransitionLink({
  href,
  onClick,
  prefetch: _prefetch,
  children,
  ...rest
}: Props) {
  const { navigate } = usePageTransition();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    const external =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");
    const bypass =
      external ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0;

    if (bypass) {
      onClick?.(e);
      return;
    }

    e.preventDefault();
    onClick?.(e);
    navigate(href);
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
