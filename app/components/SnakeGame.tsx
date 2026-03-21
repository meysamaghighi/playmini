"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };
type GameState = "START" | "PLAYING" | "GAME_OVER";

const GRID_SIZE = 20;
const INITIAL_SPEED = 150; // ms per move
const SPEED_INCREASE = 3; // ms faster per food
const MIN_SPEED = 50; // fastest possible

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("START");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Game state refs (for RAF loop)
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const speedRef = useRef(INITIAL_SPEED);
  const lastMoveTimeRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load best score on mount
  useEffect(() => {
    const saved = localStorage.getItem("pb-snake");
    if (saved) {
      setBestScore(parseInt(saved, 10));
    }
  }, []);

  // Generate random food position
  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    );
    return newFood;
  }, []);

  // Draw the game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = "#111827"; // gray-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = "#1f2937"; // gray-800
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = "#ef4444"; // red-500
    ctx.fillRect(
      foodRef.current.x * cellSize + 2,
      foodRef.current.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "#22c55e" : "#16a34a"; // green-500 head, green-600 body
      ctx.fillRect(
        segment.x * cellSize + 2,
        segment.y * cellSize + 2,
        cellSize - 4,
        cellSize - 4
      );
    });
  }, []);

  // Game loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameState !== "PLAYING" || isPaused) {
        gameLoopRef.current = null;
        return;
      }

      // Check if enough time has passed
      if (timestamp - lastMoveTimeRef.current < speedRef.current) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      lastMoveTimeRef.current = timestamp;

      // Update direction (from queued input)
      directionRef.current = nextDirectionRef.current;

      const snake = snakeRef.current;
      const head = snake[0];
      const direction = directionRef.current;

      // Calculate new head position
      let newHead: Position;
      switch (direction) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameState("GAME_OVER");
        gameLoopRef.current = null;
        return;
      }

      // Check self collision
      if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameState("GAME_OVER");
        gameLoopRef.current = null;
        return;
      }

      // Add new head
      const newSnake = [newHead, ...snake];

      // Check if food eaten
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        // Grow snake (don't remove tail)
        snakeRef.current = newSnake;
        foodRef.current = generateFood(newSnake);

        // Increase score
        const newScore = score + 1;
        setScore(newScore);

        // Update best score
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem("pb-snake", newScore.toString());
        }

        // Increase speed
        speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREASE);
      } else {
        // Move snake (remove tail)
        newSnake.pop();
        snakeRef.current = newSnake;
      }

      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [gameState, isPaused, score, bestScore, draw, generateFood]
  );

  // Start game
  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    foodRef.current = generateFood([{ x: 10, y: 10 }]);
    speedRef.current = INITIAL_SPEED;
    lastMoveTimeRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
    setIsPaused(false);

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, gameLoop, generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === "PLAYING") {
        const current = directionRef.current;

        // Pause/unpause
        if (e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          setIsPaused((prev) => {
            const newPaused = !prev;
            if (!newPaused) {
              lastMoveTimeRef.current = performance.now();
              gameLoopRef.current = requestAnimationFrame(gameLoop);
            }
            return newPaused;
          });
          return;
        }

        // Direction changes (prevent 180-degree turns)
        if (
          (e.key === "ArrowUp" || e.key === "w" || e.key === "W") &&
          current !== "DOWN"
        ) {
          e.preventDefault();
          nextDirectionRef.current = "UP";
        } else if (
          (e.key === "ArrowDown" || e.key === "s" || e.key === "S") &&
          current !== "UP"
        ) {
          e.preventDefault();
          nextDirectionRef.current = "DOWN";
        } else if (
          (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") &&
          current !== "RIGHT"
        ) {
          e.preventDefault();
          nextDirectionRef.current = "LEFT";
        } else if (
          (e.key === "ArrowRight" || e.key === "d" || e.key === "D") &&
          current !== "LEFT"
        ) {
          e.preventDefault();
          nextDirectionRef.current = "RIGHT";
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, gameLoop]);

  // Handle touch input (swipe)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameState !== "PLAYING") return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Minimum swipe distance
      if (absDeltaX < 30 && absDeltaY < 30) return;

      const current = directionRef.current;

      // Determine swipe direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && current !== "LEFT") {
          nextDirectionRef.current = "RIGHT";
        } else if (deltaX < 0 && current !== "RIGHT") {
          nextDirectionRef.current = "LEFT";
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && current !== "UP") {
          nextDirectionRef.current = "DOWN";
        } else if (deltaY < 0 && current !== "DOWN") {
          nextDirectionRef.current = "UP";
        }
      }

      touchStartRef.current = null;
    };

    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameState]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  // Share score
  const handleShare = async () => {
    const text = `I scored ${score} in Snake! Can you beat me? Play at playmini.com/snake`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert("Score copied to clipboard!");
      } catch (err) {
        alert("Unable to share");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Score display */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-3xl font-bold text-green-500">{score}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Best</div>
          <div className="text-3xl font-bold text-yellow-500">{bestScore}</div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-lg border-2 border-gray-700 max-w-full h-auto"
          style={{ touchAction: "none" }}
        />

        {/* Overlays */}
        {gameState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-lg">
            <h2 className="text-3xl font-bold text-green-500 mb-4">Snake</h2>
            <p className="text-gray-300 mb-6 text-center px-4">
              Use arrow keys or swipe to move
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
            >
              Press Start
            </button>
          </div>
        )}

        {isPaused && gameState === "PLAYING" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-yellow-500 mb-2">Paused</h2>
              <p className="text-gray-300">Press Space to resume</p>
            </div>
          </div>
        )}

        {gameState === "GAME_OVER" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-lg">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over</h2>
            <p className="text-gray-300 mb-2">Score: {score}</p>
            <p className="text-gray-300 mb-6">Best: {bestScore}</p>
            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls info */}
      <div className="text-center text-sm text-gray-400">
        {gameState === "PLAYING" && !isPaused && (
          <p>Press Space to pause</p>
        )}
      </div>
    </div>
  );
}
