import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Illoura — First Nations-Owned Recruitment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logoData = await readFile(join(process.cwd(), "public/logo.png"), "base64");
const logoSrc = `data:image/png;base64,${logoData}`;

export default async function Image() {
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
          background: "#FBF3EC",
        }}
      >
        <div style={{ display: "flex", width: "100%", height: 10, background: "linear-gradient(90deg, #6B2A1D 0%, #C0651F 55%, #D19A2C 100%)" }} />
        <div style={{ display: "flex", flex: 1, width: "100%", alignItems: "center", justifyContent: "center", gap: 56 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={220} height={220} alt="" />
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
            <div style={{ display: "flex", fontSize: 66, fontWeight: 700, color: "#6B2A1D", lineHeight: 1.05 }}>
              Illoura
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 30, fontWeight: 500, color: "#B8894F" }}>
              First Nations-Owned Recruitment
            </div>
            <div style={{ display: "flex", marginTop: 26, fontSize: 22, color: "#8A6F5C" }}>
              Connecting candidates and employers across Australia
            </div>
          </div>
        </div>
        <div style={{ display: "flex", width: "100%", height: 10, background: "linear-gradient(90deg, #D19A2C 0%, #C0651F 45%, #6B2A1D 100%)" }} />
      </div>
    ),
    { ...size }
  );
}
