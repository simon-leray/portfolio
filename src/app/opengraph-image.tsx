import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 128,
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: "#ffffff" }}>SIMON LERAY</span>
          <span style={{ color: "#d0021b" }}>.</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(245,244,240,0.5)",
            marginTop: 48,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Journalist — Biel/Bienne
        </div>
      </div>
    ),
    { ...size }
  );
}
