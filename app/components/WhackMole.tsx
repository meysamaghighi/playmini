'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type GameState = 'idle' | 'countdown' | 'playing' | 'ended';

export default function WhackMole() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [moleHoles, setMoleHoles] = useState<Array<{ visible: boolean; golden: boolean; hit: boolean }>>(
    Array.from({ length: 9 }, () => ({ visible: false, golden: false, hit: false }))
  );

  const scoreRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const gameActiveRef = useRef(false);

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

    const progress = elapsedRef.current / 30;
    const visibleDuration = Math.max(500, 1200 - progress * 700);

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
    const nextDelay = Math.max(400, 800 - progress * 400);
    spawnTimerRef.current = setTimeout(spawnMole, nextDelay);
  }, []);

  const startGame = () => {
    setGameState('countdown');
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
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
          const remaining = Math.max(0, 30 - elapsedRef.current);
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
    const text = `I scored ${scoreRef.current} in Whack-a-Mole! Can you beat it? Play now at playmini.fun/whack-a-mole`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Timer Bar */}
      {(gameState === 'playing' || gameState === 'countdown') && (
        <div className="mb-6">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-100"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
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
        <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 bg-green-900/30 rounded-2xl">
          {moleHoles.map((hole, idx) => (
            <button
              key={idx}
              onClick={() => whackMole(idx)}
              className="relative aspect-square cursor-pointer select-none active:scale-95 transition-transform"
            >
              {/* Hole background */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-stone-900 rounded-full border-4 border-stone-700 shadow-inner overflow-hidden">
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
                    {/* Eyes */}
                    <div className="flex gap-[25%] mb-[5%]">
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
      )}

      {/* End State */}
      {gameState === 'ended' && (
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
          <div className="mb-6">
            <div className="text-6xl font-bold text-white mb-2">{score}</div>
            <div className="text-gray-400 text-lg">Final Score</div>
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
