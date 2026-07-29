import type { MetadataRoute } from "next";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "Amazonbot",
  "Meta-ExternalAgent",
  "Bytespider",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    // Nested-route sitemap avoids the known Next.js App Router + GSC bug
    // where /sitemap.xml gets stuck in "Couldn't fetch" status.
    sitemap: "https://playmini.fun/sitemap/sitemap.xml",
  };
}
