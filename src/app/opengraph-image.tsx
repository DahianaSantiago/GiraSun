// The card apps show when someone shares girasun.com — WhatsApp, iMessage,
// Telegram, X, Facebook, Slack. Without an og:image the link renders as a bare
// line of text; with it, the sunflower and the wordmark travel with the link.
//
// twitter-image.tsx re-exports this module so both previews stay identical.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "GiraSun — diario literario de Dahiana Santiago";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const linen = "#fbf6e8";
const ink = "#322c20";
const inkSoft = "#615a4a";
const accent = "#dba94a";

export default async function OpengraphImage() {
  // Paths stay inline and literal: routed through a helper, the bundler can't
  // trace them statically and ends up tracing the whole project into the build.
  const [photo, cormorant, cormorantItalic] = await Promise.all([
    readFile(join(process.cwd(), "public/images/girasol.jpg"), "base64"),
    readFile(join(process.cwd(), "public/fonts/CormorantGaramond-Medium.ttf")),
    readFile(join(process.cwd(), "public/fonts/CormorantGaramond-MediumItalic.ttf")),
  ]);

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: linen }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 740,
          padding: "0 64px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: inkSoft,
            marginBottom: 28,
          }}
        >
          Diario literario
        </div>

        <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 132, color: ink }}>
          <span>Gira</span>
          <span style={{ fontFamily: "Cormorant Italic", fontStyle: "italic", color: accent }}>
            Sun
          </span>
        </div>

        <div
          style={{
            fontFamily: "Cormorant Italic",
            fontStyle: "italic",
            fontSize: 40,
            lineHeight: 1.35,
            color: inkSoft,
            margin: "18px 0 40px",
          }}
        >
          Cuentos, escritos, club de lectura y CineClub.
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: accent }}
          />
          <div style={{ fontSize: 24, letterSpacing: 3, color: inkSoft, marginLeft: 14 }}>
            girasun.com
          </div>
        </div>
      </div>

      {/* Photo panel. 736×1308 scaled to 560 wide is 995 tall; the offsets crop
          it into the 460×630 panel with the flower head near the middle. */}
      <div style={{ display: "flex", position: "relative", width: 460, overflow: "hidden" }}>
        {/* Plain <img>: ImageResponse renders through satori, which has no
            next/image runtime. */}
        <img
          src={`data:image/jpeg;base64,${photo}`}
          alt=""
          width={560}
          height={995}
          style={{ position: "absolute", top: -141, left: -60 }}
        />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: cormorant, style: "normal", weight: 500 },
        { name: "Cormorant Italic", data: cormorantItalic, style: "italic", weight: 500 },
      ],
    },
  );
}
