"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  caption?: string;
  credit?: string;
}

export function ArticleImage({ image, caption, credit }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!image) return null;

  return (
    <>
      <figure className="my-10">
        <button
          onClick={() => setOpen(true)}
          className="relative w-full aspect-video overflow-hidden bg-ink/5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-red block"
          aria-label="Bild vergrössern"
        >
          <Image
            src={urlFor(image).width(1200).url()}
            alt={caption || ""}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300 flex items-center justify-center">
            <svg
              className="text-paper opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </button>
        {(caption || credit) && (
          <figcaption className="mt-2 text-xs text-ink/50 flex justify-between">
            <span>{caption}</span>
            {credit && <span>Foto: {credit}</span>}
          </figcaption>
        )}
      </figure>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-paper/60 hover:text-paper transition-colors p-2"
            aria-label="Schliessen"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative max-w-5xl w-full mx-12"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urlFor(image).width(1600).url()}
              alt={caption || ""}
              width={1600}
              height={1000}
              className="object-contain w-full"
              style={{ maxHeight: "85vh" }}
            />
            {(caption || credit) && (
              <p className="mt-3 text-sm text-paper/60 text-center">
                {caption}
                {caption && credit ? " — " : ""}
                {credit && `Foto: ${credit}`}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
