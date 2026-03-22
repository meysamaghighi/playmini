"use client";

import { useState, useEffect, useCallback } from "react";

const WORD_LIST = [
  "CRANE", "SLATE", "HOUSE", "PLANE", "STORM", "LIGHT", "FRAME", "GLOBE", "CHAIR", "MONEY",
  "PLANT", "BRAND", "STONE", "BEACH", "CROWN", "SPACE", "TRADE", "PEACE", "ANGEL", "GHOST",
  "TIGER", "EARTH", "OCEAN", "PIANO", "RIVER", "CLOUD", "MUSIC", "DANCE", "HEART", "SMILE",
  "BRAVE", "CHARM", "DREAM", "FAITH", "GRACE", "HAPPY", "LAUGH", "MAPLE", "NOBLE", "PRIDE",
  "QUIET", "RAZOR", "SWORD", "TRUST", "URBAN", "VITAL", "WHALE", "YOUTH", "ZEBRA", "ALERT",
  "BEAST", "CANDY", "DELTA", "EAGLE", "FLAME", "GRANT", "HORSE", "IMAGE", "JEWEL", "KNIFE",
  "LEMON", "MARCH", "NIGHT", "OLIVE", "PEARL", "QUEEN", "RANCH", "SHARK", "TRAIN", "UNCLE",
  "VOICE", "WATER", "YOUNG", "ADMIN", "BEACH", "COAST", "DRIVE", "ENTRY", "FIELD", "GRAIN",
  "HATCH", "INDEX", "JOINT", "KNOTS", "LUNCH", "MIXER", "NORTH", "ORBIT", "PATCH", "QUEST",
  "ROUND", "SHIFT", "TOUCH", "UNITY", "VAULT", "WATCH", "EXACT", "YIELD", "ZONES", "ABOUT",
  "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT",
  "AGREE", "AHEAD", "ALARM", "ALBUM", "ALIEN", "ALIGN", "ALIVE", "ALLOW", "ALONE", "ALONG",
  "ALTER", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE",
  "ARRAY", "ARROW", "ASIDE", "ASSET", "AVOID", "AWAKE", "AWARD", "AWARE", "BADLY", "BAKER",
  "BASES", "BASIC", "BASIN", "BASIS", "BATCH", "BEARS", "BEGAN", "BEGIN", "BEING", "BELOW",
  "BENCH", "BILLY", "BIRTH", "BLACK", "BLADE", "BLAME", "BLANK", "BLEND", "BLESS", "BLIND",
  "BLOCK", "BLOOD", "BLOOM", "BOARD", "BONDS", "BONES", "BONUS", "BOOTH", "BOUND", "BRAIN",
  "BREAD", "BREAK", "BREED", "BRIAN", "BRICK", "BRIDE", "BRIEF", "BRING", "BROAD", "BROKE",
  "BROWN", "BUILD", "BUILT", "BUNCH", "BURNS", "BURST", "BUYER", "CABLE", "CACHE", "CALIF",
  "CANAL", "CARDS", "CARGO", "CAROL", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAOS", "CHARM",
];

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"],
];

interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
}

interface TileState {
  letter: string;
  state: "empty" | "tbd" | "correct" | "present" | "absent";
}

export default function WordleGame() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keyStates, setKeyStates] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
  });
  const [showStats, setShowStats] = useState(false);
  const [flipRow, setFlipRow] = useState<number | null>(null);

  useEffect(() => {
    const savedStats = localStorage.getItem("pb-wordle");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setKeyStates({});
    setShowStats(false);
    setFlipRow(null);
  };

  const saveStats = useCallback((newStats: GameStats) => {
    localStorage.setItem("pb-wordle", JSON.stringify(newStats));
    setStats(newStats);
  }, []);

  const updateKeyStates = (guess: string, target: string) => {
    const newKeyStates = { ...keyStates };
    const targetLetters = target.split("");

    guess.split("").forEach((letter, idx) => {
      if (letter === targetLetters[idx]) {
        newKeyStates[letter] = "correct";
      } else if (targetLetters.includes(letter)) {
        if (newKeyStates[letter] !== "correct") {
          newKeyStates[letter] = "present";
        }
      } else {
        if (!newKeyStates[letter]) {
          newKeyStates[letter] = "absent";
        }
      }
    });

    setKeyStates(newKeyStates);
  };

  const submitGuess = () => {
    if (currentGuess.length !== 5) return;
    if (!WORD_LIST.includes(currentGuess)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    // Trigger flip animation
    setFlipRow(newGuesses.length - 1);
    setTimeout(() => setFlipRow(null), 1500);

    updateKeyStates(currentGuess, targetWord);

    if (currentGuess === targetWord) {
      setWon(true);
      setGameOver(true);
      const newStats = {
        played: stats.played + 1,
        won: stats.won + 1,
        currentStreak: stats.currentStreak + 1,
        maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
      };
      saveStats(newStats);
      setTimeout(() => setShowStats(true), 1500);
    } else if (newGuesses.length === 6) {
      setGameOver(true);
      const newStats = {
        played: stats.played + 1,
        won: stats.won,
        currentStreak: 0,
        maxStreak: stats.maxStreak,
      };
      saveStats(newStats);
      setTimeout(() => setShowStats(true), 1500);
    }

    setCurrentGuess("");
  };

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver) return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE" || key === "←") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, gameOver, targetWord, guesses, keyStates, stats]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER") {
        handleKeyPress("ENTER");
      } else if (key === "BACKSPACE") {
        handleKeyPress("BACKSPACE");
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const getTileState = (
    rowIndex: number,
    colIndex: number
  ): TileState["state"] => {
    if (rowIndex >= guesses.length) {
      return rowIndex === guesses.length && colIndex < currentGuess.length
        ? "tbd"
        : "empty";
    }

    const guess = guesses[rowIndex];
    const letter = guess[colIndex];
    const targetLetters = targetWord.split("");

    if (letter === targetLetters[colIndex]) {
      return "correct";
    }

    const targetCounts: Record<string, number> = {};
    targetLetters.forEach((l) => {
      targetCounts[l] = (targetCounts[l] || 0) + 1;
    });

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === targetLetters[i]) {
        targetCounts[guess[i]]--;
      }
    }

    let presentCount = 0;
    for (let i = 0; i < colIndex; i++) {
      if (guess[i] === letter && guess[i] !== targetLetters[i]) {
        presentCount++;
      }
    }

    if (targetCounts[letter] > presentCount) {
      return "present";
    }

    return "absent";
  };

  const getKeyClass = (key: string) => {
    const state = keyStates[key];
    if (state === "correct") return "bg-[#22c55e] text-white border-[#22c55e]";
    if (state === "present") return "bg-[#eab308] text-white border-[#eab308]";
    if (state === "absent") return "bg-[#4b5563] text-white border-[#4b5563]";
    return "bg-slate-700 hover:bg-slate-600 border-gray-600";
  };

  const getTileClass = (state: TileState["state"]) => {
    if (state === "correct") return "bg-[#22c55e] border-[#22c55e] text-white";
    if (state === "present") return "bg-[#eab308] border-[#eab308] text-white";
    if (state === "absent") return "bg-[#4b5563] border-[#4b5563] text-white";
    if (state === "tbd") return "border-gray-500 text-white animate-pulse";
    return "border-gray-700 text-white";
  };

  const shareResults = () => {
    const emojiGrid = guesses
      .map((guess) => {
        return guess
          .split("")
          .map((letter, idx) => {
            if (letter === targetWord[idx]) return "🟩";
            if (targetWord.includes(letter)) return "🟨";
            return "⬛";
          })
          .join("");
      })
      .join("\n");

    const text = `Word Guess ${guesses.length}/6\n\n${emojiGrid}\n\nPlay at playmini.fun/wordle`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard.writeText(text);
        alert("Results copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Word Guess</h1>
        <p className="text-gray-400">
          Guess the 5-letter word in 6 tries
        </p>
      </div>

      {/* Game Grid */}
      <div className="flex flex-col items-center gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex gap-2 ${
              shake && rowIndex === guesses.length ? "animate-shake" : ""
            }`}
          >
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const letter =
                rowIndex < guesses.length
                  ? guesses[rowIndex][colIndex]
                  : rowIndex === guesses.length
                  ? currentGuess[colIndex] || ""
                  : "";
              const state = getTileState(rowIndex, colIndex);
              const shouldFlip = flipRow === rowIndex;

              return (
                <div
                  key={colIndex}
                  className={`w-14 h-14 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-2xl font-bold rounded ${getTileClass(
                    state
                  )} ${shouldFlip ? "animate-flip" : ""}`}
                  style={{
                    animationDelay: shouldFlip ? `${colIndex * 0.1}s` : "0s",
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* On-Screen Keyboard */}
      <div className="flex flex-col gap-2 mb-8">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`px-2 py-3 sm:px-4 sm:py-4 rounded font-bold border-2 transition-colors ${
                  key === "ENTER" || key === "←" ? "flex-grow max-w-[80px]" : "w-8 sm:w-10"
                } ${getKeyClass(key)}`}
                disabled={gameOver}
              >
                {key === "←" ? "⌫" : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Game Over Message */}
      {gameOver && showStats && (
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-4">
            {won ? (
              <span className="text-[#22c55e]">
                Congratulations! You won! 🎉
              </span>
            ) : (
              <span className="text-red-400">
                Game Over! The word was: {targetWord}
              </span>
            )}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {stats.played}
              </div>
              <div className="text-gray-400 text-sm">Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {stats.played > 0
                  ? Math.round((stats.won / stats.played) * 100)
                  : 0}
                %
              </div>
              <div className="text-gray-400 text-sm">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {stats.currentStreak}
              </div>
              <div className="text-gray-400 text-sm">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {stats.maxStreak}
              </div>
              <div className="text-gray-400 text-sm">Max Streak</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={shareResults}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Share Results
            </button>
            <button
              onClick={startNewGame}
              className="flex-1 bg-[#22c55e] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              New Game
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        @keyframes flip {
          0% { transform: rotateX(0); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0); }
        }
        .animate-flip {
          animation: flip 0.6s;
        }
      `}</style>
    </div>
  );
}
