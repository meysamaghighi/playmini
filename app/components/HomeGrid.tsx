"use client";

import Link from "next/link";
import { useState } from "react";
import { GAMES, FILTER_TAGS, CURATED_ROWS, type FilterTag, type Game } from "../lib/games";

const ALL_GAMES_PREVIEW = 12;

function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/${game.slug}`}
      className="group rounded-xl p-3 border border-line hover:border-ink-3 transition-all flex flex-col items-center gap-2"
      style={{ background: "var(--paper-2)" }}
    >
      <div className="w-11 h-11">{game.icon}</div>
      <div className="text-center w-full">
        <p className="text-sm font-bold text-ink leading-tight">{game.title}</p>
        <p className="text-xs text-ink-2 hidden sm:block mt-0.5 line-clamp-1">{game.description}</p>
      </div>
    </Link>
  );
}

function CuratedRow({ id, label }: { id: string; label: string }) {
  const games = GAMES.filter((g) => g.curated?.includes(id as "classics" | "reflexes"));
  if (games.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-xl font-bold text-ink" style={{ letterSpacing: "-0.01em" }}>
          {label}
        </h2>
        <span className="text-xs text-ink-3">{games.length} games</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}

export default function HomeGrid() {
  const [active, setActive] = useState<FilterTag | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = active ? GAMES.filter((g) => g.tags.includes(active)) : GAMES;

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => setActive(null)}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
          style={
            active === null
              ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" }
              : { background: "var(--paper)", color: "var(--ink-2)", borderColor: "var(--line)" }
          }
        >
          All
        </button>
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActive(tag === active ? null : tag)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
            style={
              active === tag
                ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" }
                : { background: "var(--paper)", color: "var(--ink-2)", borderColor: "var(--line)" }
            }
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Curated rows (only when no filter active) */}
      {active === null && CURATED_ROWS.map((row) => (
        <CuratedRow key={row.id} id={row.id} label={row.label} />
      ))}

      {/* All games or filtered results */}
      {active === null ? (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-xl font-bold text-ink" style={{ letterSpacing: "-0.01em" }}>
              All games
            </h2>
            <span className="text-xs text-ink-3">{GAMES.length} games</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(showAll ? GAMES : GAMES.slice(0, ALL_GAMES_PREVIEW)).map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
          {!showAll && GAMES.length > ALL_GAMES_PREVIEW && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium border border-line hover:border-ink-3 transition-colors"
              style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}
            >
              Show all {GAMES.length} games →
            </button>
          )}
        </section>
      ) : (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-xl font-bold text-ink" style={{ letterSpacing: "-0.01em" }}>
              {active}
            </h2>
            <span className="text-xs text-ink-3">{filtered.length} games</span>
          </div>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {filtered.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          ) : (
            <p className="text-ink-3 text-sm">No games match this filter.</p>
          )}
        </section>
      )}
    </div>
  );
}
