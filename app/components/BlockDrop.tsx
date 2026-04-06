"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Position = { x: number; y: number };
type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
type PowerUpType = "slowTime" | "clearBottom" | "holdSwap" | "bomb";
type GameMode = "campaign" | "endless";

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
}

interface LevelConfig {
  level: number;
  name: string;
  description: string;
  speed: number; // ms per drop
  garbageRows: number; // rows of garbage at start
  invisibleBlocks: boolean;
  limitedRotations: number | null; // null = unlimited
  restrictedPieces: TetrominoType[] | null; // null = all pieces
  ghostPiece: boolean;
  powerUpChance: number;
}

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const POWERUP_DURATION = 8000; // 8 seconds
const POWERUP_DROP_CHANCE = 0.15;

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

const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    name: "Classic Start",
    description: "Standard Tetris gameplay",
    speed: 800,
    garbageRows: 0,
    invisibleBlocks: false,
    limitedRotations: null,
    restrictedPieces: null,
    ghostPiece: true,
    powerUpChance: 0.15,
  },
  {
    level: 2,
    name: "Speed Boost",
    description: "Faster falling pieces",
    speed: 600,
    garbageRows: 0,
    invisibleBlocks: false,
    limitedRotations: null,
    restrictedPieces: null,
    ghostPiece: true,
    powerUpChance: 0.15,
  },
  {
    level: 3,
    name: "Garbage Pile",
    description: "Start with 3 rows of garbage",
    speed: 700,
    garbageRows: 3,
    invisibleBlocks: false,
    limitedRotations: null,
    restrictedPieces: null,
    ghostPiece: true,
    powerUpChance: 0.2,
  },
  {
    level: 4,
    name: "No Ghost",
    description: "Ghost piece disabled",
    speed: 650,
    garbageRows: 0,
    invisibleBlocks: false,
    limitedRotations: null,
    restrictedPieces: null,
    ghostPiece: false,
    powerUpChance: 0.15,
  },
  {
    level: 5,
    name: "Lightning Speed",
    description: "Very fast drops",
    speed: 400,
    garbageRows: 0,
    invisibleBlocks: false,
    limitedRotations: null,
    restrictedPieces: null,
    ghostPiece: true,
    powerUpChance: 0.2,
  },
  {
    level: 6,
    name: "Limited Rotations",
    description: "Only 2 rotations per piece",
    speed: 600,
    garbageRows: 2,
    invisibleBlocks: false,
    limitedRotations: 2,
    restrictedPieces: null,
    ghostPiece: true,
    powerUpChance: 0.2,
  },
  {
    level: 7,
    name: "Invisible Blocks",
    description: "Locked blocks fade away",
    speed: 700,
    garbageRows: 0,
    invisibleBlocks: true,
    limitedRotations: null,
    restrictedPieces: null,
    ghostPiece: false,
    powerUpChance: 0.25,
  },
  {
    level: 8,
    name: "Limited Pieces",
    description: "Only I, O, and T pieces",
    speed: 500,
    garbageRows: 4,
    invisibleBlocks: false,
    limitedRotations: null,
    restrictedPieces: ["I", "O", "T"],
    ghostPiece: true,
    powerUpChance: 0.2,
  },
  {
    level: 9,
    name: "Chaos Mode",
    description: "Fast, invisible, limited rotations",
    speed: 350,
    garbageRows: 2,
    invisibleBlocks: true,
    limitedRotations: 1,
    restrictedPieces: null,
    ghostPiece: false,
    powerUpChance: 0.3,
  },
  {
    level: 10,
    name: "Final Challenge",
    description: "The ultimate test",
    speed: 300,
    garbageRows: 5,
    invisibleBlocks: true,
    limitedRotations: 1,
    restrictedPieces: null,
    ghostPiece: false,
    powerUpChance: 0.25,
  },
];

export default function BlockDrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayState, setDisplayState] = useState<"START" | "LEVEL_SELECT" | "PLAYING" | "PAUSED" | "GAME_OVER" | "LEVEL_COMPLETE">("START");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>("campaign");
  const [bestScore, setBestScore] = useState(0);
  const [campaignProgress, setCampaignProgress] = useState(1);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const boardRef = useRef<(string | null)[][]>(
    Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(null))
  );
  const currentPieceRef = useRef<Tetromino | null>(null);
  const currentPosRef = useRef<Position>({ x: 0, y: 0 });
  const nextPieceRef = useRef<TetrominoType | null>(null);
  const holdPieceRef = useRef<TetrominoType | null>(null);
  const canHoldRef = useRef(true);
  const speedRef = useRef(800);
  const lastMoveTimeRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const bestScoreRef = useRef(0);
  const gameStateRef = useRef<"START" | "LEVEL_SELECT" | "PLAYING" | "PAUSED" | "GAME_OVER" | "LEVEL_COMPLETE">("START");
  const powerUpsRef = useRef<PowerUp[]>([]);
  const activePowerUpRef = useRef<PowerUpType | null>(null);
  const powerUpTimerRef = useRef<number | null>(null);
  const rotationsLeftRef = useRef<number | null>(null);
  const gameModeRef = useRef<GameMode>("campaign");
  const campaignProgressRef = useRef(1);
  const linesRequiredRef = useRef(10); // Lines needed to complete campaign level
  const invisibleTimestampsRef = useRef<number[][]>(
    Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(0))
  );

  useEffect(() => {
    const saved = localStorage.getItem("pb-blockdrop");
    if (saved) {
      const val = parseInt(saved, 10);
      setBestScore(val);
      bestScoreRef.current = val;
    }
    const progress = localStorage.getItem("blockdrop-progress");
    if (progress) {
      const val = parseInt(progress, 10);
      setCampaignProgress(val);
      campaignProgressRef.current = val;
    }
  }, []);

  const randomPiece = (restrictedPieces: TetrominoType[] | null = null): TetrominoType => {
    const pool = restrictedPieces || PIECE_ORDER;
    return pool[Math.floor(Math.random() * pool.length)];
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
            invisibleTimestampsRef.current[boardY][boardX] = Date.now();
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
        invisibleTimestampsRef.current.splice(y, 1);
        invisibleTimestampsRef.current.unshift(Array(GRID_WIDTH).fill(0));
        cleared++;
        y++;

        // Drop power-up
        if (Math.random() < POWERUP_DROP_CHANCE && gameStateRef.current === "PLAYING") {
          spawnPowerUp();
        }
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

  const spawnPowerUp = () => {
    const types: PowerUpType[] = ["slowTime", "clearBottom", "holdSwap", "bomb"];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.floor(Math.random() * GRID_WIDTH);
    powerUpsRef.current.push({ x, y: 0, type });
  };

  const activatePowerUpFn = useCallback((type: PowerUpType) => {
    if (powerUpTimerRef.current !== null) {
      clearTimeout(powerUpTimerRef.current);
    }

    activePowerUpRef.current = type;
    setActivePowerUp(type);

    if (type === "slowTime") {
      // Speed is temporarily halved in game loop
      powerUpTimerRef.current = window.setTimeout(() => {
        activePowerUpRef.current = null;
        setActivePowerUp(null);
      }, POWERUP_DURATION);
    } else if (type === "clearBottom") {
      // Clear bottom 2 rows
      for (let i = 0; i < 2; i++) {
        if (GRID_HEIGHT - 1 - i >= 0) {
          boardRef.current[GRID_HEIGHT - 1 - i] = Array(GRID_WIDTH).fill(null);
          invisibleTimestampsRef.current[GRID_HEIGHT - 1 - i] = Array(GRID_WIDTH).fill(0);
        }
      }
      activePowerUpRef.current = null;
      setActivePowerUp(null);
      scoreRef.current += 100;
      setScore(scoreRef.current);
    } else if (type === "holdSwap") {
      // Allow one extra hold swap immediately
      if (holdPieceRef.current && currentPieceRef.current) {
        const temp = holdPieceRef.current;
        holdPieceRef.current = currentPieceRef.current.type;
        currentPieceRef.current = createPiece(temp);
        const startX = Math.floor((GRID_WIDTH - currentPieceRef.current.shape[0].length) / 2);
        currentPosRef.current = { x: startX, y: 0 };
        canHoldRef.current = false;
      }
      activePowerUpRef.current = null;
      setActivePowerUp(null);
    } else if (type === "bomb") {
      // Clear 3x3 area around current piece
      const pos = currentPosRef.current;
      const centerX = pos.x + 1;
      const centerY = pos.y + 1;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const bx = centerX + dx;
          const by = centerY + dy;
          if (by >= 0 && by < GRID_HEIGHT && bx >= 0 && bx < GRID_WIDTH) {
            boardRef.current[by][bx] = null;
            invisibleTimestampsRef.current[by][bx] = 0;
          }
        }
      }
      activePowerUpRef.current = null;
      setActivePowerUp(null);
      scoreRef.current += 150;
      setScore(scoreRef.current);
    }
  }, []);

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
    const config = gameModeRef.current === "campaign" ? LEVEL_CONFIGS[levelRef.current - 1] : null;
    const isInvisible = config?.invisibleBlocks;
    const now = Date.now();

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const color = boardRef.current[y][x];
        if (color) {
          let alpha = 1.0;
          if (isInvisible) {
            const age = now - invisibleTimestampsRef.current[y][x];
            if (age > 2000) {
              alpha = Math.max(0, 1 - (age - 2000) / 1000);
            }
          }
          if (alpha > 0) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
            // Highlight
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(x * cellW + 2, y * cellH + 2, cellW / 3, cellH / 3);
            ctx.globalAlpha = 1.0;
          }
        }
      }
    }

    // Draw power-ups
    for (const powerUp of powerUpsRef.current) {
      const px = powerUp.x * cellW + cellW / 2;
      const py = powerUp.y * cellH + cellH / 2;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(px, py, cellW / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const icon = powerUp.type === "slowTime" ? "⏱" : powerUp.type === "clearBottom" ? "⬇" : powerUp.type === "holdSwap" ? "↔" : "💣";
      ctx.fillText(icon, px, py);
    }

    // Ghost piece
    const piece = currentPieceRef.current;
    const pos = currentPosRef.current;
    const showGhost = config ? config.ghostPiece : true;
    if (piece && gameStateRef.current === "PLAYING" && showGhost) {
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

  const createGarbageRow = (): (string | null)[] => {
    const row = Array(GRID_WIDTH).fill("#64748b");
    const emptyIndex = Math.floor(Math.random() * GRID_WIDTH);
    row[emptyIndex] = null;
    return row;
  };

  const initLevel = useCallback((level: number) => {
    const config = LEVEL_CONFIGS[level - 1];
    speedRef.current = config.speed;

    // Create garbage rows
    boardRef.current = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(null));
    invisibleTimestampsRef.current = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(0));

    for (let i = 0; i < config.garbageRows; i++) {
      boardRef.current[GRID_HEIGHT - 1 - i] = createGarbageRow();
    }

    rotationsLeftRef.current = config.limitedRotations;
  }, []);

  const spawnPiece = useCallback(() => {
    const config = gameModeRef.current === "campaign" ? LEVEL_CONFIGS[levelRef.current - 1] : null;
    const restrictedPieces = config?.restrictedPieces || null;

    const type = nextPieceRef.current || randomPiece(restrictedPieces);
    nextPieceRef.current = randomPiece(restrictedPieces);
    const piece = createPiece(type);
    const startX = Math.floor((GRID_WIDTH - piece.shape[0].length) / 2);
    const startY = 0;

    if (collides(piece, { x: startX, y: startY })) {
      // Lost a life
      livesRef.current--;
      setLives(livesRef.current);

      if (livesRef.current <= 0) {
        gameStateRef.current = "GAME_OVER";
        setDisplayState("GAME_OVER");
        gameLoopRef.current = null;
        return false;
      } else {
        // Clear some of the board (partial reset)
        for (let y = 0; y < 5; y++) {
          boardRef.current[y] = Array(GRID_WIDTH).fill(null);
          invisibleTimestampsRef.current[y] = Array(GRID_WIDTH).fill(0);
        }
        currentPieceRef.current = piece;
        currentPosRef.current = { x: startX, y: startY };
        return true;
      }
    }

    currentPieceRef.current = piece;
    currentPosRef.current = { x: startX, y: startY };
    canHoldRef.current = true;

    // Reset rotation limit
    const levelConfig = gameModeRef.current === "campaign" ? LEVEL_CONFIGS[levelRef.current - 1] : null;
    rotationsLeftRef.current = levelConfig?.limitedRotations || null;

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

      // Campaign mode: check for level completion
      if (gameModeRef.current === "campaign" && linesRef.current >= linesRequiredRef.current) {
        gameStateRef.current = "LEVEL_COMPLETE";
        setDisplayState("LEVEL_COMPLETE");
        gameLoopRef.current = null;

        // Update progress
        if (levelRef.current >= campaignProgressRef.current && levelRef.current < 10) {
          campaignProgressRef.current = levelRef.current + 1;
          setCampaignProgress(campaignProgressRef.current);
          localStorage.setItem("blockdrop-progress", campaignProgressRef.current.toString());
        }
        return;
      }

      // Endless mode: level up every 10 lines
      if (gameModeRef.current === "endless") {
        const newLevel = Math.floor(linesRef.current / 10) + 1;
        if (newLevel !== levelRef.current) {
          levelRef.current = newLevel;
          setCurrentLevel(newLevel);
          const baseSpeed = 800;
          const speedDecrease = 50;
          const minSpeed = 100;
          speedRef.current = Math.max(minSpeed, baseSpeed - (newLevel - 1) * speedDecrease);
          setLevelUp(newLevel);
          setTimeout(() => setLevelUp(null), 2000);
        }
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

      // Update power-ups
      powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
        powerUp.y += 0.1;

        // Check collision with current piece
        const piece = currentPieceRef.current;
        const pos = currentPosRef.current;
        if (piece) {
          for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
              if (piece.shape[y][x]) {
                const boardX = pos.x + x;
                const boardY = pos.y + y;
                const powerUpGridY = Math.floor(powerUp.y);
                if (boardX === powerUp.x && boardY === powerUpGridY) {
                  activatePowerUpFn(powerUp.type);
                  return false; // Remove power-up
                }
              }
            }
          }
        }

        return powerUp.y < GRID_HEIGHT;
      });

      const currentSpeed = activePowerUpRef.current === "slowTime" ? speedRef.current * 2 : speedRef.current;

      if (timestamp - lastMoveTimeRef.current < currentSpeed) {
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
    [draw, lockPiece, activatePowerUpFn]
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

    // Check rotation limit
    if (rotationsLeftRef.current !== null) {
      if (rotationsLeftRef.current <= 0) return;
      rotationsLeftRef.current--;
    }

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

  const holdPiece = useCallback(() => {
    if (!canHoldRef.current || gameStateRef.current !== "PLAYING") return;

    const currentType = currentPieceRef.current?.type;
    if (!currentType) return;

    if (holdPieceRef.current === null) {
      holdPieceRef.current = currentType;
      spawnPiece();
    } else {
      const temp = holdPieceRef.current;
      holdPieceRef.current = currentType;
      currentPieceRef.current = createPiece(temp);
      const startX = Math.floor((GRID_WIDTH - currentPieceRef.current.shape[0].length) / 2);
      currentPosRef.current = { x: startX, y: 0 };
    }

    canHoldRef.current = false;
    draw();
  }, [spawnPiece, draw]);

  const startCampaignLevel = useCallback((level: number) => {
    levelRef.current = level;
    setCurrentLevel(level);
    gameModeRef.current = "campaign";
    setGameMode("campaign");

    initLevel(level);

    nextPieceRef.current = null;
    holdPieceRef.current = null;
    powerUpsRef.current = [];
    activePowerUpRef.current = null;
    setActivePowerUp(null);
    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);

    lastMoveTimeRef.current = 0;
    scoreRef.current = 0;
    linesRef.current = 0;
    livesRef.current = 3;
    linesRequiredRef.current = 10;

    setScore(0);
    setLines(0);
    setLives(3);

    gameStateRef.current = "PLAYING";
    setDisplayState("PLAYING");
    spawnPiece();
    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [initLevel, spawnPiece, draw, gameLoop]);

  const startEndlessMode = useCallback(() => {
    gameModeRef.current = "endless";
    setGameMode("endless");
    levelRef.current = 1;
    setCurrentLevel(1);

    boardRef.current = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(null));
    invisibleTimestampsRef.current = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(0));

    nextPieceRef.current = null;
    holdPieceRef.current = null;
    powerUpsRef.current = [];
    activePowerUpRef.current = null;
    setActivePowerUp(null);
    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);

    speedRef.current = 800;
    lastMoveTimeRef.current = 0;
    scoreRef.current = 0;
    linesRef.current = 0;
    livesRef.current = 3;
    rotationsLeftRef.current = null;

    setScore(0);
    setLines(0);
    setLives(3);

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

  const showLevelSelect = useCallback(() => {
    gameStateRef.current = "LEVEL_SELECT";
    setDisplayState("LEVEL_SELECT");
  }, []);

  // Touch gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;

    e.preventDefault();

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Swipe threshold
    const threshold = 30;

    if (absDx < threshold && absDy < threshold) {
      // Tap - hard drop
      hardDrop();
    } else if (absDx > absDy) {
      // Horizontal swipe
      if (dx < -threshold) {
        movePiece(-1);
      } else if (dx > threshold) {
        movePiece(1);
      }
    } else {
      // Vertical swipe
      if (dy > threshold) {
        softDrop();
      } else if (dy < -threshold) {
        rotatePieceFn();
      }
    }

    touchStartRef.current = null;
  }, [movePiece, rotatePieceFn, softDrop, hardDrop]);

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

      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        if (gameStateRef.current === "PLAYING") {
          holdPiece();
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
  }, [movePiece, rotatePieceFn, softDrop, hardDrop, holdPiece, togglePause]);

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

  const drawHoldPiece = () => {
    const holdCanvas = document.getElementById("holdCanvas") as HTMLCanvasElement;
    if (!holdCanvas) return;
    const ctx = holdCanvas.getContext("2d");
    if (!ctx) return;

    const cellSize = 20;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);

    if (holdPieceRef.current) {
      const hold = createPiece(holdPieceRef.current);
      ctx.fillStyle = canHoldRef.current ? hold.color : "#334155";
      const offsetX = (4 - hold.shape[0].length) * cellSize / 2;
      const offsetY = (4 - hold.shape.length) * cellSize / 2;

      for (let y = 0; y < hold.shape.length; y++) {
        for (let x = 0; x < hold.shape[y].length; x++) {
          if (hold.shape[y][x]) {
            ctx.fillRect(offsetX + x * cellSize + 1, offsetY + y * cellSize + 1, cellSize - 2, cellSize - 2);
            if (canHoldRef.current) {
              ctx.fillStyle = "rgba(255,255,255,0.3)";
              ctx.fillRect(offsetX + x * cellSize + 2, offsetY + y * cellSize + 2, cellSize / 3, cellSize / 3);
              ctx.fillStyle = hold.color;
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      drawNextPiece();
      drawHoldPiece();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const config = gameMode === "campaign" && currentLevel <= 10 ? LEVEL_CONFIGS[currentLevel - 1] : null;

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
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
          <div className="text-2xl font-black text-red-400 tabular-nums">{"❤️".repeat(lives)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
          <div className="text-2xl font-black text-green-400 tabular-nums">{currentLevel}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-2xl font-black text-amber-400 tabular-nums">{bestScore}</div>
        </div>
      </div>

      {/* Active Power-up Indicator */}
      {activePowerUp && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm animate-pulse">
          Power-up: {activePowerUp === "slowTime" ? "Slow Time" : activePowerUp === "clearBottom" ? "Clear Bottom" : activePowerUp === "holdSwap" ? "Hold Swap" : "Bomb"}
        </div>
      )}

      {/* Game Area */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Hold Piece */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 text-center">Hold (C)</div>
          <canvas id="holdCanvas" width={80} height={80} className="rounded-lg" />
        </div>

        {/* Main Canvas */}
        <div className="relative" style={{ maxWidth: "min(300px, 90vw)" }}>
          <canvas
            ref={canvasRef}
            width={300}
            height={600}
            className="rounded-xl w-full h-auto border-2 border-gray-800"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {displayState === "START" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-xl backdrop-blur-sm">
              <div className="text-6xl mb-3">🎮</div>
              <h2 className="text-3xl font-black text-purple-400 mb-2">Block Drop</h2>
              <p className="text-gray-400 mb-6 text-sm text-center px-4">
                Campaign with 10 levels or endless mode
              </p>
              <div className="flex gap-3">
                <button
                  onClick={showLevelSelect}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Campaign
                </button>
                <button
                  onClick={startEndlessMode}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Endless
                </button>
              </div>
            </div>
          )}

          {displayState === "LEVEL_SELECT" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 rounded-xl backdrop-blur-sm overflow-y-auto p-4">
              <h2 className="text-2xl font-black text-purple-400 mb-4">Select Level</h2>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {LEVEL_CONFIGS.map((cfg) => (
                  <button
                    key={cfg.level}
                    onClick={() => startCampaignLevel(cfg.level)}
                    disabled={cfg.level > campaignProgress}
                    className={`p-3 rounded-lg font-bold text-sm transition-all ${
                      cfg.level <= campaignProgress
                        ? "bg-purple-600 hover:bg-purple-500 text-white hover:scale-105"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <div className="text-lg">{cfg.level}</div>
                    <div className="text-xs">{cfg.name}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  gameStateRef.current = "START";
                  setDisplayState("START");
                }}
                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-all"
              >
                Back
              </button>
            </div>
          )}

          {/* Level Up Announcement */}
          {levelUp !== null && displayState === "PLAYING" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center animate-levelup">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-400 to-cyan-400 drop-shadow-lg">
                  LEVEL {levelUp}
                </div>
                <div className="text-xl font-bold text-white mt-2 drop-shadow-md">
                  Speed Up!
                </div>
              </div>
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

          {displayState === "LEVEL_COMPLETE" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-xl backdrop-blur-sm">
              <h2 className="text-3xl font-black text-green-400 mb-4">Level Complete!</h2>
              <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
                <p className="text-white text-lg font-bold">Score: {score}</p>
                <p className="text-cyan-400 text-sm">Lines: {lines}</p>
              </div>
              <div className="flex gap-3">
                {currentLevel < 10 && (
                  <button
                    onClick={() => startCampaignLevel(currentLevel + 1)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Next Level
                  </button>
                )}
                <button
                  onClick={showLevelSelect}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Level Select
                </button>
                <button
                  onClick={() => {
                    gameStateRef.current = "START";
                    setDisplayState("START");
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Menu
                </button>
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
              <div className="flex gap-3 flex-wrap justify-center">
                {gameMode === "campaign" && (
                  <button
                    onClick={() => startCampaignLevel(currentLevel)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Retry Level
                  </button>
                )}
                {gameMode === "endless" && (
                  <button
                    onClick={startEndlessMode}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Play Again
                  </button>
                )}
                <button
                  onClick={showLevelSelect}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Levels
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
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

          {config && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 max-w-[200px]">
              <div className="text-xs text-yellow-400 uppercase tracking-wider mb-1 font-bold">{config.name}</div>
              <div className="text-xs text-gray-400">{config.description}</div>
              {config.limitedRotations !== null && (
                <div className="text-xs text-orange-400 mt-2">Rotations: {rotationsLeftRef.current ?? config.limitedRotations}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-600">
        {displayState === "PLAYING" && (
          <>
            <p className="hidden md:block">Arrows to move, Space to drop, C to hold, P to pause</p>
            <p className="md:hidden">Swipe to move, swipe up to rotate, tap to drop</p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes levelup-anim {
          0% { transform: scale(0.3); opacity: 0; }
          15% { transform: scale(1.2); opacity: 1; }
          30% { transform: scale(1.0); opacity: 1; }
          80% { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-levelup {
          animation: levelup-anim 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
