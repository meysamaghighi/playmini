"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const SIZE = 4;

type CellValue = number | null;
type Board = CellValue[][];

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2:    { bg: "#eee4da", text: "#776e65" },
  4:    { bg: "#ede0c8", text: "#776e65" },
  8:    { bg: "#f2b179", text: "#f9f6f2" },
  16:   { bg: "#f59563", text: "#f9f6f2" },
  32:   { bg: "#f67c5f", text: "#f9f6f2" },
  64:   { bg: "#f65e3b", text: "#f9f6f2" },
  128:  { bg: "#edcf72", text: "#f9f6f2" },
  256:  { bg: "#edcc61", text: "#f9f6f2" },
  512:  { bg: "#edc850", text: "#f9f6f2" },
  1024: { bg: "#edc53f", text: "#f9f6f2" },
  2048: { bg: "#edc22e", text: "#f9f6f2" },
};

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function addRandom(board: Board): Board {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c] === null) empty.push([r, c]);
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = board.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slideRow(row: CellValue[]): { result: CellValue[]; points: number; moved: boolean } {
  const nums = row.filter((v) => v !== null) as number[];
  const result: CellValue[] = [];
  let points = 0;
  let i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const merged = nums[i] * 2;
      result.push(merged);
      points += merged;
      i += 2;
    } else {
      result.push(nums[i]);
      i++;
    }
  }
  while (result.length < SIZE) result.push(null);
  const moved = row.some((v, idx) => v !== result[idx]);
  return { result, points, moved };
}

function transpose(board: Board): Board {
  return board[0].map((_, c) => board.map((row) => row[c]));
}

function reverseRows(board: Board): Board {
  return board.map((row) => [...row].reverse());
}

function moveLeft(board: Board): { board: Board; points: number; moved: boolean } {
  let totalPoints = 0;
  let anyMoved = false;
  const next = board.map((row) => {
    const { result, points, moved } = slideRow(row);
    totalPoints += points;
    if (moved) anyMoved = true;
    return result;
  });
  return { board: next, points: totalPoints, moved: anyMoved };
}

function moveRight(board: Board) {
  const flipped = reverseRows(board);
  const { board: moved, points, moved: anyMoved } = moveLeft(flipped);
  return { board: reverseRows(moved), points, moved: anyMoved };
}

function moveUp(board: Board) {
  const t = transpose(board);
  const { board: moved, points, moved: anyMoved } = moveLeft(t);
  return { board: transpose(moved), points, moved: anyMoved };
}

function moveDown(board: Board) {
  const t = transpose(board);
  const { board: moved, points, moved: anyMoved } = moveRight(t);
  return { board: transpose(moved), points, moved: anyMoved };
}

function canMove(board: Board): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === null) return true;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  return false;
}

function hasWon(board: Board): boolean {
  return board.some((row) => row.some((v) => v === 2048));
}

// Track which cells just appeared or merged for animation
type AnimState = "new" | "merge" | null;

export default function Game2048() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [anims, setAnims] = useState<AnimState[][]>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  );
  const prevBoardRef = useRef<Board>(emptyBoard());
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  // Init
  useEffect(() => {
    const saved = localStorage.getItem("pb-2048");
    if (saved) setBest(parseInt(saved, 10));
    newGame();
  }, []);

  const newGame = () => {
    const b = addRandom(addRandom(emptyBoard()));
    setBoard(b);
    prevBoardRef.current = b;
    setScore(0);
    setGameOver(false);
    setWon(false);
    // Mark initial tiles as "new"
    const a: AnimState[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (b[r][c] !== null) a[r][c] = "new";
    setAnims(a);
  };

  const doMove = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (gameOver) return;
      const moveFn = { left: moveLeft, right: moveRight, up: moveUp, down: moveDown }[dir];
      const { board: moved, points, moved: anyMoved } = moveFn(board);
      if (!anyMoved) return;

      const withNew = addRandom(moved);
      const newScore = score + points;
      setScore(newScore);
      if (newScore > best) {
        setBest(newScore);
        localStorage.setItem("pb-2048", newScore.toString());
      }

      // Compute animations
      const a: AnimState[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) {
          if (withNew[r][c] !== null && moved[r][c] === null) {
            a[r][c] = "new"; // newly spawned
          } else if (
            withNew[r][c] !== null &&
            prevBoardRef.current[r][c] !== null &&
            withNew[r][c]! > prevBoardRef.current[r][c]!
          ) {
            a[r][c] = "merge"; // merged
          }
        }
      setAnims(a);

      prevBoardRef.current = withNew;
      setBoard(withNew);

      if (!won && hasWon(withNew)) setWon(true);
      if (!canMove(withNew)) setGameOver(true);
    },
    [board, score, best, gameOver, won]
  );

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      };
      if (map[e.key]) { e.preventDefault(); doMove(map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doMove]);

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? "right" : "left");
    else doMove(dy > 0 ? "down" : "up");
  };

  const handleShare = async () => {
    const text = `I scored ${score} in 2048! https://playmini.fun/2048`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  const fontSize = (val: number) => {
    if (val >= 1024) return "text-lg";
    if (val >= 128) return "text-xl";
    return "text-2xl";
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Score bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-gray-800 rounded-xl px-4 py-2 text-center min-w-[80px]">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Score</div>
          <div className="text-xl font-bold text-white">{score}</div>
        </div>
        <div className="bg-gray-800 rounded-xl px-4 py-2 text-center min-w-[80px]">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Best</div>
          <div className="text-xl font-bold text-amber-400">{best}</div>
        </div>
        <button
          onClick={newGame}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl transition-colors"
        >
          New Game
        </button>
      </div>

      {/* Win / Game Over */}
      {(won || gameOver) && (
        <div className="bg-gray-800 border-2 border-amber-500 rounded-xl p-4 mb-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {won && !gameOver ? "You reached 2048!" : "Game Over!"}
          </div>
          {won && !gameOver && (
            <p className="text-gray-400 text-sm mb-2">Keep going for a higher score!</p>
          )}
          <p className="text-gray-400 text-sm mb-3">Score: {score}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={newGame} className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl transition-colors">
              Play Again
            </button>
            <button onClick={handleShare} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-5 py-2 rounded-xl transition-colors">
              Share
            </button>
          </div>
        </div>
      )}

      {/* Board */}
      <div
        className="bg-gray-800 rounded-xl p-3"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div className="grid grid-cols-4 gap-2.5">
          {board.flat().map((val, i) => {
            const r = Math.floor(i / SIZE);
            const c = i % SIZE;
            const anim = anims[r][c];
            const colors = val ? TILE_COLORS[val] || { bg: "#3c3a32", text: "#f9f6f2" } : null;

            return (
              <div
                key={i}
                className="aspect-square rounded-lg flex items-center justify-center font-extrabold relative overflow-hidden"
                style={{
                  backgroundColor: colors ? colors.bg : "#1f2937",
                  color: colors ? colors.text : "transparent",
                }}
              >
                {val && (
                  <span
                    className={`${fontSize(val)} ${
                      anim === "new"
                        ? "animate-[popIn_200ms_ease-out]"
                        : anim === "merge"
                        ? "animate-[popMerge_200ms_ease-out]"
                        : ""
                    }`}
                  >
                    {val}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-4">
        <span className="hidden md:inline">Arrow keys to move</span>
        <span className="md:hidden">Swipe to move</span>
      </p>

      <style jsx>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popMerge {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
