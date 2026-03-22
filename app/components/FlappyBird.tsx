'use client';

import { useRef, useEffect, useState } from 'react';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  // Game state refs (to avoid stale closures in RAF loop)
  const birdRef = useRef({ y: 250, velocity: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const gameStateRef = useRef<'start' | 'playing' | 'gameover'>('start');
  const animationIdRef = useRef<number | null>(null);

  // Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BIRD_SIZE = 30;
  const PIPE_WIDTH = 60;
  const GAP_SIZE = 150;
  const GRAVITY = 0.5;
  const FLAP_STRENGTH = -9;
  const PIPE_SPEED = 2;
  const PIPE_SPACING = 220;
  const GROUND_HEIGHT = 80;

  useEffect(() => {
    // Load best score
    const saved = localStorage.getItem('pb-flappy');
    if (saved) {
      setBestScore(parseInt(saved));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (gameStateRef.current !== 'playing') {
        return;
      }

      frameCountRef.current++;

      // Update bird
      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;

      // Generate pipes
      if (frameCountRef.current % Math.floor(PIPE_SPACING / PIPE_SPEED) === 0) {
        const minGapY = 100;
        const maxGapY = CANVAS_HEIGHT - GROUND_HEIGHT - GAP_SIZE - 100;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        pipesRef.current.push({ x: CANVAS_WIDTH, gapY, passed: false });
      }

      // Update pipes
      pipesRef.current = pipesRef.current.filter(pipe => {
        pipe.x -= PIPE_SPEED;

        // Score when passing pipe
        if (!pipe.passed && pipe.x + PIPE_WIDTH < CANVAS_WIDTH / 2 - BIRD_SIZE / 2) {
          pipe.passed = true;
          scoreRef.current++;
          setScore(scoreRef.current);
        }

        return pipe.x > -PIPE_WIDTH;
      });

      // Collision detection
      const birdLeft = CANVAS_WIDTH / 2 - BIRD_SIZE / 2;
      const birdRight = CANVAS_WIDTH / 2 + BIRD_SIZE / 2;
      const birdTop = birdRef.current.y - BIRD_SIZE / 2;
      const birdBottom = birdRef.current.y + BIRD_SIZE / 2;

      // Check ground/ceiling collision
      if (birdBottom >= CANVAS_HEIGHT - GROUND_HEIGHT || birdTop <= 0) {
        endGame();
        return;
      }

      // Check pipe collision
      for (const pipe of pipesRef.current) {
        if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
          // Bird is horizontally aligned with pipe
          if (birdTop < pipe.gapY || birdBottom > pipe.gapY + GAP_SIZE) {
            endGame();
            return;
          }
        }
      }

      // Draw
      draw(ctx);

      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      // Sky background
      ctx.fillStyle = '#4EC0CA';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);

      // Ground
      ctx.fillStyle = '#DED895';
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

      // Pipes
      ctx.fillStyle = '#5CB85C';
      for (const pipe of pipesRef.current) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapY + GAP_SIZE, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - GAP_SIZE - GROUND_HEIGHT);

        // Pipe borders
        ctx.strokeStyle = '#4A934A';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.strokeRect(pipe.x, pipe.gapY + GAP_SIZE, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - GAP_SIZE - GROUND_HEIGHT);
      }

      // Bird
      const birdX = CANVAS_WIDTH / 2;
      const birdY = birdRef.current.y;
      const rotation = Math.min(Math.max(birdRef.current.velocity * 0.05, -0.5), 0.5);

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(rotation);

      // Bird body (yellow circle)
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Bird outline
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(8, -5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.moveTo(BIRD_SIZE / 2, 0);
      ctx.lineTo(BIRD_SIZE / 2 + 10, -3);
      ctx.lineTo(BIRD_SIZE / 2 + 10, 3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Score
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(scoreRef.current.toString(), CANVAS_WIDTH / 2, 80);
      ctx.fillText(scoreRef.current.toString(), CANVAS_WIDTH / 2, 80);
    };

    const endGame = () => {
      gameStateRef.current = 'gameover';
      setGameState('gameover');

      // Update best score
      if (scoreRef.current > bestScore) {
        setBestScore(scoreRef.current);
        localStorage.setItem('pb-flappy', scoreRef.current.toString());
      }

      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };

    if (gameStateRef.current === 'playing') {
      animationIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      // Draw initial state
      draw(ctx);
    }

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameState, bestScore]);

  const flap = () => {
    if (gameStateRef.current === 'start') {
      startGame();
    } else if (gameStateRef.current === 'playing') {
      birdRef.current.velocity = FLAP_STRENGTH;
    }
  };

  const startGame = () => {
    birdRef.current = { y: 250, velocity: 0 };
    pipesRef.current = [];
    scoreRef.current = 0;
    frameCountRef.current = 0;
    setScore(0);
    gameStateRef.current = 'playing';
    setGameState('playing');
  };

  const handlePlayAgain = () => {
    startGame();
  };

  const handleShare = async () => {
    const text = `I scored ${score} in Flappy Bird! Can you beat it? ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        navigator.clipboard.writeText(text);
        alert('Score copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (gameStateRef.current === 'playing') {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gray-700 rounded-lg max-w-full h-auto cursor-pointer touch-none"
          onClick={flap}
          onTouchStart={(e) => {
            e.preventDefault();
            flap();
          }}
        />

        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
            <h2 className="text-4xl font-bold text-white mb-4">Flappy Bird</h2>
            <p className="text-xl text-white mb-2">Tap or Press Space to Flap</p>
            <p className="text-lg text-gray-300">Avoid the pipes!</p>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <h2 className="text-4xl font-bold text-white mb-6">Game Over!</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
              <p className="text-2xl text-white mb-2">Score: <span className="font-bold text-yellow-400">{score}</span></p>
              <p className="text-xl text-white">Best: <span className="font-bold text-yellow-400">{bestScore}</span></p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handlePlayAgain}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {gameState === 'playing' && (
        <p className="text-gray-400 text-sm">Tap or press Space to flap</p>
      )}
    </div>
  );
}
