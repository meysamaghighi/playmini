import type { MetadataRoute } from "next";

const BASE = "https://playmini.fun";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE, lastModified: now, priority: 1.0 },
    { url: `${BASE}/2048`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/snake`, lastModified: now, priority: 0.9 },
  ];
}
