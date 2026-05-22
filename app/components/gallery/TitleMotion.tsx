"use client";

import React from "react";
import { motion, useTransform, useScroll, MotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGalleryContext } from "./GalleryProjectsContext";

const LEFT_PERCENTAGES = ["40%", "25%", "75%"];
const DIRECTIONS: ("left" | "right")[] = ["right", "left", "right"];

export default function TitleMotion() {
  const container = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  const { projects, marqueeTitle } = useGalleryContext();
  const slideSources = [
    projects[0]?.src,
    projects[1]?.src,
    projects[2]?.src,
  ].filter(Boolean) as string[];

  if (slideSources.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden pt-4 md:pt-24" dir="rtl">
      <div className="sm:h-[15vh]" />
      <div ref={container}>
        {slideSources.map((src, i) => (
          <Slide
            key={src}
            src={src}
            direction={DIRECTIONS[i % DIRECTIONS.length]}
            left={LEFT_PERCENTAGES[i % LEFT_PERCENTAGES.length]}
            progress={scrollYProgress}
            title={marqueeTitle}
          />
        ))}
      </div>
      <div className="h-[10vh] md:h-[30vh]" />
    </div>
  );
}

interface PhraseProps {
  src: string;
  title: string;
}

const Phrase = ({ src, title }: PhraseProps) => {
  return (
    <div className="flex flex-row-reverse items-center gap-5 px-5 pt-2">
      <p className="text-[9vw] font-bold lg:text-[5vw]">{title}</p>
      <span className="relative aspect-[4/2] h-[7.5vw] overflow-hidden rounded-full">
        <Image style={{ objectFit: "cover" }} src={src} alt="" fill sizes="20vw" />
      </span>
    </div>
  );
};

interface SlideProps {
  direction: string;
  progress: MotionValue<number>;
  left: string;
  src: string;
  title: string;
}

const Slide = (props: SlideProps) => {
  const [repetitions, setRepetitions] = useState(4);

  useEffect(() => {
    const calculateRepetitions = () => {
      const screenWidth = window.innerWidth;
      const textWidth = 220;
      const buffer = 2;
      const baseRepetitions = Math.ceil(screenWidth / textWidth) + buffer;
      setRepetitions(Math.max(6, baseRepetitions));
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);

    return () => window.removeEventListener("resize", calculateRepetitions);
  }, []);

  const direction = props.direction === "left" ? -1 : 1;
  const translateX = useTransform(
    props.progress,
    [0, 1],
    [150 * direction, -150 * direction]
  );

  return (
    <motion.div
      style={{ x: translateX, left: props.left }}
      className="relative flex whitespace-nowrap"
      dir="rtl"
    >
      {Array.from({ length: repetitions }, (_, index) => (
        <Phrase key={index} src={props.src} title={props.title} />
      ))}
    </motion.div>
  );
};
