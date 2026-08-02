// Home-screen / share-sheet icon for iOS (rel="apple-touch-icon"). Safari shows
// this next to the title and domain when you tap Compartir, and it's what sticks
// to the home screen if someone saves the site — icon.tsx (the 32px gold dot)
// is only legible as a browser tab favicon.
//
// The artwork is the brand photo (marca-lectora.jpg), already square, so it maps
// straight onto the 180px tile with no cropping.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const photo = await readFile(join(process.cwd(), "public/images/marca-lectora.jpg"), "base64");

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#1c1a17",
      }}
    >
      {/* Plain <img>: ImageResponse renders through satori, which has no
          next/image runtime. */}
      <img src={`data:image/jpeg;base64,${photo}`} alt="" width={180} height={180} />
    </div>,
    { ...size },
  );
}
