"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Difficulty = "easy" | "medium" | "hard";
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Cell {
  row: number;
  col: number;
}

const MAZE_SIZES = {
  easy: 11,
  medium: 17,
  hard: 23,
};

export default function MazeRunner() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [maze, setMaze] = useState<boolean[][]>([]);
  const [playerPos, setPlayerPos] = useState<Cell>({ row: 1, col: 1 });
  const [endPos, setEndPos] = useState<Cell>({ row: 0, col: 0 });
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [timer, setTimer] = useState(0);
  const [moves, setMoves] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const mazeSize = MAZE_SIZES[difficulty];

  // Load personal best
  useEffect(() => {
    const key = `pb-maze-${difficulty}`;
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

  // Generate maze using recursive backtracking
  const generateMaze = useCallback(() => {
    const size = mazeSize;
    const newMaze: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(true));

    // Carve passages
    const stack: Cell[] = [];
    const start = { row: 1, col: 1 };
    newMaze[start.row][start.col] = false;
    stack.push(start);

    const directions = [
      { dr: -2, dc: 0 },
      { dr: 2, dc: 0 },
      { dr: 0, dc: -2 },
      { dr: 0, dc: 2 },
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors: Array<{ cell: Cell; wall: Cell }> = [];

      for (const { dr, dc } of directions) {
        const newRow = current.row + dr;
        const newCol = current.col + dc;

        if (newRow > 0 && newRow < size - 1 && newCol > 0 && newCol < size - 1) {
          if (newMaze[newRow][newCol]) {
            neighbors.push({
              cell: { row: newRow, col: newCol },
              wall: { row: current.row + dr / 2, col: current.col + dc / 2 },
            });
          }
        }
      }

      if (neighbors.length > 0) {
        const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
        newMaze[chosen.cell.row][chosen.cell.col] = false;
        newMaze[chosen.wall.row][chosen.wall.col] = false;
        stack.push(chosen.cell);
      } else {
        stack.pop();
      }
    }

    // Set start and end positions
    const newStart = { row: 1, col: 1 };
    const newEnd = { row: size - 2, col: size - 2 };

    setMaze(newMaze);
    setPlayerPos(newStart);
    setEndPos(newEnd);
    setGameState("playing");
    setTimer(0);
    setMoves(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mazeSize]);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  // Move player
  const movePlayer = useCallback((direction: Direction) => {
    if (gameState !== "playing") return;
    if (timer === 0) startTimer();

    let newRow = playerPos.row;
    let newCol = playerPos.col;

    switch (direction) {
      case "UP": newRow--; break;
      case "DOWN": newRow++; break;
      case "LEFT": newCol--; break;
      case "RIGHT": newCol++; break;
    }

    // Check bounds and walls
    if (
      newRow >= 0 &&
      newRow < mazeSize &&
      newCol >= 0 &&
      newCol < mazeSize &&
      !maze[newRow][newCol]
    ) {
      setPlayerPos({ row: newRow, col: newCol });
      setMoves((prev) => prev + 1);

      // Check if reached end
      if (newRow === endPos.row && newCol === endPos.col) {
        setGameState("won");
        if (timerRef.current) clearInterval(timerRef.current);

        // Save personal best
        const key = `pb-maze-${difficulty}`;
        const currentBest = localStorage.getItem(key);
        if (!currentBest || timer < parseInt(currentBest)) {
          localStorage.setItem(key, timer.toString());
          setPersonalBest(timer);
        }
      }
    }
  }, [playerPos, maze, mazeSize, gameState, endPos, timer, difficulty, startTimer]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        movePlayer("UP");
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        movePlayer("DOWN");
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        movePlayer("LEFT");
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        movePlayer("RIGHT");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer, gameState]);

  // Touch controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (gameState !== "playing") return;
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameState !== "playing") return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;

      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) movePlayer("RIGHT");
        else movePlayer("LEFT");
      } else {
        if (dy > 0) movePlayer("DOWN");
        else movePlayer("UP");
      }

      touchStartRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [movePlayer, gameState]);

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
                ? "bg-purple-600 text-ink"
                : "bg-paper-2 text-ink-2 hover:bg-paper-2"
            }`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 flex-wrap justify-center">
        <div className="bg-paper-2 px-6 py-3 rounded-lg text-center">
          <div className="text-xs text-ink-3 uppercase">Time</div>
          <div className="text-2xl font-bold text-purple-400">{timer}s</div>
        </div>
        <div className="bg-paper-2 px-6 py-3 rounded-lg text-center">
          <div className="text-xs text-ink-3 uppercase">Moves</div>
          <div className="text-2xl font-bold text-blue-400">{moves}</div>
        </div>
        <button
          onClick={generateMaze}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-ink font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
        >
          New Maze
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
        <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-2xl font-bold text-purple-400 mb-2">🎉 Maze Completed!</h2>
          <p className="text-ink-2 mb-4">
            Time: {timer}s | Moves: {moves}
            {personalBest === timer && (
              <span className="block text-yellow-400 font-bold mt-1">New Personal Best! 🏆</span>
            )}
          </p>
        </div>
      )}

      {/* Maze */}
      <div className="bg-paper-2 p-4 rounded-2xl border-2 border-line overflow-auto max-w-full">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${mazeSize}, minmax(0, 1fr))`,
          }}
        >
          {maze.map((row, rowIndex) =>
            row.map((isWall, colIndex) => {
              const isPlayer = playerPos.row === rowIndex && playerPos.col === colIndex;
              const isEnd = endPos.row === rowIndex && endPos.col === colIndex;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-5 h-5 sm:w-6 sm:h-6 transition-colors
                    ${isWall ? "bg-paper-2" : "bg-paper"}
                    ${isPlayer ? "bg-blue-500" : ""}
                    ${isEnd ? "bg-green-500" : ""}
                  `}
                >
                  {isPlayer && (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      🔵
                    </div>
                  )}
                  {isEnd && !isPlayer && (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      🎯
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="sm:hidden grid grid-cols-3 gap-2 max-w-[200px]">
        <div></div>
        <button
          onClick={() => movePlayer("UP")}
          className="bg-paper-2 hover:bg-paper-2 text-ink p-4 rounded-lg active:bg-gray-600"
          disabled={gameState !== "playing"}
        >
          ▲
        </button>
        <div></div>
        <button
          onClick={() => movePlayer("LEFT")}
          className="bg-paper-2 hover:bg-paper-2 text-ink p-4 rounded-lg active:bg-gray-600"
          disabled={gameState !== "playing"}
        >
          ◀
        </button>
        <div></div>
        <button
          onClick={() => movePlayer("RIGHT")}
          className="bg-paper-2 hover:bg-paper-2 text-ink p-4 rounded-lg active:bg-gray-600"
          disabled={gameState !== "playing"}
        >
          ▶
        </button>
        <div></div>
        <button
          onClick={() => movePlayer("DOWN")}
          className="bg-paper-2 hover:bg-paper-2 text-ink p-4 rounded-lg active:bg-gray-600"
          disabled={gameState !== "playing"}
        >
          ▼
        </button>
        <div></div>
      </div>

      <div className="text-center text-xs text-ink-3 max-w-md">
        <p>Navigate from 🔵 to 🎯 using arrow keys or swipe gestures.</p>
        <p className="mt-1">Desktop: Arrow keys or WASD</p>
      </div>
    </div>
  );
}
