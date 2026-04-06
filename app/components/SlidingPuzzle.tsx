"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Tile = number | null; // null represents empty space
type PowerUpType = "shuffle" | "peek" | "undo" | "freeze";

type PowerUp = {
  type: PowerUpType;
  count: number;
};

type Move = {
  tiles: Tile[];
  emptyIndex: number;
};

type LevelConfig = {
  level: number;
  name: string;
  gridSize: number; // 3 = 3x3 (8-puzzle), 4 = 4x4 (15-puzzle), 5 = 5x5 (24-puzzle)
  moveLimit: number | null; // null = unlimited
  timeLimit: number | null; // null = unlimited (seconds)
  blindMode?: boolean; // tiles become invisible
  targetScore: number; // minimum score to complete level
};

// Level configurations with progressive difficulty
const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, name: "Baby Steps", gridSize: 3, moveLimit: 50, timeLimit: null, targetScore: 100 },
  { level: 2, name: "Getting Started", gridSize: 3, moveLimit: 35, timeLimit: null, targetScore: 150 },
  { level: 3, name: "Standard Puzzle", gridSize: 4, moveLimit: 120, timeLimit: null, targetScore: 200 },
  { level: 4, name: "Time Pressure", gridSize: 4, moveLimit: 100, timeLimit: 180, targetScore: 300 },
  { level: 5, name: "Speed Challenge", gridSize: 4, moveLimit: 80, timeLimit: 120, targetScore: 400 },
  { level: 6, name: "Big Board", gridSize: 5, moveLimit: 200, timeLimit: null, targetScore: 500 },
  { level: 7, name: "Blind Faith", gridSize: 4, moveLimit: 100, timeLimit: 150, blindMode: true, targetScore: 600 },
  { level: 8, name: "Expert Grid", gridSize: 5, moveLimit: 180, timeLimit: 240, targetScore: 750 },
  { level: 9, name: "Master Trial", gridSize: 5, moveLimit: 150, timeLimit: 180, targetScore: 900 },
  { level: 10, name: "Ultimate Challenge", gridSize: 5, moveLimit: 120, timeLimit: 150, targetScore: 1200 },
];

// Scoring: fewer moves and faster time = higher score
const calculateScore = (moves: number, timeSeconds: number, config: LevelConfig): number => {
  const gridBonus = config.gridSize * 50;
  const moveEfficiency = Math.max(0, (config.moveLimit || 200) - moves) * 5;
  const timeEfficiency = config.timeLimit ? Math.max(0, config.timeLimit - timeSeconds) * 2 : 100;
  const blindBonus = config.blindMode ? 200 : 0;

  return gridBonus + moveEfficiency + timeEfficiency + blindBonus;
};

export default function SlidingPuzzle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<"start" | "playing" | "levelComplete" | "gameover">("start");
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [totalScore, setTotalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [campaignProgress, setCampaignProgress] = useState(1);

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: "shuffle", count: 3 },
    { type: "peek", count: 2 },
    { type: "undo", count: 2 },
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const movesRef = useRef(0);
  const timeRef = useRef(0);
  const gameStateRef = useRef<"start" | "playing" | "levelComplete" | "gameover">("start");
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const totalScoreRef = useRef(0);
  const moveHistoryRef = useRef<Move[]>([]);
  const peekActiveRef = useRef(false);
  const peekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blindModeActiveRef = useRef(false);
  const levelUpFlashRef = useRef(0);
  const tilesRef = useRef<Tile[]>([]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("pb-sliding-puzzle-score");
    if (savedHighScore) {
      const score = parseInt(savedHighScore, 10);
      setHighScore(score);
    }

    const savedProgress = localStorage.getItem("pb-sliding-puzzle-progress");
    if (savedProgress) {
      const progress = parseInt(savedProgress, 10);
      setCampaignProgress(progress);
    }
  }, []);

  const isSolvable = useCallback((tiles: Tile[], gridSize: number): boolean => {
    let inversions = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === null) continue;
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[j] === null) continue;
        if (tiles[i]! > tiles[j]!) inversions++;
      }
    }

    // For odd grid size, inversions must be even
    if (gridSize % 2 === 1) {
      return inversions % 2 === 0;
    }

    // For even grid size, inversions + row of empty space (from bottom) must be odd
    const emptyIndex = tiles.indexOf(null);
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyRowFromBottom = gridSize - emptyRow;
    return (inversions + emptyRowFromBottom) % 2 === 1;
  }, []);

  const shuffle = useCallback((gridSize: number) => {
    const totalTiles = gridSize * gridSize;
    let shuffled: Tile[];
    let attempts = 0;

    do {
      shuffled = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
      shuffled.push(null);

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      attempts++;
    } while ((!isSolvable(shuffled, gridSize) || isSolved(shuffled, gridSize)) && attempts < 100);

    return shuffled;
  }, [isSolvable]);

  const isSolved = useCallback((tiles: Tile[], gridSize: number): boolean => {
    const totalTiles = gridSize * gridSize;
    for (let i = 0; i < totalTiles - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[totalTiles - 1] === null;
  }, []);

  const startLevel = useCallback((lvl: number) => {
    const config = LEVEL_CONFIGS[Math.min(lvl - 1, LEVEL_CONFIGS.length - 1)];
    const newTiles = shuffle(config.gridSize);

    setTiles(newTiles);
    tilesRef.current = newTiles;
    setMoves(0);
    movesRef.current = 0;
    setTime(0);
    timeRef.current = 0;
    moveHistoryRef.current = [];
    peekActiveRef.current = false;
    blindModeActiveRef.current = config.blindMode || false;
    levelUpFlashRef.current = 0;

    setLevel(lvl);
    levelRef.current = lvl;
    setGameState("playing");
    gameStateRef.current = "playing";

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (gameStateRef.current === "playing") {
        timeRef.current++;
        setTime(timeRef.current);

        // Check time limit
        if (config.timeLimit && timeRef.current >= config.timeLimit) {
          loseLife();
        }
      }
    }, 1000);
  }, [shuffle]);

  const loseLife = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    livesRef.current--;
    setLives(livesRef.current);

    if (livesRef.current <= 0) {
      gameStateRef.current = "gameover";
      setGameState("gameover");

      if (totalScoreRef.current > highScore) {
        setHighScore(totalScoreRef.current);
        localStorage.setItem("pb-sliding-puzzle-score", totalScoreRef.current.toString());
      }
    } else {
      // Restart level with remaining lives
      startLevel(levelRef.current);
    }
  }, [highScore, startLevel]);

  const moveTile = useCallback((index: number) => {
    if (gameStateRef.current !== "playing") return;

    const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, LEVEL_CONFIGS.length - 1)];
    const gridSize = config.gridSize;
    const currentTiles = tilesRef.current;
    const emptyIndex = currentTiles.indexOf(null);

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    // Check if adjacent
    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (!isAdjacent) return;

    // Save to history for undo
    moveHistoryRef.current.push({
      tiles: [...currentTiles],
      emptyIndex: emptyIndex,
    });

    const newTiles = [...currentTiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

    setTiles(newTiles);
    tilesRef.current = newTiles;

    movesRef.current++;
    setMoves(movesRef.current);

    // Check move limit
    if (config.moveLimit && movesRef.current >= config.moveLimit) {
      loseLife();
      return;
    }

    // Check if solved
    if (isSolved(newTiles, gridSize)) {
      if (timerRef.current) clearInterval(timerRef.current);

      const levelScore = calculateScore(movesRef.current, timeRef.current, config);
      totalScoreRef.current += levelScore;
      setTotalScore(totalScoreRef.current);

      gameStateRef.current = "levelComplete";
      setGameState("levelComplete");

      // Update campaign progress
      if (levelRef.current === campaignProgress && levelRef.current < LEVEL_CONFIGS.length) {
        const newProgress = campaignProgress + 1;
        setCampaignProgress(newProgress);
        localStorage.setItem("pb-sliding-puzzle-progress", newProgress.toString());
      }

      // Update high score
      if (totalScoreRef.current > highScore) {
        setHighScore(totalScoreRef.current);
        localStorage.setItem("pb-sliding-puzzle-score", totalScoreRef.current.toString());
      }
    }
  }, [isSolved, loseLife, campaignProgress, highScore]);

  const usePowerUp = useCallback((type: PowerUpType) => {
    if (gameStateRef.current !== "playing") return;

    const powerUpIndex = powerUps.findIndex(p => p.type === type && p.count > 0);
    if (powerUpIndex === -1) return;

    const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, LEVEL_CONFIGS.length - 1)];
    const gridSize = config.gridSize;

    if (type === "shuffle") {
      // Shuffle tiles around empty space
      const emptyIndex = tilesRef.current.indexOf(null);
      const row = Math.floor(emptyIndex / gridSize);
      const col = emptyIndex % gridSize;

      const neighbors: number[] = [];
      if (row > 0) neighbors.push((row - 1) * gridSize + col);
      if (row < gridSize - 1) neighbors.push((row + 1) * gridSize + col);
      if (col > 0) neighbors.push(row * gridSize + (col - 1));
      if (col < gridSize - 1) neighbors.push(row * gridSize + (col + 1));

      // Shuffle neighbors
      for (let i = neighbors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const newTiles = [...tilesRef.current];
        [newTiles[neighbors[i]], newTiles[neighbors[j]]] = [newTiles[neighbors[j]], newTiles[neighbors[i]]];
        setTiles(newTiles);
        tilesRef.current = newTiles;
      }
    } else if (type === "peek") {
      // Show solved state briefly
      peekActiveRef.current = true;

      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = setTimeout(() => {
        peekActiveRef.current = false;
        draw();
      }, 2000);
    } else if (type === "undo") {
      // Undo last move
      if (moveHistoryRef.current.length > 0) {
        const lastMove = moveHistoryRef.current.pop()!;
        setTiles(lastMove.tiles);
        tilesRef.current = lastMove.tiles;

        movesRef.current = Math.max(0, movesRef.current - 1);
        setMoves(movesRef.current);
      }
    }

    // Decrement power-up count
    const newPowerUps = [...powerUps];
    newPowerUps[powerUpIndex].count--;
    setPowerUps(newPowerUps);
  }, [powerUps]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, LEVEL_CONFIGS.length - 1)];
    const gridSize = config.gridSize;
    const cellSize = 500 / gridSize;
    const gap = 4;
    const tileSize = cellSize - gap;

    // Background
    ctx.fillStyle = "#0a0a1f";
    ctx.fillRect(0, 0, 500, 500);

    // Grid lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, 500);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(500, i * cellSize);
      ctx.stroke();
    }

    // Draw tiles
    const currentTiles = peekActiveRef.current ?
      ([...Array.from({ length: gridSize * gridSize - 1 }, (_, i) => i + 1), null] as (number | null)[]) :
      tilesRef.current;

    currentTiles.forEach((tile, index) => {
      if (tile === null) return;

      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = col * cellSize + gap / 2;
      const y = row * cellSize + gap / 2;

      // Tile background gradient
      const gradient = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      if (peekActiveRef.current) {
        gradient.addColorStop(0, "#10b981");
        gradient.addColorStop(1, "#059669");
      } else {
        gradient.addColorStop(0, "#3b82f6");
        gradient.addColorStop(1, "#1e40af");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Border
      ctx.strokeStyle = peekActiveRef.current ? "#34d399" : "#60a5fa";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, tileSize, tileSize);

      // Tile number (or hidden in blind mode)
      if (blindModeActiveRef.current && !peekActiveRef.current && Math.random() > 0.3) {
        // Show only some tiles in blind mode
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(x, y, tileSize, tileSize);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${tileSize * 0.4}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tile.toString(), x + tileSize / 2, y + tileSize / 2);
      }
    });

    // Level-up flash
    if (levelUpFlashRef.current > 0) {
      levelUpFlashRef.current--;
      const alpha = Math.min(1, levelUpFlashRef.current / 30);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`LEVEL ${levelRef.current}`, 250, 200);
      ctx.font = "24px monospace";
      ctx.fillText(config.name, 250, 260);
      ctx.restore();
    }
  }, []);

  const nextLevel = useCallback(() => {
    if (levelRef.current >= LEVEL_CONFIGS.length) {
      // Start endless mode or loop back
      levelRef.current = 1;
    } else {
      levelRef.current++;
    }

    levelUpFlashRef.current = 60; // 1 second flash
    startLevel(levelRef.current);
  }, [startLevel]);

  const restartCampaign = useCallback(() => {
    levelRef.current = 1;
    livesRef.current = 3;
    totalScoreRef.current = 0;

    setLevel(1);
    setLives(3);
    setTotalScore(0);
    setPowerUps([
      { type: "shuffle", count: 3 },
      { type: "peek", count: 2 },
      { type: "undo", count: 2 },
    ]);

    startLevel(1);
  }, [startLevel]);

  useEffect(() => {
    draw();
    const interval = setInterval(draw, 100); // Redraw for animations
    return () => clearInterval(interval);
  }, [draw]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    };
  }, []);

  const handleShare = async () => {
    const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, LEVEL_CONFIGS.length - 1)];
    const text = `I reached Level ${levelRef.current} (${config.name}) with ${totalScoreRef.current} points in Sliding Puzzle! https://playmini.fun/sliding-puzzle`;
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

  const currentConfig = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      {/* Stats Display */}
      <div className="flex gap-4 text-center flex-wrap justify-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
          <div className="text-2xl font-black text-blue-400 tabular-nums">{level}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div className="text-2xl font-black text-green-400 tabular-nums">{totalScore}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-2xl font-black text-yellow-400 tabular-nums">{highScore}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
          <div className="text-2xl font-black text-red-400 tabular-nums">{"❤️".repeat(lives)}</div>
        </div>
      </div>

      {/* Level Info */}
      {gameState === "playing" && (
        <div className="flex gap-3 text-sm text-gray-400 flex-wrap justify-center">
          <div>
            <span className="text-gray-500">Moves:</span>{" "}
            <span className={movesRef.current >= (currentConfig.moveLimit || 999) * 0.8 ? "text-red-400 font-bold" : "text-white"}>
              {moves}
            </span>
            {currentConfig.moveLimit && <span className="text-gray-600"> / {currentConfig.moveLimit}</span>}
          </div>
          <div>
            <span className="text-gray-500">Time:</span>{" "}
            <span className={time >= (currentConfig.timeLimit || 9999) * 0.8 ? "text-red-400 font-bold" : "text-white"}>
              {time}s
            </span>
            {currentConfig.timeLimit && <span className="text-gray-600"> / {currentConfig.timeLimit}s</span>}
          </div>
          {currentConfig.blindMode && <span className="text-purple-400 font-bold">👻 BLIND MODE</span>}
        </div>
      )}

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="rounded-2xl max-w-full h-auto border border-gray-800 cursor-pointer"
          onClick={(e) => {
            if (gameState !== "playing") return;
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const scaleX = 500 / rect.width;
            const scaleY = 500 / rect.height;
            const gridX = Math.floor((x * scaleX) / (500 / currentConfig.gridSize));
            const gridY = Math.floor((y * scaleY) / (500 / currentConfig.gridSize));
            const index = gridY * currentConfig.gridSize + gridX;

            moveTile(index);
          }}
        />

        {/* Start Screen */}
        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🧩</div>
            <h2 className="text-3xl font-black text-blue-400 mb-2">Sliding Puzzle</h2>
            <p className="text-gray-400 mb-2 text-sm">10 campaign levels + power-ups</p>
            <p className="text-gray-500 mb-4 text-xs">3x3 → 4x4 → 5x5 grids</p>
            {highScore > 0 && (
              <p className="text-yellow-400 mb-4 text-sm font-bold">High Score: {highScore}</p>
            )}
            {campaignProgress > 1 && (
              <p className="text-green-400 mb-4 text-sm">Campaign Progress: Level {campaignProgress}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={restartCampaign}
                className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
              >
                Start Campaign
              </button>
              {campaignProgress > 1 && (
                <button
                  onClick={() => startLevel(campaignProgress)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Continue (Lvl {campaignProgress})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Level Complete */}
        {gameState === "levelComplete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-green-400 mb-4">Level Complete!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Level {level}: {currentConfig.name}</p>
              <p className="text-gray-300 text-md">Moves: {moves} | Time: {time}s</p>
              <p className="text-green-400 text-xl font-bold mt-2">
                +{calculateScore(moves, time, currentConfig)} points
              </p>
              <p className="text-yellow-400 text-md">Total: {totalScore}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={nextLevel}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                {level >= LEVEL_CONFIGS.length ? "Play Again" : "Next Level"}
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="sliding-puzzle-victory" label="Save" />
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Reached Level {level}</p>
              <p className="text-white text-md">Total Score: {totalScore}</p>
              <p className="text-yellow-400 text-md font-bold">Best: {highScore}</p>
              {totalScore === highScore && totalScore > 0 && (
                <p className="text-green-400 text-sm mt-2">New High Score!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={restartCampaign}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="sliding-puzzle-score" label="Save" />
            </div>
          </div>
        )}
      </div>

      {/* Power-ups */}
      {gameState === "playing" && (
        <div className="flex gap-2 flex-wrap justify-center max-w-md">
          <button
            onClick={() => usePowerUp("shuffle")}
            disabled={!powerUps.find(p => p.type === "shuffle")?.count}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 text-sm"
          >
            🔀 Shuffle ({powerUps.find(p => p.type === "shuffle")?.count || 0})
          </button>
          <button
            onClick={() => usePowerUp("peek")}
            disabled={!powerUps.find(p => p.type === "peek")?.count}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 text-sm"
          >
            👁️ Peek ({powerUps.find(p => p.type === "peek")?.count || 0})
          </button>
          <button
            onClick={() => usePowerUp("undo")}
            disabled={!powerUps.find(p => p.type === "undo")?.count || moveHistoryRef.current.length === 0}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 text-sm"
          >
            ↩️ Undo ({powerUps.find(p => p.type === "undo")?.count || 0})
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-xs text-gray-600 max-w-md">
        <p>Click on a tile next to the empty space to slide it</p>
        <p className="mt-1">Complete all 10 levels with 3 lives</p>
        <p className="mt-1 text-gray-500">
          Power-ups: Shuffle nearby tiles • Peek at solution • Undo moves
        </p>
      </div>
    </div>
  );
}
