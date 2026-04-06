import type { MetadataRoute } from "next";

const BASE = "https://playmini.fun";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE, lastModified: now, priority: 1.0 },
    { url: `${BASE}/2048`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/snake`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/minesweeper`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/memory`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/whack-a-mole`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/tic-tac-toe`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/flappy`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/block-drop`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/wordle`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/dino-runner`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/sudoku`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/voxel`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/car-racer`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/tower-builder`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/soccer`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/table-tennis`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/music-trivia`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/connect4`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/hangman`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/crossword`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/checkers`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/breakout`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/typing-race`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/word-search`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/maze`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/space-invaders`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/bubble-shooter`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/simon`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/sliding-puzzle`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/solitaire`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/word-builder`, lastModified: now, priority: 0.9 },
    { url: "https://random.playmini.fun", lastModified: now, priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, priority: 0.3 },
  ];
}
