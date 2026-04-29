"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "../hooks/useProgress";
import { generateShareCard, shareCard } from "../lib/shareCard";
import { todayKey, todayPick, formatDate } from "../lib/dailyGame";

export default function DailyGame() {
  const { state, bumpStreak } = useProgress();
  const [hydrated, setHydrated] = useState(false);
  const dateKey = todayKey();
  const pick = todayPick(dateKey);

  useEffect(() => { setHydrated(true); }, []);

  const playedToday = hydrated && state.streak.lastDate === dateKey;
  const streakCount = hydrated ? state.streak.count : 0;

  const handlePlay = () => {
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
          background: "linear-gradient(135deg, oklch(0.94 0.06 35) 0%, oklch(0.96 0.04 85) 100%)",
        }}
      >
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">
          Today&apos;s Daily · {formatDate(dateKey)}
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

        <div
          aria-hidden
          className="hidden sm:block absolute pointer-events-none"
          style={{ right: -40, bottom: -40, width: 240, height: 240, opacity: 0.25 }}
        >
          <svg viewBox="0 0 100 100" width="240" height="240">
            <g fill="none" stroke="var(--ink)" strokeWidth="1.5">
              {Array.from({ length: 5 }).flatMap((_, r) =>
                Array.from({ length: 5 }).map((__, c) => (
                  <rect key={`${r}-${c}`} x={c * 18 + 5} y={r * 18 + 5} width="14" height="14" rx="2" />
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
        <Link href="/" className="inline-block mt-3 text-sm text-ink-2 hover:text-ink underline">
          Browse all games
        </Link>
      </section>
    </main>
  );
}
