"use client";

import { useEffect, useRef, useState } from "react";
import DownloadButton from "./DownloadButton";

interface Obstacle {
  x: number;
  type: "cactus" | "ptero";
  height: number; // for cactus: height, for ptero: y-position
}

export default function DinoRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    isRunning: false,
    gameOver: false,
    score: 0,
    bestScore: 0,
    dino: {
      x: 50,
      y: 0,
      velocityY: 0,
      isDucking: false,
      isJumping: false,
    },
    obstacles: [] as Obstacle[],
    groundOffset: 0,
    speed: 5,
    lastObstacleSpawn: 0,
    frameCount: 0,
    lastMilestone: 0,
    showMilestone: false,
    milestoneFrame: 0,
  });

  const [displayScore, setDisplayScore] = useState(0);
  const [displayBest, setDisplayBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Game logic runs at 400x250, rendered at 2x (800x500)
  const SCALE = 2;
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 250;
  const RENDER_WIDTH = CANVAS_WIDTH * SCALE;
  const RENDER_HEIGHT = CANVAS_HEIGHT * SCALE;
  const GROUND_Y = 200;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const DINO_WIDTH = 20;
  const DINO_HEIGHT = 44;
  const DINO_DUCK_HEIGHT = 26;
  const CACTUS_WIDTH = 20;
  const PTERO_WIDTH = 30;
  const PTERO_HEIGHT = 20;

  useEffect(() => {
    const best = localStorage.getItem("pb-dino");
    if (best) {
      gameStateRef.current.bestScore = parseInt(best, 10);
      setDisplayBest(parseInt(best, 10));
    }
  }, []);

  const drawDino = (ctx: CanvasRenderingContext2D) => {
    const { dino, frameCount } = gameStateRef.current;
    const isDucking = dino.isDucking;
    const height = isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    const dinoY = GROUND_Y - height + dino.y;

    if (isDucking) {
      ctx.fillStyle = "#7ec850";
      ctx.fillRect(dino.x, dinoY, 40, 12);
      ctx.fillStyle = "#6ab43e";
      ctx.fillRect(dino.x, dinoY + 6, 40, 6);
      ctx.fillStyle = "#7ec850";
      ctx.fillRect(dino.x + 35, dinoY + 2, 10, 10);
      ctx.fillStyle = "#fff";
      ctx.fillRect(dino.x + 40, dinoY + 3, 3, 3);
      ctx.fillStyle = "#111";
      ctx.fillRect(dino.x + 41, dinoY + 4, 2, 2);
      ctx.fillStyle = "#5a9e30";
      ctx.fillRect(dino.x + 5, dinoY + 14, 8, 12);
      ctx.fillRect(dino.x + 25, dinoY + 14, 8, 12);
    } else {
      ctx.fillStyle = "#7ec850";
      ctx.fillRect(dino.x, dinoY + 18, DINO_WIDTH + 2, 26);
      ctx.fillStyle = "#6ab43e";
      ctx.fillRect(dino.x + 2, dinoY + 22, 3, 3);
      ctx.fillRect(dino.x + 8, dinoY + 20, 3, 3);
      ctx.fillRect(dino.x + 14, dinoY + 24, 3, 3);
      ctx.fillRect(dino.x + 6, dinoY + 30, 3, 3);
      ctx.fillRect(dino.x + 12, dinoY + 32, 3, 3);
      ctx.fillStyle = "#a8e080";
      ctx.fillRect(dino.x + 2, dinoY + 30, DINO_WIDTH - 4, 10);
      ctx.fillStyle = "#7ec850";
      ctx.fillRect(dino.x + 13, dinoY + 8, 14, 14);
      ctx.fillStyle = "#fff";
      ctx.fillRect(dino.x + 21, dinoY + 10, 4, 4);
      ctx.fillStyle = "#111";
      ctx.fillRect(dino.x + 23, dinoY + 11, 2, 2);
      ctx.fillStyle = "#5a9e30";
      ctx.fillRect(dino.x + 22, dinoY + 17, 6, 2);
      ctx.fillStyle = "#6ab43e";
      ctx.fillRect(dino.x + 4, dinoY + 24, 4, 6);
      ctx.fillStyle = "#5a9e30";
      const legOffset = dino.y === 0 ? (Math.floor(frameCount / 5) % 2) * 4 : 0;
      ctx.fillRect(dino.x + 2, dinoY + 44 - 12, 7, 12 - legOffset);
      ctx.fillRect(dino.x + 13, dinoY + 44 - 12, 7, 12 + legOffset);
      ctx.fillStyle = "#7ec850";
      ctx.fillRect(dino.x + 1, dinoY + 44 - legOffset, 8, 3);
      ctx.fillRect(dino.x + 12, dinoY + 44 + legOffset, 8, 3);
    }
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    if (obs.type === "cactus") {
      const cactusY = GROUND_Y - obs.height;
      ctx.fillStyle = "#2d8c3c";
      ctx.fillRect(obs.x + 4, cactusY, CACTUS_WIDTH - 8, obs.height);
      ctx.fillStyle = "#1e6e2c";
      ctx.fillRect(obs.x + 8, cactusY, 4, obs.height);
      ctx.fillStyle = "#3aaf50";
      for (let sy = cactusY + 4; sy < GROUND_Y - 4; sy += 8) {
        ctx.fillRect(obs.x + 3, sy, 2, 2);
        ctx.fillRect(obs.x + CACTUS_WIDTH - 5, sy + 4, 2, 2);
      }
      if (obs.height > 30) {
        ctx.fillStyle = "#2d8c3c";
        ctx.fillRect(obs.x - 4, cactusY + 8, 8, 6);
        ctx.fillRect(obs.x - 4, cactusY + 8, 4, 14);
        ctx.fillRect(obs.x + CACTUS_WIDTH - 4, cactusY + 12, 8, 6);
        ctx.fillRect(obs.x + CACTUS_WIDTH, cactusY + 12, 4, 14);
        ctx.fillStyle = "#3aaf50";
        ctx.fillRect(obs.x - 3, cactusY + 9, 2, 2);
        ctx.fillRect(obs.x + CACTUS_WIDTH + 1, cactusY + 13, 2, 2);
      }
      ctx.fillStyle = "#3aaf50";
      ctx.beginPath();
      ctx.arc(obs.x + CACTUS_WIDTH / 2, cactusY + 2, 6, Math.PI, 0);
      ctx.fill();
    } else {
      const pteroY = obs.height;
      const wingFlap = Math.floor(gameStateRef.current.frameCount / 5) % 2;
      ctx.fillStyle = "#8b5e3c";
      ctx.fillRect(obs.x + 8, pteroY + 4, 16, 12);
      ctx.fillStyle = "#a0704f";
      ctx.fillRect(obs.x + 22, pteroY + 4, 10, 8);
      ctx.fillStyle = "#d4a056";
      ctx.fillRect(obs.x + 30, pteroY + 6, 6, 4);
      ctx.fillStyle = "#fff";
      ctx.fillRect(obs.x + 26, pteroY + 5, 3, 3);
      ctx.fillStyle = "#111";
      ctx.fillRect(obs.x + 27, pteroY + 6, 2, 2);
      ctx.fillStyle = "#a0704f";
      if (wingFlap === 0) {
        ctx.fillRect(obs.x + 4, pteroY - 4, 22, 6);
        ctx.fillRect(obs.x, pteroY - 6, 8, 4);
      } else {
        ctx.fillRect(obs.x + 4, pteroY + 14, 22, 6);
        ctx.fillRect(obs.x, pteroY + 18, 8, 4);
      }
    }
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    const { groundOffset } = gameStateRef.current;
    ctx.strokeStyle = "#525252";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
    ctx.fillStyle = "#333";
    const seed = 42;
    for (let i = 0; i < 30; i++) {
      const px = ((i * 37 + seed) % CANVAS_WIDTH + CANVAS_WIDTH - groundOffset) % CANVAS_WIDTH;
      const py = GROUND_Y + 4 + ((i * 13 + seed) % 20);
      const sz = 1 + ((i * 7) % 3);
      ctx.fillRect(px, py, sz, sz);
    }
    ctx.fillStyle = "#3a3a3a";
    for (let i = 0; i < 6; i++) {
      const px = ((i * 83 + 17) % CANVAS_WIDTH + CANVAS_WIDTH - groundOffset * 0.5) % CANVAS_WIDTH;
      const py = GROUND_Y + 6 + ((i * 29) % 14);
      ctx.fillRect(px, py, 4, 3);
    }
  };

  const drawClouds = (ctx: CanvasRenderingContext2D) => {
    const { groundOffset } = gameStateRef.current;
    ctx.fillStyle = "#2a2a2a";
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 120 + 50) - groundOffset * 0.2 + CANVAS_WIDTH * 2) % CANVAS_WIDTH;
      const cy = 30 + i * 15;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.arc(cx + 14, cy - 4, 10, 0, Math.PI * 2);
      ctx.arc(cx + 24, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const checkCollision = (): boolean => {
    const { dino, obstacles } = gameStateRef.current;
    const dinoHeight = dino.isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    const dinoRect = {
      x: dino.x + 2,
      y: GROUND_Y - dinoHeight + dino.y + 2,
      width: DINO_WIDTH - 4,
      height: dinoHeight - 4,
    };

    for (const obs of obstacles) {
      let obsRect;
      if (obs.type === "cactus") {
        obsRect = {
          x: obs.x + 2,
          y: GROUND_Y - obs.height + 2,
          width: CACTUS_WIDTH - 4,
          height: obs.height - 4,
        };
      } else {
        obsRect = {
          x: obs.x + 2,
          y: obs.height + 2,
          width: PTERO_WIDTH - 4,
          height: PTERO_HEIGHT - 4,
        };
      }

      if (
        dinoRect.x < obsRect.x + obsRect.width &&
        dinoRect.x + dinoRect.width > obsRect.x &&
        dinoRect.y < obsRect.y + obsRect.height &&
        dinoRect.y + dinoRect.height > obsRect.y
      ) {
        return true;
      }
    }
    return false;
  };

  const spawnObstacle = () => {
    const { obstacles, frameCount, lastObstacleSpawn } = gameStateRef.current;
    const minGap = 90;
    const maxGap = 150;
    const gap = minGap + Math.random() * (maxGap - minGap);

    if (frameCount - lastObstacleSpawn > gap) {
      const obstacleType = Math.random() < 0.7 ? "cactus" : "ptero";

      if (obstacleType === "cactus") {
        const heights = [30, 40, 50];
        obstacles.push({
          x: CANVAS_WIDTH,
          type: "cactus",
          height: heights[Math.floor(Math.random() * heights.length)],
        });
      } else {
        obstacles.push({
          x: CANVAS_WIDTH,
          type: "ptero",
          height: GROUND_Y - DINO_HEIGHT - 10,
        });
      }

      gameStateRef.current.lastObstacleSpawn = frameCount;
    }
  };

  const jump = () => {
    const { dino } = gameStateRef.current;
    if (dino.y === 0 && !dino.isDucking) {
      dino.velocityY = JUMP_FORCE;
      dino.isJumping = true;
    }
  };

  const duck = (isDucking: boolean) => {
    const { dino } = gameStateRef.current;
    if (!dino.isJumping) {
      dino.isDucking = isDucking;
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    if (!state.isRunning || state.gameOver) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
    ctx.scale(SCALE, SCALE);

    state.frameCount++;
    state.score = Math.floor(state.frameCount / 6);
    setDisplayScore(state.score);

    if (state.score >= state.lastMilestone + 100) {
      state.lastMilestone = state.score;
      state.showMilestone = true;
      state.milestoneFrame = state.frameCount;
    }

    state.speed = 5 + state.score / 100;

    const { dino } = state;
    dino.velocityY += GRAVITY;
    dino.y += dino.velocityY;
    if (dino.y >= 0) {
      dino.y = 0;
      dino.velocityY = 0;
      dino.isJumping = false;
    }

    state.groundOffset += state.speed;
    if (state.groundOffset > 20) state.groundOffset = 0;

    spawnObstacle();

    state.obstacles = state.obstacles.filter((obs) => {
      obs.x -= state.speed;
      return obs.x > -50;
    });

    if (checkCollision()) {
      state.gameOver = true;
      state.isRunning = false;
      setGameOver(true);

      if (state.score > state.bestScore) {
        state.bestScore = state.score;
        setDisplayBest(state.score);
        localStorage.setItem("pb-dino", state.score.toString());
      }
      return;
    }

    drawClouds(ctx);
    drawGround(ctx);
    state.obstacles.forEach((obs) => drawObstacle(ctx, obs));
    drawDino(ctx);

    ctx.fillStyle = "#f7f7f7";
    ctx.font = "16px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH - 10, 30);

    if (state.showMilestone && state.frameCount - state.milestoneFrame < 30) {
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.fillText(`${state.lastMilestone}!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    } else if (state.showMilestone) {
      state.showMilestone = false;
    }

    requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    const state = gameStateRef.current;
    state.isRunning = true;
    state.gameOver = false;
    state.score = 0;
    state.frameCount = 0;
    state.lastObstacleSpawn = 0;
    state.lastMilestone = 0;
    state.showMilestone = false;
    state.dino.y = 0;
    state.dino.velocityY = 0;
    state.dino.isDucking = false;
    state.dino.isJumping = false;
    state.obstacles = [];
    state.groundOffset = 0;
    state.speed = 5;
    setDisplayScore(0);
    setGameOver(false);
    setStarted(true);
    requestAnimationFrame(gameLoop);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const state = gameStateRef.current;

    if (!state.isRunning && !state.gameOver) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        startGame();
      }
      return;
    }

    if (!state.isRunning) return;

    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      jump();
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      duck(true);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === "ArrowDown") {
      e.preventDefault();
      duck(false);
    }
  };

  const handleCanvasClick = () => {
    const state = gameStateRef.current;
    if (!state.isRunning && !state.gameOver) {
      startGame();
    } else if (state.isRunning) {
      jump();
    }
  };

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };

      const state = gameStateRef.current;
      if (!state.isRunning && !state.gameOver) {
        startGame();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;

      const state = gameStateRef.current;
      if (!state.isRunning) return;

      if (deltaY > 30) {
        duck(true);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current) return;

      const state = gameStateRef.current;
      if (!state.isRunning) return;

      const touch = e.changedTouches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (deltaY < 30) {
        jump();
      }

      duck(false);
      touchStartRef.current = null;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const shareScore = async () => {
    const text = `I scored ${displayScore} in Dino Runner! Can you beat my score? Play now: https://playmini.fun/dino-runner`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Score copied to clipboard!");
      } catch (err) {
        alert("Failed to copy score");
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score Display */}
      <div className="flex gap-8 text-lg font-mono">
        <div>
          Score: <span className="font-bold">{displayScore}</span>
        </div>
        <div>
          Best: <span className="font-bold text-yellow-400">{displayBest}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full" style={{ maxWidth: "800px" }}>
        <canvas
          ref={canvasRef}
          width={RENDER_WIDTH}
          height={RENDER_HEIGHT}
          className="border-2 border-gray-700 rounded-lg w-full cursor-pointer"
          onClick={handleCanvasClick}
          style={{ touchAction: "none" }}
        />

        {/* Start Overlay */}
        {!started && !gameOver && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg cursor-pointer"
            onClick={startGame}
            onTouchEnd={(e) => { e.preventDefault(); startGame(); }}
          >
            <div className="text-center text-white pointer-events-none">
              <p className="text-xl font-bold mb-2">Press Space or Tap to Start</p>
              <p className="text-sm text-gray-300">↑/Space: Jump | ↓: Duck</p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-lg">
            <div className="text-center text-white">
              <p className="text-2xl font-bold mb-2">Game Over!</p>
              <p className="text-lg mb-1">Score: {displayScore}</p>
              <p className="text-sm text-yellow-400 mb-4">Best: {displayBest}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={shareScore}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
                >
                  Share
                </button>
                <DownloadButton canvasRef={canvasRef} filename="dino-score" label="Save" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="text-sm text-gray-400 text-center">
        <p className="font-semibold mb-1">Controls:</p>
        <p>Desktop: Arrow Keys or Space | Mobile: Tap to Jump, Swipe Down to Duck</p>
      </div>
    </div>
  );
}
