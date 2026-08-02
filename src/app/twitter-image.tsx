// X/Twitter reads its own tags and ignores og:image when twitter:image is
// absent for some card types, so point it at the same generated card.
export { default, alt, size, contentType } from "./opengraph-image";
