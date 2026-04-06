'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type GameState = 'menu' | 'countdown' | 'playing' | 'levelUp' | 'gameOver';
type MoleType = 'normal' | 'golden' | 'bomb' | 'helmet' | 'boss';
type PowerUpType = 'freeze' | 'double' | 'multi';

interface Mole {
  visible: boolean;
  type: MoleType;
  hit: boolean;
  helmetHits?: number; // For helmet moles (needs 2 hits)
  bossHits?: number; // For boss moles (needs 5 hits)
  holeIndex?: number; // For boss moles (which hole is primary)
}

interface PowerUp {
  type: PowerUpType;
  count: number;
  active: boolean;
  remaining: number; // For multi-whack: hits remaining
}

interface Level {
  id: number;
  name: string;
  duration: number;
  target: number;
  spawnRate: number; // ms between spawns
  visibleDuration: number; // how long moles stay visible
  maxVisible: number; // max simultaneous moles
  moleTypes: MoleType[];
  special?: 'dark' | 'ninja' | 'boss';
}

const LEVELS: Level[] = [
  { id: 1, name: 'Garden Pests', duration: 30, target: 10, spawnRate: 1200, visibleDuration: 1500, maxVisible: 1, moleTypes: ['normal'] },
  { id: 2, name: 'Mole Mayhem', duration: 30, target: 18, spawnRate: 1000, visibleDuration: 1300, maxVisible: 1, moleTypes: ['normal', 'golden'] },
  { id: 3, name: 'Bomb Alert', duration: 30, target: 25, spawnRate: 900, visibleDuration: 1200, maxVisible: 1, moleTypes: ['normal', 'golden', 'bomb'] },
  { id: 4, name: 'Speed Round', duration: 25, target: 30, spawnRate: 700, visibleDuration: 900, maxVisible: 1, moleTypes: ['normal', 'golden', 'bomb'] },
  { id: 5, name: 'Helmet Moles', duration: 30, target: 40, spawnRate: 800, visibleDuration: 1200, maxVisible: 1, moleTypes: ['normal', 'golden', 'bomb', 'helmet'] },
  { id: 6, name: 'Night Shift', duration: 25, target: 45, spawnRate: 800, visibleDuration: 1100, maxVisible: 1, moleTypes: ['normal', 'golden', 'bomb', 'helmet'], special: 'dark' },
  { id: 7, name: 'Mole Swarm', duration: 30, target: 55, spawnRate: 600, visibleDuration: 1000, maxVisible: 3, moleTypes: ['normal', 'golden', 'bomb', 'helmet'] },
  { id: 8, name: 'Ninja Moles', duration: 25, target: 65, spawnRate: 650, visibleDuration: 950, maxVisible: 2, moleTypes: ['normal', 'golden', 'bomb', 'helmet'], special: 'ninja' },
  { id: 9, name: 'Ultimate Test', duration: 25, target: 80, spawnRate: 500, visibleDuration: 800, maxVisible: 3, moleTypes: ['normal', 'golden', 'bomb', 'helmet'] },
  { id: 10, name: 'Grand Finale', duration: 30, target: 100, spawnRate: 600, visibleDuration: 1000, maxVisible: 3, moleTypes: ['normal', 'golden', 'bomb', 'helmet', 'boss'], special: 'boss' },
];

export default function WhackMole() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [isEndless, setIsEndless] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [escapeStreak, setEscapeStreak] = useState(0);
  const [levelUpMessage, setLevelUpMessage] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [moleHoles, setMoleHoles] = useState<Mole[]>(
    Array.from({ length: 9 }, () => ({ visible: false, type: 'normal', hit: false }))
  );

  const [powerUps, setPowerUps] = useState<Record<PowerUpType, PowerUp>>({
    freeze: { type: 'freeze', count: 0, active: false, remaining: 0 },
    double: { type: 'double', count: 0, active: false, remaining: 0 },
    multi: { type: 'multi', count: 0, active: false, remaining: 0 },
  });

  // High scores
  const [highScore, setHighScore] = useState<number>(0);
  const [highestLevel, setHighestLevel] = useState<number>(1);
  const [highestCombo, setHighestCombo] = useState<number>(0);

  // Refs for game loop
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const powerUpTimersRef = useRef<Map<PowerUpType, ReturnType<typeof setTimeout>>>(new Map());
  const gameActiveRef = useRef(false);
  const freezeActiveRef = useRef(false);
  const doubleActiveRef = useRef(false);
  const multiActiveRef = useRef(0);
  const escapeStreakRef = useRef(0);

  // Load high scores from localStorage
  useEffect(() => {
    const savedScore = localStorage.getItem('pb-whack');
    const savedLevel = localStorage.getItem('pb-whack-level');
    const savedCombo = localStorage.getItem('pb-whack-combo');
    if (savedScore) setHighScore(parseInt(savedScore, 10));
    if (savedLevel) {
      const level = parseInt(savedLevel, 10);
      setHighestLevel(level);
      setUnlockedLevel(level);
    }
    if (savedCombo) setHighestCombo(parseInt(savedCombo, 10));
  }, []);

  // Track cursor position for dark mode
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else {
        setCursorPos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      hideTimersRef.current.forEach((t) => clearTimeout(t));
      powerUpTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const getLevelConfig = useCallback(() => {
    if (isEndless) {
      const progress = Math.floor(elapsedRef.current / 10); // Every 10 seconds, speed up
      return {
        id: 99,
        name: 'Endless',
        duration: 999,
        target: 999999,
        spawnRate: Math.max(400, 800 - progress * 50),
        visibleDuration: Math.max(600, 1000 - progress * 40),
        maxVisible: 3,
        moleTypes: ['normal', 'golden', 'bomb', 'helmet'] as MoleType[],
      };
    }
    return LEVELS[currentLevel - 1];
  }, [currentLevel, isEndless]);

  const endGame = useCallback((won: boolean = false) => {
    gameActiveRef.current = false;
    setGameState('gameOver');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnTimerRef.current) { clearTimeout(spawnTimerRef.current); spawnTimerRef.current = null; }
    hideTimersRef.current.forEach((t) => clearTimeout(t));
    hideTimersRef.current.clear();
    powerUpTimersRef.current.forEach((t) => clearTimeout(t));
    powerUpTimersRef.current.clear();

    const finalScore = scoreRef.current;
    const finalCombo = maxCombo;
    setScore(finalScore);

    // Update high scores
    const savedScore = localStorage.getItem('pb-whack');
    const currentBest = savedScore ? parseInt(savedScore, 10) : 0;
    if (finalScore > currentBest) {
      setHighScore(finalScore);
      localStorage.setItem('pb-whack', finalScore.toString());
    }

    if (finalCombo > highestCombo) {
      setHighestCombo(finalCombo);
      localStorage.setItem('pb-whack-combo', finalCombo.toString());
    }

    if (won && currentLevel > highestLevel) {
      setHighestLevel(currentLevel);
      setUnlockedLevel(currentLevel + 1);
      localStorage.setItem('pb-whack-level', (currentLevel + 1).toString());
    }
  }, [currentLevel, highestLevel, highestCombo, maxCombo]);

  const advanceLevel = useCallback(() => {
    if (isEndless) return;

    const won = scoreRef.current >= getLevelConfig().target;
    if (!won) {
      endGame(false);
      return;
    }

    if (currentLevel >= 10) {
      endGame(true);
      return;
    }

    // Clean up all active moles and timers before transitioning
    gameActiveRef.current = false;
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    hideTimersRef.current.forEach((t) => clearTimeout(t));
    hideTimersRef.current.clear();
    setMoleHoles(Array.from({ length: 9 }, () => ({ visible: false, type: 'normal', hit: false })));

    // Level up!
    setGameState('levelUp');
    setLevelUpMessage(`Level ${currentLevel} Complete!`);

    // Award power-up every 2 levels
    if (currentLevel % 2 === 0) {
      const types: PowerUpType[] = ['freeze', 'double', 'multi'];
      const awarded = types[Math.floor(Math.random() * types.length)];
      setPowerUps((prev) => ({
        ...prev,
        [awarded]: { ...prev[awarded], count: Math.min(prev[awarded].count + 1, 3) },
      }));
    }

    const nextLevel = currentLevel + 1;
    setTimeout(() => {
      setCurrentLevel(nextLevel);
      setGameState('countdown');
      setCountdown(3);

      let count = 3;
      const countInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(countInterval);
          startPlaying();
        }
      }, 1000);
    }, 2000);
  }, [currentLevel, isEndless, getLevelConfig, endGame]);

  const checkLevelComplete = useCallback(() => {
    // Level completion is now only checked when time runs out, not on every hit
    // This ensures players experience the full level duration
    return;
  }, []);

  const updateCombo = useCallback((hit: boolean) => {
    if (hit) {
      comboRef.current += 1;
      setCombo(comboRef.current);
      setMaxCombo((prev) => Math.max(prev, comboRef.current));
      escapeStreakRef.current = 0;
      setEscapeStreak(0);
    } else {
      comboRef.current = 0;
      setCombo(0);
    }
  }, []);

  const loseLife = useCallback(() => {
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        endGame(false);
      }
      return newLives;
    });
    // Flash screen for life lost (from escapes)
    const flashDiv = document.createElement('div');
    flashDiv.style.cssText = 'position:fixed;inset:0;background:red;opacity:0.4;pointer-events:none;z-index:9999;';
    document.body.appendChild(flashDiv);
    setTimeout(() => flashDiv.remove(), 300);
  }, [endGame]);

  const flashBombHit = useCallback((holeElement: HTMLElement) => {
    // Flash specific hole when bomb is hit
    const flashDiv = document.createElement('div');
    const rect = holeElement.getBoundingClientRect();
    flashDiv.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;background:red;opacity:0.6;pointer-events:none;z-index:9999;border-radius:50%;`;
    document.body.appendChild(flashDiv);
    setTimeout(() => flashDiv.remove(), 200);
  }, []);

  const spawnMole = useCallback(() => {
    if (!gameActiveRef.current) return;

    const cfg = getLevelConfig();
    const visibleCount = moleHoles.filter((h) => h.visible).length;
    if (visibleCount >= cfg.maxVisible) {
      spawnTimerRef.current = setTimeout(spawnMole, cfg.spawnRate / 2);
      return;
    }

    setMoleHoles((prev) => {
      const available = prev.map((h, i) => ({ ...h, idx: i })).filter((h) => !h.visible);
      if (available.length === 0) return prev;

      const pick = available[Math.floor(Math.random() * available.length)];

      // Determine mole type
      let type: MoleType = 'normal';
      const validTypes = cfg.moleTypes;
      const rand = Math.random();

      if (validTypes.includes('boss') && cfg.special === 'boss' && rand < 0.05) {
        type = 'boss';
      } else if (validTypes.includes('bomb') && rand < 0.15) {
        type = 'bomb';
      } else if (validTypes.includes('golden') && rand < 0.15) {
        type = 'golden';
      } else if (validTypes.includes('helmet') && rand < 0.2) {
        type = 'helmet';
      }

      let updated = prev.map((h, i) =>
        i === pick.idx ? { visible: true, type, hit: false, helmetHits: 0, bossHits: 0 } : h
      );

      // For boss moles, occupy 2x2 grid (holes 0-1-3-4, 1-2-4-5, 3-4-6-7, or 4-5-7-8)
      if (type === 'boss') {
        const bossConfigs = [
          [0, 1, 3, 4],
          [1, 2, 4, 5],
          [3, 4, 6, 7],
          [4, 5, 7, 8],
        ];
        const validBoss = bossConfigs.filter((holes) =>
          holes.every((h) => !prev[h].visible)
        );
        if (validBoss.length > 0) {
          const bossHoles = validBoss[Math.floor(Math.random() * validBoss.length)];
          updated = prev.map((h, i) => {
            if (bossHoles.includes(i)) {
              return { visible: true, type: 'boss', hit: false, bossHits: 0, holeIndex: bossHoles[0] };
            }
            return h;
          });
        }
      }

      // Auto-hide after duration
      const hideTimer = setTimeout(() => {
        if (!gameActiveRef.current) return;
        setMoleHoles((cur) => {
          const mole = cur[pick.idx];
          if (!mole.visible) return cur;

          // Mole escaped
          escapeStreakRef.current += 1;
          setEscapeStreak(escapeStreakRef.current);

          if (escapeStreakRef.current >= 3) {
            loseLife();
            escapeStreakRef.current = 0;
            setEscapeStreak(0);
          }

          updateCombo(false);

          return cur.map((h, i) => (i === pick.idx ? { ...h, visible: false } : h));
        });
        hideTimersRef.current.delete(pick.idx);
      }, cfg.visibleDuration);
      hideTimersRef.current.set(pick.idx, hideTimer);

      return updated;
    });

    // Schedule next spawn
    spawnTimerRef.current = setTimeout(spawnMole, cfg.spawnRate);
  }, [getLevelConfig, loseLife, updateCombo]);

  const startPlaying = useCallback(() => {
    const cfg = getLevelConfig();
    setGameState('playing');
    gameActiveRef.current = true;
    setTimeLeft(cfg.duration);
    elapsedRef.current = 0;
    setMoleHoles(Array.from({ length: 9 }, () => ({ visible: false, type: 'normal', hit: false })));

    // Start timer
    timerRef.current = setInterval(() => {
      if (freezeActiveRef.current) return; // Time freeze active

      elapsedRef.current += 0.1;
      const remaining = Math.max(0, cfg.duration - elapsedRef.current);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (isEndless) {
          endGame(false);
        } else {
          // Time's up - check if level target was met
          advanceLevel();
        }
      }
    }, 100);

    // Start spawning moles
    spawnMole();
  }, [getLevelConfig, isEndless, endGame, advanceLevel, spawnMole]);

  const startGame = (level: number, endless: boolean = false) => {
    setIsEndless(endless);
    setCurrentLevel(level);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setMaxCombo(0);
    setLives(3);
    setEscapeStreak(0);
    escapeStreakRef.current = 0;
    setPowerUps({
      freeze: { type: 'freeze', count: 0, active: false, remaining: 0 },
      double: { type: 'double', count: 0, active: false, remaining: 0 },
      multi: { type: 'multi', count: 0, active: false, remaining: 0 },
    });
    freezeActiveRef.current = false;
    doubleActiveRef.current = false;
    multiActiveRef.current = 0;

    setGameState('countdown');
    setCountdown(3);

    let count = 3;
    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countInterval);
        startPlaying();
      }
    }, 1000);
  };

  const whackMole = (idx: number, event?: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (!gameActiveRef.current) return;

    setMoleHoles((prev) => {
      const mole = prev[idx];
      if (!mole.visible) return prev;

      let points = 0;
      let shouldHide = true;
      let hitSuccess = true;

      if (mole.type === 'bomb') {
        // Hit a bomb - lose points and flash red
        points = -3;
        updateCombo(false);
        hitSuccess = false;

        // Flash the hole red
        if (event) {
          const target = event.currentTarget;
          flashBombHit(target);
        }
      } else if (mole.type === 'helmet') {
        // Helmet mole needs 2 hits
        const hits = (mole.helmetHits || 0) + 1;
        if (hits >= 2) {
          points = 2;
          updateCombo(true);
        } else {
          shouldHide = false;
          updateCombo(true);
        }

        if (shouldHide) {
          const hideTimer = hideTimersRef.current.get(idx);
          if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimersRef.current.delete(idx);
          }
        }

        return prev.map((h, i) =>
          i === idx ? { ...h, helmetHits: hits, visible: !shouldHide, hit: shouldHide } : h
        );
      } else if (mole.type === 'boss') {
        // Boss mole needs 5 hits
        const hits = (mole.bossHits || 0) + 1;
        if (hits >= 5) {
          points = 15;
          updateCombo(true);
          shouldHide = true;

          // Hide all boss holes
          const bossHoleIndex = mole.holeIndex || idx;
          prev.forEach((h, i) => {
            if (h.visible && h.type === 'boss' && h.holeIndex === bossHoleIndex) {
              const timer = hideTimersRef.current.get(i);
              if (timer) {
                clearTimeout(timer);
                hideTimersRef.current.delete(i);
              }
            }
          });

          return prev.map((h, i) =>
            h.visible && h.type === 'boss' && h.holeIndex === bossHoleIndex
              ? { ...h, visible: false, hit: true }
              : h
          );
        } else {
          shouldHide = false;
          updateCombo(true);

          // Update all boss holes
          const bossHoleIndex = mole.holeIndex || idx;
          return prev.map((h, i) =>
            h.visible && h.type === 'boss' && h.holeIndex === bossHoleIndex
              ? { ...h, bossHits: hits }
              : h
          );
        }
      } else if (mole.type === 'golden') {
        points = 3;
        updateCombo(true);
      } else {
        points = 1;
        updateCombo(true);
      }

      // Apply combo multiplier
      const multiplier = Math.min(comboRef.current, 10);
      points = Math.round(points * multiplier);

      // Apply double points power-up
      if (doubleActiveRef.current && points > 0) {
        points *= 2;
      }

      // Apply multi-whack power-up
      if (multiActiveRef.current > 0 && points > 0) {
        multiActiveRef.current -= 1;
        setPowerUps((p) => ({ ...p, multi: { ...p.multi, remaining: multiActiveRef.current } }));

        // Hit all visible moles
        prev.forEach((h, i) => {
          if (h.visible && i !== idx) {
            setTimeout(() => whackMole(i), 50 * i);
          }
        });
      }

      scoreRef.current += points;
      setScore(scoreRef.current);

      if (shouldHide) {
        const hideTimer = hideTimersRef.current.get(idx);
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimersRef.current.delete(idx);
        }
      }

      const updated = prev.map((h, i) =>
        i === idx ? { visible: !shouldHide, type: h.type, hit: shouldHide, helmetHits: h.helmetHits, bossHits: h.bossHits } : h
      );

      // Clear hit animation after 300ms
      setTimeout(() => {
        setMoleHoles((cur) => cur.map((h, i) => (i === idx ? { ...h, hit: false } : h)));
      }, 300);

      return updated;
    });
  };

  const activatePowerUp = (type: PowerUpType) => {
    setPowerUps((prev) => {
      const pu = prev[type];
      if (pu.count <= 0 || pu.active) return prev;

      if (type === 'freeze') {
        freezeActiveRef.current = true;
        const timer = setTimeout(() => {
          freezeActiveRef.current = false;
          setPowerUps((p) => ({ ...p, freeze: { ...p.freeze, active: false } }));
        }, 5000);
        powerUpTimersRef.current.set(type, timer);
        return { ...prev, freeze: { ...pu, count: pu.count - 1, active: true } };
      } else if (type === 'double') {
        doubleActiveRef.current = true;
        const timer = setTimeout(() => {
          doubleActiveRef.current = false;
          setPowerUps((p) => ({ ...p, double: { ...p.double, active: false } }));
        }, 8000);
        powerUpTimersRef.current.set(type, timer);
        return { ...prev, double: { ...pu, count: pu.count - 1, active: true } };
      } else if (type === 'multi') {
        multiActiveRef.current = 5;
        return { ...prev, multi: { ...pu, count: pu.count - 1, active: true, remaining: 5 } };
      }

      return prev;
    });
  };

  const shareScore = async () => {
    const text = isEndless
      ? `I scored ${scoreRef.current} in Whack-a-Mole Endless mode! Can you beat it? Play now at playmini.fun/whack-a-mole`
      : `I beat Level ${currentLevel} in Whack-a-Mole with ${scoreRef.current} points! Can you beat it? Play now at playmini.fun/whack-a-mole`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const cfg = getLevelConfig();
  const isDark = cfg.special === 'dark' && gameState === 'playing';

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Timer Bar */}
      {(gameState === 'playing' || gameState === 'countdown') && !isEndless && (
        <div className="mb-4">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                timeLeft / cfg.duration < 0.2
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-green-500 to-yellow-500'
              }`}
              style={{ width: `${(timeLeft / cfg.duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="text-white text-sm font-bold">{Math.ceil(timeLeft)}s</div>
            <div className="text-gray-400 text-xs">Target: {cfg.target}</div>
          </div>
        </div>
      )}

      {/* Level Info + Score + Lives + Combo */}
      {gameState === 'playing' && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-white font-bold text-lg">{cfg.name}</div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`text-2xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}
                >
                  ❤️
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-bold text-white">{score}</div>
              <div className="text-gray-400 text-xs">Score</div>
            </div>

            {combo > 0 && (
              <div className="text-center">
                <div
                  className={`text-5xl font-black ${
                    combo >= 10 ? 'text-red-500 animate-pulse' :
                    combo >= 5 ? 'text-orange-500' :
                    combo >= 3 ? 'text-yellow-500' : 'text-white'
                  }`}
                  style={{
                    animation: combo >= 5 ? 'comboShake 0.3s ease-in-out' : undefined,
                    transform: 'scale(1.1)',
                    textShadow: '0 0 20px currentColor',
                  }}
                >
                  {Math.min(combo, 10)}x
                </div>
                <div className="text-gray-400 text-xs">COMBO</div>
              </div>
            )}
          </div>

          {/* Progress bar for level target */}
          {!isEndless && (
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${Math.min((score / cfg.target) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Power-up Buttons */}
      {gameState === 'playing' && (
        <div className="flex gap-2 mb-4 justify-center">
          <button
            onClick={() => activatePowerUp('freeze')}
            disabled={powerUps.freeze.count <= 0 || powerUps.freeze.active}
            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
              powerUps.freeze.active
                ? 'bg-blue-600 ring-2 ring-blue-400 animate-pulse'
                : powerUps.freeze.count > 0
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            ❄️ Freeze {powerUps.freeze.count > 0 && `(${powerUps.freeze.count})`}
          </button>
          <button
            onClick={() => activatePowerUp('double')}
            disabled={powerUps.double.count <= 0 || powerUps.double.active}
            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
              powerUps.double.active
                ? 'bg-yellow-600 ring-2 ring-yellow-400 animate-pulse'
                : powerUps.double.count > 0
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            2x {powerUps.double.count > 0 && `(${powerUps.double.count})`}
          </button>
          <button
            onClick={() => activatePowerUp('multi')}
            disabled={powerUps.multi.count <= 0 || powerUps.multi.active}
            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
              powerUps.multi.active
                ? 'bg-purple-600 ring-2 ring-purple-400'
                : powerUps.multi.count > 0
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            💥 Multi {powerUps.multi.active ? `(${multiActiveRef.current})` : powerUps.multi.count > 0 ? `(${powerUps.multi.count})` : ''}
          </button>
        </div>
      )}

      {/* Menu State */}
      {gameState === 'menu' && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔨</div>
          <h2 className="text-4xl font-bold text-white mb-4">Whack-a-Mole</h2>
          <p className="text-gray-400 mb-6">Choose a level or play endless mode!</p>

          {highScore > 0 && (
            <div className="mb-6 p-4 bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{highScore}</div>
              <div className="text-gray-400 text-sm">High Score</div>
              {highestCombo > 0 && (
                <div className="text-lg font-bold text-orange-500 mt-1">{highestCombo}x Max Combo</div>
              )}
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-3 font-bold">Levels</p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => startGame(level.id, false)}
                  disabled={level.id > unlockedLevel}
                  className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                    level.id <= unlockedLevel
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {level.id <= unlockedLevel ? level.id : '🔒'}
                </button>
              ))}
            </div>
            <button
              onClick={() => startGame(1, true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105"
            >
              ♾️ Endless Mode
            </button>
          </div>

          <div className="text-left bg-slate-800 rounded-lg p-4 text-sm space-y-2">
            <p className="font-bold text-white mb-2">Mole Types:</p>
            <p className="text-gray-300">🟤 Normal - 1 point</p>
            <p className="text-yellow-400">✨ Golden - 3 points</p>
            <p className="text-red-500">💣 Bomb - AVOID! (-3 points)</p>
            <p className="text-gray-400">⛑️ Helmet - needs 2 hits, 2 points</p>
            <p className="text-red-600">👹 Boss - needs 5 hits, 15 points</p>
          </div>
        </div>
      )}

      {/* Countdown */}
      {gameState === 'countdown' && (
        <div className="text-center py-16">
          <div className="text-9xl font-bold text-white animate-pulse">{countdown}</div>
        </div>
      )}

      {/* Level Up */}
      {gameState === 'levelUp' && (
        <div className="text-center py-16">
          <div className="text-6xl font-bold text-green-500 mb-4 animate-bounce">
            {levelUpMessage}
          </div>
          <div className="text-2xl text-white">Get Ready...</div>
        </div>
      )}

      {/* Game Grid */}
      {gameState === 'playing' && (
        <div className="relative">
          <div
            className="relative p-4 rounded-2xl"
            style={{ background: 'linear-gradient(180deg, #2d5a1e 0%, #1a3d10 100%)' }}
          >
            {/* Dark mode overlay */}
            {isDark && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                style={{
                  background: `radial-gradient(circle 150px at ${cursorPos.x}px ${cursorPos.y}px, transparent, rgba(0,0,0,0.85))`,
                }}
              />
            )}

            {/* Grass texture overlay */}
            <div
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle, #3a7a24 1px, transparent 1px)`,
                backgroundSize: '8px 8px',
              }}
            />

            <div className="grid grid-cols-3 gap-3 md:gap-4 relative z-20">
              {moleHoles.map((hole, idx) => {
                // Skip rendering if this is a boss sub-hole
                if (hole.visible && hole.type === 'boss' && hole.holeIndex !== idx) {
                  return <div key={idx} className="aspect-square" />;
                }

                return (
                  <button
                    key={idx}
                    onClick={(e) => whackMole(idx, e)}
                    className="relative aspect-square cursor-pointer select-none active:scale-95 transition-transform"
                  >
                    {/* Hole background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-stone-900 rounded-full border-4 border-stone-700 shadow-inner overflow-hidden">
                      {/* Dirt texture */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: 'radial-gradient(circle, #5c4033 1px, transparent 1px)',
                          backgroundSize: '6px 6px',
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-stone-800 to-transparent rounded-b-full" />

                      {/* Mole */}
                      {hole.visible && (
                        <div
                          className={`absolute inset-x-2 bottom-1 top-1/4 rounded-t-full flex flex-col items-center justify-start pt-[15%] ${
                            hole.type === 'golden'
                              ? 'bg-gradient-to-b from-yellow-400 to-yellow-700'
                              : hole.type === 'bomb'
                              ? 'bg-gradient-to-b from-red-600 to-red-900'
                              : hole.type === 'boss'
                              ? 'bg-gradient-to-b from-red-700 to-black'
                              : 'bg-gradient-to-b from-amber-600 to-amber-900'
                          }`}
                          style={{
                            animation: 'molePopUp 0.15s ease-out',
                            transform: hole.type === 'boss' ? 'scale(1.3)' : undefined,
                          }}
                        >
                          {/* Fur texture */}
                          <div
                            className="absolute inset-0 rounded-t-full opacity-20"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)',
                            }}
                          />

                          {/* Helmet (for helmet moles) */}
                          {hole.type === 'helmet' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1/3 bg-gradient-to-b from-gray-400 to-gray-600 rounded-t-full border-2 border-gray-500">
                              {(hole.helmetHits || 0) >= 1 && (
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-700 to-transparent" />
                              )}
                            </div>
                          )}

                          {/* Boss HP bar */}
                          {hole.type === 'boss' && (
                            <div className="absolute -top-6 left-0 right-0 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                                style={{ width: `${((5 - (hole.bossHits || 0)) / 5) * 100}%` }}
                              />
                            </div>
                          )}

                          {/* Eyes */}
                          <div className="flex gap-[25%] mb-[5%] relative">
                            <div
                              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full relative ${
                                hole.type === 'boss' ? 'bg-red-600 shadow-lg shadow-red-500' : 'bg-black'
                              }`}
                            >
                              {hole.type !== 'boss' && (
                                <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full" />
                              )}
                            </div>
                            <div
                              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full relative ${
                                hole.type === 'boss' ? 'bg-red-600 shadow-lg shadow-red-500' : 'bg-black'
                              }`}
                            >
                              {hole.type !== 'boss' && (
                                <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full" />
                              )}
                            </div>
                          </div>

                          {/* Nose / Bomb fuse */}
                          {hole.type === 'bomb' ? (
                            <div className="relative">
                              <div className="w-3 h-2 md:w-4 md:h-3 rounded-full bg-black" />
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-orange-500 animate-pulse" />
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" />
                            </div>
                          ) : (
                            <div
                              className={`w-3 h-2 md:w-4 md:h-3 rounded-full ${
                                hole.type === 'golden' ? 'bg-yellow-900' : 'bg-pink-400'
                              }`}
                            />
                          )}
                        </div>
                      )}

                      {/* Hit animation */}
                      {hole.hit && (
                        <div className="absolute inset-0 flex items-center justify-center z-30">
                          <span
                            className={`text-2xl md:text-3xl font-black animate-bounce ${
                              hole.type === 'bomb' ? 'text-red-500' : 'text-green-400'
                            }`}
                          >
                            {hole.type === 'bomb' ? '-3' : `+${hole.type === 'golden' ? '3' : hole.type === 'helmet' ? '2' : hole.type === 'boss' ? '15' : '1'}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Game Over State */}
      {gameState === 'gameOver' && (
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            {isEndless ? 'Game Over!' : score >= cfg.target ? '🎉 Victory!' : 'Time\'s Up!'}
          </h2>
          <div className="mb-6 space-y-3">
            <div>
              <div className="text-6xl font-bold text-white">{score}</div>
              <div className="text-gray-400 text-lg">Final Score</div>
            </div>
            {maxCombo > 0 && (
              <div>
                <div className="text-3xl font-bold text-orange-500">{maxCombo}x</div>
                <div className="text-gray-400 text-sm">Best Combo</div>
              </div>
            )}
            {highScore > 0 && (
              <div>
                <div className="text-2xl font-bold text-yellow-500">{highScore}</div>
                <div className="text-gray-400 text-sm">High Score</div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setGameState('menu');
                setScore(0);
                setCombo(0);
                setMaxCombo(0);
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105"
            >
              Back to Menu
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
        @keyframes comboShake {
          0%, 100% { transform: translateX(0) scale(1.1); }
          25% { transform: translateX(-5px) scale(1.1); }
          75% { transform: translateX(5px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
