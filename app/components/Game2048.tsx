"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const SIZE = 4;

type CellValue = number | null;
type Board = CellValue[][];

const TILE_COLORS: Record<number, { bg: string; text: string; shadow: string }> = {
  2:    { bg: "#eee4da", text: "#776e65", shadow: "rgba(238,228,218,0.4)" },
  4:    { bg: "#ede0c8", text: "#776e65", shadow: "rgba(237,224,200,0.4)" },
  8:    { bg: "#f2b179", text: "#f9f6f2", shadow: "rgba(242,177,121,0.5)" },
  16:   { bg: "#f59563", text: "#f9f6f2", shadow: "rgba(245,149,99,0.5)" },
  32:   { bg: "#f67c5f", text: "#f9f6f2", shadow: "rgba(246,124,95,0.5)" },
  64:   { bg: "#f65e3b", text: "#f9f6f2", shadow: "rgba(246,94,59,0.5)" },
  128:  { bg: "#edcf72", text: "#f9f6f2", shadow: "rgba(237,207,114,0.6)" },
  256:  { bg: "#edcc61", text: "#f9f6f2", shadow: "rgba(237,204,97,0.6)" },
  512:  { bg: "#edc850", text: "#f9f6f2", shadow: "rgba(237,200,80,0.6)" },
  1024: { bg: "#edc53f", text: "#f9f6f2", shadow: "rgba(237,197,63,0.7)" },
  2048: { bg: "#edc22e", text: "#f9f6f2", shadow: "rgba(237,194,46,0.8)" },
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

function moveLeft(board: Board) {
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
  const [scorePopup, setScorePopup] = useState<{ value: number; key: number } | null>(null);
  const prevBoardRef = useRef<Board>(emptyBoard());
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const popupKeyRef = useRef(0);

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
    setScorePopup(null);
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

      // Score popup
      if (points > 0) {
        popupKeyRef.current += 1;
        setScorePopup({ value: points, key: popupKeyRef.current });
        setTimeout(() => setScorePopup((prev) => prev?.key === popupKeyRef.current ? null : prev), 800);
      }

      // Animations
      const a: AnimState[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) {
          if (withNew[r][c] !== null && moved[r][c] === null) {
            a[r][c] = "new";
          } else if (
            withNew[r][c] !== null &&
            prevBoardRef.current[r][c] !== null &&
            withNew[r][c]! > prevBoardRef.current[r][c]!
          ) {
            a[r][c] = "merge";
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
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
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
    if (val >= 1024) return "text-base sm:text-lg";
    if (val >= 128) return "text-lg sm:text-xl";
    return "text-xl sm:text-2xl";
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Score bar */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="bg-slate-800 rounded-xl px-4 py-2 text-center min-w-[75px] relative">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Score</div>
          <div className="text-xl font-black text-white tabular-nums">{score}</div>
          {scorePopup && (
            <div
              key={scorePopup.key}
              className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 font-black text-sm pointer-events-none"
              style={{
                animation: "scoreFloat 800ms ease-out forwards",
              }}
            >
              +{scorePopup.value}
            </div>
          )}
        </div>
        <div className="bg-slate-800 rounded-xl px-4 py-2 text-center min-w-[75px]">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-xl font-black text-amber-400 tabular-nums">{best}</div>
        </div>
        <button
          onClick={newGame}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 text-sm"
        >
          New Game
        </button>
      </div>

      {/* Win / Game Over */}
      {(won || gameOver) && (
        <div className="bg-slate-800 border-2 border-amber-500/50 rounded-xl p-4 mb-4 text-center">
          <div className="text-2xl font-black text-white mb-1">
            {won && !gameOver ? "You reached 2048!" : "Game Over!"}
          </div>
          {won && !gameOver && (
            <p className="text-gray-400 text-sm mb-2">Keep going for a higher score!</p>
          )}
          <p className="text-gray-400 text-sm mb-3">Score: {score}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={newGame} className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95">
              Play Again
            </button>
            <button onClick={handleShare} className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95">
              Share
            </button>
          </div>
        </div>
      )}

      {/* Board */}
      <div
        className="bg-slate-800 rounded-2xl p-2.5 sm:p-3"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {board.flat().map((val, i) => {
            const r = Math.floor(i / SIZE);
            const c = i % SIZE;
            const anim = anims[r][c];
            const colors = val ? TILE_COLORS[val] || { bg: "#3c3a32", text: "#f9f6f2", shadow: "rgba(60,58,50,0.5)" } : null;

            let animStyle = "";
            if (anim === "new") animStyle = "tile-new";
            else if (anim === "merge") animStyle = "tile-merge";

            return (
              <div
                key={i}
                className={`aspect-square rounded-lg sm:rounded-xl flex items-center justify-center font-extrabold ${animStyle}`}
                style={{
                  backgroundColor: colors ? colors.bg : "#1e293b",
                  color: colors ? colors.text : "transparent",
                  boxShadow: colors ? `0 2px 8px ${colors.shadow}` : "none",
                }}
              >
                {val && (
                  <span className={fontSize(val)}>
                    {val}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs mt-4">
        <span className="hidden md:inline">Arrow keys to move</span>
        <span className="md:hidden">Swipe to move</span>
      </p>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popMerge {
          0% { transform: scale(0.8); }
          40% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes scoreFloat {
          0% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -30px); }
        }
        .tile-new {
          animation: popIn 200ms ease-out;
        }
        .tile-merge {
          animation: popMerge 250ms ease-out;
        }
      `}</style>
    </div>
  );
}
