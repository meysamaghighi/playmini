"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Difficulty = "easy" | "medium" | "hard";
type GameState = "ready" | "playing" | "won" | "lost";

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type Config = { rows: number; cols: number; mines: number };

const CONFIGS: Record<Difficulty, Config> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const NUM_COLORS = [
  "",
  "text-blue-600",
  "text-green-600",
  "text-red-600",
  "text-indigo-700",
  "text-amber-700",
  "text-teal-600",
  "text-black",
  "text-gray-600",
];

function newBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

function placeMines(board: Cell[][], config: Config, safeR: number, safeC: number): Cell[][] {
  const copy = board.map((row) => row.map((c) => ({ ...c })));
  const { rows, cols, mines } = config;
  const forbidden = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      forbidden.add(`${safeR + dr},${safeC + dc}`);
    }
  }
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (copy[r][c].mine || forbidden.has(`${r},${c}`)) continue;
    copy[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (copy[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && copy[nr][nc].mine) n++;
        }
      }
      copy[r][c].adjacent = n;
    }
  }
  return copy;
}

function flood(board: Cell[][], r: number, c: number): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const copy = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = copy[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (!copy[nr][nc].revealed && !copy[nr][nc].flagged) {
              stack.push([nr, nc]);
            }
          }
        }
      }
    }
  }
  return copy;
}

function hasWon(board: Cell[][]): boolean {
  for (const row of board) {
    for (const c of row) {
      if (!c.mine && !c.revealed) return false;
    }
  }
  return true;
}

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Cell[][]>(() => newBoard(9, 9));
  const [state, setState] = useState<GameState>("ready");
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const [best, setBest] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = CONFIGS[difficulty];

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startNew = useCallback(
    (d: Difficulty = difficulty) => {
      stopTimer();
      const c = CONFIGS[d];
      setBoard(newBoard(c.rows, c.cols));
      setState("ready");
      setFlags(0);
      setTime(0);
    },
    [difficulty, stopTimer]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-minesweeper-best");
      if (saved) setBest(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    startNew(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const reveal = (r: number, c: number) => {
    if (state === "won" || state === "lost") return;
    const cell = board[r][c];
    if (cell.flagged || cell.revealed) return;

    if (state === "ready") {
      const withMines = placeMines(board, config, r, c);
      const next = flood(withMines, r, c);
      setBoard(next);
      setState("playing");
      if (!timerRef.current) {
        timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
      }
      return;
    }

    if (cell.mine) {
      const revealed = board.map((row) => row.map((x) => ({ ...x, revealed: x.revealed || x.mine })));
      setBoard(revealed);
      setState("lost");
      stopTimer();
      return;
    }

    const next = flood(board, r, c);
    if (hasWon(next)) {
      setBoard(next);
      setState("won");
      stopTimer();
      setBest((prev) => {
        const existing = prev[difficulty];
        if (existing === null || time < existing) {
          const updated = { ...prev, [difficulty]: time };
          try {
            localStorage.setItem("pb-minesweeper-best", JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prev;
      });
    } else {
      setBoard(next);
    }
  };

  const toggleFlag = (r: number, c: number) => {
    if (state !== "playing" && state !== "ready") return;
    const cell = board[r][c];
    if (cell.revealed) return;
    const next = board.map((row) => row.slice());
    next[r][c] = { ...cell, flagged: !cell.flagged };
    setBoard(next);
    setFlags((f) => f + (cell.flagged ? -1 : 1));
  };

  const remaining = config.mines - flags;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(Object.keys(CONFIGS) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded font-bold ${
              difficulty === d ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            {d === "easy" ? "Easy 9×9" : d === "medium" ? "Medium 16×16" : "Hard 16×30"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 text-white text-lg bg-gray-900 px-4 py-2 rounded">
        <div>
          💣 <span className="font-bold">{remaining}</span>
        </div>
        <div>
          ⏱️ <span className="font-bold">{time}</span>
        </div>
        <div>
          Best:{" "}
          <span className="font-bold text-yellow-400">
            {best[difficulty] === null ? "—" : best[difficulty]}
          </span>
        </div>
        <button onClick={() => startNew()} className="ml-2 text-2xl" aria-label="New game">
          {state === "lost" ? "😵" : state === "won" ? "😎" : "🙂"}
        </button>
      </div>

      <div
        className="inline-block bg-gray-800 p-2 rounded overflow-auto max-w-full"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 28px)`,
            gridTemplateRows: `repeat(${config.rows}, 28px)`,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r}-${c}`;
              const base =
                "w-7 h-7 text-sm font-bold flex items-center justify-center select-none touch-manipulation";
              if (cell.revealed) {
                if (cell.mine) {
                  return (
                    <div key={key} className={`${base} bg-red-500 text-white`}>
                      💣
                    </div>
                  );
                }
                return (
                  <div
                    key={key}
                    className={`${base} bg-gray-200 ${NUM_COLORS[cell.adjacent] || ""}`}
                  >
                    {cell.adjacent > 0 ? cell.adjacent : ""}
                  </div>
                );
              }
              return (
                <button
                  key={key}
                  className={`${base} bg-gray-500 hover:bg-gray-400 active:bg-gray-400 transition-colors`}
                  onClick={() => reveal(r, c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleFlag(r, c);
                  }}
                  onTouchStart={(e) => {
                    const t = (e.target as HTMLButtonElement & { _timer?: ReturnType<typeof setTimeout> });
                    t._timer = setTimeout(() => {
                      toggleFlag(r, c);
                      t._timer = undefined;
                    }, 350);
                  }}
                  onTouchEnd={(e) => {
                    const t = (e.target as HTMLButtonElement & { _timer?: ReturnType<typeof setTimeout> });
                    if (t._timer) {
                      clearTimeout(t._timer);
                      t._timer = undefined;
                    }
                  }}
                  onTouchMove={(e) => {
                    const t = (e.target as HTMLButtonElement & { _timer?: ReturnType<typeof setTimeout> });
                    if (t._timer) {
                      clearTimeout(t._timer);
                      t._timer = undefined;
                    }
                  }}
                >
                  {cell.flagged ? "🚩" : ""}
                </button>
              );
            })
          )}
        </div>
      </div>

      {(state === "won" || state === "lost") && (
        <div className="bg-gray-900 text-white px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2">
            {state === "won" ? "You won!" : "Game over"}
          </div>
          {state === "won" && (
            <div className="mb-3">
              Time: <span className="font-bold text-yellow-400">{time}s</span>
            </div>
          )}
          <button
            onClick={() => startNew()}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
          >
            Play Again
          </button>
        </div>
      )}

      <p className="text-sm text-gray-400 text-center max-w-md">
        Left-click to reveal. Right-click (or long-press on mobile) to flag a mine.
      </p>
    </div>
  );
}
