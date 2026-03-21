"use client";

import { useEffect, useState, useCallback } from "react";

type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  mergedFrom?: number[];
};

type Grid = (number | null)[][];

const GRID_SIZE = 4;
let tileIdCounter = 0;

const getTileColor = (value: number): string => {
  const colors: { [key: number]: string } = {
    2: "bg-gray-200 text-gray-800",
    4: "bg-gray-300 text-gray-800",
    8: "bg-orange-400 text-white",
    16: "bg-orange-500 text-white",
    32: "bg-red-500 text-white",
    64: "bg-red-600 text-white",
    128: "bg-yellow-400 text-white",
    256: "bg-yellow-500 text-white",
    512: "bg-yellow-600 text-white",
    1024: "bg-amber-500 text-white",
    2048: "bg-yellow-300 text-gray-900 font-bold",
  };
  return colors[value] || "bg-purple-600 text-white";
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Load best score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pb-2048");
    if (saved) {
      setBestScore(parseInt(saved, 10));
    }
  }, []);

  // Save best score to localStorage
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("pb-2048", score.toString());
    }
  }, [score, bestScore]);

  // Initialize game
  const initGame = useCallback(() => {
    tileIdCounter = 0;
    const newGrid: Grid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));

    const newTiles: Tile[] = [];

    // Add two random tiles
    for (let i = 0; i < 2; i++) {
      const { row, col } = getRandomEmptyCell(newGrid);
      const value = Math.random() < 0.9 ? 2 : 4;
      newGrid[row][col] = value;
      newTiles.push({ id: tileIdCounter++, value, row, col });
    }

    setGrid(newGrid);
    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  function getRandomEmptyCell(grid: Grid): { row: number; col: number } {
    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  function addRandomTile(grid: Grid): Tile | null {
    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return null;

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    grid[row][col] = value;
    return { id: tileIdCounter++, value, row, col };
  }

  function checkGameOver(grid: Grid): boolean {
    // Check if there are any empty cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === null) return false;
      }
    }

    // Check if any adjacent tiles can merge
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const current = grid[row][col];
        if (col < GRID_SIZE - 1 && grid[row][col + 1] === current) return false;
        if (row < GRID_SIZE - 1 && grid[row + 1][col] === current) return false;
      }
    }

    return true;
  }

  const move = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (gameOver) return;

      let moved = false;
      let scoreIncrease = 0;
      const newGrid: Grid = grid.map((row) => [...row]);

      // Rotate grid for easier processing (always process left)
      const rotatedGrid = rotateGrid(newGrid, direction);

      // Process each row
      for (let row = 0; row < GRID_SIZE; row++) {
        const originalRow = [...rotatedGrid[row]];
        const { newRow, merged, points } = processRow(rotatedGrid[row]);
        rotatedGrid[row] = newRow;

        if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
          moved = true;
        }
        scoreIncrease += points;
      }

      // Rotate back
      const finalGrid = rotateGridBack(rotatedGrid, direction);

      if (moved) {
        // Add random tile
        const newTile = addRandomTile(finalGrid);

        // Update tiles from grid
        const newTiles: Tile[] = [];
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (finalGrid[row][col] !== null) {
              newTiles.push({
                id: tileIdCounter++,
                value: finalGrid[row][col]!,
                row,
                col,
              });
            }
          }
        }

        setGrid(finalGrid);
        setTiles(newTiles);
        setScore((prev) => prev + scoreIncrease);

        // Check for win
        if (!won && finalGrid.some((row) => row.some((cell) => cell === 2048))) {
          setWon(true);
        }

        // Check for game over
        if (checkGameOver(finalGrid)) {
          setGameOver(true);
        }
      }
    },
    [grid, gameOver, won]
  );

  function rotateGrid(grid: Grid, direction: string): Grid {
    const rotated: Grid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));

    if (direction === "left") {
      return grid.map((row) => [...row]);
    } else if (direction === "right") {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          rotated[row][col] = grid[row][GRID_SIZE - 1 - col];
        }
      }
    } else if (direction === "up") {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          rotated[row][col] = grid[col][row];
        }
      }
    } else if (direction === "down") {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          rotated[row][col] = grid[GRID_SIZE - 1 - col][row];
        }
      }
    }

    return rotated;
  }

  function rotateGridBack(grid: Grid, direction: string): Grid {
    const rotated: Grid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));

    if (direction === "left") {
      return grid.map((row) => [...row]);
    } else if (direction === "right") {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          rotated[row][col] = grid[row][GRID_SIZE - 1 - col];
        }
      }
    } else if (direction === "up") {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          rotated[row][col] = grid[col][row];
        }
      }
    } else if (direction === "down") {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          rotated[row][col] = grid[col][GRID_SIZE - 1 - row];
        }
      }
    }

    return rotated;
  }

  function processRow(row: (number | null)[]): {
    newRow: (number | null)[];
    merged: boolean;
    points: number;
  } {
    let newRow: (number | null)[] = row.filter((cell) => cell !== null);
    let merged = false;
    let points = 0;

    // Merge tiles
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] = newRow[i]! * 2;
        points += newRow[i]!;
        newRow.splice(i + 1, 1);
        merged = true;
      }
    }

    // Fill with nulls
    while (newRow.length < GRID_SIZE) {
      newRow.push(null);
    }

    return { newRow, merged, points };
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const directionMap: { [key: string]: "up" | "down" | "left" | "right" } = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
        };
        move(directionMap[e.key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;

    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        move(deltaX > 0 ? "right" : "left");
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        move(deltaY > 0 ? "down" : "up");
      }
    }

    setTouchStart(null);
  };

  const handleShare = async () => {
    const text = `I scored ${score} points in 2048! Can you beat my score?`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "2048 Game Score", text, url });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        alert("Score copied to clipboard!");
      } catch (err) {
        alert("Could not copy to clipboard");
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Score Display */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-gray-800 rounded-lg px-4 py-2">
          <div className="text-xs text-gray-400 uppercase">Score</div>
          <div className="text-xl font-bold text-white">{score}</div>
        </div>
        <div className="bg-gray-800 rounded-lg px-4 py-2">
          <div className="text-xs text-gray-400 uppercase">Best</div>
          <div className="text-xl font-bold text-white">{bestScore}</div>
        </div>
        <button
          onClick={initGame}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          New Game
        </button>
      </div>

      {/* Win/Game Over Message */}
      {(won || gameOver) && (
        <div className="bg-gray-800 border-2 border-orange-500 rounded-lg p-4 mb-4 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {won && !gameOver ? "You Win!" : "Game Over!"}
          </div>
          {won && !gameOver && (
            <div className="text-gray-400 text-sm mb-2">Keep going for a higher score!</div>
          )}
          <div className="text-gray-400 text-sm mb-3">Final Score: {score}</div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={initGame}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={handleShare}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Share Score
            </button>
          </div>
        </div>
      )}

      {/* Game Board */}
      <div
        className="bg-gray-900 rounded-lg p-3 relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 16 }).map((_, index) => {
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;
            const value = grid[row]?.[col];

            return (
              <div
                key={index}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold ${
                  value === null
                    ? "bg-gray-800"
                    : getTileColor(value)
                }`}
              >
                {value !== null && value}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Instructions */}
      <div className="text-center text-gray-500 text-sm mt-4">
        <div className="md:hidden">Swipe to move tiles</div>
        <div className="hidden md:block">Use arrow keys to move tiles</div>
      </div>
    </div>
  );
}
