// Components map for MDX rendering. Each MDX file renders inside .prose,
// so we only need to override the brand-specific elements (numbered H2,
// blockquote with cite, figure with caption, ImageSlot embeds, ornament
// dividers). Plain p, a, ul, ol, h3, h4, etc. inherit the .prose styles.

import type { ComponentProps, ReactNode } from "react";
import { ImageSlot } from "@/components/ImageSlot";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Numbered H2 — pairs a JetBrains Mono ordinal with the section title. */
function Section({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <>
      <h2 id={slugify(title)}>
        <span className="num">{num}</span>
        {title}
      </h2>
      {children}
    </>
  );
}

/** Blockquote with a typographic cite line. */
function Blockquote({ cite, children }: { cite?: string; children: ReactNode }) {
  return (
    <blockquote>
      {children}
      {cite ? <cite>{cite}</cite> : null}
    </blockquote>
  );
}

/** Figure with caption, using ImageSlot for the photo surface. */
function Figure({ src, alt, caption }: { src?: string; alt: string; caption: string }) {
  return (
    <figure>
      <div className="ph">
        <ImageSlot
          src={src}
          alt={alt}
          placeholder={alt}
          style={{ position: "absolute", inset: 0 }}
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** Decorative full-width separator with the ✿ glyph. */
function Ornament() {
  return <div className="divider-ornament">✿</div>;
}

/** Re-export of ImageSlot for one-off uses inside MDX. */
function MDXImage(props: ComponentProps<typeof ImageSlot>) {
  return <ImageSlot {...props} />;
}

export const mdxComponents = {
  Section,
  Blockquote,
  Figure,
  Ornament,
  ImageSlot: MDXImage,
};
