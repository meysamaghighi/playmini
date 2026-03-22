"use client";

import { useRef, useEffect, useState } from "react";

type GameState = "start" | "playing" | "gameover";

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFE66D", // Yellow
  "#95E1D3", // Mint
  "#F38181", // Pink
  "#AA96DA", // Purple
  "#FCBAD3", // Light Pink
  "#A8E6CF", // Light Green
];

export default function TowerBuilder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>("start");
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const blocksRef = useRef<Block[]>([]);
  const currentBlockRef = useRef<Block | null>(null);
  const swingDirectionRef = useRef(1);
  const swingSpeedRef = useRef(3);
  const cameraOffsetRef = useRef(0);
  const animationIdRef = useRef<number>(0);
  const perfectPopupRef = useRef<{ show: boolean; time: number }>({ show: false, time: 0 });

  const [, setForceUpdate] = useState(0);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BLOCK_HEIGHT = 40;
  const INITIAL_BLOCK_WIDTH = 100;
  const SWING_RANGE = CANVAS_WIDTH - INITIAL_BLOCK_WIDTH;
  const PERFECT_THRESHOLD = 5;

  useEffect(() => {
    const stored = localStorage.getItem("pb-tower");
    if (stored) {
      bestRef.current = parseInt(stored, 10);
    }
  }, []);

  const startGame = () => {
    stateRef.current = "playing";
    scoreRef.current = 0;
    blocksRef.current = [];
    cameraOffsetRef.current = 0;
    swingDirectionRef.current = 1;
    swingSpeedRef.current = 3;
    perfectPopupRef.current = { show: false, time: 0 };

    // Ground block
    blocksRef.current.push({
      x: CANVAS_WIDTH / 2 - INITIAL_BLOCK_WIDTH / 2,
      y: CANVAS_HEIGHT - BLOCK_HEIGHT,
      width: INITIAL_BLOCK_WIDTH,
      height: BLOCK_HEIGHT,
      color: COLORS[0],
    });

    // First swinging block
    currentBlockRef.current = {
      x: 0,
      y: 100,
      width: INITIAL_BLOCK_WIDTH,
      height: BLOCK_HEIGHT,
      color: COLORS[1],
    };

    setForceUpdate((n) => n + 1);
    gameLoop();
  };

  const dropBlock = () => {
    if (stateRef.current !== "playing" || !currentBlockRef.current) return;

    const currentBlock = currentBlockRef.current;
    const lastBlock = blocksRef.current[blocksRef.current.length - 1];

    // Calculate overlap
    const leftOverlap = Math.max(currentBlock.x, lastBlock.x);
    const rightOverlap = Math.min(
      currentBlock.x + currentBlock.width,
      lastBlock.x + lastBlock.width
    );
    const overlapWidth = rightOverlap - leftOverlap;

    // Check for miss
    if (overlapWidth <= 0 || overlapWidth < 10) {
      gameOver();
      return;
    }

    // Check for perfect drop
    const isPerfect = Math.abs(currentBlock.x - lastBlock.x) < PERFECT_THRESHOLD;

    let newWidth = overlapWidth;
    let newX = leftOverlap;

    if (isPerfect) {
      // Keep the same width as last block
      newWidth = lastBlock.width;
      newX = lastBlock.x;
      perfectPopupRef.current = { show: true, time: Date.now() };
    }

    // Place the block
    const newBlock: Block = {
      x: newX,
      y: lastBlock.y - BLOCK_HEIGHT,
      width: newWidth,
      height: BLOCK_HEIGHT,
      color: COLORS[(blocksRef.current.length) % COLORS.length],
    };

    blocksRef.current.push(newBlock);
    scoreRef.current++;

    // Pan camera up
    cameraOffsetRef.current += BLOCK_HEIGHT;

    // Check if block is too narrow
    if (newWidth < 10) {
      gameOver();
      return;
    }

    // Increase difficulty
    if (scoreRef.current % 5 === 0) {
      swingSpeedRef.current += 0.5;
    }

    // Create next block
    currentBlockRef.current = {
      x: 0,
      y: 100,
      width: newWidth,
      height: BLOCK_HEIGHT,
      color: COLORS[(blocksRef.current.length) % COLORS.length],
    };

    setForceUpdate((n) => n + 1);
  };

  const gameOver = () => {
    stateRef.current = "gameover";
    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      localStorage.setItem("pb-tower", scoreRef.current.toString());
    }
    setForceUpdate((n) => n + 1);
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Swing the current block
    if (stateRef.current === "playing" && currentBlockRef.current) {
      currentBlockRef.current.x += swingDirectionRef.current * swingSpeedRef.current;

      const maxX = CANVAS_WIDTH - currentBlockRef.current.width;
      if (currentBlockRef.current.x <= 0) {
        currentBlockRef.current.x = 0;
        swingDirectionRef.current = 1;
      } else if (currentBlockRef.current.x >= maxX) {
        currentBlockRef.current.x = maxX;
        swingDirectionRef.current = -1;
      }
    }

    // Draw
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw blocks with camera offset
    blocksRef.current.forEach((block) => {
      ctx.fillStyle = block.color;
      ctx.fillRect(
        block.x,
        block.y + cameraOffsetRef.current,
        block.width,
        block.height
      );
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        block.x,
        block.y + cameraOffsetRef.current,
        block.width,
        block.height
      );
    });

    // Draw current swinging block
    if (currentBlockRef.current && stateRef.current === "playing") {
      ctx.fillStyle = currentBlockRef.current.color;
      ctx.fillRect(
        currentBlockRef.current.x,
        currentBlockRef.current.y,
        currentBlockRef.current.width,
        currentBlockRef.current.height
      );
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentBlockRef.current.x,
        currentBlockRef.current.y,
        currentBlockRef.current.width,
        currentBlockRef.current.height
      );
    }

    // Draw perfect popup
    if (perfectPopupRef.current.show) {
      const elapsed = Date.now() - perfectPopupRef.current.time;
      if (elapsed < 1000) {
        const alpha = 1 - elapsed / 1000;
        ctx.globalAlpha = alpha;
        ctx.font = "bold 36px sans-serif";
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "center";
        ctx.fillText("Perfect!", CANVAS_WIDTH / 2, 200);
        ctx.globalAlpha = 1;
      } else {
        perfectPopupRef.current.show = false;
      }
    }

    // Draw score
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);

    if (stateRef.current === "playing") {
      animationIdRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const handleCanvasClick = () => {
    if (stateRef.current === "playing") {
      dropBlock();
    }
  };

  const handleShare = async () => {
    const text = `I stacked ${scoreRef.current} blocks in Tower Builder! Can you beat my score?`;
    const url = "https://playmini.fun/tower-builder";

    if (navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        alert("Score copied to clipboard!");
      } catch (err) {
        // Silent fail
      }
    }
  };

  const handleRestart = () => {
    startGame();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-700 rounded-lg cursor-pointer max-w-full h-auto"
          onClick={handleCanvasClick}
        />

        {stateRef.current === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            <h2 className="text-4xl font-bold text-white mb-4">Tower Builder</h2>
            <p className="text-gray-300 mb-6 text-center px-4">
              Tap to drop blocks and build the tallest tower!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {stateRef.current === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
            <p className="text-2xl text-gray-300 mb-2">Score: {scoreRef.current}</p>
            <p className="text-xl text-gray-400 mb-6">Best: {bestRef.current}</p>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {stateRef.current === "playing" && (
        <p className="text-gray-300 text-center">
          Tap the canvas to drop the block!
        </p>
      )}
    </div>
  );
}
