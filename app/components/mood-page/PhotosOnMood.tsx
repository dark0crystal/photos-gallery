"use client";

import { useMemo, useState } from "react";
import { allProjects } from "@/lib/gallery-projects";
import {
  filterProjectsByMood,
  PHOTO_MOOD_LABEL,
  PHOTO_MOODS,
  type PhotoMood,
} from "@/lib/photo-mood";
import { TransitionLink } from "@/app/components/transitions/TransitionLink";
import { pickCollageProjects } from "@/app/components/tomasi-home/collagePick";
import { PhotographerCollage } from "@/app/components/tomasi-home/PhotographerCollage";
import styles from "./mood-page.module.css";

const MOOD_COLLAGE_MAX = 9;

export default function PhotosOnMood() {
  const [mood, setMood] = useState<PhotoMood>("raiq");

  const projects = useMemo(() => {
    const filtered = filterProjectsByMood(allProjects, mood);
    return pickCollageProjects(filtered, `mood:${mood}`, MOOD_COLLAGE_MAX);
  }, [mood]);

  return (
    <main className={styles.shell}>
      <TransitionLink href="/" className={styles.homeLink}>
        الرئيسية
      </TransitionLink>

      <aside className={styles.sidebar} aria-label="تصفية حسب المزاج">
        <h1 className={styles.title}>الصور على مزاجك</h1>
        <div className={styles.moods} role="group" aria-label="المزاج">
          {PHOTO_MOODS.map((id) => (
            <button
              key={id}
              type="button"
              className={styles.moodBtn}
              data-active={mood === id}
              onClick={() => setMood(id)}
              aria-pressed={mood === id}
            >
              {PHOTO_MOOD_LABEL[id]}
            </button>
          ))}
        </div>
      </aside>

      <div className={styles.stage}>
        {projects.length === 0 ? (
          <p className={styles.empty}>لا توجد صور في هذا التصنيف.</p>
        ) : (
          <PhotographerCollage
            key={mood}
            slug="photographerone"
            projects={projects}
          />
        )}
      </div>
    </main>
  );
}
