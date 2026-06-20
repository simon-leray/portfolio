"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { GalleryImage } from "@/lib/types";

interface Props {
  images: GalleryImage[];
}

export function ImageGallery({ images }: Props) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (!images?.length) return null;

  const img = images[current];

  return (
    <figure className="my-10">
      {/* Slide area — all images stacked, fade transition */}
      <div className="relative w-full aspect-[4/3] bg-ink overflow-hidden">
        {images.map((image, i) => (
          <div
            key={image._key ?? i}
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? "auto" : "none",
            }}
          >
            <Image
              src={urlFor(image).width(1200).url()}
              alt={image.alt ?? ""}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Prev / Next — only with multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-ink/70 hover:bg-ink text-paper p-2.5 transition-colors"
              aria-label="Vorheriges Bild"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-ink/70 hover:bg-ink text-paper p-2.5 transition-colors"
              aria-label="Nächstes Bild"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Caption / credit — always present to avoid layout shifts */}
      <div className="mt-2 flex items-start gap-4 text-xs text-ink/50 min-h-[1.25rem]">
        <span className="flex-1 min-w-0">{img.caption}</span>
        {img.credit && (
          <span className="flex-shrink-0" style={{ whiteSpace: "nowrap" }}>
            Foto: {img.credit}
          </span>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Bild ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i === current ? "bg-ink" : "bg-ink/20"
              }`}
            />
          ))}
        </div>
      )}
    </figure>
  );
}
