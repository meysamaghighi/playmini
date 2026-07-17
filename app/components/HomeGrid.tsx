import Link from "next/link";
import { GAMES, CATEGORIES, type Game } from "../lib/games";

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

function CategorySection({ category }: { category: string }) {
  const games = GAMES.filter((g) => g.category === category);
  if (games.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-xl font-bold text-ink" style={{ letterSpacing: "-0.01em" }}>
          {category}
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
  return (
    <div>
      {CATEGORIES.map((category) => (
        <CategorySection key={category} category={category} />
      ))}
    </div>
  );
}
