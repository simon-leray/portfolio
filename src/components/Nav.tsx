"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/texte", label: "Texte" },
  { href: "/ueber-mich", label: "Bio" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Don't show nav in studio
  if (pathname.startsWith("/studio")) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 text-paper">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity"
          style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "2rem", letterSpacing: "0.05em" }}
        >
          LERAY<span className="text-red" style={{ position: "relative", mixBlendMode: "difference" }}>.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm tracking-widest uppercase transition-colors hover:text-red ${isActive ? "text-red" : "text-paper"}`}
                style={isActive ? { position: "relative", mixBlendMode: "difference" } : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          <span
            className={`block w-6 h-0.5 bg-paper transition-transform duration-200 ${open ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-paper transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-paper transition-transform duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-ink border-t border-paper/10 px-6 py-6 flex flex-col gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xl tracking-widest uppercase hover:text-red transition-colors"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
