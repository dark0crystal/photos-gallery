"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useGalleryContext } from "./GalleryProjectsContext";
import styles from "./projects-badges.module.css";

interface ProjectsProps {
  activeMenu: number | null;
  setActiveMenu: (index: number | null) => void;
}

const TILTS = [styles.tiltA, styles.tiltB, styles.tiltC] as const;
const EDGES = [styles.badgeEdgeStart, styles.badgeEdgeEnd] as const;

/** Up to 3 spread-out indices for title badges. */
function badgeIndices(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  if (count === 2) return [0, 1];
  const mid = Math.floor(count / 2);
  return [0, mid, count - 1];
}

const Projects: React.FC<ProjectsProps> = ({ activeMenu, setActiveMenu }) => {
  const { projects } = useGalleryContext();

  const badgeList = useMemo(() => badgeIndices(projects.length), [projects.length]);
  const badgeSet = useMemo(() => new Set(badgeList), [badgeList]);

  return (
    <div className="relative z-10 flex h-screen w-full justify-start md:mix-blend-difference">
      <ul
        onMouseLeave={() => setActiveMenu(null)}
        className="flex w-full flex-col items-stretch ps-5 pe-8 md:ps-10 md:pe-14"
      >
        {projects.map((project, i) => {
          const showBadge = badgeSet.has(i);
          const badgeHidden = activeMenu === i;
          const badgeSlot = badgeList.indexOf(i);
          const tilt = TILTS[badgeSlot % TILTS.length] ?? styles.tiltA;
          const edge = EDGES[badgeSlot % EDGES.length] ?? styles.badgeEdgeStart;

          return (
            <li
              onMouseEnter={() => setActiveMenu(i)}
              key={`${project.src}-${i}`}
              className={`${styles.item} w-full py-5`}
            >
              <p
                className={`${styles.title} text-start text-[clamp(1.1rem,3.2vw,2.75rem)] font-bold leading-none text-foreground md:text-white`}
              >
                {project.title}
              </p>
              {showBadge && (
                <div
                  className={`${styles.badgeWrap} ${edge} ${badgeHidden ? styles.badgeWrapHidden : ""}`}
                  aria-hidden={badgeHidden}
                >
                  <span className={`${styles.badge} ${tilt}`}>
                    <Image
                      src={project.src}
                      alt=""
                      width={64}
                      height={64}
                      className={styles.badgeImg}
                      sizes="64px"
                    />
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Projects;
