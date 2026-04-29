export type DailyEntry = {
  slug: string;
  title: string;
  tagline: string;
};

export const DAILY_POOL: DailyEntry[] = [
  { slug: "snake",          title: "Snake",            tagline: "one bite at a time." },
  { slug: "2048",           title: "2048",             tagline: "merge until it hurts." },
  { slug: "wordle",         title: "Word Guess",       tagline: "in six tries." },
  { slug: "minesweeper",    title: "Minesweeper",      tagline: "trust nothing." },
  { slug: "sudoku",         title: "Sudoku",           tagline: "fill the grid." },
  { slug: "tic-tac-toe",    title: "Tic-Tac-Toe",      tagline: "three in a row." },
  { slug: "memory",         title: "Memory Match",     tagline: "remember the cards." },
  { slug: "flappy",         title: "Flappy Bird",      tagline: "tap to flap." },
  { slug: "breakout",       title: "Breakout",         tagline: "smash every brick." },
  { slug: "block-drop",     title: "Block Drop",       tagline: "stack the lines." },
  { slug: "simon",          title: "Simon Says",       tagline: "repeat the colors." },
  { slug: "connect4",       title: "Connect 4",        tagline: "four in a line." },
  { slug: "hangman",        title: "Hangman",          tagline: "guess the word." },
  { slug: "word-search",    title: "Word Search",      tagline: "find them all." },
  { slug: "word-builder",   title: "Word Builder",     tagline: "from one word, many." },
  { slug: "crossword",      title: "Crossword",        tagline: "fill in the clues." },
  { slug: "sliding-puzzle", title: "Sliding Puzzle",   tagline: "from chaos to order." },
  { slug: "maze",           title: "Maze Runner",      tagline: "find the way out." },
  { slug: "pong",           title: "Pong",             tagline: "classic paddles." },
  { slug: "asteroids",      title: "Asteroids",        tagline: "shoot before they hit." },
  { slug: "space-invaders", title: "Space Invaders",   tagline: "defend the line." },
  { slug: "pac-man",        title: "Pac-Man",          tagline: "eat all the dots." },
  { slug: "frogger",        title: "Frogger",          tagline: "cross safely." },
  { slug: "bubble-shooter", title: "Bubble Shooter",   tagline: "match three or more." },
  { slug: "whack-a-mole",   title: "Whack-a-Mole",    tagline: "be the fastest." },
];

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daySeed(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) - hash + dateKey.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function todayPick(dateKey: string): DailyEntry {
  const seed = daySeed(dateKey);
  return DAILY_POOL[seed % DAILY_POOL.length];
}

export function formatDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${day} ${months[month - 1]}`;
}

export function luckyPicks(dateKey: string, dailySlug: string, count = 3): DailyEntry[] {
  const seed = daySeed(dateKey + "lucky");
  const pool = DAILY_POOL.filter((g) => g.slug !== dailySlug);
  const picks: DailyEntry[] = [];
  for (let i = 0; i < count; i++) {
    picks.push(pool[(seed + i * 7) % pool.length]);
  }
  return picks;
}
