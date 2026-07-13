import { ImageResponse } from "next/og";

export const alt = "Won Design Studio — Digital Experience Partner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        color: "#000000",
        background: "#ffffff",
        border: "1px solid #000000",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
        <strong>WDS</strong>
        <span>DIGITAL EXPERIENCE PARTNER</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ width: 72, height: 6, background: "#ff5c00" }} />
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.18 }}>
          DESIGN AND DEVELOPMENT,
          <br />
          CONNECTED FOR BUSINESS.
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
        <span>Won Design Studio</span>
        <span>wondesign.studio</span>
      </div>
    </div>,
    size,
  );
}
