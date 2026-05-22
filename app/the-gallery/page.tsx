import { Suspense } from "react";
import TheGalleryClient from "./TheGalleryClient";

export default function TheGalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f3eb]" aria-hidden />}>
      <TheGalleryClient />
    </Suspense>
  );
}
