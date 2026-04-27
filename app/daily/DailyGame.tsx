"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "../hooks/useProgress";
import { generateShareCard, shareCard } from "../lib/shareCard";

type DailyEntry = {
  slug: string;
  title: string;
  tagline: string;
};

const POOL: DailyEntry[] = [
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
  { slug: "snake",          title: "Snake",            tagline: "don't bite yourself." },
  { slug: "pong",           title: "Pong",             tagline: "classic paddles." },
  { slug: "asteroids",      title: "Asteroids",        tagline: "shoot before they hit." },
  { slug: "space-invaders", title: "Space Invaders",   tagline: "defend the line." },
  { slug: "pac-man",        title: "Pac-Man",          tagline: "eat all the dots." },
  { slug: "frogger",        title: "Frogger",          tagline: "cross safely." },
  { slug: "bubble-shooter", title: "Bubble Shooter",   tagline: "match three or more." },
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daySeed(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) - hash + dateKey.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function todayPick(dateKey: string): DailyEntry {
  const seed = daySeed(dateKey);
  return POOL[seed % POOL.length];
}

function formatToday(): string {
  const d = new Date();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function DailyGame() {
  const { state, bumpStreak } = useProgress();
  const [hydrated, setHydrated] = useState(false);
  const dateKey = todayKey();
  const pick = todayPick(dateKey);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const playedToday = hydrated && state.streak.lastDate === dateKey;
  const streakCount = hydrated ? state.streak.count : 0;

  const handlePlay = () => {
    // Bump the streak as soon as the user commits to today's daily.
    // The recordPlay in the actual game will write per-game history;
    // streak is independent and tracks consecutive-day engagement.
    bumpStreak();
  };

  const handleShare = async () => {
    const dataUrl = generateShareCard({
      headline: `${streakCount}-day streak`,
      subline: `Today's daily · ${pick.title}`,
    });
    if (!dataUrl) return;
    await shareCard(dataUrl, `playmini-streak-${streakCount}.png`);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 pt-6 pb-12">
      <section
        className="relative overflow-hidden rounded-3xl border border-line p-8 sm:p-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.94 0.06 35) 0%, oklch(0.96 0.04 85) 100%)",
        }}
      >
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">
          Today&apos;s Daily · {formatToday()}
        </p>

        <h1
          className="font-display text-5xl sm:text-7xl text-ink mt-3"
          style={{ fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 0.95 }}
        >
          {pick.title}
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 500 }}>{pick.tagline}</span>
        </h1>

        <p className="text-ink-2 text-base sm:text-lg mt-5 max-w-md">
          Fresh game every day at midnight. Your streak resets if you skip a day.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <Link
            href={`/${pick.slug}`}
            onClick={handlePlay}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-paper transition-opacity hover:opacity-90"
            style={{ background: "var(--ink)", fontSize: 15 }}
          >
            {playedToday ? "Replay today's →" : "Play today's →"}
          </Link>
          <div
            className="px-4 py-3 rounded-full text-sm text-ink-2"
            style={{ background: "rgba(22,20,15,0.06)" }}
          >
            Streak ·{" "}
            <span className="font-bold text-ink">
              {streakCount} {streakCount === 1 ? "day" : "days"}
            </span>
          </div>
          {streakCount >= 1 && (
            <button
              type="button"
              onClick={handleShare}
              className="px-5 py-3 rounded-full text-sm text-ink-2 border border-line hover:bg-paper-2 transition-colors"
            >
              Share streak
            </button>
          )}
        </div>

        {/* decorative grid bottom-right per the canvas */}
        <div
          aria-hidden
          className="hidden sm:block absolute pointer-events-none"
          style={{ right: -40, bottom: -40, width: 240, height: 240, opacity: 0.25 }}
        >
          <svg viewBox="0 0 100 100" width="240" height="240">
            <g fill="none" stroke="var(--ink)" strokeWidth="1.5">
              {Array.from({ length: 5 }).flatMap((_, r) =>
                Array.from({ length: 5 }).map((__, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={c * 18 + 5}
                    y={r * 18 + 5}
                    width="14"
                    height="14"
                    rx="2"
                  />
                ))
              )}
            </g>
          </svg>
        </div>
      </section>

      <section className="mt-10 text-center">
        <p className="text-sm text-ink-3">
          Daily pick is the same for everyone, every day.
        </p>
        <Link
          href="/"
          className="inline-block mt-3 text-sm text-ink-2 hover:text-ink underline"
        >
          Browse all games
        </Link>
      </section>
    </main>
  );
}
