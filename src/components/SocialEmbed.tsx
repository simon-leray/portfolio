"use client";

import { useEffect, useRef } from "react";

const PLATFORM_SCRIPTS: Record<string, string> = {
  twitter: "https://platform.twitter.com/widgets.js",
  instagram: "https://www.instagram.com/embed.js",
  facebook: "https://connect.facebook.net/de_DE/sdk.js#xfbml=1&version=v18.0",
};

// Extend window with optional social platform APIs
declare global {
  interface Window {
    twttr?: { widgets: { load: (el: HTMLElement) => void } };
    instgrm?: { Embeds: { process: () => void } };
    FB?: { XFBML: { parse: (el: HTMLElement) => void } };
  }
}

interface Props {
  platform: "twitter" | "instagram" | "facebook";
  embedCode: string;
}

export function SocialEmbed({ platform, embedCode }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !embedCode) return;

    // Re-inject the HTML so scripts inside blockquotes activate
    ref.current.innerHTML = embedCode;

    const scriptSrc = PLATFORM_SCRIPTS[platform];
    if (!scriptSrc) return;

    // Only inject the platform script once per page load
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existingScript) {
      // Script already present — trigger re-processing via platform APIs
      if (platform === "twitter" && window.twttr?.widgets) {
        window.twttr.widgets.load(ref.current);
      } else if (platform === "instagram" && window.instgrm?.Embeds) {
        window.instgrm.Embeds.process();
      } else if (platform === "facebook" && window.FB?.XFBML) {
        window.FB.XFBML.parse(ref.current);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [embedCode, platform]);

  if (!embedCode) {
    return (
      <div className="my-8 border border-ink/10 p-6 text-ink/40 text-sm text-center">
        Kein Einbettungscode vorhanden.
      </div>
    );
  }

  const platformLabels: Record<string, string> = {
    twitter: "Twitter / X",
    instagram: "Instagram",
    facebook: "Facebook",
  };

  return (
    <div className="my-8">
      <div className="text-xs tracking-widest uppercase text-ink/30 mb-3">
        {platformLabels[platform] ?? platform}
      </div>
      <div
        ref={ref}
        className="flex justify-center [&_iframe]:max-w-full"
      />
    </div>
  );
}
