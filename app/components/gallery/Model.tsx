"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";
import { vertex, fragment } from "./shader";
import { useTexture } from "@react-three/drei";
import useMouse from "./useMouse";
import useDimension from "./useDimension";
import { useGalleryContext } from "./GalleryProjectsContext";
import { Mesh, ShaderMaterial } from "three";

interface ModelProps {
  activeMenu: number | null;
}

const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

const Model: React.FC<ModelProps> = ({ activeMenu }) => {
  const plane = useRef<Mesh>(null);
  const { viewport } = useThree();
  const dimension = useDimension();
  const mouse = useMouse();
  const opacity = useMotionValue(0);
  const { projects } = useGalleryContext();

  const urls = useMemo(() => projects.map((p) => p.src), [projects]);
  const textures = useTexture(urls);
  const textureList = useMemo(
    () => (Array.isArray(textures) ? textures : [textures]),
    [textures]
  );

  const aspectRatio = useMemo(() => {
    const img = textureList[0]?.image as HTMLImageElement | undefined;
    const w = img?.naturalWidth ?? img?.width ?? 1;
    const h = img?.naturalHeight ?? img?.height ?? 1;
    return w / Math.max(h, 1);
  }, [textureList]);

  const desiredHeight = 3;
  const desiredWidth = (desiredHeight - 0.2) * aspectRatio;

  const smoothMouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  const shaderUniforms = useMemo(
    () => ({
      uDelta: { value: { x: 0, y: 0 } },
      uAmplitude: { value: 0.0005 },
      uTexture: { value: textureList[0] },
      uAlpha: { value: 0 },
    }),
    [textureList]
  );

  useLayoutEffect(() => {
    const maxIdx = Math.max(textureList.length - 1, 0);
    const pick =
      activeMenu !== null ? Math.min(Math.max(activeMenu, 0), maxIdx) : 0;
    const tex = textureList[pick];

    if (!tex || !plane.current) return;

    const material = plane.current.material as ShaderMaterial;
    material.uniforms.uTexture.value = tex;

    const targetAlpha = activeMenu !== null ? 1 : 0;
    animate(opacity, targetAlpha, {
      duration: 0.2,
      onUpdate: (latest) => {
        if (plane.current) {
          const matInner = plane.current.material as ShaderMaterial;
          matInner.uniforms.uAlpha.value = latest;
        }
      },
    });
  }, [activeMenu, textureList, opacity]);

  useFrame(() => {
    if (!plane.current) return;

    const { x, y } = mouse;
    const smoothX = smoothMouse.x.get();
    const smoothY = smoothMouse.y.get();

    if (Math.abs(x - smoothX) > 1) {
      smoothMouse.x.set(lerp(smoothX, x, 0.1));
      smoothMouse.y.set(lerp(smoothY, y, 0.1));
      const material = plane.current.material as ShaderMaterial;
      material.uniforms.uDelta.value = {
        x: x - smoothX,
        y: -1 * (y - smoothY),
      };
    }

    const dw = Math.max(dimension.width, 1);
    const dh = Math.max(dimension.height, 1);
    const xPos = (smoothX / dw - 0.5) * viewport.width;
    const yPos = -(smoothY / dh - 0.5) * viewport.height;
    plane.current.position.set(xPos, yPos, 0);
  });

  if (textureList.length === 0) {
    return null;
  }

  return (
    <mesh ref={plane} scale={[desiredWidth, desiredHeight, 1]}>
      <planeGeometry args={[1, 1, 15, 15]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={shaderUniforms}
        transparent
      />
    </mesh>
  );
};

export default Model;
