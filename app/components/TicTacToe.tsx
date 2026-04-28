"use client";

import { useEffect, useMemo, useState } from "react";

type Cell = "X" | "O" | null;
type Mode = "vs-ai" | "two-player";

const LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: [number, number, number] | null } {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function minimax(board: Cell[], ai: Cell, current: Cell): { score: number; move: number } {
  const { winner } = checkWinner(board);
  if (winner === ai) return { score: 10, move: -1 };
  if (winner && winner !== ai) return { score: -10, move: -1 };
  if (board.every((c) => c !== null)) return { score: 0, move: -1 };

  const best = { score: current === ai ? -Infinity : Infinity, move: -1 };
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    const next = board.slice();
    next[i] = current;
    const { score } = minimax(next, ai, current === "X" ? "O" : "X");
    if (current === ai ? score > best.score : score < best.score) {
      best.score = score;
      best.move = i;
    }
  }
  return best;
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Cell>("X");
  const [mode, setMode] = useState<Mode>("vs-ai");
  const [stats, setStats] = useState({ x: 0, o: 0, draws: 0 });

  const { winner, line } = useMemo(() => checkWinner(board), [board]);
  const full = board.every((c) => c !== null);
  const done = !!winner || full;

  useEffect(() => {
    if (!done) return;
    setStats((prev) => {
      if (winner === "X") return { ...prev, x: prev.x + 1 };
      if (winner === "O") return { ...prev, o: prev.o + 1 };
      return { ...prev, draws: prev.draws + 1 };
    });
  }, [done, winner]);

  useEffect(() => {
    if (mode !== "vs-ai" || turn !== "O" || done) return;
    const t = setTimeout(() => {
      const { move } = minimax(board, "O", "O");
      if (move >= 0) {
        const next = board.slice();
        next[move] = "O";
        setBoard(next);
        setTurn("X");
      }
    }, 250);
    return () => clearTimeout(t);
  }, [board, mode, turn, done]);

  const play = (i: number) => {
    if (done || board[i]) return;
    if (mode === "vs-ai" && turn !== "X") return;
    const next = board.slice();
    next[i] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {(["vs-ai", "two-player"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              reset();
            }}
            className={`px-4 py-2 rounded font-bold ${
              mode === m ? "bg-indigo-600 text-ink" : "bg-paper-2 text-ink"
            }`}
          >
            {m === "vs-ai" ? "Vs AI" : "Two Player"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 text-ink">
        <div>
          X: <span className="font-bold text-blue-400">{stats.x}</span>
        </div>
        <div>
          Draws: <span className="font-bold text-ink-2">{stats.draws}</span>
        </div>
        <div>
          O: <span className="font-bold text-pink-400">{stats.o}</span>
        </div>
      </div>

      <div className="text-ink text-lg">
        {winner ? (
          <span className="font-bold text-yellow-400">
            {mode === "vs-ai"
              ? winner === "X"
                ? "You win!"
                : "AI wins"
              : `${winner} wins!`}
          </span>
        ) : full ? (
          <span className="font-bold text-ink-2">Draw</span>
        ) : (
          <span>
            Turn:{" "}
            <span className={turn === "X" ? "text-blue-400 font-bold" : "text-pink-400 font-bold"}>
              {turn}
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-paper-2 p-2 rounded-lg">
        {board.map((v, i) => {
          const isWin = line?.includes(i);
          return (
            <button
              key={i}
              onClick={() => play(i)}
              disabled={!!v || done}
              className={`w-20 h-20 md:w-24 md:h-24 rounded text-5xl font-bold ${
                isWin
                  ? "bg-yellow-400 text-gray-900"
                  : v === "X"
                  ? "bg-blue-500 text-ink"
                  : v === "O"
                  ? "bg-pink-500 text-ink"
                  : "bg-paper-2 hover:bg-paper-2 text-ink"
              }`}
              aria-label={`Cell ${i + 1}`}
            >
              {v ?? ""}
            </button>
          );
        })}
      </div>

      <button
        onClick={reset}
        className="px-6 py-2 bg-indigo-600 text-ink font-bold rounded-lg hover:bg-indigo-700"
      >
        New Game
      </button>
    </div>
  );
}
