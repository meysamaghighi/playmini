"use client";

import { useEffect, useState, useCallback } from "react";

type Difficulty = "easy" | "medium" | "hard";
type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const SYMBOLS = ["🎮", "🎯", "🎨", "🎭", "🎪", "🎬", "🎤", "🎧", "🎵", "🎹", "🎲", "🎳"];

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, gridCols: 4, gridRows: 3 },
  medium: { pairs: 8, gridCols: 4, gridRows: 4 },
  hard: { pairs: 12, gridCols: 6, gridRows: 4 },
};

export default function MemoryMatch() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "WON">("START");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [bestMoves, setBestMoves] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [isChecking, setIsChecking] = useState(false);

  // Load best scores
  useEffect(() => {
    const easy = localStorage.getItem("pb-memory-easy");
    const medium = localStorage.getItem("pb-memory-medium");
    const hard = localStorage.getItem("pb-memory-hard");
    setBestMoves({
      easy: easy ? parseInt(easy, 10) : 0,
      medium: medium ? parseInt(medium, 10) : 0,
      hard: hard ? parseInt(hard, 10) : 0,
    });
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== "PLAYING") return;
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const initializeGame = useCallback((diff: Difficulty) => {
    const config = DIFFICULTY_CONFIG[diff];
    const selectedSymbols = SYMBOLS.slice(0, config.pairs);
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
    setGameState("PLAYING");
  }, []);

  const handleCardClick = useCallback((index: number) => {
    if (
      gameState !== "PLAYING" ||
      isChecking ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedIndices.length >= 2
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

          // Check if game is won
          const allMatched = cards.every(
            (card, i) =>
              card.isMatched ||
              i === first ||
              i === second
          );
          if (allMatched) {
            setGameState("WON");
            const currentMoves = moves + 1;
            const key = `pb-memory-${difficulty}`;
            const stored = localStorage.getItem(key);
            const prevBest = stored ? parseInt(stored, 10) : 0;
            if (prevBest === 0 || currentMoves < prevBest) {
              localStorage.setItem(key, currentMoves.toString());
              setBestMoves((prev) => ({ ...prev, [difficulty]: currentMoves }));
            }
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
        }, 1000);
      }
    }
  }, [gameState, isChecking, cards, flippedIndices, moves, difficulty]);

  const getStarRating = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const minMoves = config.pairs; // Perfect = exactly pairs in moves
    if (moves <= minMoves + 2) return 3;
    if (moves <= minMoves + 6) return 2;
    return 1;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    const stars = "⭐".repeat(getStarRating());
    const text = `I completed Memory Match (${difficulty}) in ${moves} moves! ${stars}\nhttps://playmini.fun/memory`;
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

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Difficulty Selector */}
      {gameState === "START" && (
        <div className="w-full max-w-md">
          <label className="block text-sm font-semibold text-gray-400 mb-2 text-center">
            Select Difficulty
          </label>
          <div className="flex gap-2 justify-center">
            {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                  difficulty === diff
                    ? "bg-purple-600 text-white scale-105"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            {config.pairs} pairs · {config.gridCols}×{config.gridRows} grid
          </p>
        </div>
      )}

      {/* Stats */}
      {gameState !== "START" && (
        <div className="flex gap-8 text-center">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Moves</div>
            <div className="text-3xl font-black text-purple-400 tabular-nums">{moves}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Time</div>
            <div className="text-3xl font-black text-blue-400 tabular-nums">{formatTime(time)}</div>
          </div>
          {bestMoves[difficulty] > 0 && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
              <div className="text-3xl font-black text-amber-400 tabular-nums">{bestMoves[difficulty]}</div>
            </div>
          )}
        </div>
      )}

      {/* Game Board */}
      <div className="relative">
        {gameState === "START" ? (
          <div className="bg-slate-900/50 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="text-7xl mb-4">🧠</div>
            <h2 className="text-3xl font-black text-purple-400 mb-2">Memory Match</h2>
            <p className="text-gray-400 mb-6 text-sm">Flip cards to find matching pairs</p>
            <button
              onClick={() => initializeGame(difficulty)}
              className="px-10 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div
            className="grid gap-2 sm:gap-3 p-4 bg-slate-900 rounded-2xl border border-gray-800"
            style={{
              gridTemplateColumns: `repeat(${config.gridCols}, minmax(0, 1fr))`,
            }}
          >
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={card.isFlipped || card.isMatched || isChecking}
                className={`aspect-square rounded-xl text-3xl sm:text-4xl font-bold transition-all duration-300 transform-style-3d ${
                  card.isFlipped || card.isMatched
                    ? "bg-gradient-to-br from-purple-600 to-pink-600 scale-100"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 hover:scale-105 active:scale-95"
                } ${
                  card.isMatched
                    ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50"
                    : ""
                } ${
                  card.isFlipped && !card.isMatched ? "animate-flip" : ""
                }`}
                style={{
                  minWidth: "60px",
                  minHeight: "60px",
                  maxWidth: "90px",
                  maxHeight: "90px",
                }}
              >
                {card.isFlipped || card.isMatched ? (
                  <span className="block animate-pop">{card.symbol}</span>
                ) : (
                  <span className="text-slate-600 text-2xl">?</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Win Overlay */}
        {gameState === "WON" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-4">You Win!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-4 mb-6 text-center">
              <p className="text-white text-lg font-bold mb-1">
                {moves} moves · {formatTime(time)}
              </p>
              <p className="text-2xl mb-2">{"⭐".repeat(getStarRating())}</p>
              {bestMoves[difficulty] > 0 && moves <= bestMoves[difficulty] && (
                <p className="text-yellow-400 text-sm font-bold">New Best!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => initializeGame(difficulty)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
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
      </div>

      {/* Instructions */}
      {gameState === "PLAYING" && (
        <p className="text-center text-xs text-gray-600 max-w-md">
          Tap cards to flip them. Find all matching pairs in the fewest moves possible!
        </p>
      )}
    </div>
  );
}
