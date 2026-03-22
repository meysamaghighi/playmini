"use client";

import { useEffect, useRef, useState } from "react";

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
      y: 0, // y=0 is ground level, negative is jumping
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

  // Constants
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 200;
  const GROUND_Y = 160;
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

    ctx.fillStyle = "#f7f7f7";

    if (isDucking) {
      // Ducking dino - lower profile
      ctx.fillRect(dino.x, dinoY, 40, 12); // body
      ctx.fillRect(dino.x + 35, dinoY + 5, 8, 8); // head
      ctx.fillRect(dino.x + 5, dinoY + 14, 8, 12); // front leg
      ctx.fillRect(dino.x + 25, dinoY + 14, 8, 12); // back leg
    } else {
      // Standing/jumping dino - T-Rex silhouette
      ctx.fillRect(dino.x, dinoY + 20, DINO_WIDTH, 24); // body
      ctx.fillRect(dino.x + 15, dinoY + 10, 12, 12); // head
      ctx.fillRect(dino.x + 5, dinoY + 24, 4, 8); // small arm top
      ctx.fillRect(dino.x + 5, dinoY + 32, 4, 8); // small arm bottom

      // Legs animate when running on ground
      const legOffset = dino.y === 0 ? (Math.floor(frameCount / 5) % 2) * 4 : 0;
      ctx.fillRect(dino.x + 2, dinoY + 44 - 12, 6, 12 - legOffset); // left leg
      ctx.fillRect(dino.x + 12, dinoY + 44 - 12, 6, 12 + legOffset); // right leg
    }
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    ctx.fillStyle = "#f7f7f7";
    if (obs.type === "cactus") {
      const cactusY = GROUND_Y - obs.height;
      ctx.fillRect(obs.x, cactusY, CACTUS_WIDTH, obs.height);
      // Add some cactus arms
      if (obs.height > 30) {
        ctx.fillRect(obs.x - 6, cactusY + 8, 6, 12);
        ctx.fillRect(obs.x + CACTUS_WIDTH, cactusY + 8, 6, 12);
      }
    } else {
      // Pterodactyl - flying at head height
      const pteroY = obs.height; // height stores y-position for ptero
      ctx.fillRect(obs.x, pteroY, PTERO_WIDTH, PTERO_HEIGHT);
      // Wings (simple animation)
      const wingFlap = Math.floor(gameStateRef.current.frameCount / 5) % 2;
      const wingY = wingFlap === 0 ? pteroY - 5 : pteroY + PTERO_HEIGHT;
      ctx.fillRect(obs.x + 5, wingY, 20, 5);
    }
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    const { groundOffset } = gameStateRef.current;
    ctx.strokeStyle = "#525252";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = -groundOffset;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const checkCollision = (): boolean => {
    const { dino, obstacles } = gameStateRef.current;
    const dinoHeight = dino.isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    const dinoRect = {
      x: dino.x + 2, // slight margin
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

    // Spawn obstacle every 90-150 frames (variable gap)
    const minGap = 90;
    const maxGap = 150;
    const gap = minGap + Math.random() * (maxGap - minGap);

    if (frameCount - lastObstacleSpawn > gap) {
      const obstacleType = Math.random() < 0.7 ? "cactus" : "ptero";

      if (obstacleType === "cactus") {
        // Cactus: variable height
        const heights = [30, 40, 50];
        obstacles.push({
          x: CANVAS_WIDTH,
          type: "cactus",
          height: heights[Math.floor(Math.random() * heights.length)],
        });
      } else {
        // Pterodactyl: flying at head height (needs ducking)
        obstacles.push({
          x: CANVAS_WIDTH,
          type: "ptero",
          height: GROUND_Y - DINO_HEIGHT - 10, // Just above dino head
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

    // Clear canvas
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Update frame count
    state.frameCount++;

    // Update score (1 point per frame, ~60fps = ~60 points/sec)
    state.score = Math.floor(state.frameCount / 6);
    setDisplayScore(state.score);

    // Check for milestone (every 100 points)
    if (state.score >= state.lastMilestone + 100) {
      state.lastMilestone = state.score;
      state.showMilestone = true;
      state.milestoneFrame = state.frameCount;
    }

    // Increase speed gradually
    state.speed = 5 + state.score / 100;

    // Update dino physics
    const { dino } = state;
    dino.velocityY += GRAVITY;
    dino.y += dino.velocityY;
    if (dino.y >= 0) {
      dino.y = 0;
      dino.velocityY = 0;
      dino.isJumping = false;
    }

    // Update ground
    state.groundOffset += state.speed;
    if (state.groundOffset > 20) state.groundOffset = 0;

    // Spawn obstacles
    spawnObstacle();

    // Update obstacles
    state.obstacles = state.obstacles.filter((obs) => {
      obs.x -= state.speed;
      return obs.x > -50; // remove off-screen obstacles
    });

    // Check collision
    if (checkCollision()) {
      state.gameOver = true;
      state.isRunning = false;
      setGameOver(true);

      // Update best score
      if (state.score > state.bestScore) {
        state.bestScore = state.score;
        setDisplayBest(state.score);
        localStorage.setItem("pb-dino", state.score.toString());
      }
      return;
    }

    // Draw everything
    drawGround(ctx);
    state.obstacles.forEach((obs) => drawObstacle(ctx, obs));
    drawDino(ctx);

    // Draw score
    ctx.fillStyle = "#f7f7f7";
    ctx.font = "16px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH - 10, 30);

    // Draw milestone flash
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

  // Touch handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    const state = gameStateRef.current;
    if (!state.isRunning && !state.gameOver) {
      startGame();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;

    const state = gameStateRef.current;
    if (!state.isRunning) return;

    // Swipe down = duck
    if (deltaY > 30) {
      duck(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const state = gameStateRef.current;
    if (!state.isRunning) return;

    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Tap or swipe up = jump
    if (deltaY < 30) {
      jump();
    }

    // Release duck
    duck(false);
    touchStartRef.current = null;
  };

  const shareScore = async () => {
    const text = `I scored ${displayScore} in Dino Runner! Can you beat my score? Play now: https://playmini.fun/dino-runner`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
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
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-700 rounded-lg max-w-full h-auto cursor-pointer"
          onClick={handleCanvasClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "none" }}
        />

        {/* Start Overlay */}
        {!gameStateRef.current.isRunning && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg">
            <div className="text-center text-white">
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
