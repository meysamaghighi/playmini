"use client";

import { useEffect, useRef, useState } from "react";
import DownloadButton from "./DownloadButton";

interface Brick {
  x: number;
  y: number;
  color: string;
  points: number;
  visible: boolean;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    isRunning: false,
    gameOver: false,
    score: 0,
    bestScore: 0,
    lives: 3,
    level: 1,
    paddle: {
      x: 350,
      y: 550,
      width: 100,
      height: 12,
      speed: 8,
    },
    ball: {
      x: 400,
      y: 500,
      radius: 6,
      velocityX: 4,
      velocityY: -4,
      launched: false,
    },
    bricks: [] as Brick[],
    keys: {
      left: false,
      right: false,
    },
    touchX: null as number | null,
  });

  const [displayScore, setDisplayScore] = useState(0);
  const [displayBest, setDisplayBest] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);

  // Constants - game logic runs at 800x600, canvas renders at 1600x1200
  const SCALE = 2;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const RENDER_WIDTH = CANVAS_WIDTH * SCALE;
  const RENDER_HEIGHT = CANVAS_HEIGHT * SCALE;

  const BRICK_ROWS = 6;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 70;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 5;
  const BRICK_OFFSET_TOP = 60;
  const BRICK_OFFSET_LEFT = 35;

  useEffect(() => {
    const best = localStorage.getItem("pb-breakout");
    if (best) {
      gameStateRef.current.bestScore = parseInt(best, 10);
      setDisplayBest(parseInt(best, 10));
    }
  }, []);

  const createBricks = (level: number) => {
    const bricks: Brick[] = [];
    const colors = [
      { color: "#ef4444", points: 70 }, // red - top
      { color: "#f97316", points: 60 }, // orange
      { color: "#eab308", points: 50 }, // yellow
      { color: "#22c55e", points: 40 }, // green
      { color: "#3b82f6", points: 30 }, // blue
      { color: "#a855f7", points: 20 }, // purple - bottom
    ];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          color: colors[row].color,
          points: colors[row].points,
          visible: true,
        });
      }
    }
    return bricks;
  };

  const drawBrick = (ctx: CanvasRenderingContext2D, brick: Brick) => {
    if (!brick.visible) return;

    // Main brick
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);

    // Highlight (top-left)
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(brick.x + 2, brick.y + 2, BRICK_WIDTH - 4, 4);
    ctx.fillRect(brick.x + 2, brick.y + 2, 4, BRICK_HEIGHT - 4);

    // Shadow (bottom-right)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(brick.x + 2, brick.y + BRICK_HEIGHT - 4, BRICK_WIDTH - 4, 2);
    ctx.fillRect(brick.x + BRICK_WIDTH - 4, brick.y + 2, 2, BRICK_HEIGHT - 4);
  };

  const drawPaddle = (ctx: CanvasRenderingContext2D) => {
    const { paddle } = gameStateRef.current;

    // Main paddle
    ctx.fillStyle = "#10b981";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(paddle.x + 4, paddle.y + 2, paddle.width - 8, 4);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(paddle.x + 4, paddle.y + paddle.height - 3, paddle.width - 8, 2);
  };

  const drawBall = (ctx: CanvasRenderingContext2D) => {
    const { ball } = gameStateRef.current;

    // Main ball
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, ball.radius / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkCollision = () => {
    const state = gameStateRef.current;
    const { ball, paddle, bricks } = state;

    // Wall collisions
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > CANVAS_WIDTH) {
      ball.velocityX = -ball.velocityX;
      ball.x = Math.max(ball.radius, Math.min(CANVAS_WIDTH - ball.radius, ball.x));
    }

    if (ball.y - ball.radius < 0) {
      ball.velocityY = -ball.velocityY;
      ball.y = ball.radius;
    }

    // Paddle collision
    if (
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      // Bounce with angle based on hit position
      const hitPos = (ball.x - paddle.x) / paddle.width; // 0 to 1
      const angle = (hitPos - 0.5) * Math.PI * 0.6; // -54° to +54°
      const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
      ball.velocityX = speed * Math.sin(angle);
      ball.velocityY = -Math.abs(speed * Math.cos(angle));
      ball.y = paddle.y - ball.radius;
    }

    // Brick collision
    for (const brick of bricks) {
      if (!brick.visible) continue;

      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + BRICK_WIDTH &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + BRICK_HEIGHT
      ) {
        brick.visible = false;
        state.score += brick.points;
        setDisplayScore(state.score);

        // Determine bounce direction based on collision side
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
        const brickCenterX = brick.x + BRICK_WIDTH / 2;
        const brickCenterY = brick.y + BRICK_HEIGHT / 2;

        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;

        if (Math.abs(dx / (BRICK_WIDTH / 2)) > Math.abs(dy / (BRICK_HEIGHT / 2))) {
          ball.velocityX = -ball.velocityX;
        } else {
          ball.velocityY = -ball.velocityY;
        }

        // Increase ball speed slightly
        const speedIncrease = 1.01;
        ball.velocityX *= speedIncrease;
        ball.velocityY *= speedIncrease;

        // Cap max speed
        const maxSpeed = 8 + state.level;
        const currentSpeed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
        if (currentSpeed > maxSpeed) {
          ball.velocityX = (ball.velocityX / currentSpeed) * maxSpeed;
          ball.velocityY = (ball.velocityY / currentSpeed) * maxSpeed;
        }

        break;
      }
    }

    // Check if all bricks destroyed
    const remainingBricks = bricks.filter((b) => b.visible).length;
    if (remainingBricks === 0) {
      // Level complete
      state.level++;
      setDisplayLevel(state.level);
      state.bricks = createBricks(state.level);
      state.ball.launched = false;
      state.ball.x = state.paddle.x + state.paddle.width / 2;
      state.ball.y = state.paddle.y - 10;
      state.ball.velocityX = 4 + state.level * 0.5;
      state.ball.velocityY = -(4 + state.level * 0.5);
    }

    // Ball fell off bottom
    if (ball.y - ball.radius > CANVAS_HEIGHT) {
      state.lives--;
      setDisplayLives(state.lives);

      if (state.lives <= 0) {
        state.gameOver = true;
        state.isRunning = false;
        setGameOver(true);

        // Update best score
        if (state.score > state.bestScore) {
          state.bestScore = state.score;
          setDisplayBest(state.score);
          localStorage.setItem("pb-breakout", state.score.toString());
        }
      } else {
        // Reset ball
        state.ball.launched = false;
        state.ball.x = state.paddle.x + state.paddle.width / 2;
        state.ball.y = state.paddle.y - 10;
        state.ball.velocityX = 4 + state.level * 0.5;
        state.ball.velocityY = -(4 + state.level * 0.5);
      }
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
    ctx.scale(SCALE, SCALE);

    // Update paddle
    const { paddle, keys, touchX } = state;
    if (touchX !== null) {
      // Touch control - paddle follows touch
      paddle.x = touchX - paddle.width / 2;
    } else if (keys.left) {
      paddle.x -= paddle.speed;
    } else if (keys.right) {
      paddle.x += paddle.speed;
    }

    // Keep paddle in bounds
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));

    // Update ball
    const { ball } = state;
    if (!ball.launched) {
      // Ball follows paddle before launch
      ball.x = paddle.x + paddle.width / 2;
      ball.y = paddle.y - 10;
    } else {
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;
      checkCollision();
    }

    // Draw everything
    state.bricks.forEach((brick) => drawBrick(ctx, brick));
    drawPaddle(ctx);
    drawBall(ctx);

    // Draw UI
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "20px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${state.score}`, 20, 35);
    ctx.fillText(`Lives: ${state.lives}`, 300, 35);
    ctx.fillText(`Level: ${state.level}`, 580, 35);

    // Launch hint
    if (!ball.launched) {
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Press SPACE or tap to launch", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
    }

    requestAnimationFrame(gameLoop);
  };

  const launchBall = () => {
    const state = gameStateRef.current;
    if (!state.ball.launched && state.isRunning) {
      state.ball.launched = true;
    }
  };

  const startGame = () => {
    const state = gameStateRef.current;
    state.isRunning = true;
    state.gameOver = false;
    state.score = 0;
    state.lives = 3;
    state.level = 1;
    state.paddle.x = 350;
    state.ball.x = 400;
    state.ball.y = 500;
    state.ball.velocityX = 4;
    state.ball.velocityY = -4;
    state.ball.launched = false;
    state.bricks = createBricks(1);
    setDisplayScore(0);
    setDisplayLives(3);
    setDisplayLevel(1);
    setGameOver(false);
    setStarted(true);
    setWon(false);
    requestAnimationFrame(gameLoop);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const state = gameStateRef.current;

    if (!state.isRunning && !state.gameOver) {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        startGame();
      }
      return;
    }

    if (!state.isRunning) return;

    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      e.preventDefault();
      state.keys.left = true;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      e.preventDefault();
      state.keys.right = true;
    } else if (e.code === "Space") {
      e.preventDefault();
      launchBall();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const state = gameStateRef.current;
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      e.preventDefault();
      state.keys.left = false;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      e.preventDefault();
      state.keys.right = false;
    }
  };

  const handleCanvasClick = () => {
    const state = gameStateRef.current;
    if (!state.isRunning && !state.gameOver) {
      startGame();
    } else if (state.isRunning) {
      launchBall();
    }
  };

  // Touch handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const state = gameStateRef.current;

      if (!state.isRunning && !state.gameOver) {
        startGame();
        return;
      }

      if (!state.isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      state.touchX = x;

      launchBall();
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const state = gameStateRef.current;
      if (!state.isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      state.touchX = x;
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const state = gameStateRef.current;
      state.touchX = null;
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
    const text = `I scored ${displayScore} points and reached level ${displayLevel} in Breakout! Can you beat my score? Play now: https://playmini.fun/breakout`;

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
      <div className="flex gap-6 text-lg font-mono">
        <div>
          Score: <span className="font-bold text-blue-400">{displayScore}</span>
        </div>
        <div>
          Lives: <span className="font-bold text-red-400">{displayLives}</span>
        </div>
        <div>
          Level: <span className="font-bold text-green-400">{displayLevel}</span>
        </div>
        <div>
          Best: <span className="font-bold text-yellow-400">{displayBest}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={RENDER_WIDTH}
          height={RENDER_HEIGHT}
          className="border-2 border-gray-700 rounded-lg w-full cursor-pointer"
          onClick={handleCanvasClick}
          style={{ touchAction: "none", maxWidth: "800px" }}
        />

        {/* Start Overlay */}
        {!started && !gameOver && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg cursor-pointer"
            onClick={startGame}
            onTouchEnd={(e) => {
              e.preventDefault();
              startGame();
            }}
          >
            <div className="text-center text-white pointer-events-none">
              <p className="text-xl font-bold mb-2">Press Space or Tap to Start</p>
              <p className="text-sm text-gray-300">
                ←/→ or A/D: Move Paddle | Space: Launch Ball
              </p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-lg">
            <div className="text-center text-white">
              <p className="text-2xl font-bold mb-2">Game Over!</p>
              <p className="text-lg mb-1">Final Score: {displayScore}</p>
              <p className="text-lg mb-1">Level Reached: {displayLevel}</p>
              <p className="text-sm text-yellow-400 mb-4">Best Score: {displayBest}</p>
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
                <DownloadButton
                  canvasRef={canvasRef}
                  filename="breakout-score"
                  label="Save"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="text-sm text-gray-400 text-center">
        <p className="font-semibold mb-1">Controls:</p>
        <p>
          Desktop: Arrow Keys or A/D to move, Space to launch | Mobile: Drag paddle, Tap to
          launch
        </p>
      </div>
    </div>
  );
}
