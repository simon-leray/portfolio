"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { GalleryImage } from "@/lib/types";

interface Props {
  images: GalleryImage[];
}

export function ImageGallery({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null)),
    [images.length]
  );

  const next = useCallback(() =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null)),
    [images.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, close, prev, next]);

  if (!images?.length) return null;

  const cols = images.length === 1 ? 1 : images.length === 2 ? 2 : 3;

  return (
    <>
      <figure className="my-10">
        <div
          className={`grid gap-1 ${
            cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
          }`}
        >
          {images.map((img, i) => (
            <button
              key={img._key ?? i}
              onClick={() => setLightboxIndex(i)}
              className="relative aspect-square overflow-hidden bg-ink/5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-red"
              aria-label={img.alt || `Bild ${i + 1} öffnen`}
            >
              <Image
                src={urlFor(img).width(600).height(600).url()}
                alt={img.alt || ""}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300 flex items-center justify-center">
                <svg
                  className="text-paper opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <figcaption className="mt-2 text-xs text-ink/40 text-right">
            {images.length} Bilder — klicken zum Vergrössern
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-paper/60 hover:text-paper transition-colors p-2"
            aria-label="Schliessen"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/60 hover:text-paper transition-colors p-2"
              aria-label="Vorheriges Bild"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ maxHeight: "80vh" }}>
              <Image
                src={urlFor(images[lightboxIndex]).width(1600).url()}
                alt={images[lightboxIndex].alt || ""}
                width={1600}
                height={1000}
                className="object-contain w-full"
                style={{ maxHeight: "80vh" }}
              />
            </div>
            {images[lightboxIndex].caption && (
              <p className="mt-3 text-sm text-paper/60 text-center">
                {images[lightboxIndex].caption}
              </p>
            )}
            {images.length > 1 && (
              <p className="mt-1 text-xs text-paper/30 text-center">
                {lightboxIndex + 1} / {images.length}
              </p>
            )}
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-paper/60 hover:text-paper transition-colors p-2"
              aria-label="Nächstes Bild"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
