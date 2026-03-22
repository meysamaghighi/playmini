'use client';

import { useState, useEffect, useRef } from 'react';

type GameState = 'idle' | 'countdown' | 'playing' | 'ended';
type Mole = {
  id: number;
  visible: boolean;
  golden: boolean;
  hitAnimation: boolean;
};

export default function WhackMole() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [moles, setMoles] = useState<Mole[]>(
    Array.from({ length: 9 }, (_, i) => ({ id: i, visible: false, golden: false, hitAnimation: false }))
  );

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load personal best on mount
  useEffect(() => {
    const saved = localStorage.getItem('pb-whack');
    if (saved) {
      setPersonalBest(parseInt(saved, 10));
    }
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimeoutRef.current) clearTimeout(moleTimeoutRef.current);
    };
  }, []);

  const startGame = () => {
    setGameState('countdown');
    setScore(0);
    setTimeLeft(30);
    setCountdown(3);
    setMoles(Array.from({ length: 9 }, (_, i) => ({ id: i, visible: false, golden: false, hitAnimation: false })));

    // Countdown 3-2-1
    let count = 3;
    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countInterval);
        setGameState('playing');
        startGameLoop();
      }
    }, 1000);
  };

  const startGameLoop = () => {
    let elapsed = 0;
    const gameDuration = 30;

    // Timer countdown
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const remaining = Math.max(0, gameDuration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        endGame();
      }
    }, 100);

    // Mole spawning
    const spawnMole = () => {
      if (gameLoopRef.current === null) return; // Game ended

      // Calculate mole visible duration (starts at 1.2s, decreases to 0.5s)
      const progress = elapsed / gameDuration;
      const visibleDuration = Math.max(500, 1200 - progress * 700);

      // Pick random hole (not currently visible)
      setMoles((prevMoles) => {
        const availableHoles = prevMoles.filter((m) => !m.visible);
        if (availableHoles.length === 0) return prevMoles;

        const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
        const isGolden = Math.random() < 0.1; // 10% chance

        const newMoles = prevMoles.map((m) =>
          m.id === randomHole.id ? { ...m, visible: true, golden: isGolden } : m
        );

        // Hide mole after duration
        moleTimeoutRef.current = setTimeout(() => {
          setMoles((current) =>
            current.map((m) => (m.id === randomHole.id ? { ...m, visible: false, golden: false } : m))
          );
        }, visibleDuration);

        return newMoles;
      });

      // Schedule next mole spawn (faster as game progresses)
      const nextSpawnDelay = Math.max(400, 800 - progress * 400);
      gameLoopRef.current = setTimeout(spawnMole, nextSpawnDelay) as any;
    };

    spawnMole();
  };

  const endGame = () => {
    setGameState('ended');
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (moleTimeoutRef.current) {
      clearTimeout(moleTimeoutRef.current);
      moleTimeoutRef.current = null;
    }

    // Update personal best
    if (personalBest === null || score > personalBest) {
      setPersonalBest(score);
      localStorage.setItem('pb-whack', score.toString());
    }
  };

  const whackMole = (id: number) => {
    if (gameState !== 'playing') return;

    setMoles((prevMoles) => {
      const mole = prevMoles.find((m) => m.id === id);
      if (!mole || !mole.visible) return prevMoles;

      // Award points
      const points = mole.golden ? 3 : 1;
      setScore((s) => s + points);

      // Show hit animation
      return prevMoles.map((m) =>
        m.id === id ? { ...m, visible: false, golden: false, hitAnimation: true } : m
      );
    });

    // Clear hit animation after 300ms
    setTimeout(() => {
      setMoles((current) => current.map((m) => (m.id === id ? { ...m, hitAnimation: false } : m)));
    }, 300);
  };

  const shareScore = async () => {
    const text = `I scored ${score} in Whack-a-Mole! Can you beat it? Play now at playmini.fun/whack-a-mole`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const playAgain = () => {
    setGameState('idle');
    setScore(0);
    setTimeLeft(30);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
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

      {/* Countdown State */}
      {gameState === 'countdown' && (
        <div className="text-center py-12">
          <div className="text-9xl font-bold text-white animate-pulse">{countdown}</div>
        </div>
      )}

      {/* Game Grid */}
      {gameState === 'playing' && (
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {moles.map((mole) => (
            <div
              key={mole.id}
              onClick={() => whackMole(mole.id)}
              className="relative aspect-square cursor-pointer"
            >
              {/* Hole */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full border-4 border-gray-700 shadow-inner overflow-hidden">
                {/* Mole */}
                {mole.visible && (
                  <div
                    className={`absolute inset-x-0 bottom-0 h-3/4 rounded-t-full transition-transform duration-200 ${
                      mole.golden
                        ? 'bg-gradient-to-b from-yellow-400 to-yellow-600'
                        : 'bg-gradient-to-b from-amber-700 to-amber-900'
                    } animate-popUp`}
                  >
                    {/* Mole face */}
                    <div className="relative w-full h-full">
                      {/* Eyes */}
                      <div className="absolute top-1/4 left-1/4 w-2 h-2 md:w-3 md:h-3 bg-black rounded-full" />
                      <div className="absolute top-1/4 right-1/4 w-2 h-2 md:w-3 md:h-3 bg-black rounded-full" />
                      {/* Nose */}
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-3 h-2 md:w-4 md:h-3 rounded-full ${mole.golden ? 'bg-yellow-800' : 'bg-pink-400'}`} />
                    </div>
                  </div>
                )}

                {/* Hit Animation */}
                {mole.hitAnimation && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl font-bold text-green-400 animate-ping">+{moles.find(m => m.id === mole.id)?.golden ? 3 : 1}</div>
                  </div>
                )}
              </div>
            </div>
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
              onClick={playAgain}
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
        @keyframes popUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-popUp {
          animation: popUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
