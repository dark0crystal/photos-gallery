"use client";

import { useEffect, useState } from "react";
import Scene from "./Scene";
import Projects from "./Projects";
import Lenis from "lenis";

const Galleries: React.FC = () => {
  useEffect(() => {
    const lenis = new Lenis();
    let frame = 0;

    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none sticky top-0 z-0 h-screen" aria-hidden>
        <Scene activeMenu={activeMenu} />
      </div>
      <div className="relative z-10 -mt-[100vh] md:mix-blend-difference">
        <Projects activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>
      <div className="h-[10vh] md:h-[20vh] lg:h-[40vh]" />
    </div>
  );
};

export default Galleries;
