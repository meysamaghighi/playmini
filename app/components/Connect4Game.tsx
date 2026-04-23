"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

const ROWS = 6;
const COLS = 7;

type Cell = 0 | 1 | 2; // 0 empty, 1 player, 2 ai
type Board = Cell[][];
type Mode = "vs-ai" | "two-player";
type Result = { winner: Cell; line: [number, number][] } | null;

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
}

function dropDisc(board: Board, col: number, player: Cell): Board | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const next = board.map((row) => row.slice()) as Board;
      next[r][col] = player;
      return next;
    }
  }
  return null;
}

function checkWinner(board: Board): Result {
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c];
      if (v === 0) continue;
      for (const [dr, dc] of dirs) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== v) break;
          line.push([nr, nc]);
        }
        if (line.length === 4) return { winner: v, line };
      }
    }
  }
  return null;
}

function isFull(board: Board): boolean {
  return board[0].every((c) => c !== 0);
}

function legalCols(board: Board): number[] {
  return [3, 2, 4, 1, 5, 0, 6].filter((c) => board[0][c] === 0);
}

function evalBoard(board: Board, ai: Cell, hum: Cell): number {
  function scoreLine(cells: Cell[]): number {
    let aiCount = 0;
    let humCount = 0;
    for (const c of cells) {
      if (c === ai) aiCount++;
      else if (c === hum) humCount++;
    }
    if (aiCount > 0 && humCount > 0) return 0;
    if (aiCount === 4) return 100000;
    if (humCount === 4) return -100000;
    if (aiCount === 3) return 50;
    if (humCount === 3) return -80;
    if (aiCount === 2) return 5;
    if (humCount === 2) return -8;
    return 0;
  }

  let total = 0;
  // Center bonus
  for (let r = 0; r < ROWS; r++) {
    if (board[r][3] === ai) total += 3;
    else if (board[r][3] === hum) total -= 3;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 3 < COLS) {
        total += scoreLine([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
      }
      if (r + 3 < ROWS) {
        total += scoreLine([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
      }
      if (r + 3 < ROWS && c + 3 < COLS) {
        total += scoreLine([
          board[r][c],
          board[r + 1][c + 1],
          board[r + 2][c + 2],
          board[r + 3][c + 3],
        ]);
      }
      if (r + 3 < ROWS && c - 3 >= 0) {
        total += scoreLine([
          board[r][c],
          board[r + 1][c - 1],
          board[r + 2][c - 2],
          board[r + 3][c - 3],
        ]);
      }
    }
  }
  return total;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  ai: Cell,
  hum: Cell
): { score: number; col: number } {
  const result = checkWinner(board);
  if (result) {
    return { score: result.winner === ai ? 100000 + depth : -100000 - depth, col: -1 };
  }
  if (depth === 0 || isFull(board)) {
    return { score: evalBoard(board, ai, hum), col: -1 };
  }
  const cols = legalCols(board);
  let bestCol = cols[0];
  if (maximizing) {
    let value = -Infinity;
    for (const c of cols) {
      const next = dropDisc(board, c, ai)!;
      const { score } = minimax(next, depth - 1, alpha, beta, false, ai, hum);
      if (score > value) {
        value = score;
        bestCol = c;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { score: value, col: bestCol };
  } else {
    let value = Infinity;
    for (const c of cols) {
      const next = dropDisc(board, c, hum)!;
      const { score } = minimax(next, depth - 1, alpha, beta, true, ai, hum);
      if (score < value) {
        value = score;
        bestCol = c;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return { score: value, col: bestCol };
  }
}

export default function Connect4Game() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<Cell>(1);
  const [mode, setMode] = useState<Mode>("vs-ai");
  const [aiThinking, setAiThinking] = useState(false);

  const result = useMemo(() => checkWinner(board), [board]);
  const draw = !result && isFull(board);

  const playCol = useCallback(
    (col: number, player: Cell) => {
      const next = dropDisc(board, col, player);
      if (!next) return;
      setBoard(next);
      setTurn(player === 1 ? 2 : 1);
    },
    [board]
  );

  const onColumnClick = (col: number) => {
    if (result || draw || aiThinking) return;
    if (mode === "vs-ai" && turn !== 1) return;
    playCol(col, turn);
  };

  useEffect(() => {
    if (mode !== "vs-ai" || turn !== 2 || result || draw) return;
    setAiThinking(true);
    const t = setTimeout(() => {
      const { col } = minimax(board, 5, -Infinity, Infinity, true, 2, 1);
      if (col >= 0) {
        const next = dropDisc(board, col, 2);
        if (next) {
          setBoard(next);
          setTurn(1);
        }
      }
      setAiThinking(false);
    }, 250);
    return () => clearTimeout(t);
  }, [board, mode, turn, result, draw]);

  const reset = () => {
    setBoard(emptyBoard());
    setTurn(1);
    setAiThinking(false);
  };

  const winLine = useMemo(() => {
    if (!result) return new Set<string>();
    return new Set(result.line.map(([r, c]) => `${r}-${c}`));
  }, [result]);

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
              mode === m ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-200"
            }`}
          >
            {m === "vs-ai" ? "Vs AI" : "Two Player"}
          </button>
        ))}
      </div>

      <div className="text-white text-lg">
        {result ? (
          <span className="font-bold text-yellow-400">
            {result.winner === 1 ? "Red wins!" : mode === "vs-ai" ? "AI wins!" : "Yellow wins!"}
          </span>
        ) : draw ? (
          <span className="font-bold text-gray-300">Draw</span>
        ) : (
          <span>
            Turn:{" "}
            <span className={turn === 1 ? "text-red-400 font-bold" : "text-yellow-400 font-bold"}>
              {turn === 1 ? "Red" : mode === "vs-ai" ? "AI" : "Yellow"}
            </span>
            {aiThinking && " (thinking…)"}
          </span>
        )}
      </div>

      <div className="bg-blue-700 p-3 rounded-lg shadow-lg">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {Array.from({ length: COLS }, (_, c) => (
            <button
              key={c}
              onClick={() => onColumnClick(c)}
              disabled={!!result || draw || aiThinking || (mode === "vs-ai" && turn !== 1)}
              className="text-blue-200 hover:text-white text-2xl font-bold pb-1"
              aria-label={`Drop in column ${c + 1}`}
            >
              ↓
            </button>
          ))}
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isWin = winLine.has(`${r}-${c}`);
              const color =
                cell === 0
                  ? "bg-blue-900"
                  : cell === 1
                  ? "bg-red-500"
                  : "bg-yellow-400";
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => onColumnClick(c)}
                  disabled={!!result || draw || aiThinking || (mode === "vs-ai" && turn !== 1)}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${color} ${
                    isWin ? "ring-4 ring-white" : ""
                  }`}
                  aria-label={`Row ${r + 1} column ${c + 1}`}
                />
              );
            })
          )}
        </div>
      </div>

      <button
        onClick={reset}
        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
      >
        New Game
      </button>
    </div>
  );
}
