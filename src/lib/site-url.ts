/**
 * Canonical origin for every absolute URL the site hands out: metadata,
 * og:image, sitemap, robots, JSON-LD and the links inside the emails.
 *
 * It defaults to the www host, not the apex, because that is the one the
 * deployment actually answers on. girasun.com still carries an AAAA record
 * from the previous host, so IPv6 clients — most phones on mobile data, and
 * the WhatsApp and iMessage link crawlers — never reach Vercel there. That is
 * why link previews arrived with a title but no image: the page loaded from
 * www while og:image pointed at the apex.
 *
 * Once the apex resolves to Vercel on its own, set
 * NEXT_PUBLIC_SITE_URL=https://girasun.com and everything follows without
 * another code change.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.girasun.com").replace(
  /\/+$/,
  "",
);
