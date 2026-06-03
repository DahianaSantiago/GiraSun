import { describe, it, expect } from "vitest";
import { deriveExcerpt, EXCERPT_WORDS } from "../excerpt";

describe("deriveExcerpt", () => {
  it("returns an empty string for empty or whitespace-only input", () => {
    expect(deriveExcerpt("")).toBe("");
    expect(deriveExcerpt("   \n  ")).toBe("");
  });

  it("keeps short text intact and appends an ellipsis", () => {
    expect(deriveExcerpt("Había una vez una casa.")).toBe("Había una vez una casa.…");
  });

  it("crops to the first 20 words and ends in an ellipsis", () => {
    const body = Array.from({ length: 50 }, (_, i) => `palabra${i + 1}`).join(" ");
    const result = deriveExcerpt(body);

    expect(result.endsWith("…")).toBe(true);
    const words = result.replace(/…$/, "").split(" ");
    expect(words).toHaveLength(EXCERPT_WORDS);
    expect(words[0]).toBe("palabra1");
    expect(words[EXCERPT_WORDS - 1]).toBe("palabra20");
    expect(result).not.toContain("palabra21");
  });

  it("respects a custom word count", () => {
    const body = "uno dos tres cuatro cinco";
    expect(deriveExcerpt(body, 3)).toBe("uno dos tres…");
  });

  it("strips Markdown markers, links and images down to plain text", () => {
    const body =
      "# Título\n\n**El viento** sopla por la [ventana](https://x.com) abierta ![foto](/a.png) hoy.";
    const result = deriveExcerpt(body);

    expect(result).toContain("El viento sopla por la ventana abierta");
    expect(result).not.toContain("#");
    expect(result).not.toContain("*");
    expect(result).not.toContain("https://x.com");
    expect(result).not.toContain("/a.png");
  });

  it("collapses whitespace and newlines into single spaces", () => {
    expect(deriveExcerpt("uno\n\n  dos\t tres")).toBe("uno dos tres…");
  });

  it("drops fenced code blocks", () => {
    const body = "Intro real aquí.\n\n```\nconst secret = 42;\n```";
    const result = deriveExcerpt(body);
    expect(result).toContain("Intro real aquí.");
    expect(result).not.toContain("secret");
  });
});
