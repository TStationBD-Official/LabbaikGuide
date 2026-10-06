import { ImageResponse } from "next/og";

export const alt = "Labbaik Guide — Umrah & Hajj";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1511 0%, #0f5c45 100%)",
          color: "#f7f3ea",
        }}
      >
        <div style={{ display: "flex", width: 140, height: 140, border: "6px solid #d6b25e", transform: "rotate(45deg)", marginBottom: 56 }} />
        <div style={{ fontSize: 76, fontWeight: 700 }}>Labbaik Guide</div>
        <div style={{ fontSize: 34, color: "#d6b25e", marginTop: 16 }}>Quran · Zikr · Umrah & Hajj · Prayer Times</div>
      </div>
    ),
    size,
  );
}
