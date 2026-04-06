"use client";

import { useState, useEffect, useCallback } from "react";
import { VALID_GUESSES } from "./wordlist";

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

const HARD_WORD_LIST = [
  "JAZZY", "FUZZY", "QUIRK", "WALTZ", "VODKA", "FJORD", "GLYPH", "NYMPH", "CRYPT", "LYNCH",
  "PYGMY", "TRYST", "WRYLY", "GYPSY", "MYTHS", "PSYCH", "SYNTH", "ABYSS", "CYNIC", "HYENA",
  "LYMPH", "MYRRH", "PHPSY", "RHYME", "STYLE", "TYPOS", "BYTES", "CRYPT", "DWARF", "FJORD",
  "GNOME", "HYMNS", "KNACK", "WRECK", "XEROX", "YACHT", "ZESTY", "BLITZ", "CRAMP", "DWELT",
  "EXIST", "FRIZZ", "GRUFF", "HELIX", "INBOX", "JUMBO", "KUDOS", "LATEX", "MAXIM", "NEXUS",
];

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"],
];

interface TileState {
  letter: string;
  state: "empty" | "tbd" | "correct" | "present" | "absent";
}

interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
}

interface Level {
  id: number;
  name: string;
  description: string;
  maxGuesses: number;
  timeLimit?: number;
  hardMode?: boolean;
  wordCount?: number;
  wordPool?: string[];
  hintsEnabled?: boolean;
}

interface CampaignProgress {
  stars: number[];
  highScore: number;
  unlockedLevel: number;
}

const LEVELS: Level[] = [
  { id: 1, name: "Warm Up", description: "8 guesses + hints", maxGuesses: 8, hintsEnabled: true },
  { id: 2, name: "Standard", description: "Classic 6 guesses", maxGuesses: 6 },
  { id: 3, name: "Quick Thinker", description: "Only 5 guesses", maxGuesses: 5 },
  { id: 4, name: "Tough Words", description: "Harder word pool", maxGuesses: 6, wordPool: HARD_WORD_LIST },
  { id: 5, name: "Speed Round", description: "2 minutes time limit", maxGuesses: 6, timeLimit: 120 },
  { id: 6, name: "Four Tries", description: "Only 4 guesses", maxGuesses: 4 },
  { id: 7, name: "Hard Mode", description: "Must use revealed letters", maxGuesses: 6, hardMode: true },
  { id: 8, name: "Double Trouble", description: "Solve 2 words in 8 guesses", maxGuesses: 8, wordCount: 2 },
  { id: 9, name: "Three Tries", description: "Only 3 guesses", maxGuesses: 3 },
  { id: 10, name: "Gauntlet", description: "3 words, 5 guesses each, hard mode", maxGuesses: 5, wordCount: 3, hardMode: true, timeLimit: 300 },
];

type GameMode = "menu" | "campaign" | "endless" | "classic" | "levelSelect";

export default function WordleGame() {
  const [mode, setMode] = useState<GameMode>("menu");
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>({
    stars: Array(10).fill(0),
    highScore: 0,
    unlockedLevel: 1,
  });

  // Game state
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keyStates, setKeyStates] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);
  const [flipRow, setFlipRow] = useState<number | null>(null);

  // Campaign state
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  // Power-ups (1 per level)
  const [revealLetterUsed, setRevealLetterUsed] = useState(false);
  const [eliminateUsed, setEliminateUsed] = useState(false);
  const [extraGuessUsed, setExtraGuessUsed] = useState(false);
  const [extraGuesses, setExtraGuesses] = useState(0);

  // Hard mode tracking
  const [revealedLetters, setRevealedLetters] = useState<{pos: number, letter: string}[]>([]);
  const [mustInclude, setMustInclude] = useState<Set<string>>(new Set());

  // Classic mode stats
  const [stats, setStats] = useState<GameStats>({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
  });
  const [showStats, setShowStats] = useState(false);

  // Endless mode
  const [endlessWordsCleared, setEndlessWordsCleared] = useState(0);
  const [endlessLives, setEndlessLives] = useState(3);

  // Word completion message
  const [wordCompleteMessage, setWordCompleteMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedCampaign = localStorage.getItem("pb-wordle-campaign");
    if (savedCampaign) {
      setCampaignProgress(JSON.parse(savedCampaign));
    }
    const savedStats = localStorage.getItem("pb-wordle");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            setTimerActive(false);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, timeLeft]);

  const handleTimeOut = () => {
    if (mode === "campaign" || mode === "endless") {
      const newLives = mode === "campaign" ? lives - 1 : endlessLives - 1;
      if (mode === "campaign") setLives(newLives);
      else setEndlessLives(newLives);

      if (newLives <= 0) {
        setGameOver(true);
        setShowStats(true);
      } else {
        moveToNextWord();
      }
    }
  };

  const startCampaignLevel = (level: Level) => {
    setMode("campaign");
    setCurrentLevel(level);
    setLives(3);
    setScore(0);
    setStreak(0);
    setRevealLetterUsed(false);
    setEliminateUsed(false);
    setExtraGuessUsed(false);
    setExtraGuesses(0);
    setCurrentWordIndex(0);

    const wordPool = level.wordPool || WORD_LIST;
    const wordCount = level.wordCount || 1;
    const words = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < wordCount; i++) {
      let idx = Math.floor(Math.random() * wordPool.length);
      while (usedIndices.has(idx)) {
        idx = Math.floor(Math.random() * wordPool.length);
      }
      usedIndices.add(idx);
      words.push(wordPool[idx]);
    }

    setTargetWords(words);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setKeyStates({});
    setShowStats(false);
    setFlipRow(null);
    setRevealedLetters([]);
    setMustInclude(new Set());
    setWordCompleteMessage(null);

    if (level.timeLimit) {
      setTimeLeft(level.timeLimit);
      setTimerActive(true);
    } else {
      setTimeLeft(null);
      setTimerActive(false);
    }
  };

  const startEndlessMode = () => {
    setMode("endless");
    setEndlessWordsCleared(0);
    setEndlessLives(3);
    setScore(0);
    setStreak(0);
    setCurrentLevel({ id: 0, name: "Endless", description: "Endless mode", maxGuesses: 6 });

    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWords([randomWord]);
    setCurrentWordIndex(0);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setKeyStates({});
    setShowStats(false);
    setFlipRow(null);
    setRevealedLetters([]);
    setMustInclude(new Set());
    setTimeLeft(null);
    setTimerActive(false);
    setRevealLetterUsed(false);
    setEliminateUsed(false);
    setExtraGuessUsed(false);
    setExtraGuesses(0);
    setWordCompleteMessage(null);
  };

  const startClassicMode = () => {
    setMode("classic");
    setCurrentLevel(null);
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWords([randomWord]);
    setCurrentWordIndex(0);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setKeyStates({});
    setShowStats(false);
    setFlipRow(null);
    setRevealedLetters([]);
    setMustInclude(new Set());
    setTimeLeft(null);
    setTimerActive(false);
    setWordCompleteMessage(null);
  };

  const saveCampaignProgress = (newProgress: CampaignProgress) => {
    localStorage.setItem("pb-wordle-campaign", JSON.stringify(newProgress));
    setCampaignProgress(newProgress);
  };

  const saveClassicStats = (newStats: GameStats) => {
    localStorage.setItem("pb-wordle", JSON.stringify(newStats));
    setStats(newStats);
  };

  const moveToNextWord = () => {
    if (!currentLevel) return;

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < targetWords.length) {
      setWordCompleteMessage(null);
      setCurrentWordIndex(nextIndex);
      setGuesses([]);
      setCurrentGuess("");
      setKeyStates({});
      setRevealedLetters([]);
      setMustInclude(new Set());
      setFlipRow(null);
    } else {
      // Level complete
      setWordCompleteMessage(null);
      completeLevel(true);
    }
  };

  const completeLevel = (success: boolean) => {
    if (mode === "campaign" && currentLevel) {
      const levelIndex = currentLevel.id - 1;
      const usedPowerups = (revealLetterUsed ? 1 : 0) + (eliminateUsed ? 1 : 0) + (extraGuessUsed ? 1 : 0);
      let stars = 0;

      if (success) {
        if (usedPowerups === 0) stars = 3;
        else if (usedPowerups === 1) stars = 2;
        else stars = 1;
      }

      const newStars = [...campaignProgress.stars];
      newStars[levelIndex] = Math.max(newStars[levelIndex], stars);

      const newUnlocked = Math.min(10, Math.max(campaignProgress.unlockedLevel, currentLevel.id + 1));
      const newHighScore = Math.max(campaignProgress.highScore, score);

      saveCampaignProgress({
        stars: newStars,
        highScore: newHighScore,
        unlockedLevel: newUnlocked,
      });

      setGameOver(true);
      setWon(success);
      setShowStats(true);
    } else if (mode === "endless") {
      setGameOver(true);
      setWon(false);
      setShowStats(true);
    }
  };

  const calculateScore = (guessCount: number) => {
    const basePoints = [500, 250, 100, 50, 25, 10];
    const guessIndex = guessCount - 1;
    let points = basePoints[guessIndex] || 10;

    if (streak > 0) {
      points = Math.floor(points * (1 + streak * 0.1));
    }

    return points;
  };

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

  const validateHardMode = (guess: string): boolean => {
    if (!currentLevel?.hardMode) return true;

    // Must use correct letters in same positions
    for (const {pos, letter} of revealedLetters) {
      if (guess[pos] !== letter) {
        return false;
      }
    }

    // Must include all yellow letters
    for (const letter of mustInclude) {
      if (!guess.includes(letter)) {
        return false;
      }
    }

    return true;
  };

  const submitGuess = () => {
    const maxGuesses = (currentLevel?.maxGuesses || 6) + extraGuesses;
    if (currentGuess.length !== 5) return;
    if (!VALID_GUESSES.has(currentGuess) && !WORD_LIST.includes(currentGuess) && !HARD_WORD_LIST.includes(currentGuess)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (!validateHardMode(currentGuess)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const targetWord = targetWords[currentWordIndex];
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    // Update hard mode tracking
    if (currentLevel?.hardMode) {
      const newRevealed = [...revealedLetters];
      const newMustInclude = new Set(mustInclude);

      currentGuess.split("").forEach((letter, idx) => {
        if (letter === targetWord[idx]) {
          if (!newRevealed.some(r => r.pos === idx)) {
            newRevealed.push({pos: idx, letter});
          }
        } else if (targetWord.includes(letter)) {
          newMustInclude.add(letter);
        }
      });

      setRevealedLetters(newRevealed);
      setMustInclude(newMustInclude);
    }

    setFlipRow(newGuesses.length - 1);
    setTimeout(() => setFlipRow(null), 1500);

    updateKeyStates(currentGuess, targetWord);

    if (currentGuess === targetWord) {
      const points = calculateScore(newGuesses.length);
      setScore(score + points);
      setStreak(streak + 1);

      if (mode === "classic") {
        setWon(true);
        setGameOver(true);
        const newStats = {
          played: stats.played + 1,
          won: stats.won + 1,
          currentStreak: stats.currentStreak + 1,
          maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
        };
        saveClassicStats(newStats);
        setTimeout(() => setShowStats(true), 1500);
      } else if (mode === "endless") {
        setEndlessWordsCleared(endlessWordsCleared + 1);
        setTimeout(() => {
          const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
          setTargetWords([randomWord]);
          setCurrentWordIndex(0);
          setGuesses([]);
          setCurrentGuess("");
          setKeyStates({});
          setRevealedLetters([]);
          setMustInclude(new Set());
          setFlipRow(null);
        }, 1500);
      } else {
        // Campaign mode with potential multi-word levels
        const isMultiWord = currentLevel && currentLevel.wordCount && currentLevel.wordCount > 1;
        if (isMultiWord && currentWordIndex + 1 < targetWords.length) {
          // Show "Word X Complete!" message before advancing
          setWordCompleteMessage(`Word ${currentWordIndex + 1}/${targetWords.length} Complete!`);
          setTimeout(() => moveToNextWord(), 2500);
        } else {
          // Last word or single-word level, proceed normally
          setTimeout(() => moveToNextWord(), 1500);
        }
      }
    } else if (newGuesses.length >= maxGuesses) {
      // Failed to guess
      if (mode === "classic") {
        setGameOver(true);
        const newStats = {
          played: stats.played + 1,
          won: stats.won,
          currentStreak: 0,
          maxStreak: stats.maxStreak,
        };
        saveClassicStats(newStats);
        setTimeout(() => setShowStats(true), 1500);
      } else if (mode === "campaign") {
        setStreak(0);
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          completeLevel(false);
        } else {
          // Show the answer before moving to next word
          const isMultiWord = currentLevel && currentLevel.wordCount && currentLevel.wordCount > 1;
          if (isMultiWord && currentWordIndex + 1 < targetWords.length) {
            setWordCompleteMessage(`Word was: ${targetWord}. Moving to word ${currentWordIndex + 2}/${targetWords.length}`);
          } else {
            setWordCompleteMessage(`Word was: ${targetWord}`);
          }
          setTimeout(() => moveToNextWord(), 2500);
        }
      } else if (mode === "endless") {
        setStreak(0);
        const newLives = endlessLives - 1;
        setEndlessLives(newLives);
        if (newLives <= 0) {
          completeLevel(false);
        } else {
          setTimeout(() => {
            const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
            setTargetWords([randomWord]);
            setCurrentWordIndex(0);
            setGuesses([]);
            setCurrentGuess("");
            setKeyStates({});
            setRevealedLetters([]);
            setMustInclude(new Set());
            setFlipRow(null);
          }, 1500);
        }
      }
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
    [currentGuess, gameOver, targetWords, guesses, keyStates]
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
    const targetWord = targetWords[currentWordIndex];
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
    if (state === "absent") return "bg-[#6b2c2c] text-gray-400 border-[#6b2c2c]";
    return "bg-slate-700 hover:bg-slate-600 border-gray-600";
  };

  const getTileClass = (state: TileState["state"]) => {
    if (state === "correct") return "bg-[#22c55e] border-[#22c55e] text-white";
    if (state === "present") return "bg-[#eab308] border-[#eab308] text-white";
    if (state === "absent") return "bg-[#5c2020] border-[#5c2020] text-gray-300";
    if (state === "tbd") return "border-gray-500 text-white animate-pulse";
    return "border-gray-700 text-white";
  };

  const useRevealLetter = () => {
    if (revealLetterUsed || gameOver) return;

    const targetWord = targetWords[currentWordIndex];
    const unrevealedPositions = [];

    for (let i = 0; i < 5; i++) {
      const alreadyRevealed = guesses.some(g => g[i] === targetWord[i]);
      if (!alreadyRevealed) {
        unrevealedPositions.push(i);
      }
    }

    if (unrevealedPositions.length > 0) {
      const pos = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
      const letter = targetWord[pos];

      if (currentLevel?.hardMode) {
        setRevealedLetters([...revealedLetters, {pos, letter}]);
      }

      setCurrentGuess((prev) => {
        const arr = prev.split("");
        while (arr.length < 5) arr.push("");
        arr[pos] = letter;
        return arr.join("").substring(0, 5);
      });

      setRevealLetterUsed(true);
    }
  };

  const useEliminateLetters = () => {
    if (eliminateUsed || gameOver) return;

    const targetWord = targetWords[currentWordIndex];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const unused = alphabet.filter(letter =>
      !targetWord.includes(letter) && !keyStates[letter]
    );

    const toEliminate = unused.slice(0, 5);
    const newKeyStates = {...keyStates};
    toEliminate.forEach(letter => {
      newKeyStates[letter] = "absent";
    });
    setKeyStates(newKeyStates);
    setEliminateUsed(true);
  };

  const useExtraGuess = () => {
    if (extraGuessUsed || gameOver) return;
    setExtraGuesses(extraGuesses + 1);
    setExtraGuessUsed(true);
  };

  const shareResults = () => {
    const targetWord = targetWords[currentWordIndex];
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

    const text = mode === "classic"
      ? `Word Guess ${guesses.length}/6\n\n${emojiGrid}\n\nPlay at playmini.fun/wordle`
      : mode === "endless"
      ? `Word Guess Endless: ${endlessWordsCleared} words cleared!\nScore: ${score}\n\nPlay at playmini.fun/wordle`
      : `Word Guess Campaign: ${currentLevel?.name}\nScore: ${score}\n\nPlay at playmini.fun/wordle`;

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

  if (mode === "menu") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Word Guess</h1>
          <p className="text-gray-400">Guess the 5-letter word</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setMode("levelSelect")}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 px-8 rounded-lg transition-all text-xl"
          >
            Campaign Mode
            <div className="text-sm mt-1 opacity-90">10 levels + power-ups</div>
          </button>

          <button
            onClick={startEndlessMode}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6 px-8 rounded-lg transition-all text-xl"
          >
            Endless Mode
            <div className="text-sm mt-1 opacity-90">Solve as many as you can</div>
          </button>

          <button
            onClick={startClassicMode}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-8 rounded-lg transition-all text-xl"
          >
            Classic Mode
            <div className="text-sm mt-1 opacity-90">Original Wordle experience</div>
          </button>

          <div className="bg-slate-800 rounded-lg p-6 border border-gray-700 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Campaign Progress</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-400">
                  {campaignProgress.stars.reduce((a, b) => a + b, 0)}/30
                </div>
                <div className="text-gray-400 text-sm">Total Stars</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {campaignProgress.highScore}
                </div>
                <div className="text-gray-400 text-sm">High Score</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Classic Stats</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-white">{stats.played}</div>
                <div className="text-gray-400 text-sm">Played</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                </div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{stats.currentStreak}</div>
                <div className="text-gray-400 text-sm">Current Streak</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{stats.maxStreak}</div>
                <div className="text-gray-400 text-sm">Max Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "levelSelect") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Campaign</h1>
          <p className="text-gray-400">Choose a level</p>
          <button
            onClick={() => setMode("menu")}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Back to Menu
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEVELS.map((level) => {
            const isUnlocked = level.id <= campaignProgress.unlockedLevel;
            const stars = campaignProgress.stars[level.id - 1] || 0;

            return (
              <button
                key={level.id}
                onClick={() => isUnlocked && startCampaignLevel(level)}
                disabled={!isUnlocked}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  isUnlocked
                    ? "bg-slate-800 border-gray-700 hover:border-blue-500 cursor-pointer"
                    : "bg-slate-900 border-gray-800 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-gray-400">Level {level.id}</div>
                    <div className="text-xl font-bold text-white">{level.name}</div>
                  </div>
                  {isUnlocked ? (
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <span key={i} className={`text-2xl ${i <= stars ? "text-yellow-400" : "text-gray-700"}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-3xl">🔒</span>
                  )}
                </div>
                <div className="text-gray-400 text-sm">{level.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const maxGuesses = (currentLevel?.maxGuesses || 6) + extraGuesses;
  const targetWord = targetWords[currentWordIndex] || "";
  const currentLives = mode === "endless" ? endlessLives : lives;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-1">
          {mode === "campaign" && currentLevel ? currentLevel.name : mode === "endless" ? "Endless Mode" : "Word Guess"}
        </h1>
        {mode === "campaign" && currentLevel && (
          <p className="text-gray-400 text-sm">{currentLevel.description}</p>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="flex gap-4">
          {(mode === "campaign" || mode === "endless") && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-red-400">❤</span>
                <span className="text-white font-bold">x{currentLives}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-bold">{score}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-400">🔥</span>
                <span className="text-white font-bold">{streak}</span>
              </div>
              {mode === "endless" && (
                <div className="flex items-center gap-1">
                  <span className="text-green-400">✓</span>
                  <span className="text-white font-bold">{endlessWordsCleared}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {timeLeft !== null && (
            <div className={`font-bold ${timeLeft < 30 ? "text-red-400" : "text-white"}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          )}
          {mode === "campaign" && currentLevel && currentLevel.wordCount && currentLevel.wordCount > 1 && (
            <div className="text-gray-400">
              Word {currentWordIndex + 1}/{targetWords.length}
            </div>
          )}
        </div>
      </div>

      {/* Word Complete Message */}
      {wordCompleteMessage && (
        <div className="mb-4 p-4 bg-blue-600 rounded-lg text-center">
          <div className="text-white font-bold text-lg">
            {wordCompleteMessage}
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div className="flex flex-col items-center gap-2 mb-4">
        {Array.from({ length: maxGuesses }).map((_, rowIndex) => (
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
                  className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl font-bold rounded leading-none ${getTileClass(
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

      {/* Power-ups */}
      {mode === "campaign" && !gameOver && (
        <div className="flex gap-2 justify-center mb-4">
          <button
            onClick={useRevealLetter}
            disabled={revealLetterUsed}
            className={`px-3 py-2 rounded text-xs sm:text-sm font-bold transition-colors ${
              revealLetterUsed
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            title="Reveal one correct letter"
          >
            💡 Reveal {revealLetterUsed && "✓"}
          </button>
          <button
            onClick={useEliminateLetters}
            disabled={eliminateUsed}
            className={`px-3 py-2 rounded text-xs sm:text-sm font-bold transition-colors ${
              eliminateUsed
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
            title="Eliminate 5 wrong letters"
          >
            ❌ Eliminate {eliminateUsed && "✓"}
          </button>
          <button
            onClick={useExtraGuess}
            disabled={extraGuessUsed}
            className={`px-3 py-2 rounded text-xs sm:text-sm font-bold transition-colors ${
              extraGuessUsed
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            title="Add one extra guess"
          >
            ➕ Extra {extraGuessUsed && "✓"}
          </button>
        </div>
      )}

      {/* On-Screen Keyboard */}
      <div className="flex flex-col gap-1 sm:gap-2 mb-8">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`px-2 py-2 sm:px-3 sm:py-3 rounded font-bold border-2 transition-colors text-xs sm:text-sm leading-none flex items-center justify-center ${
                  key === "ENTER" || key === "←" ? "flex-grow max-w-[60px] sm:max-w-[80px]" : "w-7 sm:w-9"
                } ${getKeyClass(key)}`}
                disabled={gameOver}
              >
                {key === "←" ? "⌫" : key === "ENTER" ? "ENT" : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Game Over Message */}
      {gameOver && showStats && (
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-4">
            {mode === "classic" ? (
              won ? (
                <span className="text-[#22c55e]">Congratulations! You won! 🎉</span>
              ) : (
                <span className="text-red-400">Game Over! The word was: {targetWord}</span>
              )
            ) : mode === "endless" ? (
              <span className="text-yellow-400">Game Over! {endlessWordsCleared} words cleared!</span>
            ) : (
              won ? (
                <span className="text-[#22c55e]">Level Complete! 🎉</span>
              ) : (
                <span className="text-red-400">Level Failed</span>
              )
            )}
          </h2>

          {mode === "campaign" && (
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">
                {[1, 2, 3].map((i) => {
                  const usedPowerups = (revealLetterUsed ? 1 : 0) + (eliminateUsed ? 1 : 0) + (extraGuessUsed ? 1 : 0);
                  let stars = 0;
                  if (won) {
                    if (usedPowerups === 0) stars = 3;
                    else if (usedPowerups === 1) stars = 2;
                    else stars = 1;
                  }
                  return (
                    <span key={i} className={`${i <= stars ? "text-yellow-400" : "text-gray-700"}`}>
                      ★
                    </span>
                  );
                })}
              </div>
              <div className="text-white text-lg">Score: {score}</div>
            </div>
          )}

          {mode === "classic" && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.played}</div>
                <div className="text-gray-400 text-sm">Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                </div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.currentStreak}</div>
                <div className="text-gray-400 text-sm">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.maxStreak}</div>
                <div className="text-gray-400 text-sm">Max Streak</div>
              </div>
            </div>
          )}

          {mode === "endless" && (
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-2">{endlessWordsCleared}</div>
              <div className="text-gray-400">Words Cleared</div>
              <div className="text-2xl font-bold text-yellow-400 mt-2">{score}</div>
              <div className="text-gray-400 text-sm">Total Score</div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={shareResults}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Share
            </button>
            <button
              onClick={() => {
                if (mode === "campaign") setMode("levelSelect");
                else if (mode === "endless") startEndlessMode();
                else startClassicMode();
              }}
              className="flex-1 bg-[#22c55e] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {mode === "campaign" ? "Level Select" : "New Game"}
            </button>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => setMode("menu")}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          Back to Menu
        </button>
      </div>

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
