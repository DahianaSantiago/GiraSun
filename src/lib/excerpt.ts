// The resumen shown on cards and listings is auto-generated from a post's body.
// We strip Markdown down to plain text and keep the first `EXCERPT_WORDS` words,
// ending in an ellipsis. Kept as a pure function so it can be reused (editor
// preview + save payload) and unit-tested in isolation.

export const EXCERPT_WORDS = 20;

export function deriveExcerpt(markdown: string, maxWords: number = EXCERPT_WORDS): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → their text
    .replace(/<[^>]+>/g, " ") // stray HTML tags
    .replace(/[#>*_`~]/g, " ") // markdown markers
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  const words = text.split(" ").filter(Boolean);
  return `${words.slice(0, maxWords).join(" ")}…`;
}
