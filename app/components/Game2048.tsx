"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const SIZE = 4;
type Board = number[][];
type Dir = "up" | "down" | "left" | "right";

const TILE_COLORS: Record<number, string> = {
  0: "bg-gray-700/40",
  2: "bg-gray-200 text-gray-800",
  4: "bg-yellow-100 text-gray-800",
  8: "bg-orange-300 text-white",
  16: "bg-orange-400 text-white",
  32: "bg-orange-500 text-white",
  64: "bg-red-500 text-white",
  128: "bg-yellow-400 text-white",
  256: "bg-yellow-500 text-white",
  512: "bg-yellow-600 text-white",
  1024: "bg-amber-600 text-white",
  2048: "bg-amber-500 text-white ring-4 ring-yellow-300",
};

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
}

function emptyCells(b: Board): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (b[r][c] === 0) out.push([r, c]);
  return out;
}

function addRandomTile(b: Board): Board {
  const empties = emptyCells(b);
  if (!empties.length) return b;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const next = b.map((row) => row.slice());
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function rotate(b: Board): Board {
  const n = b.length;
  const out = emptyBoard();
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) out[c][n - 1 - r] = b[r][c];
  return out;
}

function slideLeft(b: Board): { board: Board; gained: number; moved: boolean } {
  let gained = 0;
  let moved = false;
  const next = b.map((row) => {
    const filtered = row.filter((v) => v !== 0);
    const merged: number[] = [];
    for (let i = 0; i < filtered.length; i++) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        merged.push(filtered[i] * 2);
        gained += filtered[i] * 2;
        i++;
      } else {
        merged.push(filtered[i]);
      }
    }
    while (merged.length < SIZE) merged.push(0);
    if (!moved && merged.some((v, idx) => v !== row[idx])) moved = true;
    return merged;
  });
  return { board: next, gained, moved };
}

function move(b: Board, dir: Dir): { board: Board; gained: number; moved: boolean } {
  let working = b;
  let rotations = 0;
  if (dir === "up") {
    working = rotate(rotate(rotate(working)));
    rotations = 3;
  } else if (dir === "right") {
    working = rotate(rotate(working));
    rotations = 2;
  } else if (dir === "down") {
    working = rotate(working);
    rotations = 1;
  }
  const { board: slid, gained, moved } = slideLeft(working);
  let result = slid;
  for (let i = 0; i < (4 - rotations) % 4; i++) result = rotate(result);
  return { board: result, gained, moved };
}

function canMove(b: Board): boolean {
  if (emptyCells(b).length) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (c + 1 < SIZE && b[r][c] === b[r][c + 1]) return true;
      if (r + 1 < SIZE && b[r][c] === b[r + 1][c]) return true;
    }
  }
  return false;
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const prevRef = useRef<{ board: Board; score: number } | null>(null);
  const startTouchRef = useRef<{ x: number; y: number } | null>(null);

  const newGame = useCallback(() => {
    let b = emptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setHasWon(false);
    prevRef.current = null;
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-2048-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
    newGame();
  }, [newGame]);

  const tryMove = useCallback(
    (dir: Dir) => {
      if (gameOver) return;
      const { board: next, gained, moved } = move(board, dir);
      if (!moved) return;
      prevRef.current = { board, score };
      const withTile = addRandomTile(next);
      const newScore = score + gained;
      setBoard(withTile);
      setScore(newScore);
      if (newScore > best) {
        setBest(newScore);
        try {
          localStorage.setItem("pb-2048-best", String(newScore));
        } catch {}
      }
      if (!hasWon && withTile.some((row) => row.some((v) => v >= 2048))) {
        setHasWon(true);
      }
      if (!canMove(withTile)) setGameOver(true);
    },
    [board, score, best, hasWon, gameOver]
  );

  const undo = () => {
    if (!prevRef.current) return;
    setBoard(prevRef.current.board);
    setScore(prevRef.current.score);
    setGameOver(false);
    prevRef.current = null;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };
      const dir = map[e.key] || map[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault();
      tryMove(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startTouchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!startTouchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startTouchRef.current.x;
    const dy = t.clientY - startTouchRef.current.y;
    startTouchRef.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      tryMove(dx > 0 ? "right" : "left");
    } else {
      tryMove(dy > 0 ? "down" : "up");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-6 text-white">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div>
          Best: <span className="font-bold text-yellow-400">{best}</span>
        </div>
        <button
          onClick={undo}
          disabled={!prevRef.current}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-bold disabled:opacity-40"
        >
          Undo
        </button>
        <button
          onClick={newGame}
          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-bold"
        >
          New
        </button>
      </div>

      <div
        className="bg-gray-800 p-3 rounded-lg select-none touch-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2">
          {board.flatMap((row, r) =>
            row.map((v, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-16 h-16 md:w-20 md:h-20 rounded flex items-center justify-center font-bold text-xl md:text-2xl ${
                  TILE_COLORS[v] ?? "bg-gray-900 text-white"
                }`}
              >
                {v !== 0 ? v : ""}
              </div>
            ))
          )}
        </div>
      </div>

      {hasWon && !gameOver && (
        <div className="text-yellow-400 font-bold text-lg">You reached 2048! Keep going.</div>
      )}

      {gameOver && (
        <div className="bg-gray-900 text-white px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2">Game Over</div>
          <div className="mb-1">Score: {score}</div>
          <div className="mb-3">
            Best: <span className="text-yellow-400 font-bold">{best}</span>
          </div>
          <button
            onClick={newGame}
            className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700"
          >
            Play Again
          </button>
        </div>
      )}

      <p className="text-sm text-gray-400 text-center max-w-md">
        Arrow keys / WASD / swipe to move tiles. Combine matching tiles to reach 2048.
      </p>
    </div>
  );
}
