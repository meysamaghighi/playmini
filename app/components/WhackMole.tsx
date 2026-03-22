'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type GameState = 'idle' | 'countdown' | 'playing' | 'ended';
type Speed = 'easy' | 'normal' | 'hard';

const SPEED_CONFIG: Record<Speed, { label: string; duration: number; spawnBase: number; spawnMin: number; visibleBase: number; visibleMin: number; desc: string }> = {
  easy:   { label: 'Easy',   duration: 30, spawnBase: 1000, spawnMin: 600,  visibleBase: 1500, visibleMin: 800,  desc: 'Relaxed pace' },
  normal: { label: 'Normal', duration: 30, spawnBase: 800,  spawnMin: 400,  visibleBase: 1200, visibleMin: 500,  desc: 'Standard challenge' },
  hard:   { label: 'Hard',   duration: 25, spawnBase: 600,  spawnMin: 250,  visibleBase: 800,  visibleMin: 350,  desc: 'Lightning fast' },
};

export default function WhackMole() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [moleHoles, setMoleHoles] = useState<Array<{ visible: boolean; golden: boolean; hit: boolean }>>(
    Array.from({ length: 9 }, () => ({ visible: false, golden: false, hit: false }))
  );

  const scoreRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const gameActiveRef = useRef(false);
  const speedRef = useRef<Speed>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('pb-whack');
    if (saved) setPersonalBest(parseInt(saved, 10));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      hideTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const endGame = useCallback(() => {
    gameActiveRef.current = false;
    setGameState('ended');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnTimerRef.current) { clearTimeout(spawnTimerRef.current); spawnTimerRef.current = null; }
    hideTimersRef.current.forEach((t) => clearTimeout(t));
    hideTimersRef.current.clear();

    const finalScore = scoreRef.current;
    setScore(finalScore);
    const savedBest = localStorage.getItem('pb-whack');
    const currentBest = savedBest ? parseInt(savedBest, 10) : 0;
    if (finalScore > currentBest) {
      setPersonalBest(finalScore);
      localStorage.setItem('pb-whack', finalScore.toString());
    }
  }, []);

  const spawnMole = useCallback(() => {
    if (!gameActiveRef.current) return;

    const cfg = SPEED_CONFIG[speedRef.current];
    const duration = cfg.duration;
    const progress = elapsedRef.current / duration;
    const visibleDuration = Math.max(cfg.visibleMin, cfg.visibleBase - progress * (cfg.visibleBase - cfg.visibleMin));

    setMoleHoles((prev) => {
      const available = prev.map((h, i) => ({ ...h, idx: i })).filter((h) => !h.visible);
      if (available.length === 0) return prev;

      const pick = available[Math.floor(Math.random() * available.length)];
      const isGolden = Math.random() < 0.1;
      const updated = prev.map((h, i) =>
        i === pick.idx ? { visible: true, golden: isGolden, hit: false } : h
      );

      // Auto-hide after duration
      const hideTimer = setTimeout(() => {
        if (!gameActiveRef.current) return;
        setMoleHoles((cur) =>
          cur.map((h, i) => (i === pick.idx && h.visible ? { ...h, visible: false, golden: false } : h))
        );
        hideTimersRef.current.delete(pick.idx);
      }, visibleDuration);
      hideTimersRef.current.set(pick.idx, hideTimer);

      return updated;
    });

    // Schedule next spawn
    const nextDelay = Math.max(cfg.spawnMin, cfg.spawnBase - progress * (cfg.spawnBase - cfg.spawnMin));
    spawnTimerRef.current = setTimeout(spawnMole, nextDelay);
  }, []);

  const startGame = () => {
    const cfg = SPEED_CONFIG[speed];
    speedRef.current = speed;
    setGameState('countdown');
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(cfg.duration);
    setCountdown(3);
    elapsedRef.current = 0;
    setMoleHoles(Array.from({ length: 9 }, () => ({ visible: false, golden: false, hit: false })));

    let count = 3;
    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countInterval);
        setGameState('playing');
        gameActiveRef.current = true;

        // Start timer
        timerRef.current = setInterval(() => {
          elapsedRef.current += 0.1;
          const remaining = Math.max(0, cfg.duration - elapsedRef.current);
          setTimeLeft(remaining);
          if (remaining <= 0) endGame();
        }, 100);

        // Start spawning moles
        spawnMole();
      }
    }, 1000);
  };

  const whackMole = (idx: number) => {
    if (!gameActiveRef.current) return;

    setMoleHoles((prev) => {
      const mole = prev[idx];
      if (!mole.visible) return prev;

      const points = mole.golden ? 3 : 1;
      scoreRef.current += points;
      setScore(scoreRef.current);

      // Cancel the auto-hide timer for this hole
      const hideTimer = hideTimersRef.current.get(idx);
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimersRef.current.delete(idx);
      }

      const updated = prev.map((h, i) =>
        i === idx ? { visible: false, golden: false, hit: true } : h
      );

      // Clear hit animation after 300ms
      setTimeout(() => {
        setMoleHoles((cur) => cur.map((h, i) => (i === idx ? { ...h, hit: false } : h)));
      }, 300);

      return updated;
    });
  };

  const shareScore = async () => {
    const text = `I scored ${scoreRef.current} in Whack-a-Mole (${SPEED_CONFIG[speedRef.current].label})! Can you beat it? Play now at playmini.fun/whack-a-mole`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const gameDuration = SPEED_CONFIG[speedRef.current].duration;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Timer Bar */}
      {(gameState === 'playing' || gameState === 'countdown') && (
        <div className="mb-6">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-100"
              style={{ width: `${(timeLeft / gameDuration) * 100}%` }}
            />
          </div>
          <div className="text-center text-white text-xl font-bold mt-2">
            {Math.ceil(timeLeft)}s
          </div>
        </div>
      )}

      {/* Score Display */}
      {gameState === 'playing' && (
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-white">{score}</div>
          <div className="text-gray-400 text-sm mt-1">Score</div>
        </div>
      )}

      {/* Idle State */}
      {gameState === 'idle' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔨</div>
          <h2 className="text-4xl font-bold text-white mb-4">Whack-a-Mole</h2>
          <p className="text-gray-400 mb-2">Tap the moles as they pop up!</p>
          <p className="text-gray-400 mb-6">Golden moles are worth 3 points!</p>

          {/* Speed Selection */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-3 font-bold">Speed</p>
            <div className="flex gap-2 justify-center">
              {(Object.keys(SPEED_CONFIG) as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                    speed === s
                      ? s === 'easy' ? 'bg-green-600 text-white ring-2 ring-green-400 scale-105'
                        : s === 'normal' ? 'bg-yellow-600 text-white ring-2 ring-yellow-400 scale-105'
                        : 'bg-red-600 text-white ring-2 ring-red-400 scale-105'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {SPEED_CONFIG[s].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{SPEED_CONFIG[speed].desc}{speed === 'hard' ? ' (25s)' : ' (30s)'}</p>
          </div>

          {personalBest !== null && (
            <div className="mb-6">
              <div className="text-2xl font-bold text-yellow-500">{personalBest}</div>
              <div className="text-gray-400 text-sm">Personal Best</div>
            </div>
          )}
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      )}

      {/* Countdown */}
      {gameState === 'countdown' && (
        <div className="text-center py-12">
          <div className="text-9xl font-bold text-white animate-pulse">{countdown}</div>
        </div>
      )}

      {/* Game Grid */}
      {gameState === 'playing' && (
        <div className="relative p-4 rounded-2xl" style={{ background: 'linear-gradient(180deg, #2d5a1e 0%, #1a3d10 100%)' }}>
          {/* Grass texture overlay */}
          <div className="absolute inset-0 rounded-2xl opacity-20" style={{
            backgroundImage: `radial-gradient(circle, #3a7a24 1px, transparent 1px)`,
            backgroundSize: '8px 8px',
          }} />
          <div className="grid grid-cols-3 gap-3 md:gap-4 relative">
            {moleHoles.map((hole, idx) => (
              <button
                key={idx}
                onClick={() => whackMole(idx)}
                className="relative aspect-square cursor-pointer select-none active:scale-95 transition-transform"
              >
                {/* Hole background */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-stone-900 rounded-full border-4 border-stone-700 shadow-inner overflow-hidden">
                  {/* Dirt texture */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle, #5c4033 1px, transparent 1px)',
                    backgroundSize: '6px 6px',
                  }} />
                  {/* Dirt at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-stone-800 to-transparent rounded-b-full" />

                  {/* Mole */}
                  {hole.visible && (
                    <div
                      className={`absolute inset-x-2 bottom-1 top-1/4 rounded-t-full flex flex-col items-center justify-start pt-[15%] ${
                        hole.golden
                          ? 'bg-gradient-to-b from-yellow-400 to-yellow-700'
                          : 'bg-gradient-to-b from-amber-600 to-amber-900'
                      }`}
                      style={{ animation: 'molePopUp 0.15s ease-out' }}
                    >
                      {/* Fur texture */}
                      <div className="absolute inset-0 rounded-t-full opacity-20" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)',
                      }} />
                      {/* Eyes */}
                      <div className="flex gap-[25%] mb-[5%] relative">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-black rounded-full relative">
                          <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full" />
                        </div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-black rounded-full relative">
                          <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full" />
                        </div>
                      </div>
                      {/* Nose */}
                      <div className={`w-3 h-2 md:w-4 md:h-3 rounded-full ${hole.golden ? 'bg-yellow-900' : 'bg-pink-400'}`} />
                    </div>
                  )}

                  {/* Hit animation */}
                  {hole.hit && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-black text-green-400 animate-bounce">+1</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End State */}
      {gameState === 'ended' && (
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
          <div className="mb-2">
            <div className="text-6xl font-bold text-white mb-2">{score}</div>
            <div className="text-gray-400 text-lg">Final Score ({SPEED_CONFIG[speedRef.current].label})</div>
          </div>
          {personalBest !== null && (
            <div className="mb-6">
              <div className="text-3xl font-bold text-yellow-500">{personalBest}</div>
              <div className="text-gray-400 text-sm">Personal Best</div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setGameState('idle'); setScore(0); setTimeLeft(30); }}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105"
            >
              Play Again
            </button>
            <button
              onClick={shareScore}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105"
            >
              Share Score
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes molePopUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
