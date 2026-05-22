import { notFound } from "next/navigation";
import { getProjectBySlug, PHOTOGRAPHERS, allProjects } from "@/lib/gallery-projects";
import PhotoDetailClient from "./PhotoDetailClient";

export function generateStaticParams() {
  return allProjects.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProjectBySlug(id);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectBySlug(id);
  if (!project) notFound();

  const photographer = PHOTOGRAPHERS[project.photographerId];

  return (
    <PhotoDetailClient
      src={project.src}
      width={project.width}
      height={project.height}
      title={project.title}
      photographerLabel={photographer.label}
      description={project.description}
      backHref="/"
    />
  );
}
