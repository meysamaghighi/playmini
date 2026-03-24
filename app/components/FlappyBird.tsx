'use client';

import { useRef, useEffect, useState } from 'react';
import DownloadButton from './DownloadButton';

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

type BirdType = 'classic' | 'blueJay' | 'cardinal' | 'parrot' | 'penguin' | 'phoenix';

interface BirdTheme {
  label: string;
  body: string;
  belly: string;
  outline: string;
  wing: string;
  wingOutline: string;
  beak: string;
  beakLine: string;
}

const BIRDS: Record<BirdType, BirdTheme> = {
  classic: {
    label: 'Classic',
    body: '#FFD700',
    belly: '#FFE44D',
    outline: '#FFA500',
    wing: '#E5B800',
    wingOutline: '#CC9900',
    beak: '#FF6347',
    beakLine: '#CC4030',
  },
  blueJay: {
    label: 'Blue Jay',
    body: '#4A90D9',
    belly: '#6BB3F0',
    outline: '#2E6DB4',
    wing: '#3A7AC4',
    wingOutline: '#2B5F9E',
    beak: '#F5A623',
    beakLine: '#D4891A',
  },
  cardinal: {
    label: 'Cardinal',
    body: '#D42C2C',
    belly: '#E85555',
    outline: '#A31F1F',
    wing: '#B82525',
    wingOutline: '#8A1A1A',
    beak: '#F0A030',
    beakLine: '#C88020',
  },
  parrot: {
    label: 'Parrot',
    body: '#2ECC40',
    belly: '#5FE870',
    outline: '#1FA030',
    wing: '#28B038',
    wingOutline: '#1A8A28',
    beak: '#F5C542',
    beakLine: '#D4A830',
  },
  penguin: {
    label: 'Penguin',
    body: '#2C2C2C',
    belly: '#E8E8E8',
    outline: '#111111',
    wing: '#1A1A1A',
    wingOutline: '#000000',
    beak: '#F5A623',
    beakLine: '#D4891A',
  },
  phoenix: {
    label: 'Phoenix',
    body: '#FF6B00',
    belly: '#FFD93D',
    outline: '#CC4400',
    wing: '#FF4500',
    wingOutline: '#CC2200',
    beak: '#FFE066',
    beakLine: '#DDBB33',
  },
};

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [selectedBird, setSelectedBird] = useState<BirdType>('classic');

  // Game state refs
  const birdRef = useRef({ y: 250, velocity: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const gameStateRef = useRef<'start' | 'playing' | 'gameover'>('start');
  const animationIdRef = useRef<number | null>(null);
  const birdTypeRef = useRef<BirdType>('classic');

  // Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BIRD_SIZE = 30;
  const PIPE_WIDTH = 60;
  const GAP_SIZE = 200;
  const GRAVITY = 0.35;
  const FLAP_STRENGTH = -7.5;
  const PIPE_SPEED = 1.6;
  const PIPE_SPACING = 280;
  const GROUND_HEIGHT = 80;

  useEffect(() => {
    const saved = localStorage.getItem('pb-flappy');
    if (saved) setBestScore(parseInt(saved));
    const savedBird = localStorage.getItem('flappy-bird-type');
    if (savedBird && savedBird in BIRDS) {
      setSelectedBird(savedBird as BirdType);
      birdTypeRef.current = savedBird as BirdType;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBird = (ctx: CanvasRenderingContext2D) => {
      const birdX = CANVAS_WIDTH / 2;
      const birdY = birdRef.current.y;
      const rotation = Math.min(Math.max(birdRef.current.velocity * 0.05, -0.5), 0.5);
      const t = BIRDS[birdTypeRef.current];

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(rotation);

      // Wing (behind body)
      const wingFlap = Math.floor(frameCountRef.current / 4) % 3;
      const wingAngle = wingFlap === 0 ? -0.4 : wingFlap === 1 ? 0.1 : 0.3;
      ctx.fillStyle = t.wing;
      ctx.save();
      ctx.translate(-4, 2);
      ctx.rotate(wingAngle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 14, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = t.wingOutline;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Body
      ctx.fillStyle = t.body;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Belly
      ctx.fillStyle = t.belly;
      ctx.beginPath();
      ctx.ellipse(-1, 3, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = t.outline;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Eye white
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(8, -5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eye pupil
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(9, -5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Penguin special: white face patch
      if (birdTypeRef.current === 'penguin') {
        ctx.fillStyle = '#E8E8E8';
        ctx.beginPath();
        ctx.ellipse(5, -2, 5, 7, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Re-draw eye on top
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(8, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(9, -5, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Phoenix special: flame tail
      if (birdTypeRef.current === 'phoenix') {
        const flicker = Math.sin(frameCountRef.current * 0.3) * 2;
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(-BIRD_SIZE / 2, -2);
        ctx.quadraticCurveTo(-BIRD_SIZE - 4 + flicker, -6, -BIRD_SIZE - 8, -3 + flicker);
        ctx.quadraticCurveTo(-BIRD_SIZE - 2, 0, -BIRD_SIZE - 6, 5 - flicker);
        ctx.quadraticCurveTo(-BIRD_SIZE - 2 + flicker, 2, -BIRD_SIZE / 2, 4);
        ctx.fill();
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.moveTo(-BIRD_SIZE / 2, -1);
        ctx.quadraticCurveTo(-BIRD_SIZE + 2 + flicker, -3, -BIRD_SIZE - 2, 0);
        ctx.quadraticCurveTo(-BIRD_SIZE + 2, 2, -BIRD_SIZE / 2, 3);
        ctx.fill();
      }

      // Cardinal special: crest
      if (birdTypeRef.current === 'cardinal') {
        ctx.fillStyle = t.body;
        ctx.beginPath();
        ctx.moveTo(0, -BIRD_SIZE / 2);
        ctx.lineTo(-3, -BIRD_SIZE / 2 - 10);
        ctx.lineTo(5, -BIRD_SIZE / 2 - 2);
        ctx.closePath();
        ctx.fill();
      }

      // Beak
      ctx.fillStyle = t.beak;
      ctx.beginPath();
      ctx.moveTo(BIRD_SIZE / 2, -2);
      ctx.lineTo(BIRD_SIZE / 2 + 10, 0);
      ctx.lineTo(BIRD_SIZE / 2, 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = t.beakLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(BIRD_SIZE / 2, 1);
      ctx.lineTo(BIRD_SIZE / 2 + 8, 1);
      ctx.stroke();

      ctx.restore();
    };

    const gameLoop = () => {
      if (gameStateRef.current !== 'playing') return;

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
        if (!pipe.passed && pipe.x + PIPE_WIDTH < CANVAS_WIDTH / 2 - BIRD_SIZE / 2) {
          pipe.passed = true;
          scoreRef.current++;
          setScore(scoreRef.current);
        }
        return pipe.x > -PIPE_WIDTH;
      });

      // Collision detection (with forgiving hitbox)
      const birdLeft = CANVAS_WIDTH / 2 - BIRD_SIZE / 2 + 4;
      const birdRight = CANVAS_WIDTH / 2 + BIRD_SIZE / 2 - 4;
      const birdTop = birdRef.current.y - BIRD_SIZE / 2 + 4;
      const birdBottom = birdRef.current.y + BIRD_SIZE / 2 - 4;

      if (birdBottom >= CANVAS_HEIGHT - GROUND_HEIGHT || birdTop <= 0) {
        endGame();
        return;
      }

      for (const pipe of pipesRef.current) {
        if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
          if (birdTop < pipe.gapY || birdBottom > pipe.gapY + GAP_SIZE) {
            endGame();
            return;
          }
        }
      }

      draw(ctx);
      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      // Sky
      ctx.fillStyle = '#4EC0CA';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);

      // Ground
      ctx.fillStyle = '#DED895';
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

      // Pipes
      ctx.fillStyle = '#5CB85C';
      for (const pipe of pipesRef.current) {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.fillRect(pipe.x, pipe.gapY + GAP_SIZE, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - GAP_SIZE - GROUND_HEIGHT);
        ctx.strokeStyle = '#4A934A';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.strokeRect(pipe.x, pipe.gapY + GAP_SIZE, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - GAP_SIZE - GROUND_HEIGHT);
      }

      drawBird(ctx);

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
      draw(ctx);
    }

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameState, bestScore, selectedBird]);

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

  const selectBird = (type: BirdType) => {
    setSelectedBird(type);
    birdTypeRef.current = type;
    localStorage.setItem('flappy-bird-type', type);
  };

  const handleShare = async () => {
    const text = `I scored ${score} in Flappy Bird! Can you beat it? ${window.location.href}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {
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
      if (gameStateRef.current === 'playing') e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, []);

  // Mini bird preview for selection buttons
  const BirdPreview = ({ type, size = 24 }: { type: BirdType; size?: number }) => {
    const t = BIRDS[type];
    const r = size / 2;
    return (
      <svg width={size + 12} height={size + 4} viewBox={`0 0 ${size + 12} ${size + 4}`}>
        {/* Wing */}
        <ellipse cx={r - 2} cy={r + 3} rx={r * 0.4} ry={r * 0.7} fill={t.wing} stroke={t.wingOutline} strokeWidth="0.5" />
        {/* Body */}
        <circle cx={r + 2} cy={r + 2} r={r} fill={t.body} stroke={t.outline} strokeWidth="1.5" />
        {/* Belly */}
        <ellipse cx={r + 1} cy={r + 4} rx={r * 0.5} ry={r * 0.35} fill={t.belly} />
        {/* Cardinal crest */}
        {type === 'cardinal' && <polygon points={`${r + 2},2 ${r - 1},-4 ${r + 5},1`} fill={t.body} />}
        {/* Penguin face */}
        {type === 'penguin' && <ellipse cx={r + 5} cy={r} rx={r * 0.35} ry={r * 0.5} fill="#E8E8E8" />}
        {/* Phoenix tail */}
        {type === 'phoenix' && <path d={`M${r - r + 2},${r + 1} Q${-3},${r - 2} ${-2},${r + 1} Q${-3},${r + 4} ${r - r + 2},${r + 3}`} fill="#FF4500" />}
        {/* Eye */}
        <circle cx={r + 6} cy={r - 1} r={2.5} fill="#fff" />
        <circle cx={r + 6.5} cy={r - 1} r={1.2} fill="#000" />
        {/* Beak */}
        <polygon points={`${r + r},${r} ${r + r + 6},${r + 2} ${r + r},${r + 4}`} fill={t.beak} />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gray-700 rounded-lg max-w-full h-auto cursor-pointer touch-none"
          onClick={flap}
          onTouchStart={(e) => { e.preventDefault(); flap(); }}
        />

        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg" onClick={flap}>
            <h2 className="text-4xl font-bold text-white mb-2">Flappy Bird</h2>
            <p className="text-sm text-gray-300 mb-4">Avoid the pipes!</p>

            {/* Bird Selection */}
            <div className="mb-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-gray-400 uppercase tracking-wider text-center mb-2 font-bold">Choose Your Bird</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-[340px]">
                {(Object.keys(BIRDS) as BirdType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => selectBird(type)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedBird === type
                        ? 'bg-white/25 ring-2 ring-white scale-105 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    <BirdPreview type={type} size={18} />
                    {BIRDS[type].label}
                  </button>
                ))}
              </div>
            </div>

            {bestScore > 0 && (
              <p className="text-yellow-400 text-sm mb-3">Best: {bestScore}</p>
            )}

            <button
              onClick={startGame}
              className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
            <p className="text-xs text-gray-400 mt-2">or tap anywhere / press Space</p>
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
                onClick={startGame}
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
              <DownloadButton canvasRef={canvasRef} filename="flappy-score" label="Save" />
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
