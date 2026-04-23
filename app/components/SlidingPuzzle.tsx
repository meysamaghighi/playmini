"use client";

import { useCallback, useEffect, useState } from "react";

type Size = 3 | 4;

function solved(size: Size): number[] {
  const arr = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
  arr.push(0);
  return arr;
}

function shuffle(size: Size): number[] {
  const arr = solved(size);
  // Random legal moves for guaranteed solvability
  let emptyIndex = arr.length - 1;
  for (let i = 0; i < size * size * 40; i++) {
    const [er, ec] = [Math.floor(emptyIndex / size), emptyIndex % size];
    const options: number[] = [];
    if (er > 0) options.push(emptyIndex - size);
    if (er < size - 1) options.push(emptyIndex + size);
    if (ec > 0) options.push(emptyIndex - 1);
    if (ec < size - 1) options.push(emptyIndex + 1);
    const swap = options[Math.floor(Math.random() * options.length)];
    [arr[emptyIndex], arr[swap]] = [arr[swap], arr[emptyIndex]];
    emptyIndex = swap;
  }
  return arr;
}

function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[tiles.length - 1] === 0;
}

export default function SlidingPuzzle() {
  const [size, setSize] = useState<Size>(3);
  const [tiles, setTiles] = useState<number[]>(() => shuffle(3));
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState<Record<Size, number | null>>({ 3: null, 4: null });

  const won = isSolved(tiles);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-slidingpuzzle-best");
      if (saved) setBest(JSON.parse(saved));
    } catch {}
  }, []);

  const newGame = useCallback((s: Size = size) => {
    setTiles(shuffle(s));
    setMoves(0);
    setTime(0);
    setRunning(true);
  }, [size]);

  useEffect(() => {
    newGame(size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    if (!running || won) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, won]);

  useEffect(() => {
    if (!won) return;
    setRunning(false);
    setBest((prev) => {
      const existing = prev[size];
      if (existing === null || moves < existing) {
        const next = { ...prev, [size]: moves };
        try {
          localStorage.setItem("pb-slidingpuzzle-best", JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });
  }, [won, size, moves]);

  const tryMove = useCallback(
    (index: number) => {
      if (won) return;
      const emptyIdx = tiles.indexOf(0);
      const [r1, c1] = [Math.floor(index / size), index % size];
      const [r2, c2] = [Math.floor(emptyIdx / size), emptyIdx % size];
      const adj = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
      if (!adj) return;
      const next = tiles.slice();
      [next[index], next[emptyIdx]] = [next[emptyIdx], next[index]];
      setTiles(next);
      setMoves((m) => m + 1);
    },
    [tiles, size, won]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (won) return;
      const emptyIdx = tiles.indexOf(0);
      const [er, ec] = [Math.floor(emptyIdx / size), emptyIdx % size];
      let target: [number, number] | null = null;
      if (e.key === "ArrowUp" && er < size - 1) target = [er + 1, ec];
      else if (e.key === "ArrowDown" && er > 0) target = [er - 1, ec];
      else if (e.key === "ArrowLeft" && ec < size - 1) target = [er, ec + 1];
      else if (e.key === "ArrowRight" && ec > 0) target = [er, ec - 1];
      if (target) {
        e.preventDefault();
        tryMove(target[0] * size + target[1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tiles, size, tryMove, won]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {([3, 4] as Size[]).map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`px-4 py-2 rounded font-bold ${
              size === s ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-200"
            }`}
          >
            {s}×{s}
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
          Best: <span className="font-bold text-emerald-400">{best[size] ?? "—"}</span>
        </div>
        <button
          onClick={() => newGame()}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700"
        >
          Shuffle
        </button>
      </div>

      <div
        className="grid gap-2 bg-gray-800 p-2 rounded-lg"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {tiles.map((v, i) => (
          <button
            key={i}
            onClick={() => tryMove(i)}
            disabled={v === 0}
            className={`w-16 h-16 md:w-20 md:h-20 rounded text-2xl md:text-3xl font-bold ${
              v === 0
                ? "bg-gray-700/50"
                : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-md"
            }`}
          >
            {v !== 0 ? v : ""}
          </button>
        ))}
      </div>

      {won && (
        <div className="bg-gray-900 text-white px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2">Solved!</div>
          <div className="mb-1">
            Moves: <span className="font-bold text-yellow-400">{moves}</span>
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
