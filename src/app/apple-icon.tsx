// Home-screen / share-sheet icon for iOS (rel="apple-touch-icon"). Safari shows
// this next to the title and domain when you tap Compartir, and it's what sticks
// to the home screen if someone saves the site — icon.tsx (the 32px gold dot)
// is only legible as a browser tab favicon.
//
// The artwork is the sunflower photo already in the repo, cropped to the flower
// head so it still reads at ~60px.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// girasol.jpg is 736×1308. Scaled to the icon width (180) it becomes 180×320,
// and these offsets slide the flower head into the middle of the square.
const PHOTO = { width: 180, height: 320, left: -13, top: -42 };

export default async function AppleIcon() {
  const photo = await readFile(join(process.cwd(), "public/images/girasol.jpg"), "base64");

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#fbf6e8",
      }}
    >
      {/* Plain <img>: ImageResponse renders through satori, which has no
          next/image runtime. */}
      <img
        src={`data:image/jpeg;base64,${photo}`}
        alt=""
        width={PHOTO.width}
        height={PHOTO.height}
        style={{ position: "absolute", left: PHOTO.left, top: PHOTO.top }}
      />
    </div>,
    { ...size },
  );
}
