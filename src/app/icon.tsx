import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 900,
          letterSpacing: "-0.02em",
        }}
      >
        <span style={{ color: "#ffffff" }}>SL</span>
        <span style={{ color: "#ae0c00" }}>.</span>
      </div>
    ),
    { ...size }
  );
}
