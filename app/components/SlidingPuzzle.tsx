"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Tile = number | null; // null represents empty space

export default function SlidingPuzzle() {
  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const movesRef = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem("pb-sliding-puzzle");
    setPersonalBest(stored ? parseInt(stored) : null);
  }, []);

  const isSolvable = useCallback((tiles: Tile[]): boolean => {
    let inversions = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === null) continue;
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[j] === null) continue;
        if (tiles[i]! > tiles[j]!) inversions++;
      }
    }
    return inversions % 2 === 0;
  }, []);

  const shuffle = useCallback(() => {
    let shuffled: Tile[];
    do {
      shuffled = Array.from({ length: 15 }, (_, i) => i + 1);
      shuffled.push(null);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (!isSolvable(shuffled) || isSolved(shuffled));
    return shuffled;
  }, [isSolvable]);

  const isSolved = useCallback((tiles: Tile[]): boolean => {
    for (let i = 0; i < 15; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[15] === null;
  }, []);

  const startGame = useCallback(() => {
    const newTiles = shuffle();
    setTiles(newTiles);
    setMoves(0);
    movesRef.current = 0;
    setTime(0);
    setGameState("playing");

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  }, [shuffle]);

  const moveTile = useCallback(
    (index: number) => {
      if (gameState !== "playing") return;

      const emptyIndex = tiles.indexOf(null);
      const row = Math.floor(index / 4);
      const col = index % 4;
      const emptyRow = Math.floor(emptyIndex / 4);
      const emptyCol = emptyIndex % 4;

      // Check if adjacent
      const isAdjacent =
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow);

      if (!isAdjacent) return;

      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);

      movesRef.current++;
      setMoves(movesRef.current);

      if (isSolved(newTiles)) {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState("won");

        const key = "pb-sliding-puzzle";
        const currentBest = localStorage.getItem(key);
        if (!currentBest || time < parseInt(currentBest)) {
          localStorage.setItem(key, time.toString());
          setPersonalBest(time);
        }
      }
    },
    [gameState, tiles, time, isSolved]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleShare = async () => {
    const text = `I solved the sliding puzzle in ${time}s with ${movesRef.current} moves! Can you beat me? https://playmini.fun/sliding-puzzle`;
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

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {gameState === "start" && (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-green-400 mb-4">Sliding Puzzle</h2>
          <p className="text-gray-400 mb-6">Arrange the tiles in order from 1 to 15</p>
          <button
            onClick={startGame}
            className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            Start
          </button>
        </div>
      )}

      {(gameState === "playing" || gameState === "won") && (
        <>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <div className="bg-gray-900 px-6 py-3 rounded-lg text-center">
              <div className="text-xs text-gray-500 uppercase">Time</div>
              <div className="text-2xl font-bold text-blue-400">{time}s</div>
            </div>
            <div className="bg-gray-900 px-6 py-3 rounded-lg text-center">
              <div className="text-xs text-gray-500 uppercase">Moves</div>
              <div className="text-2xl font-bold text-purple-400">{moves}</div>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              New Game
            </button>
            {personalBest !== null && (
              <div className="bg-gray-900 px-6 py-3 rounded-lg text-center">
                <div className="text-xs text-gray-500 uppercase">Best</div>
                <div className="text-2xl font-bold text-amber-400">{personalBest}s</div>
              </div>
            )}
          </div>

          {gameState === "won" && (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 text-center max-w-md">
              <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 Puzzle Solved!</h2>
              <p className="text-gray-300 mb-4">
                Time: {time}s | Moves: {moves}
                {personalBest === time && (
                  <span className="block text-yellow-400 font-bold mt-1">New Personal Best! 🏆</span>
                )}
              </p>
              <button
                onClick={handleShare}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Share Score
              </button>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 p-4 bg-gray-900 rounded-2xl border-2 border-gray-800">
            {tiles.map((tile, index) => (
              <button
                key={index}
                onClick={() => moveTile(index)}
                disabled={tile === null || gameState !== "playing"}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg font-black text-3xl transition-all ${
                  tile === null
                    ? "bg-gray-950 cursor-default"
                    : gameState === "playing"
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:scale-105 active:scale-95 cursor-pointer"
                    : "bg-gradient-to-br from-green-500 to-emerald-600 text-white cursor-default"
                }`}
              >
                {tile}
              </button>
            ))}
          </div>

          <div className="text-center text-xs text-gray-600 max-w-md">
            <p>Click on a tile next to the empty space to slide it.</p>
            <p className="mt-1">Arrange all tiles in order from 1 to 15.</p>
          </div>
        </>
      )}
    </div>
  );
}
