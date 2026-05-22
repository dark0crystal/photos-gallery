import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المعرض",
  description: "معرض أعمال المصورين",
};

export default function TheGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
