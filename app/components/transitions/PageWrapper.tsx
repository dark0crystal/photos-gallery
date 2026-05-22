"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Keyed on the current pathname so React remounts it on every navigation,
 * triggering a fresh entrance animation each time the curtain strips reveal
 * the new page.
 */
export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ minHeight: "100%", display: "flex", flexDirection: "column", flex: 1 }}
    >
      {children}
    </motion.div>
  );
}
