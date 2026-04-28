"use client";

import { useState, useEffect, useCallback } from "react";

type Difficulty = "easy" | "medium" | "hard";
type Board = number[][];

const REMOVAL_COUNT: Record<Difficulty, number> = {
  easy: 35,
  medium: 45,
  hard: 55,
};

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array<number>(9).fill(0));
}

function isValid(b: Board, r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (b[r][i] === n || b[i][c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (b[br + i][bc + j] === n) return false;
    }
  }
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function fillBoard(b: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (b[r][c] === 0) {
        for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
          if (isValid(b, r, c, n)) {
            b[r][c] = n;
            if (fillBoard(b)) return true;
            b[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = emptyBoard();
  fillBoard(solution);
  const puzzle = solution.map((row) => row.slice());
  let removed = 0;
  const target = REMOVAL_COUNT[difficulty];
  while (removed < target) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return { puzzle, solution };
}

function isSolved(b: Board, sol: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (b[r][c] !== sol[r][c]) return false;
    }
  }
  return true;
}

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Board>(emptyBoard);
  const [solution, setSolution] = useState<Board>(emptyBoard);
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);

  const newGame = useCallback((d: Difficulty = difficulty) => {
    const { puzzle: p, solution: s } = generatePuzzle(d);
    setPuzzle(p);
    setSolution(s);
    setBoard(p.map((row) => row.slice()));
    setSelected(null);
    setErrors(new Set());
    setTime(0);
    setRunning(true);
    setSolved(false);
  }, [difficulty]);

  useEffect(() => {
    newGame(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const setCell = useCallback(
    (n: number) => {
      if (!selected || solved) return;
      const [r, c] = selected;
      if (puzzle[r][c] !== 0) return;
      const next = board.map((row) => row.slice());
      next[r][c] = n;
      setBoard(next);

      const errs = new Set<string>();
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (next[i][j] !== 0 && next[i][j] !== solution[i][j]) {
            errs.add(`${i}-${j}`);
          }
        }
      }
      setErrors(errs);

      if (errs.size === 0 && isSolved(next, solution)) {
        setSolved(true);
        setRunning(false);
      }
    },
    [board, puzzle, selected, solution, solved]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key >= "1" && e.key <= "9") {
        setCell(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        setCell(0);
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const [r, c] = selected;
        if (e.key === "ArrowUp") setSelected([Math.max(0, r - 1), c]);
        if (e.key === "ArrowDown") setSelected([Math.min(8, r + 1), c]);
        if (e.key === "ArrowLeft") setSelected([r, Math.max(0, c - 1)]);
        if (e.key === "ArrowRight") setSelected([r, Math.min(8, c + 1)]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, setCell]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded font-bold capitalize ${
              difficulty === d ? "bg-indigo-600 text-ink" : "bg-paper-2 text-ink"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 text-ink">
        <div>⏱️ <span className="font-bold">{formatTime(time)}</span></div>
        <div>Errors: <span className="font-bold text-red-400">{errors.size}</span></div>
        <button
          onClick={() => newGame()}
          className="px-3 py-1 bg-indigo-600 text-ink rounded text-sm font-bold hover:bg-indigo-700"
        >
          New
        </button>
      </div>

      <div className="bg-paper-2 p-2 rounded-lg shadow-xl">
        <div className="grid grid-cols-9 gap-0 bg-paper-2 border-4 border-line">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isFixed = puzzle[r][c] !== 0;
              const isSel = selected && selected[0] === r && selected[1] === c;
              const sameRowCol =
                selected && (selected[0] === r || selected[1] === c);
              const sameBox =
                selected &&
                Math.floor(selected[0] / 3) === Math.floor(r / 3) &&
                Math.floor(selected[1] / 3) === Math.floor(c / 3);
              const sameVal =
                selected && val !== 0 && board[selected[0]][selected[1]] === val;
              const err = errors.has(`${r}-${c}`);
              const borderRight = c % 3 === 2 && c !== 8 ? "border-r-2" : "border-r";
              const borderBottom = r % 3 === 2 && r !== 8 ? "border-b-2" : "border-b";
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelected([r, c])}
                  className={`w-9 h-9 md:w-11 md:h-11 text-base md:text-lg font-bold border-line ${borderRight} ${borderBottom} ${
                    isSel
                      ? "bg-indigo-300 text-gray-900"
                      : sameVal
                      ? "bg-indigo-200 text-gray-900"
                      : sameRowCol || sameBox
                      ? "bg-gray-300 text-gray-900"
                      : "bg-white text-gray-900"
                  } ${err ? "text-red-600" : isFixed ? "" : "text-blue-700"}`}
                >
                  {val !== 0 ? val : ""}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-9 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => setCell(n)}
            className="w-9 h-9 md:w-11 md:h-11 bg-paper-2 hover:bg-paper-2 text-ink font-bold rounded"
          >
            {n}
          </button>
        ))}
      </div>
      <button
        onClick={() => setCell(0)}
        className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-ink font-bold rounded"
      >
        Erase
      </button>

      {solved && (
        <div className="bg-paper-2 text-ink px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2">Solved!</div>
          <div className="mb-3">
            Time: <span className="font-bold text-yellow-400">{formatTime(time)}</span>
          </div>
          <button
            onClick={() => newGame()}
            className="px-6 py-2 bg-indigo-600 text-ink font-bold rounded-lg hover:bg-indigo-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
