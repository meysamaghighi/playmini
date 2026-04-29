"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "../hooks/useProgress";
import { todayKey, todayPick, formatDate, luckyPicks } from "../lib/dailyGame";
import { GAMES } from "../lib/games";

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HomeHero() {
  const { state } = useProgress();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  const dateKey = todayKey();
  const pick = todayPick(dateKey);
  const lucky = luckyPicks(dateKey, pick.slug, 3);
  const streakCount = hydrated ? state.streak.count : 0;
  const playedToday = hydrated && state.streak.lastDate === dateKey;

  const lastGameSlug = hydrated ? state.lastPlayedGame : null;
  const lastGameData = lastGameSlug ? GAMES.find((g) => g.slug === lastGameSlug) : null;
  const lastGameEntry = lastGameSlug ? state.history[lastGameSlug] : null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3 mb-6">
      {/* Daily hero card */}
      <Link
        href="/daily"
        className="relative overflow-hidden rounded-2xl p-7 sm:p-9 block group"
        style={{
          background: "linear-gradient(135deg, oklch(0.94 0.06 35) 0%, oklch(0.96 0.04 75) 100%)",
        }}
      >
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">
          Today&apos;s Daily · {formatDate(dateKey)}
        </p>

        <h2
          className="font-display text-4xl sm:text-5xl text-ink mt-3 leading-none"
          style={{ fontWeight: 900, letterSpacing: "-0.02em" }}
        >
          {pick.title}
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 500 }}>{pick.tagline}</span>
        </h2>

        <p className="text-ink-2 text-sm mt-4 max-w-xs">
          Fresh game every day at midnight. Your streak resets if you skip a day.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-opacity group-hover:opacity-90"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            {playedToday ? "Replay today's →" : "Play today's →"}
          </span>
          {hydrated && (
            <span
              className="px-4 py-2.5 rounded-full text-sm text-ink-2"
              style={{ background: "rgba(22,20,15,0.08)" }}
            >
              {streakCount > 0 ? (
                <>🔥 <span className="font-bold text-ink">{streakCount} day streak</span></>
              ) : (
                "Start your streak"
              )}
            </span>
          )}
        </div>

        {/* Decorative grid */}
        <div
          aria-hidden
          className="absolute pointer-events-none bottom-0 right-0 opacity-20"
          style={{ width: 160, height: 160 }}
        >
          <svg viewBox="0 0 80 80" width="160" height="160">
            <g fill="none" stroke="var(--ink)" strokeWidth="1.5">
              {Array.from({ length: 4 }).flatMap((_, r) =>
                Array.from({ length: 4 }).map((__, c) => (
                  <rect key={`${r}-${c}`} x={c * 18 + 4} y={r * 18 + 4} width="13" height="13" rx="2" />
                ))
              )}
            </g>
          </svg>
        </div>
      </Link>

      {/* Right column */}
      <div className="flex flex-col gap-3">
        {/* Continue card */}
        {hydrated && lastGameData && lastGameEntry ? (
          <div
            className="rounded-2xl p-5 border border-line flex flex-col gap-3"
            style={{ background: "var(--paper)" }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3">Continue</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--paper-2)" }}
              >
                <div className="w-7 h-7">{lastGameData.icon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink text-sm leading-tight">{lastGameData.title}</p>
                <p className="text-xs text-ink-3 truncate">
                  Best · {lastGameEntry.best}
                  {lastGameEntry.lastPlayedAt
                    ? ` · ${timeAgo(lastGameEntry.lastPlayedAt)}`
                    : ""}
                </p>
              </div>
              <Link
                href={`/${lastGameData.slug}`}
                className="px-4 py-2 rounded-full text-sm font-bold flex-shrink-0"
                style={{ background: "var(--ink)", color: "var(--paper)" }}
              >
                Resume
              </Link>
            </div>
          </div>
        ) : hydrated ? null : (
          <div
            className="rounded-2xl p-5 border border-line animate-pulse"
            style={{ background: "var(--paper)", minHeight: 88 }}
          />
        )}

        {/* Feeling Lucky */}
        <div
          className="rounded-2xl p-5 border border-line flex flex-col gap-4 flex-1"
          style={{ background: "var(--paper)" }}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3">Feeling Lucky</p>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-ink-3">
              <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex gap-2">
            {lucky.map((g) => {
              const gameData = GAMES.find((gd) => gd.slug === g.slug);
              return (
                <Link
                  key={g.slug}
                  href={`/${g.slug}`}
                  className="flex-1 rounded-xl p-3 flex flex-col items-center gap-1.5 border border-line hover:border-ink-3 transition-colors"
                  style={{ background: "var(--paper-2)" }}
                  title={g.title}
                >
                  <div className="w-8 h-8">{gameData?.icon}</div>
                  <span className="text-[10px] text-ink-2 font-medium text-center leading-tight line-clamp-1">{g.title}</span>
                </Link>
              );
            })}
          </div>
          <Link
            href="/random-game"
            className="w-full text-center text-sm text-ink-2 hover:text-ink transition-colors py-1.5 rounded-xl border border-line hover:border-ink-3"
            style={{ background: "var(--paper-2)" }}
          >
            Surprise me with any game →
          </Link>
        </div>
      </div>
    </section>
  );
}
