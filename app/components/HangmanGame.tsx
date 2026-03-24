"use client";

import { useEffect, useState, useCallback } from "react";

// Easy words for kids learning English (3-4 letters)
const EASY_WORDS: { [category: string]: string[] } = {
  Animals: ["cat", "dog", "cow", "pig", "hen", "bat", "fox", "bee"],
  Objects: ["sun", "hat", "cup", "bed", "bus", "pen", "box", "map", "mat", "pot", "net", "van"],
  Actions: ["run", "sit", "hop", "fun", "top", "hot"],
  Body: ["leg", "arm", "lip", "eye", "ear"],
  Things: ["toy", "boy", "key", "ice", "pie", "jam", "red", "big"]
};

// Medium words (current difficulty)
const MEDIUM_WORD_BANK: { [category: string]: string[] } = {
  Animals: [
    "elephant", "giraffe", "penguin", "dolphin", "cheetah", "kangaroo", "leopard",
    "octopus", "crocodile", "butterfly", "squirrel", "hedgehog", "flamingo", "panda",
    "raccoon", "hamster", "parrot", "ostrich", "walrus", "buffalo", "peacock", "zebra"
  ],
  Countries: [
    "canada", "brazil", "france", "germany", "australia", "japan", "mexico", "spain",
    "italy", "greece", "egypt", "sweden", "norway", "finland", "poland", "turkey",
    "argentina", "colombia", "portugal", "ireland", "scotland", "iceland", "denmark"
  ],
  Foods: [
    "pizza", "burger", "spaghetti", "sandwich", "chocolate", "strawberry", "banana",
    "mango", "avocado", "broccoli", "carrot", "potato", "tomato", "cucumber", "pepper",
    "cheese", "yogurt", "cookie", "donut", "waffle", "pancake", "noodles", "taco"
  ],
  Sports: [
    "football", "basketball", "tennis", "baseball", "cricket", "hockey", "rugby",
    "volleyball", "badminton", "golf", "swimming", "boxing", "wrestling", "cycling",
    "skiing", "skating", "surfing", "archery", "karate", "judo", "fencing", "rowing"
  ],
  Movies: [
    "titanic", "avatar", "inception", "gladiator", "frozen", "interstellar", "jaws",
    "rocky", "shrek", "coco", "scream", "psycho", "aliens", "gravity", "wildlife",
    "matrix", "django", "scarface", "casablanca", "vertigo", "fargo", "platoon"
  ],
  Music: [
    "guitar", "piano", "drums", "violin", "trumpet", "saxophone", "clarinet", "flute",
    "harp", "trombone", "banjo", "accordion", "harmonica", "ukulele", "cello", "bass",
    "keyboard", "tambourine", "cymbals", "xylophone", "maracas", "recorder"
  ],
  Nature: [
    "mountain", "ocean", "forest", "desert", "river", "volcano", "canyon", "waterfall",
    "glacier", "prairie", "jungle", "island", "meadow", "valley", "cliff", "cave",
    "beach", "swamp", "dune", "geyser", "lagoon", "plateau", "peninsula"
  ],
  Technology: [
    "computer", "smartphone", "laptop", "tablet", "keyboard", "monitor", "printer",
    "scanner", "router", "camera", "speaker", "headphones", "microphone", "projector",
    "console", "controller", "charger", "battery", "processor", "software", "hardware"
  ],
  Professions: [
    "doctor", "teacher", "engineer", "lawyer", "chef", "pilot", "dentist", "nurse",
    "architect", "mechanic", "plumber", "electrician", "carpenter", "painter", "baker",
    "barber", "waiter", "farmer", "fisherman", "librarian", "scientist", "musician"
  ],
  Clothing: [
    "jacket", "sweater", "trousers", "jeans", "dress", "shirt", "blouse", "skirt",
    "shorts", "socks", "shoes", "boots", "sneakers", "sandals", "gloves", "scarf",
    "hat", "cap", "belt", "tie", "vest", "cardigan", "hoodie", "pajamas"
  ]
};

// Hard words (8+ letters, challenging)
const HARD_WORDS: { [category: string]: string[] } = {
  Science: ["algorithm", "hypothesis", "phenomenon", "catastrophe", "bibliography"],
  Places: ["boulevard", "labyrinth", "architecture", "peninsula", "archipelago"],
  Abstract: ["mysterious", "elaborate", "magnificent", "exquisite", "spectacular"],
  Advanced: ["xylophone", "pneumonia", "rhombus", "renaissance", "philosopher"]
};

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_SETTINGS = {
  easy: { maxWrong: 10, wordBank: EASY_WORDS },
  medium: { maxWrong: 6, wordBank: MEDIUM_WORD_BANK },
  hard: { maxWrong: 5, wordBank: HARD_WORDS }
};

export default function HangmanGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [word, setWord] = useState("");
  const [category, setCategory] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameState, setGameState] = useState<"SELECT" | "PLAYING" | "WON" | "LOST">("SELECT");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [maxWrong, setMaxWrong] = useState(6);

  // Load best streak from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pb-hangman");
    if (saved) {
      setBestStreak(parseInt(saved, 10));
    }
  }, []);

  const pickRandomWord = useCallback((diff: Difficulty) => {
    const settings = DIFFICULTY_SETTINGS[diff];
    const categories = Object.keys(settings.wordBank);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = settings.wordBank[randomCategory];
    const randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
    return { word: randomWord, category: randomCategory };
  }, []);

  const selectDifficulty = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setMaxWrong(DIFFICULTY_SETTINGS[diff].maxWrong);
    const { word: newWord, category: newCategory } = pickRandomWord(diff);
    setWord(newWord);
    setCategory(newCategory);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameState("PLAYING");
  }, [pickRandomWord]);

  const startGame = useCallback(() => {
    if (!difficulty) return;
    const { word: newWord, category: newCategory } = pickRandomWord(difficulty);
    setWord(newWord);
    setCategory(newCategory);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameState("PLAYING");
  }, [pickRandomWord, difficulty]);

  const handleGuess = useCallback((letter: string) => {
    if (gameState !== "PLAYING" || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);

      if (newWrong >= maxWrong) {
        setGameState("LOST");
        setCurrentStreak(0);
      }
    } else {
      // Check if word is complete
      const allLetters = word.split("").every((l) => newGuessed.has(l));
      if (allLetters) {
        setGameState("WON");
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
          localStorage.setItem("pb-hangman", newStreak.toString());
        }
      }
    }
  }, [gameState, guessedLetters, word, wrongGuesses, currentStreak, bestStreak]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "PLAYING") return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleGuess]);

  const displayWord = word
    .split("")
    .map((letter) => (guessedLetters.has(letter) ? letter : "_"))
    .join(" ");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleShare = async () => {
    const text = `I won ${currentStreak} game${currentStreak !== 1 ? "s" : ""} in a row in Hangman! Can you beat me? https://playmini.fun/hangman`;
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Win Streak</div>
          <div className="text-3xl font-black text-orange-400 tabular-nums">{currentStreak}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best Streak</div>
          <div className="text-3xl font-black text-red-500 tabular-nums">{bestStreak}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 w-full max-w-xl">
        {/* Hangman SVG */}
        <div className="flex justify-center mb-6">
          <svg width="200" height="250" className="mx-auto">
            {/* Gallows */}
            <line x1="10" y1="230" x2="150" y2="230" stroke="white" strokeWidth="4" />
            <line x1="50" y1="230" x2="50" y2="20" stroke="white" strokeWidth="4" />
            <line x1="50" y1="20" x2="130" y2="20" stroke="white" strokeWidth="4" />
            <line x1="130" y1="20" x2="130" y2="50" stroke="white" strokeWidth="4" />

            {/* Head */}
            {wrongGuesses >= 1 && (
              <circle cx="130" cy="70" r="20" stroke="white" strokeWidth="4" fill="none" />
            )}

            {/* Body */}
            {wrongGuesses >= 2 && (
              <line x1="130" y1="90" x2="130" y2="150" stroke="white" strokeWidth="4" />
            )}

            {/* Left Arm */}
            {wrongGuesses >= 3 && (
              <line x1="130" y1="110" x2="100" y2="130" stroke="white" strokeWidth="4" />
            )}

            {/* Right Arm */}
            {wrongGuesses >= 4 && (
              <line x1="130" y1="110" x2="160" y2="130" stroke="white" strokeWidth="4" />
            )}

            {/* Left Leg */}
            {wrongGuesses >= 5 && (
              <line x1="130" y1="150" x2="110" y2="190" stroke="white" strokeWidth="4" />
            )}

            {/* Right Leg */}
            {wrongGuesses >= 6 && (
              <line x1="130" y1="150" x2="150" y2="190" stroke="white" strokeWidth="4" />
            )}

            {/* Left Hand */}
            {wrongGuesses >= 7 && (
              <circle cx="95" cy="135" r="5" stroke="white" strokeWidth="3" fill="none" />
            )}

            {/* Right Hand */}
            {wrongGuesses >= 8 && (
              <circle cx="165" cy="135" r="5" stroke="white" strokeWidth="3" fill="none" />
            )}

            {/* Left Foot */}
            {wrongGuesses >= 9 && (
              <line x1="110" y1="190" x2="100" y2="200" stroke="white" strokeWidth="3" />
            )}

            {/* Right Foot */}
            {wrongGuesses >= 10 && (
              <line x1="150" y1="190" x2="160" y2="200" stroke="white" strokeWidth="3" />
            )}
          </svg>
        </div>

        {/* Difficulty Badge */}
        {gameState !== "SELECT" && difficulty && (
          <div className="text-center mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-800 text-gray-300">
              {difficulty}
            </span>
          </div>
        )}

        {/* Category Hint */}
        {gameState !== "SELECT" && (
          <div className="text-center mb-4">
            <span className="text-sm text-gray-400">Category: </span>
            <span className="text-sm font-bold text-orange-400">{category}</span>
          </div>
        )}

        {/* Word Display */}
        {gameState !== "SELECT" && (
          <div className="text-center mb-6">
            <div className="text-3xl md:text-4xl font-mono font-bold tracking-wider text-white">
              {displayWord}
            </div>
          </div>
        )}

        {/* Wrong Guesses Counter */}
        {gameState === "PLAYING" && (
          <div className="text-center mb-4 text-gray-400 text-sm">
            Wrong guesses: {wrongGuesses} / {maxWrong}
          </div>
        )}

        {/* Difficulty Selection Screen */}
        {gameState === "SELECT" && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Hangman</h2>
            <p className="text-gray-400 mb-8">Choose your difficulty</p>

            <div className="space-y-4 max-w-md mx-auto">
              <button
                onClick={() => selectDifficulty("easy")}
                className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 border-2 border-green-600 text-white rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="font-bold text-lg text-green-400 mb-1">Easy</div>
                <div className="text-sm text-gray-400">3-4 letter words • 8 wrong guesses allowed</div>
                <div className="text-xs text-gray-500 mt-1">Perfect for kids learning English</div>
              </button>

              <button
                onClick={() => selectDifficulty("medium")}
                className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 border-2 border-orange-600 text-white rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="font-bold text-lg text-orange-400 mb-1">Medium</div>
                <div className="text-sm text-gray-400">5-10 letter words • 6 wrong guesses allowed</div>
                <div className="text-xs text-gray-500 mt-1">Standard difficulty</div>
              </button>

              <button
                onClick={() => selectDifficulty("hard")}
                className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 border-2 border-red-600 text-white rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="font-bold text-lg text-red-400 mb-1">Hard</div>
                <div className="text-sm text-gray-400">8+ letter words • 5 wrong guesses allowed</div>
                <div className="text-xs text-gray-500 mt-1">Challenging vocabulary</div>
              </button>
            </div>
          </div>
        )}

        {/* On-Screen Keyboard */}
        {gameState === "PLAYING" && (
          <div className="grid grid-cols-7 gap-2 max-w-md mx-auto">
            {alphabet.map((letter) => {
              const guessed = guessedLetters.has(letter);
              const correct = guessed && word.includes(letter);
              const wrong = guessed && !word.includes(letter);

              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={guessed}
                  className={`
                    aspect-square text-lg font-bold rounded-lg transition-all
                    ${!guessed && "bg-gray-800 hover:bg-gray-700 text-white active:scale-95"}
                    ${correct && "bg-green-600 text-white cursor-not-allowed"}
                    ${wrong && "bg-red-600 text-white cursor-not-allowed"}
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}

        {/* Win Screen */}
        {gameState === "WON" && (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">You Won!</h2>
            <p className="text-xl text-white mb-1">The word was:</p>
            <p className="text-2xl font-bold text-orange-400 mb-4">{word}</p>
            <p className="text-green-400 text-lg font-bold mb-6">
              Win Streak: {currentStreak}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Next Word
              </button>
              {currentStreak > 0 && (
                <button
                  onClick={handleShare}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Share
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lost Screen */}
        {gameState === "LOST" && (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">💀</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over</h2>
            <p className="text-xl text-white mb-1">The word was:</p>
            <p className="text-2xl font-bold text-orange-400 mb-6">{word}</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Hint */}
      {gameState === "PLAYING" && (
        <div className="text-center text-xs text-gray-600">
          Click letters or use your keyboard to guess
        </div>
      )}
    </div>
  );
}
