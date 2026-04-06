"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type PowerUpType = "slow-time" | "auto-correct" | "skip-word";

type PowerUp = {
  type: PowerUpType;
  count: number;
};

type LevelConfig = {
  targetWPM: number;
  minAccuracy: number;
  timeLimit: number; // seconds
  texts: string[];
};

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    targetWPM: 20,
    minAccuracy: 80,
    timeLimit: 60,
    texts: [
      "The quick brown fox jumps over the lazy dog near the old wooden fence in the park.",
      "A bird in the hand is worth two in the bush, but three in the tree is even better.",
      "Life is like a box of chocolates. You never know what you are going to get from it.",
    ],
  },
  2: {
    targetWPM: 25,
    minAccuracy: 82,
    timeLimit: 55,
    texts: [
      "Walking through the forest on a sunny day brings peace and joy to the heart and mind.",
      "The old library smells of books and history, filled with stories waiting to be discovered.",
      "Cooking a meal from scratch requires patience, practice, and a good recipe to follow closely.",
    ],
  },
  3: {
    targetWPM: 35,
    minAccuracy: 85,
    timeLimit: 50,
    texts: [
      "Success is not final, failure is not fatal. It is the courage to continue that counts most in life. The only way to do great work is to love what you do.",
      "Technology has changed the way we communicate, work, and live our daily lives. From smartphones to artificial intelligence, innovation continues to shape our future.",
      "Reading is to the mind what exercise is to the body. Books open doors to new worlds and introduce us to ideas that challenge our thinking and expand horizons.",
    ],
  },
  4: {
    targetWPM: 40,
    minAccuracy: 87,
    timeLimit: 45,
    texts: [
      "The art of programming is the art of organizing complexity, mastering multitude, and avoiding chaos. Good code is its own best documentation. Clean code always looks like it was written by someone who cares.",
      "Music has the power to evoke emotions, bring people together, and create lasting memories. From classical symphonies to modern pop songs, every genre tells a unique story that resonates with different audiences.",
      "Exercise and proper nutrition are fundamental pillars of good health. Regular physical activity strengthens the body while a balanced diet provides essential nutrients for optimal functioning and longevity.",
    ],
  },
  5: {
    targetWPM: 50,
    minAccuracy: 90,
    timeLimit: 40,
    texts: [
      "In the realm of competitive typing, speed and accuracy must harmonize perfectly. Professional typists develop muscle memory through thousands of hours of practice, allowing their fingers to dance across the keyboard without conscious thought.",
      "The scientific method represents humanity's most powerful tool for understanding the natural world. Through systematic observation, hypothesis formation, experimental testing, and peer review, scientists build knowledge that stands the test of time.",
      "Environmental conservation requires collective action from individuals, communities, and governments worldwide. Protecting biodiversity, reducing pollution, and promoting sustainable practices are essential for preserving our planet for future generations.",
    ],
  },
  6: {
    targetWPM: 55,
    minAccuracy: 91,
    timeLimit: 38,
    texts: [
      "Artificial intelligence and machine learning algorithms are reshaping industries worldwide at an unprecedented pace. These technologies analyze vast datasets to identify patterns invisible to human observers, enabling breakthroughs in healthcare diagnosis, financial forecasting, and autonomous vehicles.",
      "The history of human civilization is marked by constant innovation and adaptation. From the discovery of fire to the invention of the internet, each technological leap has fundamentally transformed how we live, work, and interact with one another.",
      "Effective communication requires more than just speaking clearly. It involves active listening, empathy, understanding nonverbal cues, and adapting your message to your audience while remaining authentic and respectful of different perspectives.",
    ],
  },
  7: {
    targetWPM: 60,
    minAccuracy: 92,
    timeLimit: 36,
    texts: [
      "Climate change represents one of the most significant challenges facing humanity in the twenty-first century. Rising global temperatures, melting ice caps, and increasingly severe weather events threaten ecosystems and human communities worldwide. Addressing this crisis requires international cooperation, technological innovation, and fundamental changes to how we produce and consume energy.",
      "Philosophy explores fundamental questions about existence, knowledge, values, reason, mind, and language. Ancient philosophers like Socrates, Plato, and Aristotle laid the groundwork for Western thought, while Eastern traditions offer complementary perspectives on the nature of reality and human consciousness.",
      "The digital revolution has transformed virtually every aspect of modern life. Social media platforms connect billions of people instantaneously, e-commerce has revolutionized retail, and remote work technologies enable collaboration across continents, fundamentally reshaping economic and social structures.",
    ],
  },
  8: {
    targetWPM: 65,
    minAccuracy: 93,
    timeLimit: 34,
    texts: [
      "Neuroscience reveals the incredible complexity of the human brain, containing approximately eighty-six billion neurons that form trillions of connections. These neural networks give rise to consciousness, memory, emotion, and cognition through electrochemical signaling mechanisms that scientists are only beginning to fully understand and map comprehensively.",
      "Economic systems shape societies by determining how resources are allocated, goods are produced, and wealth is distributed. Different models, from free-market capitalism to planned economies, reflect varying philosophies about individual liberty, collective welfare, and the proper role of government in regulating commerce and ensuring social stability.",
      "Architecture bridges art and engineering, creating spaces that are both functional and aesthetically pleasing. Great buildings reflect cultural values, technological capabilities, and environmental considerations while addressing practical needs like shelter, work spaces, and public gathering areas through innovative design solutions.",
    ],
  },
  9: {
    targetWPM: 70,
    minAccuracy: 94,
    timeLimit: 32,
    texts: [
      "The evolution of human language remains one of the most fascinating mysteries in anthropology and linguistics. Scholars debate whether language emerged gradually over millions of years or appeared relatively suddenly in our evolutionary history. What is clear is that language fundamentally transformed human society, enabling complex cooperation, abstract thinking, and the transmission of knowledge across generations.",
      "Biotechnology and genetic engineering offer unprecedented opportunities to cure diseases, enhance agricultural productivity, and address environmental challenges. However, these powerful tools also raise profound ethical questions about the limits of human intervention in natural processes and the potential unintended consequences of modifying living organisms at the genetic level.",
      "The exploration of space represents one of humanity's greatest adventures and scientific endeavors. From the first satellite launches to manned moon landings and robotic missions to distant planets, space programs have expanded our understanding of the cosmos while developing technologies that benefit life on Earth through satellite communications, weather forecasting, and materials science innovations.",
    ],
  },
  10: {
    targetWPM: 80,
    minAccuracy: 95,
    timeLimit: 30,
    texts: [
      "Quantum mechanics fundamentally challenges our intuitive understanding of physical reality at the smallest scales. Particles exist in superposition states, occupying multiple positions simultaneously until observation collapses the wave function. Entangled particles remain mysteriously connected across vast distances, instantly influencing each other in ways that Einstein famously called spooky action at a distance. These counterintuitive phenomena have been repeatedly confirmed through rigorous experimentation.",
      "Democracy requires more than just periodic elections and majority rule. It depends on robust institutions, an informed citizenry, freedom of speech and press, protection of minority rights, and the rule of law. Maintaining democratic governance demands constant vigilance against corruption, authoritarianism, and the erosion of civil liberties while balancing competing interests and values in diverse societies.",
      "Cryptocurrency and blockchain technology challenge traditional financial systems by enabling decentralized, peer-to-peer transactions without intermediaries like banks. While proponents emphasize benefits such as transparency, security, and financial inclusion, critics raise concerns about volatility, regulatory challenges, environmental impact from energy-intensive mining operations, and potential use in illicit activities.",
    ],
  },
};

function getEndlessLevelConfig(level: number): LevelConfig {
  const baseWPM = 80;
  const baseAccuracy = 95;
  const increment = level - 10;

  return {
    targetWPM: baseWPM + increment * 5,
    minAccuracy: Math.min(98, baseAccuracy + Math.floor(increment / 2)),
    timeLimit: Math.max(20, 30 - increment),
    texts: [
      "Quantum mechanics fundamentally challenges our intuitive understanding of physical reality at the smallest scales. Particles exist in superposition states, occupying multiple positions simultaneously until observation collapses the wave function. Entangled particles remain mysteriously connected across vast distances, instantly influencing each other in ways that Einstein famously called spooky action at a distance.",
      "Democracy requires more than just periodic elections and majority rule. It depends on robust institutions, an informed citizenry, freedom of speech and press, protection of minority rights, and the rule of law. Maintaining democratic governance demands constant vigilance against corruption, authoritarianism, and the erosion of civil liberties.",
      "Cryptocurrency and blockchain technology challenge traditional financial systems by enabling decentralized, peer-to-peer transactions without intermediaries like banks. While proponents emphasize benefits such as transparency, security, and financial inclusion, critics raise concerns about volatility and regulatory challenges.",
    ],
  };
}

function getLevelConfig(level: number): LevelConfig {
  if (level <= 10) {
    return LEVEL_CONFIGS[level];
  }
  return getEndlessLevelConfig(level);
}

export default function TypingRace() {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highestLevel, setHighestLevel] = useState(1);

  const [targetText, setTargetText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctStreak, setCorrectStreak] = useState(0);

  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [autoCorrectCharges, setAutoCorrectCharges] = useState(0);
  const [slowTimeActive, setSlowTimeActive] = useState(false);

  const [levelUpFlash, setLevelUpFlash] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const gameStateRef = useRef<"start" | "playing" | "gameover">("start");
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const timerIntervalRef = useRef<number | null>(null);
  const slowTimeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    // Load saved data
    const savedHighScore = localStorage.getItem("pb-typing-race");
    const savedHighestLevel = localStorage.getItem("highest-level-typing-race");

    if (savedHighScore) {
      const hs = parseInt(savedHighScore);
      highScoreRef.current = hs;
      setHighScore(hs);
    }

    if (savedHighestLevel) {
      setHighestLevel(parseInt(savedHighestLevel));
    }
  }, []);

  const startGame = useCallback(() => {
    setGameState("playing");
    setLevel(1);
    setLives(3);
    setScore(0);
    levelRef.current = 1;
    livesRef.current = 3;
    scoreRef.current = 0;
    startLevel(1);
  }, []);

  const startLevel = useCallback((lvl: number) => {
    const config = getLevelConfig(lvl);
    const randomText = config.texts[Math.floor(Math.random() * config.texts.length)];

    setTargetText(randomText);
    setUserInput("");
    setStartTime(null);
    setTimeRemaining(config.timeLimit);
    setWpm(0);
    setAccuracy(100);
    setCorrectStreak(0);
    setAutoCorrectCharges(0);
    setSlowTimeActive(false);

    // Award power-ups every 2 levels
    if (lvl % 2 === 0 && lvl > 1) {
      const types: PowerUpType[] = ["slow-time", "auto-correct", "skip-word"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setPowerUps(prev => {
        const existing = prev.find(p => p.type === randomType);
        if (existing) {
          return prev.map(p => p.type === randomType ? { ...p, count: p.count + 1 } : p);
        }
        return [...prev, { type: randomType, count: 1 }];
      });
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const calculateWPM = useCallback((chars: number, milliseconds: number) => {
    if (milliseconds === 0) return 0;
    const minutes = milliseconds / 60000;
    const words = chars / 5;
    return Math.round(words / minutes);
  }, []);

  const calculateAccuracy = useCallback((input: string, target: string) => {
    if (input.length === 0) return 100;
    let correct = 0;
    const minLength = Math.min(input.length, target.length);
    for (let i = 0; i < minLength; i++) {
      if (input[i] === target[i]) correct++;
    }
    return Math.round((correct / input.length) * 100);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (gameState !== "playing") return;

    let input = e.target.value;

    // Start timer on first keystroke
    if (!startTime && input.length > 0) {
      setStartTime(Date.now());
      startTimer();
    }

    // Auto-correct power-up
    if (autoCorrectCharges > 0 && input.length > 0) {
      const lastCharIndex = input.length - 1;
      if (input[lastCharIndex] !== targetText[lastCharIndex]) {
        input = input.substring(0, lastCharIndex) + targetText[lastCharIndex];
        setAutoCorrectCharges(prev => prev - 1);
      }
    }

    // Prevent typing beyond target text length
    if (input.length > targetText.length) return;

    setUserInput(input);

    // Calculate streak
    if (input.length > 0 && input[input.length - 1] === targetText[input.length - 1]) {
      setCorrectStreak(prev => prev + 1);
    } else if (input.length > 0) {
      setCorrectStreak(0);
    }

    // Calculate real-time stats
    if (startTime) {
      const elapsed = Date.now() - startTime;
      const currentWpm = calculateWPM(input.length, elapsed);
      const currentAccuracy = calculateAccuracy(input, targetText);
      setWpm(currentWpm);
      setAccuracy(currentAccuracy);
    }

    // Check if level completed
    if (input === targetText) {
      completeLevel(true);
    }
  };

  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = window.setInterval(() => {
      if (gameStateRef.current !== "playing") {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        return;
      }

      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          completeLevel(false);
          return 0;
        }
        return newTime;
      });
    }, slowTimeActive ? 1500 : 1000);
  };

  const completeLevel = useCallback((success: boolean) => {
    if (gameStateRef.current !== "playing") return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const config = getLevelConfig(levelRef.current);

    if (success && wpm >= config.targetWPM && accuracy >= config.minAccuracy) {
      // Level passed
      const levelBonus = levelRef.current * 100;
      const speedBonus = Math.max(0, (wpm - config.targetWPM) * 10);
      const accuracyBonus = Math.max(0, (accuracy - config.minAccuracy) * 20);
      const totalBonus = levelBonus + speedBonus + accuracyBonus;

      const newScore = scoreRef.current + totalBonus;
      scoreRef.current = newScore;
      setScore(newScore);

      // Update high score
      if (newScore > highScoreRef.current) {
        highScoreRef.current = newScore;
        setHighScore(newScore);
        localStorage.setItem("pb-typing-race", newScore.toString());
      }

      // Update highest level
      const newLevel = levelRef.current + 1;
      if (newLevel > highestLevel) {
        setHighestLevel(newLevel);
        localStorage.setItem("highest-level-typing-race", newLevel.toString());
      }

      // Level up animation
      setLevelUpFlash(3);
      const flashInterval = setInterval(() => {
        setLevelUpFlash(prev => {
          if (prev <= 1) {
            clearInterval(flashInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 200);

      setTimeout(() => {
        setLevel(newLevel);
        levelRef.current = newLevel;
        startLevel(newLevel);
      }, 800);
    } else {
      // Level failed
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);

      if (newLives <= 0) {
        // Game over
        setGameState("gameover");
        gameStateRef.current = "gameover";
      } else {
        // Retry level
        setTimeout(() => {
          startLevel(levelRef.current);
        }, 500);
      }
    }
  }, [wpm, accuracy, highestLevel, startLevel]);

  const usePowerUp = (type: PowerUpType) => {
    const powerUp = powerUps.find(p => p.type === type);
    if (!powerUp || powerUp.count <= 0) return;

    setPowerUps(prev => prev.map(p =>
      p.type === type ? { ...p, count: p.count - 1 } : p
    ).filter(p => p.count > 0));

    if (type === "slow-time") {
      setSlowTimeActive(true);
      if (slowTimeTimeoutRef.current) clearTimeout(slowTimeTimeoutRef.current);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        startTimer();
      }
      slowTimeTimeoutRef.current = window.setTimeout(() => {
        setSlowTimeActive(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          startTimer();
        }
      }, 10000);
    } else if (type === "auto-correct") {
      setAutoCorrectCharges(3);
    } else if (type === "skip-word") {
      // Find next space after current position
      const currentPos = userInput.length;
      const nextSpace = targetText.indexOf(" ", currentPos);
      if (nextSpace !== -1) {
        const skipTo = nextSpace + 1;
        setUserInput(targetText.substring(0, skipTo));
      }
    }
  };

  const getCharClass = (index: number) => {
    if (index >= userInput.length) {
      return index === userInput.length
        ? "bg-yellow-500/30 text-white"
        : "text-gray-400";
    }

    if (userInput[index] === targetText[index]) {
      return "text-green-400";
    } else {
      return "text-red-400 bg-red-900/30";
    }
  };

  const handleShare = async () => {
    const text = `I reached Level ${level} with ${score} points in Typing Race! https://playmini.fun/typing-race`;
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

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  const config = getLevelConfig(level);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Typing Race
        </h1>
        <p className="text-gray-400">
          Type fast and accurately to advance through 10 levels + endless mode!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
          <div className="text-2xl font-black text-blue-400 tabular-nums">{level}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div className="text-2xl font-black text-green-400 tabular-nums">{score}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-2xl font-black text-yellow-400 tabular-nums">{highScore}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
          <div className="text-2xl font-black text-red-400 tabular-nums">{lives}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Time</div>
          <div className={`text-2xl font-black tabular-nums ${timeRemaining <= 10 ? "text-red-400" : "text-purple-400"}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      {/* Level Up Flash */}
      {levelUpFlash > 0 && (
        <div className="fixed inset-0 bg-green-500/20 pointer-events-none z-50 animate-pulse" />
      )}

      {gameState === "start" && (
        <div className="bg-slate-800 rounded-lg p-8 mb-6 border border-gray-700 text-center">
          <div className="text-6xl mb-4">⌨️</div>
          <h2 className="text-3xl font-black text-purple-400 mb-2">Typing Race</h2>
          <p className="text-gray-400 mb-4">
            Complete 10 levels with increasing difficulty, then test your skills in endless mode!
          </p>
          <div className="mb-6 text-left max-w-md mx-auto">
            <p className="text-gray-300 mb-2 font-bold">How to Play:</p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Type the text as fast and accurately as possible</li>
              <li>• Meet the WPM and accuracy targets before time runs out</li>
              <li>• Earn power-ups every 2 levels</li>
              <li>• You have 3 lives - lose one for each failed attempt</li>
            </ul>
          </div>
          {highScore > 0 && (
            <p className="text-yellow-400 mb-4 text-lg font-bold">High Score: {highScore}</p>
          )}
          {highestLevel > 1 && (
            <p className="text-blue-400 mb-4 text-sm">Highest Level: {highestLevel}</p>
          )}
          <button
            onClick={startGame}
            className="px-10 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <>
          {/* Level Info */}
          <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-gray-700">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-gray-400 text-sm">Level {level}</span>
                {level > 10 && <span className="ml-2 text-purple-400 text-xs font-bold">(ENDLESS)</span>}
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Target: </span>
                  <span className="text-blue-400 font-bold">{config.targetWPM} WPM</span>
                </div>
                <div>
                  <span className="text-gray-500">Min Accuracy: </span>
                  <span className="text-green-400 font-bold">{config.minAccuracy}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800 rounded-lg p-3 text-center border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{wpm}</div>
              <div className="text-gray-400 text-xs">Current WPM</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center border border-gray-700">
              <div className={`text-2xl font-bold ${accuracy >= config.minAccuracy ? "text-green-400" : "text-red-400"}`}>
                {accuracy}%
              </div>
              <div className="text-gray-400 text-xs">Accuracy</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">{correctStreak}</div>
              <div className="text-gray-400 text-xs">Streak</div>
            </div>
          </div>

          {/* Power-Ups */}
          {powerUps.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="text-gray-400 text-xs mb-2">Power-Ups:</div>
              <div className="flex gap-2 flex-wrap">
                {powerUps.map((powerUp) => (
                  <button
                    key={powerUp.type}
                    onClick={() => usePowerUp(powerUp.type)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    {powerUp.type === "slow-time" && `⏱️ Slow Time (${powerUp.count})`}
                    {powerUp.type === "auto-correct" && `✨ Auto-Correct (${powerUp.count})`}
                    {powerUp.type === "skip-word" && `⏭️ Skip Word (${powerUp.count})`}
                  </button>
                ))}
              </div>
              {autoCorrectCharges > 0 && (
                <div className="text-green-400 text-xs mt-2">
                  Auto-Correct Active: {autoCorrectCharges} charges remaining
                </div>
              )}
              {slowTimeActive && (
                <div className="text-blue-400 text-xs mt-2">
                  Slow Time Active: time moves 50% slower
                </div>
              )}
            </div>
          )}

          {/* Target Text Display */}
          <div className="bg-slate-800 rounded-lg p-6 mb-4 border border-gray-700 max-h-64 overflow-y-auto">
            <div className="font-mono text-base leading-relaxed whitespace-pre-wrap break-words">
              {targetText.split("").map((char, index) => (
                <span key={index} className={getCharClass(index)}>
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-gray-700">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              className="w-full bg-slate-900 text-white font-mono text-base p-4 rounded-lg border-2 border-gray-600 focus:border-purple-500 outline-none resize-none leading-relaxed"
              rows={4}
              placeholder="Start typing here..."
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
          </div>

          <div className="text-center text-gray-400 text-sm">
            <p>Type the text above to match it exactly. Timer started!</p>
          </div>
        </>
      )}

      {gameState === "gameover" && (
        <div className="bg-slate-800 rounded-lg p-8 mb-6 border border-gray-700 text-center">
          <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
          <div className="mb-6">
            <div className="text-center mb-2">
              <div className="text-5xl font-bold text-blue-400">{level}</div>
              <div className="text-gray-400">Final Level</div>
            </div>
            <div className="text-center mb-2">
              <div className="text-5xl font-bold text-green-400">{score}</div>
              <div className="text-gray-400">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{highScore}</div>
              <div className="text-gray-400">High Score</div>
            </div>
            {score === highScore && score > 0 && (
              <p className="text-green-400 text-lg mt-4 font-bold">New High Score!</p>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Share
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {gameState === "start" && (
        <div className="text-center text-gray-500 text-sm">
          <p className="mb-1">Power-Ups: Slow Time ⏱️ • Auto-Correct ✨ • Skip Word ⏭️</p>
          <p>Earn power-ups every 2 levels!</p>
        </div>
      )}
    </div>
  );
}
