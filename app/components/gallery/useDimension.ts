"use client";

import { useEffect, useState } from "react";

export default function useDimension() {
  const [dimension, setDimension] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1,
    height: typeof window !== "undefined" ? window.innerHeight : 1,
  }));

  useEffect(() => {
    let frame = 0;

    const resize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setDimension({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return dimension;
}
