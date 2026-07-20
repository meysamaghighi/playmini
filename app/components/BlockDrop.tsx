"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "./useGameLoop";

const COLS = 10;
const ROWS = 20;
const CELL = 28;
const CANVAS_W = COLS * CELL;
const CANVAS_H = ROWS * CELL;

type TetrominoKey = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
type Board = (string | null)[][];
type GameState = "ready" | "playing" | "paused" | "gameover";

const COLORS: Record<TetrominoKey, string> = {
  I: "#00f0f0",
  O: "#f0f000",
  T: "#a000f0",
  S: "#00f000",
  Z: "#f00000",
  J: "#0000f0",
  L: "#f0a000",
};

const SHAPES: Record<TetrominoKey, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const KEYS: TetrominoKey[] = ["I", "O", "T", "S", "Z", "J", "L"];
const LINE_POINTS = [0, 100, 300, 500, 800];

function newBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));
}

function randomKey(): TetrominoKey {
  return KEYS[Math.floor(Math.random() * KEYS.length)];
}

function rotate(shape: number[][]): number[][] {
  const n = shape.length;
  const out = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[c][n - 1 - r] = shape[r][c];
    }
  }
  return out;
}

type Piece = { key: TetrominoKey; shape: number[][]; x: number; y: number };

function spawn(key: TetrominoKey): Piece {
  const shape = SHAPES[key].map((row) => row.slice());
  return { key, shape, x: Math.floor((COLS - shape.length) / 2), y: 0 };
}

function collides(board: Board, piece: Piece): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const x = piece.x + c;
      const y = piece.y + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y][x]) return true;
    }
  }
  return false;
}

function merge(board: Board, piece: Piece): Board {
  const out = board.map((row) => row.slice());
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const x = piece.x + c;
        const y = piece.y + r;
        if (y >= 0) out[y][x] = COLORS[piece.key];
      }
    }
  }
  return out;
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - kept.length;
  const empties = Array.from({ length: cleared }, () => Array<string | null>(COLS).fill(null));
  return { board: [...empties, ...kept], cleared };
}

export default function BlockDrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(0);
  const [nextKey, setNextKey] = useState<TetrominoKey>("I");

  const boardRef = useRef<Board>(newBoard());
  const pieceRef = useRef<Piece | null>(null);
  const nextRef = useRef<TetrominoKey>(randomKey());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const stateRef = useRef<GameState>("ready");
  const dropTimerRef = useRef(0);

  const dropIntervalMs = useCallback(
    () => Math.max(100, 800 - (levelRef.current - 1) * 70),
    []
  );

  const spawnNext = useCallback(() => {
    const key = nextRef.current;
    const piece = spawn(key);
    nextRef.current = randomKey();
    setNextKey(nextRef.current);
    if (collides(boardRef.current, piece)) {
      pieceRef.current = null;
      stateRef.current = "gameover";
      setGameState("gameover");
      setBest((prev) => {
        const next = Math.max(prev, scoreRef.current);
        try {
          localStorage.setItem("pb-blockdrop-best", String(next));
        } catch {}
        return next;
      });
      return;
    }
    pieceRef.current = piece;
  }, []);

  const reset = useCallback(() => {
    boardRef.current = newBoard();
    pieceRef.current = null;
    nextRef.current = randomKey();
    setNextKey(nextRef.current);
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    setScore(0);
    setLines(0);
    setLevel(1);
  }, []);

  const start = useCallback(() => {
    reset();
    spawnNext();
    stateRef.current = "playing";
    setGameState("playing");
    dropTimerRef.current = 0;
  }, [reset, spawnNext]);

  const lockPiece = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece) return;
    const merged = merge(boardRef.current, piece);
    const { board: cleared, cleared: n } = clearLines(merged);
    boardRef.current = cleared;
    if (n > 0) {
      scoreRef.current += LINE_POINTS[n] * levelRef.current;
      linesRef.current += n;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;
      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(levelRef.current);
    } else {
      setScore(scoreRef.current);
    }
    spawnNext();
  }, [spawnNext]);

  const move = useCallback((dx: number, dy: number): boolean => {
    const piece = pieceRef.current;
    if (!piece || stateRef.current !== "playing") return false;
    const next = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (collides(boardRef.current, next)) return false;
    pieceRef.current = next;
    return true;
  }, []);

  const softDrop = useCallback(() => {
    if (!move(0, 1)) lockPiece();
  }, [lockPiece, move]);

  const hardDrop = useCallback(() => {
    if (stateRef.current !== "playing") return;
    while (move(0, 1)) {
      scoreRef.current += 2;
    }
    lockPiece();
  }, [lockPiece, move]);

  const rotatePiece = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || stateRef.current !== "playing") return;
    const rotated = { ...piece, shape: rotate(piece.shape) };
    for (const dx of [0, -1, 1, -2, 2]) {
      const candidate = { ...rotated, x: rotated.x + dx };
      if (!collides(boardRef.current, candidate)) {
        pieceRef.current = candidate;
        return;
      }
    }
  }, []);

  const togglePause = useCallback(() => {
    if (stateRef.current === "playing") {
      stateRef.current = "paused";
      setGameState("paused");
    } else if (stateRef.current === "paused") {
      stateRef.current = "playing";
      setGameState("playing");
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(CANVAS_W, r * CELL);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, CANVAS_H);
      ctx.stroke();
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = boardRef.current[r][c];
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    }

    const piece = pieceRef.current;
    if (piece) {
      // ghost
      let ghostY = piece.y;
      while (!collides(boardRef.current, { ...piece, y: ghostY + 1 })) ghostY++;
      ctx.fillStyle = COLORS[piece.key] + "55";
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            ctx.fillRect((piece.x + c) * CELL + 1, (ghostY + r) * CELL + 1, CELL - 2, CELL - 2);
          }
        }
      }
      // piece
      ctx.fillStyle = COLORS[piece.key];
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            ctx.fillRect((piece.x + c) * CELL + 1, (piece.y + r) * CELL + 1, CELL - 2, CELL - 2);
          }
        }
      }
    }
  }, []);

  const tick = useCallback(
    (dt: number) => {
      if (stateRef.current === "playing") {
        dropTimerRef.current += dt;
        if (dropTimerRef.current >= dropIntervalMs()) {
          dropTimerRef.current = 0;
          if (!move(0, 1)) lockPiece();
        }
      } else {
        dropTimerRef.current = 0;
      }
      draw();
    },
    [draw, dropIntervalMs, lockPiece, move]
  );

  useGameLoop(tick);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-blockdrop-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stateRef.current === "ready" || stateRef.current === "gameover") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(-1, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        move(1, 0);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        softDrop();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        rotatePiece();
      } else if (e.code === "Space") {
        e.preventDefault();
        hardDrop();
      } else if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hardDrop, move, rotatePiece, softDrop, togglePause]);

  // Touch controls (primary on touch devices): drag to move, tap to rotate, swipe down to hard-drop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const H_THRESH = 30; // px of horizontal drag per column step
    const V_THRESH = 50; // px of downward drag to trigger a hard drop
    const TAP_MAX_DIST = 10;
    const TAP_MAX_MS = 250;
    let fx = 0;
    let fy = 0;
    let ox = 0;
    let startTime = 0;
    let tracking = false;
    let dropped = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      fx = t.clientX;
      fy = t.clientY;
      ox = t.clientX;
      startTime = Date.now();
      dropped = false;
      tracking = true;
    };
    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      e.preventDefault(); // stop the page scrolling while playing
      const t = e.touches[0];
      const dx = t.clientX - fx;
      const dy = t.clientY - fy;
      if (dropped) return;
      // predominantly-vertical downward swipe = hard drop
      if (dy >= V_THRESH && Math.abs(dy) > Math.abs(dx)) {
        hardDrop();
        dropped = true;
        return;
      }
      // horizontal drag: every H_THRESH px = one column step
      const stepDx = t.clientX - ox;
      if (Math.abs(stepDx) >= H_THRESH) {
        move(stepDx > 0 ? 1 : -1, 0);
        ox = t.clientX; // reset origin so a continued drag can cross multiple columns
      }
    };
    const onEnd = (e: TouchEvent) => {
      if (tracking && !dropped) {
        const t = e.changedTouches[0];
        const dist = Math.hypot(t.clientX - fx, t.clientY - fy);
        const dur = Date.now() - startTime;
        if (dist < TAP_MAX_DIST && dur < TAP_MAX_MS) rotatePiece();
      }
      tracking = false;
    };
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onEnd);
    return () => {
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, [hardDrop, move, rotatePiece]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-6 text-ink">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div>
          Lines: <span className="font-bold">{lines}</span>
        </div>
        <div>
          Level: <span className="font-bold">{level}</span>
        </div>
        <div>
          Best: <span className="font-bold text-yellow-400">{best}</span>
        </div>
        <div>
          Next: <span className="font-bold" style={{ color: COLORS[nextKey] }}>{nextKey}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="border-4 border-line rounded-lg max-w-full h-auto"
        />

        {gameState !== "playing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <div className="bg-white text-gray-900 px-8 py-6 rounded-lg text-center">
              {gameState === "ready" && (
                <>
                  <div className="text-2xl font-bold mb-2">Block Drop</div>
                  <div className="text-sm text-ink-3 mb-4">Arrows / Swipe · Tap to rotate</div>
                </>
              )}
              {gameState === "paused" && <div className="text-2xl font-bold mb-2">Paused</div>}
              {gameState === "gameover" && (
                <>
                  <div className="text-2xl font-bold mb-2">Game Over</div>
                  <div className="mb-1">Score: {score}</div>
                  <div className="mb-3">
                    Best: <span className="text-yellow-600 font-bold">{best}</span>
                  </div>
                </>
              )}
              <button
                onClick={gameState === "paused" ? togglePause : start}
                className="px-6 py-2 bg-purple-600 text-ink font-bold rounded-lg hover:bg-purple-700"
              >
                {gameState === "ready" ? "Start" : gameState === "paused" ? "Resume" : "Play Again"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
