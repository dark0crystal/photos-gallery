import type { PhotoMood, Project } from "@/lib/gallery-projects";

export type { PhotoMood } from "@/lib/gallery-projects";

export const PHOTO_MOODS: PhotoMood[] = ["raiq", "hamas", "sakhob"];

export const PHOTO_MOOD_LABEL: Record<PhotoMood, string> = {
  raiq: "رايق",
  hamas: "حماس",
  sakhob: "صخب",
};

export function filterProjectsByMood(
  projects: Project[],
  mood: PhotoMood | null
): Project[] {
  if (!mood) return projects;
  return projects.filter((p) => p.mood === mood);
}
