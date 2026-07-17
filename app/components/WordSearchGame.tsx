"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Difficulty = "easy" | "medium" | "hard";
type Direction = { dx: number; dy: number };

interface WordConfig {
  word: string;
  found: boolean;
  cells: Array<{ row: number; col: number }>;
}

const WORD_CATEGORIES = {
  easy: ["CAT", "DOG", "SUN", "MOON", "TREE", "FISH", "BIRD", "STAR"],
  medium: ["PHONE", "HOUSE", "WATER", "SMILE", "DANCE", "MUSIC", "BEACH", "CLOUD"],
  hard: ["PUZZLE", "MATRIX", "DRAGON", "GUITAR", "PLANET", "ROCKET", "CASTLE", "TREASURE"],
};

const DIRECTIONS: Direction[] = [
  { dx: 0, dy: 1 },   // right
  { dx: 1, dy: 0 },   // down
  { dx: 1, dy: 1 },   // diagonal down-right
  { dx: -1, dy: 1 },  // diagonal up-right
];

const GRID_SIZES = {
  easy: 10,
  medium: 12,
  hard: 15,
};

export default function WordSearchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<WordConfig[]>([]);
  const [selection, setSelection] = useState<Array<{ row: number; col: number }>>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [timer, setTimer] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const gridSize = GRID_SIZES[difficulty];

  // Load personal best
  useEffect(() => {
    const key = `pb-word-search-${difficulty}`;
    const stored = localStorage.getItem(key);
    setPersonalBest(stored ? parseInt(stored) : null);
  }, [difficulty]);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  }, []);

  // Generate grid
  const generateGrid = useCallback(() => {
    const size = gridSize;
    const newGrid: string[][] = Array(size).fill(null).map(() => Array(size).fill(""));
    const wordList = WORD_CATEGORIES[difficulty];
    const placedWords: WordConfig[] = [];

    // Place words
    for (const word of wordList) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        // Check if word fits
        const cells: Array<{ row: number; col: number }> = [];
        let fits = true;

        for (let i = 0; i < word.length; i++) {
          const newRow = row + direction.dx * i;
          const newCol = col + direction.dy * i;

          if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
            fits = false;
            break;
          }

          if (newGrid[newRow][newCol] !== "" && newGrid[newRow][newCol] !== word[i]) {
            fits = false;
            break;
          }

          cells.push({ row: newRow, col: newCol });
        }

        if (fits) {
          // Place the word
          for (let i = 0; i < word.length; i++) {
            const newRow = row + direction.dx * i;
            const newCol = col + direction.dy * i;
            newGrid[newRow][newCol] = word[i];
          }
          placedWords.push({ word, found: false, cells });
          placed = true;
        }
      }
    }

    // Fill empty cells with random letters
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === "") {
          newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    setGrid(newGrid);
    setWords(placedWords);
    setFoundCells(new Set());
    setSelection([]);
    setGameState("playing");
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [difficulty, gridSize]);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  // Check if selection matches any word
  const checkSelection = useCallback(() => {
    if (selection.length < 2) return;

    const selectionStr = selection.map(({ row, col }) => grid[row][col]).join("");
    const reverseStr = selectionStr.split("").reverse().join("");

    const matchedWord = words.find(w =>
      !w.found && (w.word === selectionStr || w.word === reverseStr)
    );

    if (matchedWord) {
      // Word found!
      const newWords = words.map(w =>
        w.word === matchedWord.word ? { ...w, found: true } : w
      );
      setWords(newWords);

      const newFoundCells = new Set(foundCells);
      selection.forEach(({ row, col }) => {
        newFoundCells.add(`${row}-${col}`);
      });
      setFoundCells(newFoundCells);

      // Check if all words found
      if (newWords.every(w => w.found)) {
        setGameState("won");
        if (timerRef.current) clearInterval(timerRef.current);

        // Save personal best
        const key = `pb-word-search-${difficulty}`;
        const currentBest = localStorage.getItem(key);
        if (!currentBest || timer < parseInt(currentBest)) {
          localStorage.setItem(key, timer.toString());
          setPersonalBest(timer);
        }
      }
    }

    setSelection([]);
  }, [selection, grid, words, foundCells, difficulty, timer]);

  // Mouse/touch handlers
  const handleCellDown = (row: number, col: number) => {
    if (gameState !== "playing") return;
    if (timer === 0) startTimer();
    setIsDragging(true);
    setSelection([{ row, col }]);
  };

  const handleCellEnter = (row: number, col: number) => {
    if (!isDragging || gameState !== "playing") return;

    // Only allow straight lines or diagonals
    if (selection.length === 0) return;

    const first = selection[0];
    const dx = row - first.row;
    const dy = col - first.col;

    // Check if in same direction as existing selection
    if (selection.length > 1) {
      const prevDx = selection[1].row - first.row;
      const prevDy = selection[1].col - first.col;
      const dirX = prevDx === 0 ? 0 : prevDx / Math.abs(prevDx);
      const dirY = prevDy === 0 ? 0 : prevDy / Math.abs(prevDy);
      const newDirX = dx === 0 ? 0 : dx / Math.abs(dx);
      const newDirY = dy === 0 ? 0 : dy / Math.abs(dy);

      if (dirX !== newDirX || dirY !== newDirY) return;
    }

    // Check if it's a valid direction (horizontal, vertical, or diagonal)
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return;

    // Add cell to selection if not already there
    const cellKey = `${row}-${col}`;
    if (!selection.some(s => `${s.row}-${s.col}` === cellKey)) {
      setSelection([...selection, { row, col }]);
    }
  };

  const handleCellUp = () => {
    if (isDragging) {
      setIsDragging(false);
      checkSelection();
    }
  };

  const isSelected = (row: number, col: number) => {
    return selection.some(s => s.row === row && s.col === col);
  };

  const isFound = (row: number, col: number) => {
    return foundCells.has(`${row}-${col}`);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Difficulty Selector */}
      <div className="flex gap-3">
        {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              difficulty === diff
                ? "bg-green-600 text-ink"
                : "bg-paper-2 text-ink-2 hover:bg-paper-2"
            }`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Timer and Controls */}
      <div className="flex items-center gap-6">
        <div className="bg-paper-2 px-6 py-3 rounded-lg text-center">
          <div className="text-xs text-ink-3 uppercase">Time</div>
          <div className="text-2xl font-bold text-green-400">{timer}s</div>
        </div>
        <button
          onClick={generateGrid}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-ink font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
        >
          New Game
        </button>
        {personalBest !== null && (
          <div className="bg-paper-2 px-6 py-3 rounded-lg text-center">
            <div className="text-xs text-ink-3 uppercase">Best</div>
            <div className="text-2xl font-bold text-amber-400">{personalBest}s</div>
          </div>
        )}
      </div>

      {/* Win Message */}
      {gameState === "won" && (
        <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 All Words Found!</h2>
          <p className="text-ink-2 mb-4">
            Completed in {timer} seconds
            {personalBest === timer && " - New Personal Best! 🏆"}
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Grid */}
        <div
          className="bg-paper-2 p-4 rounded-2xl border-2 border-line"
          onMouseLeave={handleCellUp}
          onMouseUp={handleCellUp}
        >
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              touchAction: "none",
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((letter, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onMouseDown={() => handleCellDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleCellEnter(rowIndex, colIndex)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleCellDown(rowIndex, colIndex);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element?.getAttribute("data-cell")) {
                      const [r, c] = element.getAttribute("data-cell")!.split("-").map(Number);
                      handleCellEnter(r, c);
                    }
                  }}
                  onTouchEnd={handleCellUp}
                  data-cell={`${rowIndex}-${colIndex}`}
                  style={{ touchAction: "none" }}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center
                    font-bold text-sm sm:text-base cursor-pointer select-none
                    rounded transition-all
                    ${
                      isFound(rowIndex, colIndex)
                        ? "bg-green-600 text-ink"
                        : isSelected(rowIndex, colIndex)
                        ? "bg-yellow-500 text-black"
                        : "bg-paper-2 text-ink-2 hover:bg-paper-2"
                    }
                  `}
                >
                  {letter}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Word List */}
        <div className="bg-paper-2 rounded-2xl p-6 border-2 border-line min-w-[200px]">
          <h3 className="text-xl font-bold text-green-400 mb-4">Find These Words</h3>
          <div className="space-y-2">
            {words.map((wordConfig) => (
              <div
                key={wordConfig.word}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  wordConfig.found
                    ? "bg-green-600 text-ink line-through"
                    : "bg-paper-2 text-ink-2"
                }`}
              >
                {wordConfig.word}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-ink-3">
            {words.filter(w => w.found).length} / {words.length} found
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-ink-3 max-w-md">
        <p>Drag to select letters. Words can be horizontal, vertical, or diagonal.</p>
      </div>
    </div>
  );
}
