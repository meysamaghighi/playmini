import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // Nested-route sitemap avoids the known Next.js App Router + GSC bug
    // where /sitemap.xml gets stuck in "Couldn't fetch" status.
    sitemap: "https://playmini.fun/sitemap/sitemap.xml",
  };
}
