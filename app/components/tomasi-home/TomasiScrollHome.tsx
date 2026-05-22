"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDoubleDown } from "@phosphor-icons/react";
import {
  PHOTOGRAPHERS,
  projectsForPhotographer,
  type PhotographerSlug,
} from "@/lib/gallery-projects";
import { TransitionLink } from "@/app/components/transitions/TransitionLink";
import { pickCollageProjects } from "./collagePick";
import { PhotographerCollage } from "./PhotographerCollage";
import styles from "./tomasi-scroll-home.module.css";

const ORDER: PhotographerSlug[] = ["photographerone", "photographertwo"];

export default function TomasiScrollHome() {
  const snapRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const el = snapRef.current;
    if (!el) return;
    const onScroll = () => setShowHint(el.scrollTop < 60);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className={styles.shell}>
      <TransitionLink
        href="/photos-on-mood"
        className={styles.moodLink}
        aria-label="الصور على مزاجك"
      >
        <span className={styles.moodLinkWord}>الصور</span>
        <span className={styles.moodLinkWord}>على</span>
        <span className={styles.moodLinkWord}>مزاجك</span>
      </TransitionLink>

      <div ref={snapRef} className={styles.snapScroll}>
        {ORDER.map((slug) => {
          const projects = pickCollageProjects(projectsForPhotographer(slug), slug);
          const meta = PHOTOGRAPHERS[slug];
          return (
            <section
              key={slug}
              className={styles.block}
              aria-labelledby={`heading-${slug}`}
            >
              <div className={styles.blockInner}>
                <TransitionLink
                  href={`/the-gallery?photographer=${slug}`}
                  className={styles.galleryLink}
                  aria-label={`عرض جميع صور ${meta.label}`}
                >
                  <span className={styles.galleryLinkWord}>عرض</span>
                  <span className={styles.galleryLinkWord}>جميع</span>
                  <span className={styles.galleryLinkWord}>الصور</span>
                </TransitionLink>

                <PhotographerCollage
                  slug={slug}
                  projects={projects}
                />

                <motion.h2
                  id={`heading-${slug}`}
                  className={styles.photographerName}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: 1.0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  {meta.label}
                </motion.h2>
              </div>
            </section>
          );
        })}

        {/* Footer section */}
        <section className={`${styles.block} ${styles.footerBlock}`}>
          <div className={styles.footerInner}>
            <motion.p
              className={styles.footerKicker}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              صُمم وطوّر ب ❤️
            </motion.p>
            <motion.h2
              className={styles.footerTitle}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              معرض الأعمال
            </motion.h2>
            <motion.p
              className={styles.footerYear}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              ٢٠٢٦
            </motion.p>

            {/* Page links */}
            <motion.nav
              className={styles.footerNav}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.65, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              aria-label="روابط الصفحات"
            >
              <TransitionLink href="/" className={styles.footerNavLink}>الرئيسية</TransitionLink>
              <span className={styles.footerNavDot} aria-hidden>·</span>
              <TransitionLink href="/the-gallery" className={styles.footerNavLink}>المعرض</TransitionLink>
              <span className={styles.footerNavDot} aria-hidden>·</span>
              <TransitionLink href="/the-gallery?photographer=photographerone" className={styles.footerNavLink}>المصور الأول</TransitionLink>
              <span className={styles.footerNavDot} aria-hidden>·</span>
              <TransitionLink href="/the-gallery?photographer=photographertwo" className={styles.footerNavLink}>المصور الثاني</TransitionLink>
              <span className={styles.footerNavDot} aria-hidden>·</span>
              <TransitionLink href="/photos-on-mood" className={styles.footerNavLink}>الصور على مزاجك</TransitionLink>
            </motion.nav>

            <motion.div
              className={styles.footerImage}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/footerImages/salmeen.png"
                alt=""
                width={120}
                height={120}
                className={styles.footerImg}
              />
            </motion.div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            className={styles.scrollHint}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.3 } }}
            transition={{ delay: 2.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            <span className={styles.scrollHintText}>اسحب تحت يا فنان</span>
            <CaretDoubleDown
              size={16}
              weight="bold"
              className={styles.scrollHintArrow}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
