"use client";

import { useCallback, useEffect, useState } from "react";

type Difficulty = "easy" | "medium" | "hard";
type Card = { id: number; emoji: string; revealed: boolean; matched: boolean };

const EMOJIS = [
  "🎮","🎲","🎯","🎨","🎭","🎪","🎸","🎹","🎺","🎻","🎤","🎧",
  "🚀","🛸","⚡","🔥","💎","🌟","🍀","🦄","🐉","🦊","🐼","🐸",
];

const CONFIGS: Record<Difficulty, { pairs: number; cols: number }> = {
  easy: { pairs: 6, cols: 4 },
  medium: { pairs: 10, cols: 5 },
  hard: { pairs: 15, cols: 6 },
};

function makeDeck(pairs: number): Card[] {
  const picked = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, pairs);
  const cards: Card[] = [];
  for (let i = 0; i < pairs; i++) {
    cards.push({ id: i * 2, emoji: picked[i], revealed: false, matched: false });
    cards.push({ id: i * 2 + 1, emoji: picked[i], revealed: false, matched: false });
  }
  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryMatch() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });

  const won = cards.length > 0 && cards.every((c) => c.matched);

  const newGame = useCallback((d: Difficulty = difficulty) => {
    setCards(makeDeck(CONFIGS[d].pairs));
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setRunning(true);
  }, [difficulty]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-memorymatch-best");
      if (saved) setBest(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    newGame(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    if (!running || won) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, won]);

  useEffect(() => {
    if (!won) return;
    setRunning(false);
    setBest((prev) => {
      const existing = prev[difficulty];
      if (existing === null || moves < existing) {
        const next = { ...prev, [difficulty]: moves };
        try {
          localStorage.setItem("pb-memorymatch-best", JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });
  }, [won, difficulty, moves]);

  const onClick = (id: number) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.revealed || card.matched) return;
    if (flipped.length === 2) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, revealed: true } : c));
    const newFlipped = [...flipped, id];
    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped.map((i) => newCards.find((c) => c.id === i)!);
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a.id || c.id === b.id ? { ...c, matched: true } : c
            )
          );
          setFlipped([]);
        }, 350);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a.id || c.id === b.id ? { ...c, revealed: false } : c
            )
          );
          setFlipped([]);
        }, 800);
      }
    }
  };

  const cfg = CONFIGS[difficulty];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(Object.keys(CONFIGS) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded font-bold capitalize ${
              difficulty === d ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-200"
            }`}
          >
            {d} ({CONFIGS[d].pairs} pairs)
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 text-white">
        <div>
          Moves: <span className="font-bold">{moves}</span>
        </div>
        <div>
          Time: <span className="font-bold text-yellow-400">{time}s</span>
        </div>
        <div>
          Best: <span className="font-bold text-emerald-400">{best[difficulty] ?? "—"}</span>
        </div>
        <button
          onClick={() => newGame()}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700"
        >
          New
        </button>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onClick(card.id)}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-lg text-3xl md:text-4xl font-bold flex items-center justify-center transition-transform ${
              card.matched
                ? "bg-emerald-500 scale-95"
                : card.revealed
                ? "bg-indigo-400"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            disabled={card.revealed || card.matched}
          >
            {card.revealed || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>

      {won && (
        <div className="bg-gray-900 text-white px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2">You won!</div>
          <div className="mb-1">
            Moves: <span className="text-yellow-400 font-bold">{moves}</span>
          </div>
          <div className="mb-3">Time: {time}s</div>
          <button
            onClick={() => newGame()}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
