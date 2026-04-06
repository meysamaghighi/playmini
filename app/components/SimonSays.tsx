"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type Color = "red" | "blue" | "green" | "yellow" | "orange" | "purple";
type GameMode = "levelSelect" | "playing" | "showing" | "gameover";
type PowerUpType = "replay" | "slow" | "skip";

interface LevelConfig {
  name: string;
  target: number;        // Sequence length to beat the level
  colors: number;        // Number of colors (4-6)
  speed: number;         // Playback speed multiplier (1 = normal, 0.6 = faster)
  specialMode?: "timed" | "reverse" | "dark";
}

const ALL_COLORS: Color[] = ["red", "blue", "green", "yellow", "orange", "purple"];

const COLOR_MAP: Record<Color, { bg: string; active: string; dark: string; tone: number }> = {
  red: { bg: "bg-red-600", active: "bg-red-400", dark: "bg-red-900", tone: 261.63 },
  blue: { bg: "bg-blue-600", active: "bg-blue-400", dark: "bg-blue-900", tone: 329.63 },
  green: { bg: "bg-green-600", active: "bg-green-400", dark: "bg-green-900", tone: 392.00 },
  yellow: { bg: "bg-yellow-600", active: "bg-yellow-400", dark: "bg-yellow-900", tone: 523.25 },
  orange: { bg: "bg-orange-600", active: "bg-orange-400", dark: "bg-orange-900", tone: 440.00 },
  purple: { bg: "bg-purple-600", active: "bg-purple-400", dark: "bg-purple-900", tone: 293.66 },
};

// 10 campaign levels with progressive difficulty
const LEVELS: LevelConfig[] = [
  { name: "First Steps", target: 5, colors: 4, speed: 1.0 },
  { name: "Getting Started", target: 7, colors: 4, speed: 0.9 },
  { name: "Building Memory", target: 10, colors: 4, speed: 0.8 },
  { name: "Speed Up", target: 12, colors: 5, speed: 0.7 },
  { name: "Five Colors", target: 15, colors: 5, speed: 0.7, specialMode: "timed" },
  { name: "Reverse Mode", target: 12, colors: 5, speed: 0.8, specialMode: "reverse" },
  { name: "Six Colors", target: 15, colors: 6, speed: 0.7 },
  { name: "Dark Mode", target: 18, colors: 6, speed: 0.6, specialMode: "dark" },
  { name: "Expert Challenge", target: 22, colors: 6, speed: 0.6 },
  { name: "Ultimate Master", target: 25, colors: 6, speed: 0.5 },
];

// ============================================================================
// AUDIO CONTEXT (Web Audio API)
// ============================================================================

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (err) {
    // Silent fail for audio
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SimonSays() {
  // Mode and level state
  const [mode, setMode] = useState<GameMode>("levelSelect");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isEndless, setIsEndless] = useState(false);
  const [maxLevel, setMaxLevel] = useState(1);

  // Game state
  const [score, setScore] = useState(0); // Current sequence length
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [activeColor, setActiveColor] = useState<Color | null>(null);

  // Power-ups state (earned every 2 levels, max 3 each)
  const [powerUps, setPowerUps] = useState<Record<PowerUpType, number>>({
    replay: 0,
    slow: 0,
    skip: 0,
  });
  const [usingSlow, setUsingSlow] = useState(false);
  const [skipActive, setSkipActive] = useState(false);

  // Animation state
  const [levelUpText, setLevelUpText] = useState<string | null>(null);
  const [powerUpFeedback, setPowerUpFeedback] = useState<{ type: PowerUpType; action: "used" | "earned" } | null>(null);
  const [darkModeActive, setDarkModeActive] = useState(false);

  // Refs
  const sequenceRef = useRef<Color[]>([]);
  const userInputRef = useRef<Color[]>([]);
  const availableColorsRef = useRef<Color[]>(ALL_COLORS.slice(0, 4));
  const showingIndexRef = useRef(0);
  const isReverseRef = useRef(false);
  const isTimedRef = useRef(false);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const saved = localStorage.getItem("pb-simon");
    if (saved) setBest(parseInt(saved, 10));

    const savedLevel = localStorage.getItem("pb-simon-level");
    if (savedLevel) setMaxLevel(parseInt(savedLevel, 10));
  }, []);

  // ============================================================================
  // LEVEL MANAGEMENT
  // ============================================================================

  const startLevel = (level: number, endless: boolean = false) => {
    sequenceRef.current = [];
    userInputRef.current = [];

    const config = endless ? LEVELS[9] : LEVELS[level - 1];
    availableColorsRef.current = ALL_COLORS.slice(0, config.colors);
    isReverseRef.current = config.specialMode === "reverse";
    isTimedRef.current = config.specialMode === "timed";
    setDarkModeActive(config.specialMode === "dark");

    setScore(0);
    setLives(3);
    setMode("showing");
    setCurrentLevel(level);
    setIsEndless(endless);
    setLevelUpText(null);
    setUsingSlow(false);
    setSkipActive(false);

    // Start with first sequence
    addToSequence();
    setTimeout(() => playSequence(), 500);
  };

  const levelUp = () => {
    if (isEndless) return;

    const nextLevel = currentLevel + 1;
    if (nextLevel > 10) {
      // Won the entire campaign
      setMode("gameover");
      return;
    }

    setCurrentLevel(nextLevel);

    // Update max level
    if (nextLevel > maxLevel) {
      setMaxLevel(nextLevel);
      localStorage.setItem("pb-simon-level", nextLevel.toString());
    }

    // Award power-ups every 2 levels (max 3 of each)
    if (nextLevel % 2 === 0) {
      setPowerUps(prev => ({
        replay: Math.min(3, prev.replay + 1),
        slow: Math.min(3, prev.slow + 1),
        skip: Math.min(3, prev.skip + 1),
      }));

      // Show power-up earned notification
      setTimeout(() => {
        setPowerUpFeedback({ type: "replay", action: "earned" });
        setTimeout(() => setPowerUpFeedback(null), 2000);
      }, 1600);
    }

    // Show level-up animation
    setLevelUpText(`Level ${nextLevel}: ${LEVELS[nextLevel - 1].name}`);
    setTimeout(() => setLevelUpText(null), 1500);

    // Update level config
    const config = LEVELS[nextLevel - 1];
    availableColorsRef.current = ALL_COLORS.slice(0, config.colors);
    isReverseRef.current = config.specialMode === "reverse";
    isTimedRef.current = config.specialMode === "timed";
    setDarkModeActive(config.specialMode === "dark");

    // Continue with current sequence + 1
    setTimeout(() => {
      addToSequence();
      playSequence();
    }, 1500);
  };

  // ============================================================================
  // SEQUENCE MANAGEMENT
  // ============================================================================

  const addToSequence = () => {
    const colors = availableColorsRef.current;
    const nextColor = colors[Math.floor(Math.random() * colors.length)];
    sequenceRef.current.push(nextColor);
    userInputRef.current = [];
    setScore(sequenceRef.current.length);
  };

  const playSequence = useCallback(async () => {
    setMode("showing");
    showingIndexRef.current = 0;

    const config = isEndless ? LEVELS[9] : LEVELS[currentLevel - 1];
    const speedMultiplier = usingSlow ? 1.5 : 1.0;
    const baseDelay = 600 * config.speed * speedMultiplier;
    const flashDuration = 400 * config.speed * speedMultiplier;

    const displaySeq = isReverseRef.current ? [...sequenceRef.current].reverse() : sequenceRef.current;

    for (let i = 0; i < displaySeq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, baseDelay));

      const color = displaySeq[i];
      setActiveColor(color);
      playTone(COLOR_MAP[color].tone, flashDuration / 1000);

      await new Promise((resolve) => setTimeout(resolve, flashDuration));
      setActiveColor(null);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Reset slow playback after use
    if (usingSlow) {
      setUsingSlow(false);
    }

    setMode("playing");

    // Start timer for timed mode (3 seconds per input)
    if (isTimedRef.current) {
      startInputTimer();
    }
  }, [currentLevel, isEndless, usingSlow]);

  // ============================================================================
  // INPUT HANDLING
  // ============================================================================

  const startInputTimer = () => {
    if (timerIdRef.current) clearTimeout(timerIdRef.current);

    timerIdRef.current = setTimeout(() => {
      // Time's up - treat as wrong input
      handleWrongInput();
    }, 3000 * sequenceRef.current.length);
  };

  const clearInputTimer = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  const handleColorClick = useCallback(
    (color: Color) => {
      if (mode !== "playing") return;

      setActiveColor(color);
      playTone(COLOR_MAP[color].tone, 0.2);
      setTimeout(() => setActiveColor(null), 200);

      // Skip power-up allows skipping one color in sequence
      if (skipActive) {
        userInputRef.current.push(sequenceRef.current[userInputRef.current.length]);
        setSkipActive(false);

        // Show feedback
        setPowerUpFeedback({ type: "skip", action: "used" });
        setTimeout(() => setPowerUpFeedback(null), 1000);

        // Check if sequence complete after skip
        if (userInputRef.current.length === sequenceRef.current.length) {
          handleSequenceComplete();
        }
        return;
      }

      userInputRef.current.push(color);
      const currentIndex = userInputRef.current.length - 1;

      // Determine expected sequence (normal or reverse)
      const expectedSeq = isReverseRef.current ? [...sequenceRef.current].reverse() : sequenceRef.current;

      // Check if correct
      if (userInputRef.current[currentIndex] !== expectedSeq[currentIndex]) {
        handleWrongInput();
        return;
      }

      // Check if sequence complete
      if (userInputRef.current.length === expectedSeq.length) {
        handleSequenceComplete();
      }
    },
    [mode, skipActive, currentLevel, isEndless]
  );

  const handleWrongInput = () => {
    clearInputTimer();

    if (lives > 1) {
      // Lose a life, replay current sequence
      setLives(lives - 1);
      userInputRef.current = [];

      setTimeout(() => {
        playSequence();
      }, 800);
    } else {
      // Game over
      setMode("gameover");

      // Update best score for endless mode
      if (isEndless && score > best) {
        setBest(score);
        localStorage.setItem("pb-simon", score.toString());
      }
    }
  };

  const handleSequenceComplete = () => {
    clearInputTimer();

    // Update best score
    if (score > best) {
      setBest(score);
      localStorage.setItem("pb-simon", score.toString());
    }

    // Check for level completion
    if (!isEndless) {
      const target = LEVELS[currentLevel - 1].target;
      if (score >= target) {
        setTimeout(() => levelUp(), 800);
        return;
      }
    }

    // Continue to next sequence
    setTimeout(() => {
      addToSequence();
      playSequence();
    }, 800);
  };

  // ============================================================================
  // POWER-UPS
  // ============================================================================

  const useReplay = () => {
    if (powerUps.replay === 0 || mode !== "playing") return;

    setPowerUps(prev => ({ ...prev, replay: prev.replay - 1 }));

    setPowerUpFeedback({ type: "replay", action: "used" });
    setTimeout(() => setPowerUpFeedback(null), 1000);

    userInputRef.current = [];
    playSequence();
  };

  const useSlow = () => {
    if (powerUps.slow === 0 || mode !== "playing") return;

    setPowerUps(prev => ({ ...prev, slow: prev.slow - 1 }));
    setUsingSlow(true);

    setPowerUpFeedback({ type: "slow", action: "used" });
    setTimeout(() => setPowerUpFeedback(null), 1000);

    userInputRef.current = [];
    playSequence();
  };

  const useSkip = () => {
    if (powerUps.skip === 0 || mode !== "playing" || skipActive) return;

    setPowerUps(prev => ({ ...prev, skip: prev.skip - 1 }));
    setSkipActive(true);

    setPowerUpFeedback({ type: "skip", action: "used" });
    setTimeout(() => setPowerUpFeedback(null), 1000);
  };

  // ============================================================================
  // SHARE
  // ============================================================================

  const handleShare = async () => {
    const text = isEndless
      ? `I reached sequence length ${score} in Simon Says Endless! Can you beat me? https://playmini.fun/simon`
      : `I completed level ${currentLevel} in Simon Says! Can you beat me? https://playmini.fun/simon`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied!");
      } catch {}
    }
  };

  // ============================================================================
  // RENDER: LEVEL SELECT
  // ============================================================================

  if (mode === "levelSelect") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 max-w-4xl mx-auto px-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-black text-blue-400 mb-2">Simon Says</h1>
          <p className="text-gray-400">Watch the sequence, then repeat it!</p>
        </div>

        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Campaign Levels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {LEVELS.map((level, idx) => {
              const levelNum = idx + 1;
              const isLocked = levelNum > maxLevel;
              const isCompleted = levelNum < maxLevel;

              return (
                <button
                  key={levelNum}
                  onClick={() => !isLocked && startLevel(levelNum, false)}
                  disabled={isLocked}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    isLocked
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : isCompleted
                      ? "bg-green-600 hover:bg-green-500 text-white hover:scale-105"
                      : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105"
                  }`}
                >
                  <div className="text-2xl">{levelNum}</div>
                  <div className="text-xs mt-1 opacity-80">
                    {isLocked ? "🔒" : isCompleted ? "✓" : ""}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-6">
            <h3 className="text-xl font-bold text-purple-400 mb-2">Endless Mode</h3>
            <p className="text-gray-300 text-sm mb-4">
              How long can you last? Infinite sequences with increasing speed!
            </p>
            <div className="text-center mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Best Endless</div>
              <div className="text-3xl font-black text-amber-400 tabular-nums">{best}</div>
            </div>
            <button
              onClick={() => startLevel(10, true)}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Play Endless
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: GAME OVER
  // ============================================================================

  if (mode === "gameover") {
    const completedCampaign = !isEndless && currentLevel > 10;

    return (
      <div className="flex flex-col items-center gap-6 py-8 px-4">
        <div className={`border rounded-lg p-6 text-center max-w-md ${
          completedCampaign
            ? "bg-green-900/30 border-green-500"
            : "bg-red-900/30 border-red-500"
        }`}>
          <h2 className={`text-2xl font-bold mb-2 ${
            completedCampaign ? "text-green-400" : "text-red-400"
          }`}>
            {completedCampaign ? "Campaign Complete!" : "Game Over"}
          </h2>
          <p className="text-gray-300 mb-4">
            {isEndless ? (
              <>
                You reached sequence length {score}!
                {score >= best && score > 0 && (
                  <span className="block text-yellow-400 font-bold mt-1">New Best!</span>
                )}
              </>
            ) : completedCampaign ? (
              <>
                You beat all 10 levels!
                <span className="block text-yellow-400 font-bold mt-1">Master of Memory!</span>
              </>
            ) : (
              <>
                Level {currentLevel}: {LEVELS[currentLevel - 1].name}
                <br />
                Reached sequence length {score} / {LEVELS[currentLevel - 1].target}
              </>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setMode("levelSelect")}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Menu
            </button>
            <button
              onClick={() => startLevel(currentLevel, isEndless)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Retry
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: PLAYING
  // ============================================================================

  const config = isEndless ? LEVELS[9] : LEVELS[currentLevel - 1];
  const availableColors = availableColorsRef.current;
  const gridCols = availableColors.length === 4 ? "grid-cols-2" : availableColors.length === 5 ? "grid-cols-3" : "grid-cols-3";

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      {/* Header */}
      <div className="flex gap-8 text-center flex-wrap justify-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {isEndless ? "Endless" : `Level ${currentLevel}`}
          </div>
          <div className="text-lg font-bold text-blue-400">
            {isEndless ? "∞" : LEVELS[currentLevel - 1].name}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Sequence</div>
          <div className="text-3xl font-black text-blue-400 tabular-nums">
            {score}
            {!isEndless && ` / ${config.target}`}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
          <div className="text-3xl font-black text-red-400 tabular-nums">
            {"❤️".repeat(lives)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-3xl font-black text-amber-400 tabular-nums">{best}</div>
        </div>
      </div>

      {/* Level-up animation */}
      {levelUpText && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-blue-600 text-white px-8 py-4 rounded-xl text-2xl font-black animate-pulse">
            {levelUpText}
          </div>
        </div>
      )}

      {/* Power-up feedback */}
      {powerUpFeedback && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg z-50">
          {powerUpFeedback.action === "earned" ? "Power-Ups Earned! +1 each" : `${powerUpFeedback.type.toUpperCase()} used!`}
        </div>
      )}

      {/* Power-ups */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={useReplay}
          disabled={powerUps.replay === 0 || mode !== "playing"}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-2"
        >
          🔁 Replay ({powerUps.replay})
        </button>
        <button
          onClick={useSlow}
          disabled={powerUps.slow === 0 || mode !== "playing"}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-2"
        >
          🐌 Slow ({powerUps.slow})
        </button>
        <button
          onClick={useSkip}
          disabled={powerUps.skip === 0 || mode !== "playing" || skipActive}
          className={`px-4 py-2 ${skipActive ? "bg-orange-400" : "bg-orange-600 hover:bg-orange-500"} disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-2`}
        >
          ⏭️ Skip ({powerUps.skip})
        </button>
      </div>

      {/* Status message */}
      <div className="text-center">
        {mode === "showing" && (
          <div className="text-yellow-400 font-bold text-lg">
            Watch{isReverseRef.current ? " (Reverse!)" : ""}...
          </div>
        )}
        {mode === "playing" && (
          <div className="text-green-400 font-bold text-lg">
            Your Turn{isReverseRef.current ? " (Reverse!)" : isTimedRef.current ? " (Timed!)" : ""}!
          </div>
        )}
      </div>

      {/* Special mode indicator */}
      {config.specialMode && (
        <div className="text-center text-sm bg-purple-900/50 px-4 py-2 rounded-lg">
          <span className="text-purple-400 font-bold">
            {config.specialMode === "reverse" && "REVERSE MODE: Repeat backwards!"}
            {config.specialMode === "timed" && "TIMED MODE: 3s per color!"}
            {config.specialMode === "dark" && "DARK MODE: Memorize the flashes!"}
          </span>
        </div>
      )}

      {/* Color Grid */}
      <div className={`grid ${gridCols} gap-4 max-w-md`}>
        {availableColors.map((color) => {
          const isActive = activeColor === color;
          const colorStyle = COLOR_MAP[color];
          const shouldShowColor = !darkModeActive || isActive || mode === "showing";

          return (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              disabled={mode !== "playing"}
              className={`w-32 h-32 rounded-2xl transition-all transform active:scale-95 ${
                isActive
                  ? colorStyle.active
                  : mode === "playing" && shouldShowColor
                  ? colorStyle.bg
                  : colorStyle.dark
              } ${mode === "playing" ? "hover:opacity-80" : "cursor-not-allowed"}`}
              style={{
                opacity: !shouldShowColor ? 0.3 : 1,
              }}
            />
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-gray-600 max-w-md mt-4">
        <p>Watch the color sequence, then click the colors in the same order.</p>
        <p className="mt-1">Each round adds one more color to the sequence!</p>
      </div>

      {/* Back to menu */}
      <button
        onClick={() => setMode("levelSelect")}
        className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-all"
      >
        Back to Menu
      </button>
    </div>
  );
}
