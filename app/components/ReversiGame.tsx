"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type Color = "B" | "W";
type Cell = Color | null;
type Board = Cell[][];

const SIZE = 8;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function empty(): Board {
  const b: Board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  b[3][3] = "W"; b[3][4] = "B"; b[4][3] = "B"; b[4][4] = "W";
  return b;
}

function flipsFor(board: Board, r: number, c: number, color: Color): [number, number][] {
  if (board[r][c]) return [];
  const opp: Color = color === "B" ? "W" : "B";
  const flips: [number, number][] = [];
  for (const [dr, dc] of DIRS) {
    const line: [number, number][] = [];
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === opp) {
      line.push([nr, nc]); nr += dr; nc += dc;
    }
    if (line.length && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === color) {
      flips.push(...line);
    }
  }
  return flips;
}

function legalMoves(board: Board, color: Color): [number, number][] {
  const moves: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (flipsFor(board, r, c, color).length) moves.push([r, c]);
  return moves;
}

function applyMove(board: Board, r: number, c: number, color: Color): Board {
  const flips = flipsFor(board, r, c, color);
  const next = board.map(row => [...row]) as Board;
  next[r][c] = color;
  for (const [fr, fc] of flips) next[fr][fc] = color;
  return next;
}

function countScore(board: Board): { B: number; W: number } {
  let B = 0, W = 0;
  for (const row of board) for (const c of row) { if (c === "B") B++; if (c === "W") W++; }
  return { B, W };
}

// AI: weighted board evaluation
const WEIGHTS = [
  [120,-20, 20,  5,  5, 20,-20,120],
  [-20,-40, -5, -5, -5, -5,-40,-20],
  [ 20, -5, 15,  3,  3, 15, -5, 20],
  [  5, -5,  3,  3,  3,  3, -5,  5],
  [  5, -5,  3,  3,  3,  3, -5,  5],
  [ 20, -5, 15,  3,  3, 15, -5, 20],
  [-20,-40, -5, -5, -5, -5,-40,-20],
  [120,-20, 20,  5,  5, 20,-20,120],
];

function evalBoard(board: Board, color: Color): number {
  const opp: Color = color === "B" ? "W" : "B";
  let score = 0;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === color) score += WEIGHTS[r][c];
      else if (board[r][c] === opp) score -= WEIGHTS[r][c];
    }
  score += legalMoves(board, color).length * 5;
  score -= legalMoves(board, opp).length * 5;
  return score;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, color: Color, aiColor: Color): number {
  const moves = legalMoves(board, color);
  const opp: Color = color === "B" ? "W" : "B";
  if (depth === 0 || moves.length === 0) return evalBoard(board, aiColor);
  const maximizing = color === aiColor;
  let best = maximizing ? -Infinity : Infinity;
  for (const [r, c] of moves) {
    const next = applyMove(board, r, c, color);
    const val = minimax(next, depth - 1, alpha, beta, opp, aiColor);
    if (maximizing) { best = Math.max(best, val); alpha = Math.max(alpha, best); }
    else { best = Math.min(best, val); beta = Math.min(beta, best); }
    if (beta <= alpha) break;
  }
  return best;
}

function getBestAIMove(board: Board, aiColor: Color): [number, number] | null {
  const moves = legalMoves(board, aiColor);
  if (!moves.length) return null;
  let best = -Infinity, bestMove = moves[0];
  for (const [r, c] of moves) {
    const next = applyMove(board, r, c, aiColor);
    const opp: Color = aiColor === "B" ? "W" : "B";
    const val = minimax(next, 4, -Infinity, Infinity, opp, aiColor);
    if (val > best) { best = val; bestMove = [r, c]; }
  }
  return bestMove;
}

export default function ReversiGame() {
  const [board, setBoard] = useState<Board>(empty());
  const [turn, setTurn] = useState<Color>("B");
  const [hints, setHints] = useState(true);
  const [status, setStatus] = useState<"playing" | "gameover">("playing");
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [flashing, setFlashing] = useState<[number, number][]>([]);
  const aiColor: Color = "W";
  const playerColor: Color = "B";
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); }, []);

  const score = countScore(board);
  const moves = legalMoves(board, turn);
  const playerMoves = legalMoves(board, playerColor);

  const doAI = useCallback((b: Board) => {
    setAiThinking(true);
    aiTimerRef.current = setTimeout(() => {
      const move = getBestAIMove(b, aiColor);
      if (!move) {
        // AI can't move — check player
        if (!legalMoves(b, playerColor).length) {
          setStatus("gameover");
        } else {
          setTurn(playerColor);
        }
        setAiThinking(false);
        return;
      }
      const [r, c] = move;
      const flips = flipsFor(b, r, c, aiColor);
      const next = applyMove(b, r, c, aiColor);
      setFlashing([[r, c], ...flips]);
      setTimeout(() => setFlashing([]), 350);
      setBoard(next);
      setLastMove([r, c]);
      if (!legalMoves(next, playerColor).length) {
        if (!legalMoves(next, aiColor).length) setStatus("gameover");
        else { setAiThinking(false); doAI(next); return; }
      } else {
        setTurn(playerColor);
      }
      setAiThinking(false);
    }, 300);
  }, []);

  const handleClick = useCallback((r: number, c: number) => {
    if (turn !== playerColor || aiThinking || status === "gameover") return;
    const flips = flipsFor(board, r, c, playerColor);
    if (!flips.length) return;
    const next = applyMove(board, r, c, playerColor);
    setFlashing([[r, c], ...flips]);
    setTimeout(() => setFlashing([]), 350);
    setBoard(next);
    setLastMove([r, c]);
    if (!legalMoves(next, aiColor).length) {
      if (!legalMoves(next, playerColor).length) { setStatus("gameover"); return; }
      setTurn(playerColor); return;
    }
    setTurn(aiColor);
    doAI(next);
  }, [board, turn, aiThinking, status, doAI]);

  const restart = () => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setBoard(empty()); setTurn("B"); setStatus("playing");
    setLastMove(null); setAiThinking(false); setFlashing([]);
  };

  const legalSet = new Set(moves.map(([r, c]) => `${r},${c}`));
  const flashSet = new Set(flashing.map(([r, c]) => `${r},${c}`));

  const winner = status === "gameover"
    ? score.B > score.W ? "You win! 🎉" : score.W > score.B ? "AI wins!" : "Draw!"
    : null;

  const CELL = 52;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-paper-2 border-2 border-gray-400" />
          <span className="text-ink-2">You (Black) <span className="font-bold text-ink text-base">{score.B}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white border-2 border-line" />
          <span className="text-ink-2">AI (White) <span className="font-bold text-ink text-base">{score.W}</span></span>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative rounded-lg overflow-hidden border-2 border-line"
        style={{ width: SIZE * CELL, maxWidth: "100%" }}
      >
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)`, gridTemplateRows: `repeat(${SIZE}, ${CELL}px)` }}
        >
          {board.map((row, r) => row.map((cell, c) => {
            const key = `${r},${c}`;
            const isLegal = legalSet.has(key) && hints && turn === playerColor && !aiThinking;
            const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;
            const isFlashing = flashSet.has(key);
            return (
              <div
                key={key}
                onClick={() => handleClick(r, c)}
                className="relative flex items-center justify-center cursor-pointer"
                style={{
                  width: CELL, height: CELL,
                  backgroundColor: isFlashing ? "#166534" : (r + c) % 2 === 0 ? "#166534" : "#15803d",
                  border: "1px solid rgba(0,0,0,0.2)",
                  transition: "background-color 0.15s",
                }}
              >
                {isLast && <div className="absolute inset-1 rounded opacity-30 bg-yellow-300" />}
                {cell ? (
                  <div
                    className="rounded-full z-10"
                    style={{
                      width: CELL - 10, height: CELL - 10,
                      background: cell === "B"
                        ? "radial-gradient(circle at 35% 35%, #555, #111)"
                        : "radial-gradient(circle at 35% 35%, #fff, #ccc)",
                      boxShadow: cell === "B" ? "1px 2px 4px rgba(0,0,0,0.6)" : "1px 2px 4px rgba(0,0,0,0.3)",
                      transition: isFlashing ? "none" : "transform 0.15s",
                    }}
                  />
                ) : isLegal ? (
                  <div className="rounded-full bg-black/25 z-10" style={{ width: 16, height: 16 }} />
                ) : null}
              </div>
            );
          }))}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col items-center gap-2">
        {winner ? (
          <>
            <p className="text-lg font-bold text-ink">{winner}</p>
            <p className="text-sm text-ink-2">Black {score.B} — {score.W} White</p>
            <button onClick={restart} className="mt-1 px-6 py-2 bg-green-700 hover:bg-green-600 text-ink rounded-lg font-semibold transition-colors">
              Play Again
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <p className={`text-sm font-semibold ${aiThinking ? "text-blue-400 animate-pulse" : "text-ink-2"}`}>
              {aiThinking ? "AI thinking…" : turn === playerColor
                ? playerMoves.length ? "Your turn" : "No moves — skipping"
                : "AI's turn"}
            </p>
            <label className="flex items-center gap-1.5 text-xs text-ink-3 cursor-pointer">
              <input type="checkbox" checked={hints} onChange={e => setHints(e.target.checked)} className="accent-green-500" />
              Show hints
            </label>
            <button onClick={restart} className="text-xs text-ink-3 hover:text-ink-2 transition-colors">
              Restart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
