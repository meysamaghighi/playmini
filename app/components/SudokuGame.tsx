"use client";

import { useState, useEffect, useCallback } from "react";

type Cell = {
  value: number; // 0 = empty, 1-9 = filled
  given: boolean; // true if part of initial puzzle
  notes: Set<number>; // for pencil marks
};

type Board = Cell[][];

type Move = {
  row: number;
  col: number;
  prevValue: number;
  prevNotes: Set<number>;
  newValue: number;
  newNotes: Set<number>;
};

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 30,
  hard: 22,
};

// Generate a solved Sudoku board
function generateSolvedBoard(): number[][] {
  const board: number[][] = Array(9)
    .fill(0)
    .map(() => Array(9).fill(0));

  // Fill diagonal 3x3 boxes first (they don't conflict with each other)
  for (let box = 0; box < 3; box++) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Fisher-Yates shuffle
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[box * 3 + r][box * 3 + c] = nums[idx++];
      }
    }
  }

  // Solve the rest with backtracking
  solveSudoku(board);
  return board;
}

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

function solveSudoku(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Shuffle for randomness
        for (let i = nums.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nums[i], nums[j]] = [nums[j], nums[i]];
        }

        for (const num of nums) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solveSudoku(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Create a puzzle by removing cells from solved board
function createPuzzle(difficulty: Difficulty): Board {
  const solved = generateSolvedBoard();
  const clues = DIFFICULTY_CLUES[difficulty];
  const cellsToRemove = 81 - clues;

  // Create list of all cell positions
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Remove cells
  const removed = positions.slice(0, cellsToRemove);
  const board: Board = Array(9)
    .fill(0)
    .map((_, r) =>
      Array(9)
        .fill(0)
        .map((_, c) => ({
          value: solved[r][c],
          given: true,
          notes: new Set<number>(),
        }))
    );

  for (const [r, c] of removed) {
    board[r][c].value = 0;
    board[r][c].given = false;
  }

  return board;
}

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<Board>(() => createPuzzle("medium"));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState<Move[]>([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [won, setWon] = useState(false);
  const [personalBests, setPersonalBests] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });

  // Load personal bests
  useEffect(() => {
    const easy = localStorage.getItem("pb-sudoku-easy");
    const medium = localStorage.getItem("pb-sudoku-medium");
    const hard = localStorage.getItem("pb-sudoku-hard");

    setPersonalBests({
      easy: easy ? parseInt(easy) : null,
      medium: medium ? parseInt(medium) : null,
      hard: hard ? parseInt(hard) : null,
    });
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning || won) return;

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, won]);

  // Check for win
  useEffect(() => {
    if (won) return;

    // Check if all cells are filled
    let allFilled = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c].value === 0) {
          allFilled = false;
          break;
        }
      }
      if (!allFilled) break;
    }

    if (!allFilled) return;

    // Check if valid
    const errors = getErrors(board);
    if (errors.length === 0) {
      setWon(true);
      setIsRunning(false);

      // Update personal best
      const key = `pb-sudoku-${difficulty}`;
      const currentBest = localStorage.getItem(key);
      if (!currentBest || timer < parseInt(currentBest)) {
        localStorage.setItem(key, timer.toString());
        setPersonalBests((prev) => ({ ...prev, [difficulty]: timer }));
      }
    }
  }, [board, won, timer, difficulty]);

  const newGame = useCallback((diff?: Difficulty) => {
    const newDiff = diff || difficulty;
    setDifficulty(newDiff);
    setBoard(createPuzzle(newDiff));
    setSelectedCell(null);
    setNotesMode(false);
    setHistory([]);
    setTimer(0);
    setIsRunning(true);
    setWon(false);
  }, [difficulty]);

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].given) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || won) return;
    const [row, col] = selectedCell;
    if (board[row][col].given) return;

    const cell = board[row][col];
    const prevValue = cell.value;
    const prevNotes = new Set(cell.notes);

    if (notesMode) {
      // Toggle note
      const newNotes = new Set(cell.notes);
      if (newNotes.has(num)) {
        newNotes.delete(num);
      } else {
        newNotes.add(num);
      }

      const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      newBoard[row][col].notes = newNotes;
      setBoard(newBoard);

      setHistory([
        ...history,
        {
          row,
          col,
          prevValue,
          prevNotes,
          newValue: prevValue,
          newNotes,
        },
      ]);
    } else {
      // Set value
      const newValue = cell.value === num ? 0 : num;
      const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      newBoard[row][col].value = newValue;
      if (newValue !== 0) {
        newBoard[row][col].notes.clear();
      }
      setBoard(newBoard);

      setHistory([
        ...history,
        {
          row,
          col,
          prevValue,
          prevNotes,
          newValue,
          newNotes: newValue !== 0 ? new Set() : prevNotes,
        },
      ]);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedCell || won) return;

      const key = e.key;
      if (key >= "1" && key <= "9") {
        handleNumberInput(parseInt(key));
      } else if (key === "Backspace" || key === "Delete" || key === "0") {
        const [row, col] = selectedCell;
        if (board[row][col].given) return;

        const cell = board[row][col];
        if (cell.value !== 0) {
          const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
          newBoard[row][col].value = 0;
          setBoard(newBoard);

          setHistory([
            ...history,
            {
              row,
              col,
              prevValue: cell.value,
              prevNotes: new Set(cell.notes),
              newValue: 0,
              newNotes: new Set(cell.notes),
            },
          ]);
        }
      }
    },
    [selectedCell, board, history, won]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastMove = history[history.length - 1];
    const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
    newBoard[lastMove.row][lastMove.col].value = lastMove.prevValue;
    newBoard[lastMove.row][lastMove.col].notes = new Set(lastMove.prevNotes);
    setBoard(newBoard);
    setHistory(history.slice(0, -1));
  };

  const handleErase = () => {
    if (!selectedCell || won) return;
    const [row, col] = selectedCell;
    if (board[row][col].given) return;

    const cell = board[row][col];
    if (cell.value === 0 && cell.notes.size === 0) return;

    const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
    newBoard[row][col].value = 0;
    newBoard[row][col].notes.clear();
    setBoard(newBoard);

    setHistory([
      ...history,
      {
        row,
        col,
        prevValue: cell.value,
        prevNotes: new Set(cell.notes),
        newValue: 0,
        newNotes: new Set(),
      },
    ]);
  };

  const handleShare = async () => {
    const timeStr = formatTime(timer);
    const text = `I solved a ${difficulty} Sudoku in ${timeStr}! Can you beat my time? Play at playmini.fun/sudoku`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const errors = getErrors(board);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl">
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => newGame(diff)}
              className={`px-4 py-2 rounded font-medium capitalize transition ${
                difficulty === diff
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 sm:ml-auto">
          <div className="text-2xl font-mono font-bold text-white">{formatTime(timer)}</div>
        </div>
      </div>

      {/* Personal Best */}
      {personalBests[difficulty] !== null && !won && (
        <div className="text-slate-400 text-sm">
          Personal Best: {formatTime(personalBests[difficulty]!)}
        </div>
      )}

      {/* Win Message */}
      {won && (
        <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-2">Puzzle Solved!</div>
          <div className="text-slate-300 mb-3">
            Time: {formatTime(timer)}
            {personalBests[difficulty] === timer && (
              <span className="ml-2 text-yellow-400 font-bold">New Best!</span>
            )}
          </div>
          <button
            onClick={handleShare}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition"
          >
            Share Result
          </button>
        </div>
      )}

      {/* Sudoku Grid */}
      <div className="bg-slate-800 p-2 sm:p-4 rounded-lg">
        <div className="grid grid-cols-9 gap-0" style={{ width: "min(90vw, 450px)" }}>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isHighlighted =
                selectedCell &&
                (selectedCell[0] === r ||
                  selectedCell[1] === c ||
                  (Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
                    Math.floor(selectedCell[1] / 3) === Math.floor(c / 3)));
              const isSameNumber =
                selectedCell && cell.value !== 0 && cell.value === board[selectedCell[0]][selectedCell[1]].value;
              const hasError = errors.some((e) => e[0] === r && e[1] === c);

              const thickRight = c === 2 || c === 5;
              const thickBottom = r === 2 || r === 5;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    aspect-square flex items-center justify-center text-base sm:text-xl font-medium
                    border border-slate-700 relative transition
                    ${thickRight ? "border-r-2 border-r-slate-500" : ""}
                    ${thickBottom ? "border-b-2 border-b-slate-500" : ""}
                    ${isSelected ? "bg-blue-600 text-white" : ""}
                    ${isHighlighted && !isSelected ? "bg-slate-700" : ""}
                    ${!isHighlighted && !isSelected ? "bg-slate-900" : ""}
                    ${isSameNumber && !isSelected ? "bg-blue-900/50" : ""}
                    ${hasError ? "bg-red-900/50 text-red-400" : ""}
                    ${cell.given ? "text-slate-400 font-bold" : "text-white"}
                    ${!cell.given && !hasError ? "hover:bg-slate-700" : ""}
                  `}
                >
                  {cell.value !== 0 ? (
                    cell.value
                  ) : (
                    <div className="grid grid-cols-3 gap-0 w-full h-full text-[8px] sm:text-[10px] text-slate-500">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <div key={n} className="flex items-center justify-center">
                          {cell.notes.has(n) ? n : ""}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setNotesMode(!notesMode)}
            className={`px-4 py-2 rounded font-medium transition ${
              notesMode
                ? "bg-purple-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {notesMode ? "Notes: ON" : "Notes: OFF"}
          </button>
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-4 py-2 rounded font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Undo
          </button>
          <button
            onClick={handleErase}
            disabled={!selectedCell || won}
            className="px-4 py-2 rounded font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Erase
          </button>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={!selectedCell || won}
              className="aspect-square bg-slate-800 text-white text-xl font-bold rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleErase}
            disabled={!selectedCell || won}
            className="col-span-1 aspect-square bg-red-800 text-white text-xl font-bold rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ✕
          </button>
        </div>

        <button
          onClick={() => newGame()}
          className="w-full py-3 bg-green-700 hover:bg-green-600 text-white rounded font-medium transition"
        >
          New Game
        </button>
      </div>
    </div>
  );
}

function getErrors(board: Board): [number, number][] {
  const errors: [number, number][] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c].value;
      if (val === 0) continue;

      // Check row
      for (let c2 = 0; c2 < 9; c2++) {
        if (c2 !== c && board[r][c2].value === val) {
          errors.push([r, c]);
          break;
        }
      }

      // Check column
      for (let r2 = 0; r2 < 9; r2++) {
        if (r2 !== r && board[r2][c].value === val) {
          errors.push([r, c]);
          break;
        }
      }

      // Check box
      const boxRow = Math.floor(r / 3) * 3;
      const boxCol = Math.floor(c / 3) * 3;
      for (let r2 = boxRow; r2 < boxRow + 3; r2++) {
        for (let c2 = boxCol; c2 < boxCol + 3; c2++) {
          if ((r2 !== r || c2 !== c) && board[r2][c2].value === val) {
            errors.push([r, c]);
            break;
          }
        }
      }
    }
  }

  return errors;
}
