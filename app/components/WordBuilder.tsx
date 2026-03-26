"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Common 3-7 letter English words dictionary
const DICTIONARY = [
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one", "our", "out", "day",
  "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did",
  "its", "let", "put", "say", "she", "too", "use", "dad", "mom", "run", "top", "hot", "cut", "lot", "sit",
  "six", "yes", "yet", "age", "ago", "air", "art", "ask", "bad", "bag", "bar", "bed", "big", "bit", "box",
  "buy", "car", "cat", "cup", "dog", "eat", "end", "eye", "far", "few", "fun", "guy", "hit", "job", "kid",
  "lay", "led", "leg", "lie", "low", "may", "met", "nor", "off", "pay", "per", "pop", "red", "row", "sea",
  "set", "sex", "ten", "tie", "war", "win", "won", "act", "add", "arm", "ate", "bat", "bet", "bus", "cap",
  "cos", "cow", "cry", "die", "dry", "due", "ear", "east", "fat", "fit", "fly", "fox", "gap", "gas", "god",
  "gun", "hat", "ice", "ill", "key", "law", "lie", "lip", "mad", "map", "net", "owe", "pan", "pen", "pet",
  "pot", "raw", "row", "run", "sad", "sat", "sin", "sky", "tea", "ten", "van", "via", "war", "wet", "win",
  "about", "above", "after", "again", "angel", "anger", "apart", "apple", "arise", "bread", "break", "bring",
  "brown", "build", "catch", "chain", "chair", "cheap", "check", "china", "clean", "clear", "climb", "close",
  "coast", "could", "count", "cover", "crane", "crash", "cream", "crime", "cross", "crown", "dance", "death",
  "doing", "doubt", "dozen", "drain", "dream", "dress", "drink", "drive", "earth", "eight", "enjoy", "enter",
  "equal", "error", "event", "every", "exact", "exist", "faith", "false", "fault", "fence", "field", "fifth",
  "fight", "first", "float", "floor", "force", "forth", "found", "frame", "fresh", "front", "fruit", "glass",
  "grace", "grade", "grand", "grant", "grass", "great", "green", "gross", "group", "grown", "guard", "guess",
  "guide", "happy", "heart", "heavy", "hence", "horse", "hotel", "house", "human", "image", "inter", "issue",
  "joint", "judge", "known", "label", "large", "later", "laugh", "layer", "learn", "lease", "least", "leave",
  "legal", "lemon", "level", "light", "limit", "local", "loose", "lower", "lucky", "lunch", "magic", "major",
  "march", "match", "maybe", "meant", "media", "metal", "minor", "minus", "mixed", "model", "money", "month",
  "moral", "motor", "mount", "mouse", "mouth", "music", "never", "night", "noise", "north", "noted", "novel",
  "nurse", "ocean", "occur", "offer", "often", "order", "other", "ought", "outer", "owner", "paint", "panel",
  "paper", "party", "peace", "peter", "phone", "photo", "piece", "pilot", "place", "plain", "plane", "plant",
  "plate", "point", "pound", "power", "press", "price", "pride", "prime", "print", "prior", "proof", "proud",
  "prove", "queen", "quick", "quiet", "quite", "radio", "raise", "range", "rapid", "ratio", "reach", "ready",
  "refer", "right", "river", "roman", "rough", "round", "route", "royal", "rural", "scale", "scene", "scope",
  "score", "sense", "serve", "seven", "shall", "shape", "share", "sharp", "sheet", "shelf", "shell", "shift",
  "shine", "shirt", "shock", "shoot", "short", "shown", "sight", "since", "sixth", "sleep", "slide", "small",
  "smart", "smile", "smith", "smoke", "solid", "solve", "sorry", "sound", "south", "space", "spare", "speak",
  "speed", "spend", "spent", "split", "spoke", "sport", "staff", "stage", "stake", "stand", "start", "state",
  "steam", "steel", "stick", "still", "stock", "stone", "stood", "store", "storm", "story", "strip", "stuck",
  "study", "stuff", "style", "sugar", "suite", "super", "sweet", "table", "taken", "taste", "teach", "texas",
  "thank", "their", "theme", "there", "these", "thick", "thing", "think", "third", "those", "three", "threw",
  "throw", "tight", "timer", "title", "today", "topic", "total", "touch", "tough", "tower", "track", "trade",
  "train", "treat", "trend", "trial", "tribe", "trick", "tried", "troop", "truck", "truly", "trust", "truth",
  "twice", "uncle", "under", "union", "unity", "until", "upper", "urban", "usage", "usual", "valid", "value",
  "video", "virus", "visit", "vital", "voice", "waste", "watch", "water", "wheel", "where", "which", "while",
  "white", "whole", "whose", "woman", "women", "world", "worry", "worth", "would", "wound", "write", "wrong",
  "wrote", "yield", "young", "youth", "actor", "admin", "admit", "adopt", "adult", "agent", "agree", "ahead",
  "alarm", "album", "alert", "align", "alike", "alive", "allow", "alone", "along", "alter", "angel", "angle",
  "angry", "apply", "arena", "argue", "array", "arrow", "aside", "asset", "avoid", "awake", "award", "aware",
  "badly", "baker", "bases", "basic", "beach", "began", "begin", "being", "below", "bench", "billy", "birth",
  "black", "blade", "blame", "blank", "blast", "bleed", "bless", "blind", "block", "blood", "bloom", "blues",
  "board", "boost", "booth", "bound", "brain", "brand", "brave", "bread", "brief", "broad", "broke", "brush",
  "buddy", "bunch", "burst", "buyer", "cable", "cache", "canal", "candy", "cargo", "carry", "carve", "catch",
  "cause", "chain", "chart", "chase", "chest", "chief", "child", "chose", "civil", "claim", "class", "click",
  "cliff", "clock", "clone", "cloth", "cloud", "coach", "colonial", "colon", "color", "couch", "craft", "crane",
  "crazy", "creek", "crime", "crown", "crude", "curve", "cycle", "daily", "datum", "dealt", "delay", "delta",
  "dense", "depth", "devil", "diary", "dirty", "disco", "dough", "draft", "drama", "drank", "drawn", "drift",
  "drill", "drove", "drown", "dummy", "dying", "eager", "early", "earth", "eight", "elect", "elite", "empty",
  "enemy", "entry", "equal", "equip", "ethic", "event", "exact", "exist", "extra", "faint", "fairy", "faith",
  "fancy", "fatal", "favor", "fence", "fiber", "field", "fifty", "fight", "final", "first", "fixed", "flame",
  "flash", "fleet", "flesh", "flour", "fluid", "flush", "forum", "forty", "forum", "frame", "frank", "fraud",
  "fresh", "front", "frost", "fruit", "fully", "funny", "genre", "ghost", "giant", "given", "globe", "glory",
  "grace", "grain", "grape", "grasp", "grave", "greed", "greek", "greet", "grief", "grill", "grind", "gross",
  "guild", "guilty", "habit", "handy", "harsh", "haste", "haven", "heart", "heavy", "hence", "honey", "honor",
  "hoped", "horse", "hotel", "human", "humor", "ideal", "index", "inner", "input", "irony", "issue", "ivory",
  "japan", "jeans", "joint", "jones", "juice", "judge", "knife", "known", "label", "labor", "laser", "later",
  "latin", "laugh", "laura", "layer", "learn", "lease", "least", "leave", "legal", "lemon", "lewis", "light",
  "limit", "linen", "linux", "lived", "liver", "lobby", "local", "logic", "loose", "lotus", "loved", "lover",
  "lower", "loyal", "lucky", "lunar", "lunch", "lying", "macro", "magic", "maple", "march", "maria", "mason",
  "match", "mayor", "meant", "medal", "media", "mercy", "merge", "merit", "merry", "metal", "meter", "metro",
  "midst", "might", "minor", "minus", "mixed", "modal", "model", "modem", "month", "moral", "motor", "mount",
  "mouse", "mouth", "moved", "movie", "music", "naive", "named", "nancy", "naval", "needs", "nerve", "never",
  "newly", "night", "ninth", "noble", "noise", "normally", "north", "novel", "nurse", "nylon", "occur", "ocean",
  "offer", "often", "onion", "opera", "orbit", "order", "organ", "other", "ought", "outer", "owner", "oxide",
  "paint", "pairs", "panel", "panic", "paper", "paris", "party", "pasta", "patch", "pause", "peace", "pearl",
  "penny", "peter", "phase", "phone", "piano", "piece", "pilot", "pitch", "pixel", "plain", "plane", "plant",
  "plate", "plaza", "plots", "poem", "point", "poker", "polar", "pound", "power", "press", "price", "pride",
  "prime", "print", "prior", "prize", "probe", "proof", "prose", "proud", "prove", "proxy", "pulse", "pupil",
  "purse", "queen", "query", "quest", "queue", "quick", "quiet", "quilt", "quite", "quota", "quote", "radio",
  "raise", "ralph", "ranch", "range", "ranks", "rapid", "ratio", "reach", "react", "ready", "realm", "rebel",
  "refer", "reform", "reign", "relax", "relay", "renal", "renew", "reply", "reset", "rider", "ridge", "rifle",
  "right", "riley", "rings", "risen", "river", "robin", "rocky", "roger", "roman", "rouge", "rough", "round",
  "route", "royal", "rugby", "ruler", "rural", "sadly", "safer", "saint", "salad", "salem", "salon", "satin",
  "sauce", "scale", "scare", "scene", "scent", "scope", "score", "scott", "scout", "screw", "serum", "serve",
  "setup", "seven", "shade", "shaft", "shake", "shall", "shame", "shape", "share", "sharp", "sheer", "sheet",
  "shelf", "shell", "shift", "shine", "shirt", "shock", "shoot", "shore", "short", "shown", "sided", "sight",
  "sigma", "silly", "simon", "since", "sixth", "sixty", "sized", "skirt", "slate", "slave", "sleep", "slice",
  "slide", "slope", "small", "smart", "smell", "smile", "smith", "smoke", "snake", "solar", "solid", "solve",
  "sonic", "sorry", "sound", "south", "space", "spare", "spark", "speak", "speed", "spell", "spend", "spent",
  "sperm", "spice", "spike", "spine", "split", "spoke", "sport", "spray", "squad", "stack", "staff", "stage",
  "stake", "stamp", "stand", "stark", "start", "state", "steam", "steel", "steep", "steer", "stern", "stick",
  "still", "stock", "stone", "stood", "store", "storm", "story", "strip", "stuck", "study", "stuff", "style",
  "sugar", "suite", "sunny", "super", "surge", "susan", "sweet", "swept", "swift", "swing", "swiss", "sword",
  "syria", "table", "taken", "tales", "talks", "tanks", "taste", "taxes", "teach", "teens", "teeth", "terry",
  "texas", "thank", "theft", "their", "theme", "there", "these", "thick", "thief", "thing", "think", "third",
  "those", "three", "threw", "throw", "thumb", "tiger", "tight", "tiles", "timer", "times", "tired", "title",
  "toast", "today", "token", "tommy", "tones", "tools", "tooth", "topic", "torch", "total", "touch", "tough",
  "tours", "tower", "track", "tract", "trade", "trail", "train", "trait", "trash", "treat", "treaty", "trend",
  "trial", "tribe", "trick", "tried", "tries", "trim", "troop", "truly", "trunk", "trust", "truth", "tubes",
  "tulip", "tuned", "turbo", "twice", "twins", "twist", "ultra", "uncle", "under", "undue", "unfair", "union",
  "unite", "unity", "until", "upper", "upset", "urban", "urged", "usage", "usual", "valid", "value", "valve",
  "vault", "venue", "verse", "video", "villa", "vinyl", "viral", "virus", "visit", "vista", "vital", "vivid",
  "vocal", "vodka", "voice", "voter", "wages", "wales", "walks", "walls", "waste", "watch", "water", "waves",
  "wayne", "weeks", "weigh", "weird", "wheat", "wheel", "where", "which", "while", "white", "whole", "whose",
  "wider", "width", "wines", "wings", "wired", "witch", "woman", "women", "woods", "works", "world", "worry",
  "worse", "worst", "worth", "would", "wound", "wrist", "write", "wrong", "wrote", "yacht", "yards", "years",
  "yeast", "yield", "young", "yours", "youth", "zones"
];

// Source words with many possible sub-words
const SOURCE_WORDS = [
  "ORCHESTRA", "DANGEROUS", "EDUCATION", "NIGHTMARE", "BEAUTIFUL", "CREATURES",
  "MOUNTAINS", "PLATFORMS", "CHOCOLATE", "LANDSCAPE", "STREAMING", "WONDERFUL",
  "INTRODUCE", "IMPORTANT", "ADVENTURE", "THOUSANDS", "SCATTERED", "DIFFERENT",
  "SOMETHING", "COMPUTING", "COUNTRIES", "GARDENING", "OPERATION", "TELEPHONE",
  "MARKETING", "PAINTINGS", "BREAKFAST", "RELATIONS", "CHEMISTRY", "PASSENGER"
];

function canFormWord(word: string, availableLetters: string): boolean {
  const letterCounts: Record<string, number> = {};
  for (const l of availableLetters.toLowerCase()) {
    letterCounts[l] = (letterCounts[l] || 0) + 1;
  }
  for (const l of word.toLowerCase()) {
    if (!letterCounts[l]) return false;
    letterCounts[l]--;
  }
  return true;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WordBuilder() {
  const [sourceWord, setSourceWord] = useState("");
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [possibleWords, setPossibleWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [personalBest, setPersonalBest] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pb-word-builder");
    if (saved) setPersonalBest(parseInt(saved, 10));
  }, []);

  const calculateScore = useCallback((words: string[]) => {
    return words.reduce((sum, word) => {
      return sum + Math.max(1, word.length - 2);
    }, 0);
  }, []);

  const startGame = useCallback(() => {
    const word = SOURCE_WORDS[Math.floor(Math.random() * SOURCE_WORDS.length)];
    setSourceWord(word);
    setScrambledLetters(shuffleArray(word.split("")));

    const possible = DICTIONARY.filter(
      (w) => w.length >= 3 && canFormWord(w, word)
    );
    setPossibleWords(possible);
    setFoundWords([]);
    setCurrentInput("");
    setTimeLeft(120);
    setIsPlaying(true);
    setGameOver(false);
    setFeedback(null);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setGameOver(true);
          const score = calculateScore(foundWords);
          if (score > personalBest) {
            setPersonalBest(score);
            localStorage.setItem("pb-word-builder", score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, foundWords, calculateScore, personalBest]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const word = currentInput.trim().toLowerCase();

    if (!word) return;

    if (foundWords.map(w => w.toLowerCase()).includes(word)) {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
      setCurrentInput("");
      return;
    }

    if (possibleWords.map(w => w.toLowerCase()).includes(word)) {
      setFoundWords([...foundWords, word]);
      setFeedback("correct");
      setTimeout(() => setFeedback(null), 600);
      setCurrentInput("");
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
      setCurrentInput("");
    }
  };

  const handleShare = () => {
    const score = calculateScore(foundWords);
    const text = `Word Builder 🔤\nFound: ${foundWords.length}/${possibleWords.length} words\nScore: ${score}\n\nPlay at playmini.fun/word-builder`;

    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied to clipboard!");
    }
  };

  const missedWords = possibleWords.filter((w) => !foundWords.map(f => f.toLowerCase()).includes(w.toLowerCase()));
  const currentScore = calculateScore(foundWords);
  const isNewBest = gameOver && currentScore > personalBest;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        {!isPlaying && !gameOver && (
          <div className="text-center">
            <p className="text-gray-300 mb-6">
              Create words from the letters of one word. Find as many as you can in 2 minutes!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Start Game
            </button>
            {personalBest > 0 && (
              <p className="text-gray-500 text-sm mt-4">Personal Best: {personalBest} points</p>
            )}
          </div>
        )}

        {isPlaying && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold text-cyan-400">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Score: {currentScore}</div>
                <div className="text-sm text-gray-400">
                  Found: {foundWords.length} / {possibleWords.length}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {scrambledLetters.map((letter, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500">Source: {sourceWord}</p>
            </div>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className={`flex-1 px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                    feedback === "correct"
                      ? "border-green-500 ring-green-500"
                      : feedback === "wrong"
                      ? "border-red-500 ring-red-500 animate-shake"
                      : "border-gray-700 focus:ring-cyan-500"
                  }`}
                  placeholder="Type a word..."
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Submit
                </button>
              </div>
            </form>

            {foundWords.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Found Words:</h3>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {foundWords.map((word, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm"
                    >
                      {word} <span className="text-green-500">+{Math.max(1, word.length - 2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {gameOver && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
            {isNewBest && (
              <p className="text-xl text-yellow-400 mb-4">🎉 New Personal Best!</p>
            )}
            <div className="mb-6">
              <p className="text-2xl text-cyan-400 font-bold mb-1">Score: {currentScore}</p>
              <p className="text-gray-400">
                Found {foundWords.length} of {possibleWords.length} words
              </p>
              {personalBest > 0 && !isNewBest && (
                <p className="text-gray-500 text-sm mt-1">Personal Best: {personalBest}</p>
              )}
            </div>

            {foundWords.length > 0 && (
              <div className="mb-6 text-left">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Your Words:</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {foundWords.map((word, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {missedWords.length > 0 && (
              <div className="mb-6 text-left">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Missed Words ({missedWords.length}):
                </h3>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                  {missedWords.map((word, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors"
              >
                Share
              </button>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
