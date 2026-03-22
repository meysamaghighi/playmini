"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Position = { x: number; y: number };
type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
}

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const INITIAL_SPEED = 800;
const SPEED_INCREASE = 40;
const MIN_SPEED = 100;

const TETROMINOES: Record<TetrominoType, { shape: number[][]; color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00f0f0", // cyan
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000", // yellow
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a000f0", // purple
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00f000", // green
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#f00000", // red
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0000f0", // blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#f0a000", // orange
  },
};

const PIECE_ORDER: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export default function BlockDrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayState, setDisplayState] = useState<"START" | "PLAYING" | "PAUSED" | "GAME_OVER">("START");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(false);

  const boardRef = useRef<(string | null)[][]>(
    Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(null))
  );
  const currentPieceRef = useRef<Tetromino | null>(null);
  const currentPosRef = useRef<Position>({ x: 0, y: 0 });
  const nextPieceRef = useRef<TetrominoType | null>(null);
  const speedRef = useRef(INITIAL_SPEED);
  const lastMoveTimeRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const bestScoreRef = useRef(0);
  const gameStateRef = useRef<"START" | "PLAYING" | "PAUSED" | "GAME_OVER">("START");

  useEffect(() => {
    const saved = localStorage.getItem("pb-blockdrop");
    if (saved) {
      const val = parseInt(saved, 10);
      setBestScore(val);
      bestScoreRef.current = val;
    }
  }, []);

  const randomPiece = (): TetrominoType => {
    return PIECE_ORDER[Math.floor(Math.random() * PIECE_ORDER.length)];
  };

  const createPiece = (type: TetrominoType): Tetromino => {
    const def = TETROMINOES[type];
    return { type, shape: def.shape.map((row) => [...row]), color: def.color };
  };

  const rotatePiece = (shape: number[][]): number[][] => {
    const n = shape.length;
    const rotated = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        rotated[x][n - 1 - y] = shape[y][x];
      }
    }
    return rotated;
  };

  const collides = (piece: Tetromino, pos: Position): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;
          if (boardX < 0 || boardX >= GRID_WIDTH || boardY >= GRID_HEIGHT) return true;
          if (boardY >= 0 && boardRef.current[boardY][boardX]) return true;
        }
      }
    }
    return false;
  };

  const mergePiece = (piece: Tetromino, pos: Position) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = pos.y + y;
          const boardX = pos.x + x;
          if (boardY >= 0) {
            boardRef.current[boardY][boardX] = piece.color;
          }
        }
      }
    }
  };

  const clearLines = (): number => {
    let cleared = 0;
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      if (boardRef.current[y].every((cell) => cell !== null)) {
        boardRef.current.splice(y, 1);
        boardRef.current.unshift(Array(GRID_WIDTH).fill(null));
        cleared++;
        y++;
      }
    }
    return cleared;
  };

  const getGhostY = (piece: Tetromino, pos: Position): number => {
    let ghostY = pos.y;
    while (!collides(piece, { x: pos.x, y: ghostY + 1 })) {
      ghostY++;
    }
    return ghostY;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cellW = canvas.width / GRID_WIDTH;
    const cellH = canvas.height / GRID_HEIGHT;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellW, 0);
      ctx.lineTo(x * cellW, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellH);
      ctx.lineTo(canvas.width, y * cellH);
      ctx.stroke();
    }

    // Draw locked board
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const color = boardRef.current[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
          // Highlight
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.fillRect(x * cellW + 2, y * cellH + 2, cellW / 3, cellH / 3);
        }
      }
    }

    // Ghost piece
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    if (piece && gameStateRef.current === "PLAYING") {
      const ghostY = getGhostY(piece, pos);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardX = pos.x + x;
            const boardY = ghostY + y;
            if (boardY >= 0 && boardY < GRID_HEIGHT && boardX >= 0 && boardX < GRID_WIDTH) {
              ctx.fillRect(boardX * cellW + 1, boardY * cellH + 1, cellW - 2, cellH - 2);
            }
          }
        }
      }
    }

    // Current piece
    if (piece) {
      ctx.fillStyle = piece.color;
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardX = pos.x + x;
            const boardY = pos.y + y;
            if (boardY >= 0 && boardY < GRID_HEIGHT && boardX >= 0 && boardX < GRID_WIDTH) {
              ctx.fillRect(boardX * cellW + 1, boardY * cellH + 1, cellW - 2, cellH - 2);
              // Highlight
              ctx.fillStyle = "rgba(255,255,255,0.3)";
              ctx.fillRect(boardX * cellW + 2, boardY * cellH + 2, cellW / 3, cellH / 3);
              ctx.fillStyle = piece.color;
            }
          }
        }
      }
    }
  }, []);

  const spawnPiece = useCallback(() => {
    const type = nextPieceRef.current || randomPiece();
    nextPieceRef.current = randomPiece();
    const piece = createPiece(type);
    const startX = Math.floor((GRID_WIDTH - piece.shape[0].length) / 2);
    const startY = 0;

    if (collides(piece, { x: startX, y: startY })) {
      gameStateRef.current = "GAME_OVER";
      setDisplayState("GAME_OVER");
      gameLoopRef.current = null;
      return false;
    }

    currentPieceRef.current = piece;
    currentPosRef.current = { x: startX, y: startY };
    return true;
  }, []);

  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    if (!piece) return;

    mergePiece(piece, pos);
    const cleared = clearLines();
    if (cleared > 0) {
      linesRef.current += cleared;
      setLines(linesRef.current);

      // Scoring: 100/300/500/800
      const points = [0, 100, 300, 500, 800][cleared] || 0;
      scoreRef.current += points;
      setScore(scoreRef.current);
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 300);

      if (scoreRef.current > bestScoreRef.current) {
        bestScoreRef.current = scoreRef.current;
        setBestScore(scoreRef.current);
        localStorage.setItem("pb-blockdrop", scoreRef.current.toString());
      }

      // Level up every 10 lines
      const newLevel = Math.floor(linesRef.current / 10) + 1;
      if (newLevel !== levelRef.current) {
        levelRef.current = newLevel;
        setLevel(newLevel);
        speedRef.current = Math.max(MIN_SPEED, INITIAL_SPEED - (newLevel - 1) * SPEED_INCREASE);
      }
    }

    if (!spawnPiece()) {
      draw();
    }
  }, [spawnPiece, draw]);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameStateRef.current !== "PLAYING") {
        gameLoopRef.current = null;
        return;
      }

      if (timestamp - lastMoveTimeRef.current < speedRef.current) {
        draw();
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      lastMoveTimeRef.current = timestamp;

      const piece = currentPieceRef.current;
      const pos = currentPosRef.current;
      if (!piece) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const newPos = { x: pos.x, y: pos.y + 1 };
      if (collides(piece, newPos)) {
        lockPiece();
      } else {
        currentPosRef.current = newPos;
      }

      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [draw, lockPiece]
  );

  const movePiece = useCallback((dx: number) => {
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    if (!piece || gameStateRef.current !== "PLAYING") return;
    const newPos = { x: pos.x + dx, y: pos.y };
    if (!collides(piece, newPos)) {
      currentPosRef.current = newPos;
      draw();
    }
  }, [draw]);

  const rotatePieceFn = useCallback(() => {
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    if (!piece || gameStateRef.current !== "PLAYING") return;

    const rotated = rotatePiece(piece.shape);
    const testPiece = { ...piece, shape: rotated };

    // Wall kicks
    const kicks = [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -2, y: 0 },
      { x: 2, y: 0 },
    ];

    for (const kick of kicks) {
      const testPos = { x: pos.x + kick.x, y: pos.y + kick.y };
      if (!collides(testPiece, testPos)) {
        currentPieceRef.current = testPiece;
        currentPosRef.current = testPos;
        draw();
        return;
      }
    }
  }, [draw]);

  const softDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    if (!piece || gameStateRef.current !== "PLAYING") return;
    const newPos = { x: pos.x, y: pos.y + 1 };
    if (!collides(piece, newPos)) {
      currentPosRef.current = newPos;
      draw();
    }
  }, [draw]);

  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    if (!piece || gameStateRef.current !== "PLAYING") return;
    const ghostY = getGhostY(piece, pos);
    currentPosRef.current = { x: pos.x, y: ghostY };
    lockPiece();
    draw();
  }, [lockPiece, draw]);

  const startGame = useCallback(() => {
    boardRef.current = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(null));
    nextPieceRef.current = null;
    speedRef.current = INITIAL_SPEED;
    lastMoveTimeRef.current = 0;
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    setScore(0);
    setLines(0);
    setLevel(1);
    gameStateRef.current = "PLAYING";
    setDisplayState("PLAYING");
    spawnPiece();
    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [spawnPiece, draw, gameLoop]);

  const togglePause = useCallback(() => {
    if (gameStateRef.current === "PLAYING") {
      gameStateRef.current = "PAUSED";
      setDisplayState("PAUSED");
    } else if (gameStateRef.current === "PAUSED") {
      gameStateRef.current = "PLAYING";
      setDisplayState("PLAYING");
      lastMoveTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameLoop]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (gameStateRef.current === "PLAYING") {
          hardDrop();
        }
        return;
      }

      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        e.preventDefault();
        if (gameStateRef.current === "PLAYING" || gameStateRef.current === "PAUSED") {
          togglePause();
        }
        return;
      }

      if (gameStateRef.current !== "PLAYING") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        movePiece(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        movePiece(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        softDrop();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        rotatePieceFn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePiece, rotatePieceFn, softDrop, hardDrop, togglePause]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleShare = async () => {
    const text = `I scored ${scoreRef.current} in Block Drop! Can you beat me? https://playmini.fun/block-drop`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied!");
      } catch {}
    }
  };

  const drawNextPiece = () => {
    const nextCanvas = document.getElementById("nextCanvas") as HTMLCanvasElement;
    if (!nextCanvas) return;
    const ctx = nextCanvas.getContext("2d");
    if (!ctx) return;

    const cellSize = 20;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (nextPieceRef.current) {
      const next = createPiece(nextPieceRef.current);
      ctx.fillStyle = next.color;
      const offsetX = (4 - next.shape[0].length) * cellSize / 2;
      const offsetY = (4 - next.shape.length) * cellSize / 2;

      for (let y = 0; y < next.shape.length; y++) {
        for (let x = 0; x < next.shape[y].length; x++) {
          if (next.shape[y][x]) {
            ctx.fillRect(offsetX + x * cellSize + 1, offsetY + y * cellSize + 1, cellSize - 2, cellSize - 2);
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(offsetX + x * cellSize + 2, offsetY + y * cellSize + 2, cellSize / 3, cellSize / 3);
            ctx.fillStyle = next.color;
          }
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(drawNextPiece, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score Info */}
      <div className="flex gap-4 text-center flex-wrap justify-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div
            className={`text-2xl font-black tabular-nums transition-all duration-150 ${
              scoreFlash ? "text-yellow-400 scale-125" : "text-purple-400"
            }`}
          >
            {score}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lines</div>
          <div className="text-2xl font-black text-cyan-400 tabular-nums">{lines}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
          <div className="text-2xl font-black text-green-400 tabular-nums">{level}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-2xl font-black text-amber-400 tabular-nums">{bestScore}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Main Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={600}
            className="rounded-xl max-w-full h-auto border-2 border-gray-800"
          />

          {displayState === "START" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-xl backdrop-blur-sm">
              <div className="text-6xl mb-3">🎮</div>
              <h2 className="text-3xl font-black text-purple-400 mb-2">Block Drop</h2>
              <p className="text-gray-400 mb-6 text-sm text-center px-4">
                Arrow keys to move/rotate, Space to drop
              </p>
              <button
                onClick={startGame}
                className="px-10 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
              >
                Play
              </button>
            </div>
          )}

          {displayState === "PAUSED" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 rounded-xl backdrop-blur-sm">
              <div className="text-center">
                <h2 className="text-3xl font-black text-yellow-400 mb-2">Paused</h2>
                <p className="text-gray-400 text-sm">Press P or Escape to resume</p>
              </div>
            </div>
          )}

          {displayState === "GAME_OVER" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-xl backdrop-blur-sm">
              <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
              <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
                <p className="text-white text-lg font-bold">Score: {score}</p>
                <p className="text-cyan-400 text-sm">Lines: {lines}</p>
                {score >= bestScore && score > 0 && (
                  <p className="text-yellow-400 text-sm font-bold mt-1">New Best!</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Play Again
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Share
                </button>
                <DownloadButton canvasRef={canvasRef} filename="blockdrop-score" label="Save" />
              </div>
            </div>
          )}
        </div>

        {/* Next Piece Preview */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 text-center">Next</div>
            <canvas id="nextCanvas" width={80} height={80} className="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex gap-2 md:hidden">
        <button
          onClick={() => movePiece(-1)}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl"
        >
          ←
        </button>
        <button
          onClick={rotatePieceFn}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl"
        >
          ↻
        </button>
        <button
          onClick={() => movePiece(1)}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl"
        >
          →
        </button>
        <button
          onClick={hardDrop}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
        >
          Drop
        </button>
      </div>

      <div className="text-center text-xs text-gray-600">
        {displayState === "PLAYING" && <p>P or Escape to pause</p>}
      </div>
    </div>
  );
}
