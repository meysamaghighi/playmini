import type { MetadataRoute } from "next";

const BASE = "https://playmini.fun";

// Stable lastmod values. Google treats volatile/inaccurate lastmod as a
// negative signal — bump when the page's content materially changes.
const SITE_LAST_MODIFIED = "2026-04-18";
const GAMES_LAST_MODIFIED = "2026-04-15";

const games = [
  "2048", "snake", "minesweeper", "memory", "whack-a-mole",
  "tic-tac-toe", "flappy", "block-drop", "wordle", "dino-runner",
  "sudoku", "voxel", "car-racer", "tower-builder", "soccer",
  "table-tennis", "music-trivia", "connect4", "hangman", "crossword",
  "checkers", "breakout", "typing-race", "word-search", "maze",
  "space-invaders", "bubble-shooter", "simon", "sliding-puzzle",
  "solitaire", "word-builder", "asteroids", "chess", "frogger",
  "pac-man", "reversi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: SITE_LAST_MODIFIED, priority: 1.0, changeFrequency: "weekly" },
    ...games.map((slug) => ({
      url: `${BASE}/${slug}`,
      lastModified: GAMES_LAST_MODIFIED,
      priority: 0.9,
      changeFrequency: "monthly" as const,
    })),
    { url: `${BASE}/about`, lastModified: SITE_LAST_MODIFIED, priority: 0.3, changeFrequency: "yearly" },
  ];
}
