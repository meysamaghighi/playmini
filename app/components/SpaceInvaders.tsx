"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Alien = {
  x: number;
  y: number;
  alive: boolean;
};

type Bullet = {
  x: number;
  y: number;
};

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const ALIEN_WIDTH = 30;
const ALIEN_HEIGHT = 25;
const ALIEN_ROWS = 5;
const ALIEN_COLS = 11;
const ALIEN_SPACING = 50;
const BULLET_SPEED = 8;
const PLAYER_SPEED = 6;

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const playerXRef = useRef(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
  const aliensRef = useRef<Alien[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const alienBulletsRef = useRef<Bullet[]>([]);
  const alienDirectionRef = useRef(1);
  const alienSpeedRef = useRef(1);
  const alienMoveCountRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const lastShotTimeRef = useRef(0);
  const lastAlienShotRef = useRef(0);

  const initAliens = useCallback(() => {
    const aliens: Alien[] = [];
    const startX = (CANVAS_WIDTH - (ALIEN_COLS * ALIEN_SPACING)) / 2;
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        aliens.push({
          x: startX + col * ALIEN_SPACING,
          y: 60 + row * ALIEN_SPACING,
          alive: true,
        });
      }
    }
    return aliens;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0a0a1f";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 0; i < 50; i++) {
      const x = (i * 137) % CANVAS_WIDTH;
      const y = (i * 211) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 2, 2);
    }

    // Player
    const px = playerXRef.current;
    const py = CANVAS_HEIGHT - 60;
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(px, py, PLAYER_WIDTH, PLAYER_HEIGHT);
    // Cockpit
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(px + 10, py + 5, 20, 10);

    // Aliens
    aliensRef.current.forEach((alien) => {
      if (!alien.alive) return;
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(alien.x, alien.y, ALIEN_WIDTH, ALIEN_HEIGHT);
      // Eyes
      ctx.fillStyle = "#fff";
      ctx.fillRect(alien.x + 5, alien.y + 8, 6, 6);
      ctx.fillRect(alien.x + 19, alien.y + 8, 6, 6);
      ctx.fillStyle = "#000";
      ctx.fillRect(alien.x + 7, alien.y + 10, 3, 3);
      ctx.fillRect(alien.x + 21, alien.y + 10, 3, 3);
    });

    // Player bullets
    ctx.fillStyle = "#22c55e";
    bulletsRef.current.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, 4, 12);
    });

    // Alien bullets
    ctx.fillStyle = "#ef4444";
    alienBulletsRef.current.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, 4, 12);
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== "playing") {
      gameLoopRef.current = null;
      return;
    }

    // Move player
    if (keysRef.current["ArrowLeft"] || keysRef.current["a"]) {
      playerXRef.current = Math.max(0, playerXRef.current - PLAYER_SPEED);
    }
    if (keysRef.current["ArrowRight"] || keysRef.current["d"]) {
      playerXRef.current = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, playerXRef.current + PLAYER_SPEED);
    }

    // Shoot
    const now = Date.now();
    if (keysRef.current[" "] && now - lastShotTimeRef.current > 300) {
      bulletsRef.current.push({
        x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
        y: CANVAS_HEIGHT - 70,
      });
      lastShotTimeRef.current = now;
    }

    // Move bullets
    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      bullet.y -= BULLET_SPEED;
      return bullet.y > 0;
    });

    // Move alien bullets
    alienBulletsRef.current = alienBulletsRef.current.filter((bullet) => {
      bullet.y += BULLET_SPEED - 2;
      return bullet.y < CANVAS_HEIGHT;
    });

    // Move aliens
    alienMoveCountRef.current++;
    if (alienMoveCountRef.current % Math.max(10, 30 - alienSpeedRef.current) === 0) {
      const aliens = aliensRef.current;
      let hitEdge = false;

      for (const alien of aliens) {
        if (!alien.alive) continue;
        alien.x += alienDirectionRef.current * 10;
        if (alien.x <= 0 || alien.x >= CANVAS_WIDTH - ALIEN_WIDTH) {
          hitEdge = true;
        }
      }

      if (hitEdge) {
        alienDirectionRef.current *= -1;
        for (const alien of aliens) {
          if (alien.alive) alien.y += 20;
        }
      }
    }

    // Alien shooting
    if (now - lastAlienShotRef.current > 1000) {
      const aliveAliens = aliensRef.current.filter((a) => a.alive);
      if (aliveAliens.length > 0) {
        const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        alienBulletsRef.current.push({
          x: shooter.x + ALIEN_WIDTH / 2 - 2,
          y: shooter.y + ALIEN_HEIGHT,
        });
        lastAlienShotRef.current = now;
      }
    }

    // Collision: bullets vs aliens
    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      for (const alien of aliensRef.current) {
        if (
          alien.alive &&
          bullet.x >= alien.x &&
          bullet.x <= alien.x + ALIEN_WIDTH &&
          bullet.y >= alien.y &&
          bullet.y <= alien.y + ALIEN_HEIGHT
        ) {
          alien.alive = false;
          scoreRef.current += 10;
          setScore(scoreRef.current);
          alienSpeedRef.current = Math.min(20, alienSpeedRef.current + 0.5);
          return false;
        }
      }
      return true;
    });

    // Collision: alien bullets vs player
    const px = playerXRef.current;
    const py = CANVAS_HEIGHT - 60;
    for (const bullet of alienBulletsRef.current) {
      if (
        bullet.x >= px &&
        bullet.x <= px + PLAYER_WIDTH &&
        bullet.y >= py &&
        bullet.y <= py + PLAYER_HEIGHT
      ) {
        livesRef.current--;
        setLives(livesRef.current);
        alienBulletsRef.current = [];
        if (livesRef.current <= 0) {
          setGameState("gameover");
          gameLoopRef.current = null;
          draw();
          return;
        }
        break;
      }
    }

    // Check win
    const anyAlive = aliensRef.current.some((a) => a.alive);
    if (!anyAlive) {
      setGameState("gameover");
      gameLoopRef.current = null;
      draw();
      return;
    }

    // Check loss (aliens reached bottom)
    for (const alien of aliensRef.current) {
      if (alien.alive && alien.y + ALIEN_HEIGHT >= CANVAS_HEIGHT - 80) {
        setGameState("gameover");
        gameLoopRef.current = null;
        draw();
        return;
      }
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw]);

  const startGame = useCallback(() => {
    playerXRef.current = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    aliensRef.current = initAliens();
    bulletsRef.current = [];
    alienBulletsRef.current = [];
    alienDirectionRef.current = 1;
    alienSpeedRef.current = 1;
    alienMoveCountRef.current = 0;
    scoreRef.current = 0;
    livesRef.current = 3;
    lastShotTimeRef.current = 0;
    lastAlienShotRef.current = 0;
    setScore(0);
    setLives(3);
    setGameState("playing");
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [initAliens, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowleft", "arrowright", " ", "a", "d"].includes(key)) {
        e.preventDefault();
        keysRef.current[key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleShare = async () => {
    const text = `I scored ${scoreRef.current} in Space Invaders! Can you beat me? https://playmini.fun/space-invaders`;
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

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div className="text-3xl font-black text-green-400 tabular-nums">{score}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
          <div className="text-3xl font-black text-red-400 tabular-nums">{lives}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-2xl max-w-full h-auto border border-gray-800"
        />

        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">👾</div>
            <h2 className="text-3xl font-black text-red-400 mb-2">Space Invaders</h2>
            <p className="text-gray-400 mb-6 text-sm">Arrow keys to move, Space to shoot</p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Score: {score}</p>
              <p className="text-gray-400 text-sm">
                {aliensRef.current.every((a) => !a.alive) ? "You won! 🎉" : "Better luck next time!"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="space-invaders-score" label="Save" />
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-600">
        <p>Arrow keys or A/D to move • Space to shoot</p>
      </div>
    </div>
  );
}
