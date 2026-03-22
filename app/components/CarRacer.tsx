"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Position = { x: number; y: number };
type ObstacleCar = { x: number; y: number; lane: number; color: string };
type Coin = { x: number; y: number; collected: boolean };

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const LANE_COUNT = 3;
const ROAD_WIDTH = 280;
const GRASS_WIDTH = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;
const CAR_WIDTH = 36;
const CAR_HEIGHT = 60;
const INITIAL_SPEED = 3;
const SPEED_INCREMENT = 0.0005;
const MAX_SPEED = 12;
const OBSTACLE_SPAWN_RATE = 0.012;
const COIN_SPAWN_RATE = 0.008;
const PLAYER_Y = CANVAS_HEIGHT - 100;

const OBSTACLE_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function CarRacer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayState, setDisplayState] = useState<"START" | "PLAYING" | "GAME_OVER">("START");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(false);

  const playerLaneRef = useRef(1); // 0, 1, or 2
  const roadOffsetRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const obstaclesRef = useRef<ObstacleCar[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const bestScoreRef = useRef(0);
  const gameStateRef = useRef<"START" | "PLAYING" | "GAME_OVER">("START");
  const gameLoopRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  useEffect(() => {
    const saved = localStorage.getItem("pb-car-racer");
    if (saved) {
      const val = parseInt(saved, 10);
      setBestScore(val);
      bestScoreRef.current = val;
    }
  }, []);

  const getLaneX = (lane: number) => {
    return GRASS_WIDTH + lane * LANE_WIDTH + LANE_WIDTH / 2;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Grass
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(0, 0, GRASS_WIDTH, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - GRASS_WIDTH, 0, GRASS_WIDTH, CANVAS_HEIGHT);

    // Road
    ctx.fillStyle = "#374151";
    ctx.fillRect(GRASS_WIDTH, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    // Lane markings (dashed white lines) - move downward to simulate driving forward
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -(roadOffsetRef.current % 40);

    for (let i = 1; i < LANE_COUNT; i++) {
      const x = GRASS_WIDTH + i * LANE_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Coins
    coinsRef.current.forEach((coin) => {
      if (!coin.collected) {
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Obstacle cars
    obstaclesRef.current.forEach((obs) => {
      const x = obs.x - CAR_WIDTH / 2;
      const y = obs.y - CAR_HEIGHT / 2;

      // Car body
      ctx.fillStyle = obs.color;
      ctx.fillRect(x, y, CAR_WIDTH, CAR_HEIGHT);

      // Windshield
      ctx.fillStyle = "rgba(100, 150, 200, 0.7)";
      ctx.fillRect(x + 4, y + 10, CAR_WIDTH - 8, 20);

      // Taillights
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(x + 4, y + CAR_HEIGHT - 8, 10, 6);
      ctx.fillRect(x + CAR_WIDTH - 14, y + CAR_HEIGHT - 8, 10, 6);
    });

    // Player car
    const playerX = getLaneX(playerLaneRef.current) - CAR_WIDTH / 2;
    const playerY = PLAYER_Y - CAR_HEIGHT / 2;

    // Player body
    ctx.fillStyle = "#10b981";
    ctx.fillRect(playerX, playerY, CAR_WIDTH, CAR_HEIGHT);

    // Player windshield
    ctx.fillStyle = "rgba(100, 150, 200, 0.7)";
    ctx.fillRect(playerX + 4, playerY + CAR_HEIGHT - 30, CAR_WIDTH - 8, 20);

    // Player headlights
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(playerX + 4, playerY + 4, 10, 8);
    ctx.fillRect(playerX + CAR_WIDTH - 14, playerY + 4, 10, 8);
  }, []);

  const spawnObstacle = () => {
    // Find lanes that already have a nearby obstacle (within danger zone)
    const dangerZone = CAR_HEIGHT * 2.5;
    const blockedLanes = new Set<number>();
    for (const obs of obstaclesRef.current) {
      if (obs.y < dangerZone) {
        blockedLanes.add(obs.lane);
      }
    }

    // Always keep at least one lane open
    const availableLanes = [0, 1, 2].filter((l) => !blockedLanes.has(l));
    if (availableLanes.length <= 1) return; // Don't spawn if only 1 lane is open

    // Pick a lane from the ones that are available (so we don't double-block)
    const lane = Math.random() < 0.5
      ? Math.floor(Math.random() * LANE_COUNT) // sometimes any lane
      : availableLanes[Math.floor(Math.random() * availableLanes.length)]; // prefer open lanes less

    // Re-check: would this block all lanes?
    const wouldBlock = new Set(blockedLanes);
    wouldBlock.add(lane);
    if (wouldBlock.size >= LANE_COUNT) return;

    const color = OBSTACLE_COLORS[Math.floor(Math.random() * OBSTACLE_COLORS.length)];
    obstaclesRef.current.push({
      x: getLaneX(lane),
      y: -CAR_HEIGHT / 2,
      lane,
      color,
    });
  };

  const spawnCoin = () => {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    coinsRef.current.push({
      x: getLaneX(lane),
      y: -20,
      collected: false,
    });
  };

  const checkCollision = useCallback(() => {
    const playerX = getLaneX(playerLaneRef.current);
    const playerY = PLAYER_Y;

    // Check obstacle collision
    for (const obs of obstaclesRef.current) {
      const dx = Math.abs(playerX - obs.x);
      const dy = Math.abs(playerY - obs.y);
      if (dx < CAR_WIDTH * 0.7 && dy < CAR_HEIGHT * 0.7) {
        return true;
      }
    }

    // Check coin collection
    for (const coin of coinsRef.current) {
      if (!coin.collected) {
        const dx = Math.abs(playerX - coin.x);
        const dy = Math.abs(playerY - coin.y);
        if (dx < 30 && dy < 30) {
          coin.collected = true;
          scoreRef.current += 10;
          setScore(scoreRef.current);
          setScoreFlash(true);
          setTimeout(() => setScoreFlash(false), 200);
          if (scoreRef.current > bestScoreRef.current) {
            bestScoreRef.current = scoreRef.current;
            setBestScore(scoreRef.current);
            localStorage.setItem("pb-car-racer", scoreRef.current.toString());
          }
        }
      }
    }

    return false;
  }, []);

  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== "PLAYING") {
      gameLoopRef.current = null;
      return;
    }

    // Update speed
    speedRef.current = Math.min(MAX_SPEED, INITIAL_SPEED + distanceRef.current * SPEED_INCREMENT);

    // Update road offset
    roadOffsetRef.current += speedRef.current;

    // Update distance and score
    distanceRef.current += speedRef.current;
    const newScore = Math.floor(distanceRef.current / 10);
    if (newScore > scoreRef.current) {
      scoreRef.current = newScore;
      setScore(scoreRef.current);
      if (scoreRef.current > bestScoreRef.current) {
        bestScoreRef.current = scoreRef.current;
        setBestScore(scoreRef.current);
        localStorage.setItem("pb-car-racer", scoreRef.current.toString());
      }
    }

    // Handle keyboard movement
    if (keysRef.current.left && playerLaneRef.current > 0) {
      playerLaneRef.current--;
      keysRef.current.left = false;
    }
    if (keysRef.current.right && playerLaneRef.current < LANE_COUNT - 1) {
      playerLaneRef.current++;
      keysRef.current.right = false;
    }

    // Spawn obstacles
    if (Math.random() < OBSTACLE_SPAWN_RATE) {
      spawnObstacle();
    }

    // Spawn coins
    if (Math.random() < COIN_SPAWN_RATE) {
      spawnCoin();
    }

    // Move obstacles
    obstaclesRef.current.forEach((obs) => {
      obs.y += speedRef.current;
    });

    // Move coins
    coinsRef.current.forEach((coin) => {
      coin.y += speedRef.current;
    });

    // Remove off-screen obstacles
    obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.y < CANVAS_HEIGHT + 50);
    coinsRef.current = coinsRef.current.filter((coin) => coin.y < CANVAS_HEIGHT + 50);

    // Check collision
    if (checkCollision()) {
      gameStateRef.current = "GAME_OVER";
      setDisplayState("GAME_OVER");
      gameLoopRef.current = null;
      draw();
      return;
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, checkCollision]);

  const startGame = useCallback(() => {
    playerLaneRef.current = 1;
    roadOffsetRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    obstaclesRef.current = [];
    coinsRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    setScore(0);
    keysRef.current = { left: false, right: false };
    gameStateRef.current = "PLAYING";
    setDisplayState("PLAYING");
    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, gameLoop]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== "PLAYING") return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (playerLaneRef.current > 0) {
          keysRef.current.left = true;
        }
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        if (playerLaneRef.current < LANE_COUNT - 1) {
          keysRef.current.right = true;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Touch controls
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (gameStateRef.current !== "PLAYING") return;
      e.preventDefault();
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameStateRef.current === "PLAYING") e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartXRef.current || gameStateRef.current !== "PLAYING") return;
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const touchX = e.changedTouches[0].clientX;
      const startX = touchStartXRef.current;
      const dx = touchX - startX;

      // Swipe detection
      if (Math.abs(dx) > 30) {
        if (dx > 0 && playerLaneRef.current < LANE_COUNT - 1) {
          playerLaneRef.current++;
        } else if (dx < 0 && playerLaneRef.current > 0) {
          playerLaneRef.current--;
        }
      } else {
        // Tap detection - left or right half
        const relativeX = touchX - rect.left;
        const centerX = rect.width / 2;
        if (relativeX < centerX && playerLaneRef.current > 0) {
          playerLaneRef.current--;
        } else if (relativeX > centerX && playerLaneRef.current < LANE_COUNT - 1) {
          playerLaneRef.current++;
        }
      }

      touchStartXRef.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => { draw(); }, [draw]);

  const handleShare = async () => {
    const text = `I scored ${scoreRef.current} in Car Racer! Can you beat me? https://playmini.fun/car-racer`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4" style={{ touchAction: "none" }}>
      {/* Score */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div className={`text-3xl font-black tabular-nums transition-all duration-150 ${
            scoreFlash ? "text-yellow-400 scale-125" : "text-blue-400"
          }`}>{score}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-3xl font-black text-amber-400 tabular-nums">{bestScore}</div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-2xl max-w-full h-auto"
          style={{ touchAction: "none" }}
        />

        {displayState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🏎️</div>
            <h2 className="text-3xl font-black text-blue-400 mb-2">Car Racer</h2>
            <p className="text-gray-400 mb-6 text-sm">Arrow keys or swipe to steer</p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {displayState === "GAME_OVER" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Score: {score}</p>
              {score >= bestScore && score > 0 && (
                <p className="text-yellow-400 text-sm font-bold mt-1">New Best!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-600">
        {displayState === "PLAYING" && <p>Collect coins for bonus points!</p>}
      </div>
    </div>
  );
}
