"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Difficulty = "easy" | "medium" | "hard";

interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
}

const DIFFICULTIES: Record<Difficulty, GameConfig> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  isClickedMine?: boolean;
}

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [timer, setTimer] = useState(0);
  const [minesLeft, setMinesLeft] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);

  const config = DIFFICULTIES[difficulty];

  // Load personal best
  useEffect(() => {
    const key = `pb-mines-${difficulty}`;
    const stored = localStorage.getItem(key);
    setPersonalBest(stored ? parseInt(stored) : null);
  }, [difficulty]);

  // Initialize board
  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = [];
    for (let row = 0; row < config.rows; row++) {
      const boardRow: Cell[] = [];
      for (let col = 0; col < config.cols; col++) {
        boardRow.push({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        });
      }
      newBoard.push(boardRow);
    }
    setBoard(newBoard);
    setGameState("playing");
    setTimer(0);
    setMinesLeft(config.mines);
    setFirstClick(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [config.rows, config.cols, config.mines]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Generate mines after first click
  const generateMines = useCallback((safeRow: number, safeCol: number) => {
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    let minesPlaced = 0;

    while (minesPlaced < config.mines) {
      const row = Math.floor(Math.random() * config.rows);
      const col = Math.floor(Math.random() * config.cols);

      // Don't place mine on first click or if already has mine
      if ((row === safeRow && col === safeCol) || newBoard[row][col].isMine) {
        continue;
      }

      newBoard[row][col].isMine = true;
      minesPlaced++;
    }

    // Calculate adjacent mines
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              if (
                nr >= 0 &&
                nr < config.rows &&
                nc >= 0 &&
                nc < config.cols &&
                newBoard[nr][nc].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[row][col].adjacentMines = count;
        }
      }
    }

    setBoard(newBoard);
    return newBoard;
  }, [board, config.mines, config.rows, config.cols]);

  // Flood fill for empty cells
  const floodFill = useCallback((board: Cell[][], row: number, col: number) => {
    if (
      row < 0 ||
      row >= config.rows ||
      col < 0 ||
      col >= config.cols ||
      board[row][col].isRevealed ||
      board[row][col].isFlagged
    ) {
      return;
    }

    board[row][col].isRevealed = true;

    if (board[row][col].adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            floodFill(board, row + dr, col + dc);
          }
        }
      }
    }
  }, [config.rows, config.cols]);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  }, []);

  // Check win condition
  const checkWin = useCallback((board: Cell[][]) => {
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (!board[row][col].isMine && !board[row][col].isRevealed) {
          return false;
        }
      }
    }
    return true;
  }, [config.rows, config.cols]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== "playing") return;

    let currentBoard = board;

    // Generate mines on first click
    if (firstClick) {
      currentBoard = generateMines(row, col);
      setFirstClick(false);
      startTimer();
    }

    const newBoard = currentBoard.map((r) => r.map((cell) => ({ ...cell })));

    if (newBoard[row][col].isFlagged || newBoard[row][col].isRevealed) return;

    if (newBoard[row][col].isMine) {
      // Game over
      newBoard[row][col].isClickedMine = true;
      // Reveal all mines
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true;
          }
        }
      }
      setBoard(newBoard);
      setGameState("lost");
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Reveal cell and flood fill if empty
      floodFill(newBoard, row, col);
      setBoard(newBoard);

      // Check for win
      if (checkWin(newBoard)) {
        setGameState("won");
        if (timerRef.current) clearInterval(timerRef.current);

        // Save personal best
        const key = `pb-mines-${difficulty}`;
        const currentBest = localStorage.getItem(key);
        if (!currentBest || timer < parseInt(currentBest)) {
          localStorage.setItem(key, timer.toString());
          setPersonalBest(timer);
        }
      }
    }
  }, [board, gameState, firstClick, generateMines, startTimer, floodFill, checkWin, config.rows, config.cols, difficulty, timer]);

  // Handle right click (flag)
  const handleCellRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameState !== "playing" || board[row][col].isRevealed || firstClick) return;

    const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setMinesLeft((prev) => prev + (newBoard[row][col].isFlagged ? -1 : 1));
  }, [board, gameState, firstClick]);

  // Handle long press for mobile
  const handleTouchStart = useCallback((row: number, col: number) => {
    longPressRef.current = setTimeout(() => {
      if (gameState !== "playing" || board[row][col].isRevealed || firstClick) return;
      const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
      newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
      setBoard(newBoard);
      setMinesLeft((prev) => prev + (newBoard[row][col].isFlagged ? -1 : 1));
    }, 500);
  }, [board, gameState, firstClick]);

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
    }
  }, []);

  // Share score
  const handleShare = useCallback(async () => {
    const text = `I solved ${difficulty} Minesweeper in ${timer} seconds! Can you beat my time? Play at playmini.fun/minesweeper`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Score copied to clipboard!");
    }
  }, [difficulty, timer]);

  // Get cell content
  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged && !cell.isRevealed) return "🚩";
    if (!cell.isRevealed) return "";
    if (cell.isMine) return "💣";
    if (cell.adjacentMines === 0) return "";
    return cell.adjacentMines.toString();
  };

  // Get cell color
  const getCellColor = (num: number) => {
    const colors: Record<number, string> = {
      1: "text-blue-500",
      2: "text-green-500",
      3: "text-red-500",
      4: "text-purple-500",
      5: "text-red-900",
      6: "text-teal-500",
      7: "text-black",
      8: "text-gray-500",
    };
    return colors[num] || "";
  };

  const getFaceEmoji = () => {
    if (gameState === "won") return "😎";
    if (gameState === "lost") return "😵";
    return "😊";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Minesweeper
          </h1>
          <p className="text-slate-300 text-lg">
            Clear the board without hitting a mine!
          </p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                if (timerRef.current) clearInterval(timerRef.current);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                difficulty === diff
                  ? "bg-yellow-500 text-slate-900"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
              <div className="text-xs mt-1 opacity-80">
                {DIFFICULTIES[diff].rows}×{DIFFICULTIES[diff].cols}, {DIFFICULTIES[diff].mines} mines
              </div>
            </button>
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-xl font-bold">
          <div className="bg-slate-800 px-6 py-3 rounded-lg">
            💣 {minesLeft}
          </div>
          <button
            onClick={initializeBoard}
            className="text-4xl hover:scale-110 transition-transform bg-slate-800 px-6 py-3 rounded-lg"
          >
            {getFaceEmoji()}
          </button>
          <div className="bg-slate-800 px-6 py-3 rounded-lg">
            ⏱️ {timer}s
          </div>
        </div>

        {/* Personal Best */}
        {personalBest !== null && (
          <div className="text-center mb-4 text-slate-300">
            Personal Best: {personalBest}s
          </div>
        )}

        {/* Win Message */}
        {gameState === "won" && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 You Won!</h2>
            <p className="text-slate-300 mb-4">
              Completed in {timer} seconds
              {personalBest === timer && " - New Personal Best! 🏆"}
            </p>
            <button
              onClick={handleShare}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Share Score
            </button>
          </div>
        )}

        {/* Game Over Message */}
        {gameState === "lost" && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">💥 Game Over!</h2>
            <p className="text-slate-300">Better luck next time!</p>
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-4">
          <div
            className="bg-slate-900 p-2 rounded-lg border-4 border-slate-700 inline-block"
            style={{
              maxWidth: "100%",
            }}
          >
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                    onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
                    onTouchEnd={handleTouchEnd}
                    className={`
                      min-w-[28px] min-h-[28px] md:min-w-[32px] md:min-h-[32px]
                      flex items-center justify-center font-bold text-sm md:text-base
                      transition-colors select-none
                      ${
                        cell.isRevealed
                          ? cell.isClickedMine
                            ? "bg-red-600"
                            : "bg-slate-700"
                          : "bg-slate-800 hover:bg-slate-700 active:bg-slate-600"
                      }
                      ${cell.adjacentMines > 0 && cell.isRevealed ? getCellColor(cell.adjacentMines) : ""}
                    `}
                    disabled={gameState !== "playing"}
                  >
                    {getCellContent(cell)}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800 rounded-lg p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-3">Controls:</h3>
          <ul className="text-slate-300 space-y-2">
            <li>• <strong>Left Click / Tap:</strong> Reveal a cell</li>
            <li>• <strong>Right Click / Long Press:</strong> Place or remove a flag</li>
            <li>• Numbers show how many mines are adjacent to that cell</li>
            <li>• Flag all mines and reveal all safe cells to win!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
