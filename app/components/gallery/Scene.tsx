"use client";

import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import Model from "./Model";

interface SceneProps {
  activeMenu: number | null;
}

/**
 * Default WebGL clear is opaque light grey / white, which clashes with
 * `body` / footer (`--background`). Transparent clear lets the site background show through.
 */
const Scene: React.FC<SceneProps> = ({ activeMenu }) => {
  return (
    <div className="absolute inset-0 h-full w-full bg-transparent md:fixed">
      <Canvas
        className="!bg-transparent"
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <Model activeMenu={activeMenu} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;