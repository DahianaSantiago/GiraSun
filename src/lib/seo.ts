import type { Post } from "./content";

const SITE_URL = "https://girasun.com";

export function postUrl(post: Post): string {
  const segment = post.type === "cuento" ? "cuentos" : "escritos";
  return `${SITE_URL}/${segment}/${post.slug}`;
}

export function postArticleSchema(post: Post): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    inLanguage: "es",
    url: postUrl(post),
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "Dahiana Santiago",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "GiraSun",
      url: SITE_URL,
    },
    image: post.heroSrc ? `${SITE_URL}${post.heroSrc}` : undefined,
    articleSection: post.tag,
    timeRequired: `PT${post.readingMinutes}M`,
  };
}
