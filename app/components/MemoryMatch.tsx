"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type GameState = "MENU" | "PLAYING" | "LEVEL_COMPLETE" | "GAME_OVER";
type PowerUpType = "peek" | "freeze" | "hint";

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface PowerUp {
  type: PowerUpType;
  count: number;
}

interface LevelConfig {
  level: number;
  name: string;
  rows: number;
  cols: number;
  pairs: number;
  timeLimit?: number; // seconds, undefined = no limit
  shuffles?: boolean; // cards shuffle positions every 10s
  flashStart?: boolean; // cards flash briefly at start
  description: string;
}

const LEVELS: LevelConfig[] = [
  { level: 1, name: "Tiny Grid", rows: 2, cols: 3, pairs: 3, flashStart: true, description: "Tutorial level" },
  { level: 2, name: "Small Grid", rows: 2, cols: 4, pairs: 4, flashStart: true, description: "Warmup" },
  { level: 3, name: "Classic Easy", rows: 3, cols: 4, pairs: 6, flashStart: true, description: "Standard board" },
  { level: 4, name: "Standard", rows: 4, cols: 4, pairs: 8, description: "Getting harder" },
  { level: 5, name: "Wide Board", rows: 4, cols: 5, pairs: 10, description: "More cards" },
  { level: 6, name: "Big Board", rows: 4, cols: 6, pairs: 12, description: "Large grid" },
  { level: 7, name: "Speed Round", rows: 4, cols: 4, pairs: 8, timeLimit: 60, flashStart: true, description: "Beat the clock!" },
  { level: 8, name: "Dark Cards", rows: 4, cols: 5, pairs: 10, flashStart: true, description: "Cards flash then dim" },
  { level: 9, name: "Chaos Grid", rows: 4, cols: 6, pairs: 12, shuffles: true, description: "Cards shuffle!" },
  { level: 10, name: "Master", rows: 5, cols: 6, pairs: 15, description: "Maximum challenge" },
];

// Symbol sets themed by category
const SYMBOL_SETS = {
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"],
  food: ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑"],
  sports: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🏒", "🏑", "🥊", "🥋", "⛳"],
  nature: ["🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🌺", "🌻", "🌸", "🌼"],
  space: ["🌍", "🌎", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑", "⭐", "🌟", "✨", "💫", "☄️", "🪐", "🚀"],
  music: ["🎸", "🎹", "🎺", "🎻", "🥁", "🎷", "🎤", "🎧", "🎵", "🎶", "🎼", "🎙️", "📻", "🎚️", "🎛️"],
  objects: ["⚓", "🔔", "🔑", "🔒", "🔓", "🔧", "🔨", "⚙️", "💎", "💍", "👑", "🎩", "🎓", "🎭", "🎨"],
  emojis: ["😀", "😃", "😄", "😁", "😆", "🤣", "😊", "😇", "🙂", "🤗", "😍", "🥰", "😎", "🤩", "🥳"],
};

const THEME_ORDER = ["animals", "food", "sports", "nature", "space", "music", "objects", "emojis"];

// ============================================================================
// COMPONENT
// ============================================================================

export default function MemoryMatch() {
  // Core game state
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isEndless, setIsEndless] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  // Campaign progress
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [highScore, setHighScore] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState(1);

  // Power-ups
  const [powerUps, setPowerUps] = useState<Record<PowerUpType, number>>({
    peek: 3,
    freeze: 0,
    hint: 0,
  });
  const [freezeActive, setFreezeActive] = useState(false);
  const [freezeTimer, setFreezeTimer] = useState(0);

  // UI state
  const [isChecking, setIsChecking] = useState(false);
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const [flashedAtStart, setFlashedAtStart] = useState(false);
  const [hintPair, setHintPair] = useState<[number, number] | null>(null);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shuffleRef = useRef<NodeJS.Timeout | null>(null);
  const freezeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // LOAD SAVED DATA
  // ============================================================================

  useEffect(() => {
    const savedStars = localStorage.getItem("pb-memory-stars");
    if (savedStars) {
      setLevelStars(JSON.parse(savedStars));
    }

    const savedHighScore = localStorage.getItem("pb-memory-campaign");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    const savedUnlocked = localStorage.getItem("pb-memory-unlocked");
    if (savedUnlocked) {
      setUnlockedLevels(parseInt(savedUnlocked, 10));
    }

    const savedPowerUps = localStorage.getItem("pb-memory-powerups");
    if (savedPowerUps) {
      setPowerUps(JSON.parse(savedPowerUps));
    }
  }, []);

  // ============================================================================
  // GAME TIMER
  // ============================================================================

  useEffect(() => {
    if (gameState === "PLAYING") {
      timerRef.current = setInterval(() => {
        setTime((t) => {
          const config = LEVELS[currentLevel - 1];
          if (config.timeLimit && t + 1 >= config.timeLimit) {
            // Time's up - lose a life
            loseLife("Time ran out!");
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentLevel]);

  // ============================================================================
  // CHAOS SHUFFLE (Level 9)
  // ============================================================================

  useEffect(() => {
    const config = LEVELS[currentLevel - 1];
    if (gameState === "PLAYING" && config.shuffles && !freezeActive) {
      shuffleRef.current = setInterval(() => {
        setCards((prev) => {
          const unmatched = prev.filter(c => !c.isMatched);
          const matched = prev.filter(c => c.isMatched);

          // Shuffle unmatched cards
          for (let i = unmatched.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unmatched[i], unmatched[j]] = [unmatched[j], unmatched[i]];
          }

          // Rebuild full card array preserving positions
          const result: Card[] = [];
          let unmatchedIdx = 0;
          let matchedIdx = 0;

          for (let i = 0; i < prev.length; i++) {
            if (prev[i].isMatched) {
              result.push({ ...matched[matchedIdx++], id: i });
            } else {
              result.push({ ...unmatched[unmatchedIdx++], id: i });
            }
          }

          return result;
        });
      }, 10000);
    } else {
      if (shuffleRef.current) clearInterval(shuffleRef.current);
    }

    return () => {
      if (shuffleRef.current) clearInterval(shuffleRef.current);
    };
  }, [gameState, currentLevel, freezeActive]);

  // ============================================================================
  // FREEZE TIMER
  // ============================================================================

  useEffect(() => {
    if (freezeActive && freezeTimer > 0) {
      freezeTimerRef.current = setInterval(() => {
        setFreezeTimer((t) => {
          if (t <= 1) {
            setFreezeActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (freezeTimerRef.current) clearInterval(freezeTimerRef.current);
    }

    return () => {
      if (freezeTimerRef.current) clearInterval(freezeTimerRef.current);
    };
  }, [freezeActive, freezeTimer]);

  // ============================================================================
  // INITIALIZE LEVEL
  // ============================================================================

  const initializeLevel = useCallback((level: number, endless: boolean = false) => {
    const config = endless ? generateEndlessLevel(level) : LEVELS[level - 1];
    const theme = THEME_ORDER[(level - 1) % THEME_ORDER.length];
    const symbols = SYMBOL_SETS[theme as keyof typeof SYMBOL_SETS];
    const selectedSymbols = symbols.slice(0, config.pairs);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];

    // Shuffle
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    const newCards: Card[] = cardPairs.map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(newCards);
    setFlippedIndices([]);
    setMoves(0);
    setTime(0);
    setCombo(0);
    setConsecutiveWrong(0);
    setGameState("PLAYING");
    setFlashedAtStart(false);
    setHintPair(null);

    // Flash cards at start if configured
    if (config.flashStart) {
      setCards(newCards.map(c => ({ ...c, isFlipped: true })));
      // Longer preview for early levels: 4s for levels 1-2, 3s for level 3, 2s for others
      const previewTime = level <= 2 ? 4000 : level === 3 ? 3000 : 2000;
      setTimeout(() => {
        setCards(newCards.map(c => ({ ...c, isFlipped: false })));
        setFlashedAtStart(true);
      }, previewTime);
    }
  }, []);

  const generateEndlessLevel = (level: number): LevelConfig => {
    const pairs = Math.min(15, 3 + level);
    const totalCards = pairs * 2;
    let rows = 4;
    let cols = Math.ceil(totalCards / rows);

    // Adjust for better fit
    if (totalCards <= 12) {
      rows = 3;
      cols = Math.ceil(totalCards / rows);
    } else if (totalCards <= 20) {
      rows = 4;
      cols = Math.ceil(totalCards / rows);
    } else {
      rows = 5;
      cols = Math.ceil(totalCards / rows);
    }

    return {
      level,
      name: `Endless ${level}`,
      rows,
      cols,
      pairs,
      timeLimit: level > 3 ? Math.max(30, 90 - level * 2) : undefined,
      shuffles: level > 5 && level % 3 === 0,
      flashStart: level > 2 && level % 2 === 0,
      description: `Endless mode`,
    };
  };

  // ============================================================================
  // CARD CLICK HANDLER
  // ============================================================================

  const handleCardClick = useCallback((index: number) => {
    if (
      gameState !== "PLAYING" ||
      isChecking ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedIndices.length >= 2 ||
      !flashedAtStart && LEVELS[currentLevel - 1]?.flashStart
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    setCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves((m) => m + 1);

      const [first, second] = newFlipped;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.symbol === secondCard.symbol) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, isMatched: true } : card
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
          setHintPair(null);

          // Update combo
          setCombo((c) => c + 1);
          setConsecutiveWrong(0);

          // Add score with combo multiplier
          const basePoints = 100;
          const comboMultiplier = Math.min(combo + 1, 5);
          const points = basePoints * comboMultiplier;
          setScore((s) => s + points);

          // Check if level complete
          const allMatched = cards.every(
            (card, i) => card.isMatched || i === first || i === second
          );

          if (allMatched) {
            completeLevel();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
          setHintPair(null);

          // Update wrong streak (more forgiving on early levels)
          setConsecutiveWrong((w) => {
            const newWrong = w + 1;
            const wrongLimit = currentLevel <= 2 ? 5 : currentLevel === 3 ? 4 : 3; // 5 for levels 1-2, 4 for level 3, 3 for rest
            if (newWrong >= wrongLimit) {
              loseLife(`${wrongLimit} consecutive wrong matches!`);
              return 0;
            }
            return newWrong;
          });

          setCombo(0);
        }, 1000);
      }
    }
  }, [gameState, isChecking, cards, flippedIndices, combo, currentLevel, flashedAtStart]);

  // ============================================================================
  // LEVEL COMPLETE / GAME OVER
  // ============================================================================

  const completeLevel = () => {
    const config = LEVELS[currentLevel - 1];
    const minMoves = config.pairs; // Perfect = exactly pairs in moves
    let stars = 1;
    // More forgiving star requirements for early levels
    const threeStarBuffer = currentLevel <= 3 ? 4 : 2; // levels 1-3 get +4 moves buffer
    const twoStarBuffer = currentLevel <= 3 ? 8 : 6;   // levels 1-3 get +8 moves buffer
    if (moves + 1 <= minMoves + threeStarBuffer) stars = 3;
    else if (moves + 1 <= minMoves + twoStarBuffer) stars = 2;

    // Bonus points for stars
    const starBonus = stars * 500;
    const finalScore = score + starBonus;
    setScore(finalScore);

    // Save stars for this level
    const newStars = { ...levelStars, [currentLevel]: Math.max(levelStars[currentLevel] || 0, stars) };
    setLevelStars(newStars);
    localStorage.setItem("pb-memory-stars", JSON.stringify(newStars));

    // Unlock next level
    if (currentLevel < LEVELS.length && currentLevel >= unlockedLevels) {
      const newUnlocked = currentLevel + 1;
      setUnlockedLevels(newUnlocked);
      localStorage.setItem("pb-memory-unlocked", newUnlocked.toString());
    }

    // Award power-ups every 2 levels
    if (currentLevel % 2 === 0) {
      const newPowerUps = {
        peek: powerUps.peek + 1,
        freeze: powerUps.freeze + 1,
        hint: currentLevel % 4 === 0 ? powerUps.hint + 1 : powerUps.hint,
      };
      setPowerUps(newPowerUps);
      localStorage.setItem("pb-memory-powerups", JSON.stringify(newPowerUps));
    }

    // Update high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("pb-memory-campaign", finalScore.toString());
    }

    setLevelUpFlash(true);
    setTimeout(() => {
      setLevelUpFlash(false);
      if (isEndless) {
        // Continue to next endless level
        setCurrentLevel((l) => l + 1);
        initializeLevel(currentLevel + 1, true);
      } else {
        setGameState("LEVEL_COMPLETE");
      }
    }, 2000);
  };

  const loseLife = (reason: string) => {
    const newLives = lives - 1;
    setLives(newLives);
    setCombo(0);
    setConsecutiveWrong(0);

    if (newLives <= 0) {
      gameOver();
    } else {
      alert(reason + ` Lives remaining: ${newLives}`);
      // Reset current level
      initializeLevel(currentLevel, isEndless);
    }
  };

  const gameOver = () => {
    setGameState("GAME_OVER");

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("pb-memory-campaign", score.toString());
    }
  };

  // ============================================================================
  // POWER-UPS
  // ============================================================================

  const usePeek = () => {
    if (powerUps.peek <= 0 || gameState !== "PLAYING") return;

    setPowerUps((prev) => ({ ...prev, peek: prev.peek - 1 }));
    localStorage.setItem("pb-memory-powerups", JSON.stringify({ ...powerUps, peek: powerUps.peek - 1 }));

    // Flip all cards for 1 second
    setCards((prev) => prev.map(c => c.isMatched ? c : { ...c, isFlipped: true }));
    setTimeout(() => {
      setCards((prev) => prev.map(c => c.isMatched ? c : { ...c, isFlipped: false }));
    }, 1000);
  };

  const useFreeze = () => {
    if (powerUps.freeze <= 0 || gameState !== "PLAYING" || freezeActive) return;

    setPowerUps((prev) => ({ ...prev, freeze: prev.freeze - 1 }));
    localStorage.setItem("pb-memory-powerups", JSON.stringify({ ...powerUps, freeze: powerUps.freeze - 1 }));

    setFreezeActive(true);
    setFreezeTimer(15);
  };

  const useHint = () => {
    if (powerUps.hint <= 0 || gameState !== "PLAYING" || hintPair) return;

    setPowerUps((prev) => ({ ...prev, hint: prev.hint - 1 }));
    localStorage.setItem("pb-memory-powerups", JSON.stringify({ ...powerUps, hint: powerUps.hint - 1 }));

    // Find one unmatched pair
    const unmatched = cards.filter(c => !c.isMatched);
    const symbols = unmatched.map(c => c.symbol);
    const firstDuplicate = symbols.find((s, i) => symbols.indexOf(s) !== i);

    if (firstDuplicate) {
      const indices = cards
        .map((c, i) => (c.symbol === firstDuplicate && !c.isMatched ? i : -1))
        .filter(i => i >= 0)
        .slice(0, 2);

      if (indices.length === 2) {
        setHintPair([indices[0], indices[1]]);
        setTimeout(() => setHintPair(null), 2000);
      }
    }
  };

  // ============================================================================
  // SHARE SCORE
  // ============================================================================

  const handleShare = async () => {
    const stars = "⭐".repeat(levelStars[currentLevel] || 1);
    const text = `I completed Memory Match Level ${currentLevel} with ${moves} moves and ${score} points! ${stars}\nhttps://playmini.fun/memory`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
      } catch {}
    }
  };

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStarRating = () => {
    const config = LEVELS[currentLevel - 1];
    const minMoves = config.pairs;
    const threeStarBuffer = currentLevel <= 3 ? 4 : 2;
    const twoStarBuffer = currentLevel <= 3 ? 8 : 6;
    if (moves <= minMoves + threeStarBuffer) return 3;
    if (moves <= minMoves + twoStarBuffer) return 2;
    return 1;
  };

  const config = isEndless ? generateEndlessLevel(currentLevel) : LEVELS[currentLevel - 1];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ============ LEVEL SELECT MENU ============ */}
      {gameState === "MENU" && (
        <div className="w-full max-w-3xl">
          <div className="bg-slate-900/50 rounded-2xl p-8 border border-gray-800 text-center mb-6">
            <div className="text-7xl mb-4">🧠</div>
            <h2 className="text-4xl font-black text-purple-400 mb-2">Memory Match</h2>
            <p className="text-gray-400 mb-4">10 Campaign Levels + Endless Mode</p>
            <div className="flex gap-4 justify-center text-sm text-gray-500">
              <div>High Score: <span className="text-yellow-400 font-bold">{highScore}</span></div>
              <div>Lives: <span className="text-red-400 font-bold">{lives}</span></div>
            </div>
          </div>

          {/* Campaign Levels */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {LEVELS.map((level) => {
              const locked = level.level > unlockedLevels;
              const stars = levelStars[level.level] || 0;

              return (
                <button
                  key={level.level}
                  onClick={() => {
                    if (!locked) {
                      setCurrentLevel(level.level);
                      setIsEndless(false);
                      setLives(3);
                      setScore(0);
                      initializeLevel(level.level, false);
                    }
                  }}
                  disabled={locked}
                  className={`relative p-4 rounded-xl font-bold transition-all ${
                    locked
                      ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-105 active:scale-95"
                  }`}
                >
                  <div className="text-2xl mb-1">{locked ? "🔒" : level.level}</div>
                  <div className="text-xs">{level.name}</div>
                  {stars > 0 && (
                    <div className="text-yellow-400 text-sm mt-1">
                      {"⭐".repeat(stars)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Endless Mode */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-blue-400 mb-2">Endless Mode</h3>
            <p className="text-gray-400 text-sm mb-4">
              Infinite levels with increasing difficulty. How far can you go?
            </p>
            <button
              onClick={() => {
                setCurrentLevel(1);
                setIsEndless(true);
                setLives(3);
                setScore(0);
                initializeLevel(1, true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Start Endless
            </button>
          </div>

          {/* Power-ups Display */}
          <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 mb-2">Power-Ups Available</h3>
            <div className="flex gap-4 justify-center text-sm">
              <div className="text-center">
                <div className="text-2xl">👁️</div>
                <div className="text-purple-400 font-bold">{powerUps.peek}</div>
                <div className="text-xs text-gray-500">Peek</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">❄️</div>
                <div className="text-blue-400 font-bold">{powerUps.freeze}</div>
                <div className="text-xs text-gray-500">Freeze</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">💡</div>
                <div className="text-yellow-400 font-bold">{powerUps.hint}</div>
                <div className="text-xs text-gray-500">Hint</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              Earn power-ups by completing levels!
            </p>
          </div>
        </div>
      )}

      {/* ============ PLAYING STATE ============ */}
      {gameState === "PLAYING" && (
        <>
          {/* Stats Bar */}
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
              <div className="text-2xl font-black text-purple-400 tabular-nums">
                {isEndless ? `∞-${currentLevel}` : currentLevel}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
              <div className="text-2xl font-black text-blue-400 tabular-nums">{score}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Moves</div>
              <div className="text-2xl font-black text-green-400 tabular-nums">{moves}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
              <div className="text-2xl font-black text-red-400 tabular-nums">{"❤️".repeat(lives)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Time</div>
              <div className="text-2xl font-black text-amber-400 tabular-nums">
                {config.timeLimit ? `${formatTime(time)} / ${formatTime(config.timeLimit)}` : formatTime(time)}
              </div>
            </div>
            {combo > 0 && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Combo</div>
                <div className="text-2xl font-black text-yellow-400 tabular-nums">x{combo}</div>
              </div>
            )}
          </div>

          {/* Power-up Buttons */}
          <div className="flex gap-3">
            <button
              onClick={usePeek}
              disabled={powerUps.peek <= 0}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                powerUps.peek > 0
                  ? "bg-purple-600 hover:bg-purple-500 text-white hover:scale-105 active:scale-95"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              👁️ Peek ({powerUps.peek})
            </button>
            <button
              onClick={useFreeze}
              disabled={powerUps.freeze <= 0 || freezeActive}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                powerUps.freeze > 0 && !freezeActive
                  ? "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              ❄️ Freeze ({powerUps.freeze}) {freezeActive && `${freezeTimer}s`}
            </button>
            <button
              onClick={useHint}
              disabled={powerUps.hint <= 0}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                powerUps.hint > 0
                  ? "bg-yellow-600 hover:bg-yellow-500 text-white hover:scale-105 active:scale-95"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              💡 Hint ({powerUps.hint})
            </button>
          </div>

          {/* Game Board */}
          <div
            className="grid gap-2 sm:gap-3 p-4 bg-slate-900 rounded-2xl border border-gray-800 relative"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
              maxWidth: `${config.cols * 90 + 32}px`,
            }}
          >
            {cards.map((card, index) => {
              const isHinted = hintPair?.includes(index);

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  disabled={card.isFlipped || card.isMatched || isChecking}
                  className={`aspect-square rounded-xl text-3xl sm:text-4xl font-bold transition-all duration-300 ${
                    card.isFlipped || card.isMatched
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 scale-100"
                      : "bg-gradient-to-br from-slate-700 to-slate-800 hover:scale-105 active:scale-95"
                  } ${
                    card.isMatched
                      ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50"
                      : ""
                  } ${
                    isHinted ? "ring-4 ring-green-400 animate-pulse" : ""
                  }`}
                  style={{
                    minWidth: "60px",
                    minHeight: "60px",
                    maxWidth: "90px",
                    maxHeight: "90px",
                  }}
                >
                  {card.isFlipped || card.isMatched ? (
                    <span className="block">{card.symbol}</span>
                  ) : (
                    <span className="text-slate-600 text-2xl">?</span>
                  )}
                </button>
              );
            })}

            {/* Level-up Flash */}
            {levelUpFlash && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 rounded-2xl backdrop-blur-sm z-10">
                <div className="text-center">
                  <div className="text-6xl mb-3">🎉</div>
                  <h2 className="text-3xl font-black text-yellow-400">Level Complete!</h2>
                  <div className="text-2xl mt-2">{"⭐".repeat(getStarRating())}</div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-xs text-gray-600 max-w-md">
            <p className="font-semibold mb-1">{config.name}</p>
            <p>{config.description}</p>
            {consecutiveWrong > 0 && (
              <p className="text-red-400 mt-2 font-bold">
                Wrong matches: {consecutiveWrong}/{currentLevel <= 2 ? 5 : currentLevel === 3 ? 4 : 3} (Lose a life at limit!)
              </p>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={() => {
              setGameState("MENU");
              setCards([]);
            }}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all"
          >
            Back to Menu
          </button>
        </>
      )}

      {/* ============ LEVEL COMPLETE STATE ============ */}
      {gameState === "LEVEL_COMPLETE" && (
        <div className="w-full max-w-md">
          <div className="bg-slate-900/50 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-4">Level Complete!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-4 mb-6 space-y-2">
              <p className="text-white text-lg font-bold">
                Level {currentLevel}: {config.name}
              </p>
              <p className="text-gray-300">
                {moves} moves · {formatTime(time)}
              </p>
              <p className="text-gray-300">
                Score: <span className="text-blue-400 font-bold">{score}</span>
              </p>
              <p className="text-2xl mb-2">{"⭐".repeat(levelStars[currentLevel] || 1)}</p>
              {score === highScore && (
                <p className="text-yellow-400 text-sm font-bold">New High Score!</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {currentLevel < LEVELS.length && (
                <button
                  onClick={() => {
                    setCurrentLevel(currentLevel + 1);
                    initializeLevel(currentLevel + 1, false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Next Level
                </button>
              )}
              <button
                onClick={() => initializeLevel(currentLevel, false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Replay Level
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
              <button
                onClick={() => {
                  setGameState("MENU");
                  setCards([]);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Level Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ GAME OVER STATE ============ */}
      {gameState === "GAME_OVER" && (
        <div className="w-full max-w-md">
          <div className="bg-slate-900/50 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="text-6xl mb-3">💀</div>
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-4 mb-6 space-y-2">
              <p className="text-white text-lg font-bold">
                Reached Level: {currentLevel}
              </p>
              <p className="text-gray-300">
                Final Score: <span className="text-blue-400 font-bold">{score}</span>
              </p>
              <p className="text-gray-300">
                High Score: <span className="text-yellow-400 font-bold">{highScore}</span>
              </p>
              {score === highScore && (
                <p className="text-yellow-400 text-sm font-bold">New High Score!</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setLives(3);
                  setScore(0);
                  initializeLevel(currentLevel, isEndless);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Try Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
              <button
                onClick={() => {
                  setGameState("MENU");
                  setCards([]);
                  setLives(3);
                  setScore(0);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Level Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
