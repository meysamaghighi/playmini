"use client";

import { useState, useEffect, useCallback } from "react";

type Cell = {
  value: number; // 0 = empty, 1-9 = filled
  given: boolean; // true if part of initial puzzle
  notes: Set<number>; // for pencil marks
  solution: number; // the correct answer for this cell
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

type GameMode = "menu" | "campaign" | "endless" | "classic";

type PowerUpType = "reveal" | "check" | "eliminate";

type PowerUp = {
  type: PowerUpType;
  count: number;
};

type CampaignLevel = {
  level: number;
  name: string;
  clues: number;
  baseScore: number;
};

const CAMPAIGN_LEVELS: CampaignLevel[] = [
  { level: 1, name: "Baby Steps", clues: 45, baseScore: 100 },
  { level: 2, name: "Gentle Start", clues: 42, baseScore: 150 },
  { level: 3, name: "Easy Breezy", clues: 40, baseScore: 200 },
  { level: 4, name: "Getting Harder", clues: 36, baseScore: 250 },
  { level: 5, name: "Standard", clues: 32, baseScore: 300 },
  { level: 6, name: "Tricky", clues: 28, baseScore: 400 },
  { level: 7, name: "Advanced", clues: 25, baseScore: 500 },
  { level: 8, name: "Expert", clues: 22, baseScore: 600 },
  { level: 9, name: "Diabolical", clues: 20, baseScore: 750 },
  { level: 10, name: "Impossible", clues: 17, baseScore: 1000 },
];

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
function createPuzzle(clues: number): Board {
  const solved = generateSolvedBoard();
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
          solution: solved[r][c],
        }))
    );

  for (const [r, c] of removed) {
    board[r][c].value = 0;
    board[r][c].given = false;
  }

  return board;
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

export default function SudokuGame() {
  const [mode, setMode] = useState<GameMode>("menu");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [board, setBoard] = useState<Board>(() => createPuzzle(40));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState<Move[]>([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [lives, setLives] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: "reveal", count: 2 },
    { type: "check", count: 1 },
    { type: "eliminate", count: 2 },
  ]);
  const [usedPowerUps, setUsedPowerUps] = useState(0);
  const [showCheckHighlight, setShowCheckHighlight] = useState(false);
  const [score, setScore] = useState(0);
  const [endlessStreak, setEndlessStreak] = useState(0);

  // Campaign progress: {level: stars}
  const [campaignProgress, setCampaignProgress] = useState<Record<number, number>>({});
  const [endlessBest, setEndlessBest] = useState(0);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("pb-sudoku-campaign");
    if (saved) {
      setCampaignProgress(JSON.parse(saved));
    }
    const endlessSaved = localStorage.getItem("pb-sudoku-endless");
    if (endlessSaved) {
      setEndlessBest(parseInt(endlessSaved));
    }
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning || won || lives === 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, won, lives]);

  // Check for win
  useEffect(() => {
    if (won || lives === 0) return;

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

      // Calculate score
      if (mode === "campaign") {
        const level = CAMPAIGN_LEVELS[currentLevel - 1];
        let finalScore = level.baseScore;

        // Time bonus (max 300 points, lose 5 per 10 seconds)
        const timeBonus = Math.max(0, 300 - Math.floor(timer / 10) * 5);
        finalScore += timeBonus;

        // Accuracy bonus (50 per life remaining)
        finalScore += lives * 50;

        // No-powerup bonus
        if (usedPowerUps === 0) {
          finalScore += 200;
        }

        setScore(finalScore);

        // Calculate stars (1-3)
        let stars = 1;
        if (mistakes === 0 && usedPowerUps === 0) stars = 3;
        else if (mistakes <= 1 || lives === 3) stars = 2;

        // Update campaign progress
        const newProgress = { ...campaignProgress };
        if (!newProgress[currentLevel] || newProgress[currentLevel] < stars) {
          newProgress[currentLevel] = stars;
          setCampaignProgress(newProgress);
          localStorage.setItem("pb-sudoku-campaign", JSON.stringify(newProgress));
        }
      } else if (mode === "endless") {
        const newStreak = endlessStreak + 1;
        setEndlessStreak(newStreak);
        const puzzleScore = 100 + timer < 180 ? 50 : 0; // Bonus if under 3 min
        const newScore = score + puzzleScore;
        setScore(newScore);

        // Save best endless
        if (newScore > endlessBest) {
          setEndlessBest(newScore);
          localStorage.setItem("pb-sudoku-endless", newScore.toString());
        }
      }
    }
  }, [board, won, timer, mode, currentLevel, mistakes, usedPowerUps, lives, campaignProgress, endlessStreak, score, endlessBest]);

  const startCampaignLevel = (level: number) => {
    const levelData = CAMPAIGN_LEVELS[level - 1];
    setCurrentLevel(level);
    setBoard(createPuzzle(levelData.clues));
    setSelectedCell(null);
    setNotesMode(false);
    setHistory([]);
    setTimer(0);
    setIsRunning(true);
    setWon(false);
    setLives(3);
    setMistakes(0);
    setPowerUps([
      { type: "reveal", count: 2 },
      { type: "check", count: 1 },
      { type: "eliminate", count: 2 },
    ]);
    setUsedPowerUps(0);
    setScore(0);
    setMode("campaign");
  };

  const startEndless = () => {
    const randomClues = [45, 40, 36, 32, 28, 25, 22, 20][Math.floor(Math.random() * 8)];
    setBoard(createPuzzle(randomClues));
    setSelectedCell(null);
    setNotesMode(false);
    setHistory([]);
    setTimer(0);
    setIsRunning(true);
    setWon(false);
    setLives(3);
    setMistakes(0);
    setPowerUps([
      { type: "reveal", count: 2 },
      { type: "check", count: 1 },
      { type: "eliminate", count: 2 },
    ]);
    setUsedPowerUps(0);
    setScore(0);
    setEndlessStreak(0);
    setMode("endless");
  };

  const startClassic = (clues: number) => {
    setBoard(createPuzzle(clues));
    setSelectedCell(null);
    setNotesMode(false);
    setHistory([]);
    setTimer(0);
    setIsRunning(true);
    setWon(false);
    setLives(999); // No lives limit in classic
    setMistakes(0);
    setPowerUps([]);
    setUsedPowerUps(0);
    setMode("classic");
  };

  const nextEndlessPuzzle = () => {
    const randomClues = [45, 40, 36, 32, 28, 25, 22, 20][Math.floor(Math.random() * 8)];
    setBoard(createPuzzle(randomClues));
    setSelectedCell(null);
    setNotesMode(false);
    setHistory([]);
    setTimer(0);
    setIsRunning(true);
    setWon(false);
    // Lives persist in endless mode!
    setMistakes(0);
    setPowerUps([
      { type: "reveal", count: 2 },
      { type: "check", count: 1 },
      { type: "eliminate", count: 2 },
    ]);
  };

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].given || lives === 0) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || won || lives === 0) return;
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

        // Check if wrong (conflicts detected)
        const tempErrors = getErrors(newBoard);
        const isWrong = tempErrors.some((e) => e[0] === row && e[1] === col);

        if (isWrong) {
          // Mistake!
          setLives((l) => Math.max(0, l - 1));
          setMistakes((m) => m + 1);
        }
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
      if (!selectedCell || won || lives === 0) return;

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
    [selectedCell, board, history, won, lives]
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
    if (!selectedCell || won || lives === 0) return;
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

  const usePowerUp = (type: PowerUpType) => {
    const powerUp = powerUps.find((p) => p.type === type);
    if (!powerUp || powerUp.count === 0 || lives === 0) return;

    if (type === "reveal") {
      if (!selectedCell) return;
      const [row, col] = selectedCell;
      if (board[row][col].given || board[row][col].value !== 0) return;

      const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      newBoard[row][col].value = board[row][col].solution;
      newBoard[row][col].notes.clear();
      setBoard(newBoard);
    } else if (type === "check") {
      // Highlight all wrong numbers for 3 seconds
      setShowCheckHighlight(true);
      setTimeout(() => setShowCheckHighlight(false), 3000);
    } else if (type === "eliminate") {
      if (!selectedCell) return;
      const [row, col] = selectedCell;
      if (board[row][col].given || board[row][col].value !== 0) return;

      const solution = board[row][col].solution;
      const wrongCandidates: number[] = [];

      // Get wrong candidates from notes
      board[row][col].notes.forEach((n) => {
        if (n !== solution) wrongCandidates.push(n);
      });

      if (wrongCandidates.length === 0) return;

      // Remove up to 2 wrong candidates
      const toRemove = wrongCandidates.slice(0, 2);
      const newBoard = board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      toRemove.forEach((n) => newBoard[row][col].notes.delete(n));
      setBoard(newBoard);
    }

    // Decrement power-up count
    setPowerUps((prev) =>
      prev.map((p) => (p.type === type ? { ...p, count: p.count - 1 } : p))
    );
    setUsedPowerUps((u) => u + 1);
  };

  const handleShare = async () => {
    const timeStr = formatTime(timer);
    let text = "";

    if (mode === "campaign") {
      const level = CAMPAIGN_LEVELS[currentLevel - 1];
      text = `I beat Sudoku level ${currentLevel} (${level.name}) in ${timeStr} with ${lives} lives left! Score: ${score}. Play at playmini.fun/sudoku`;
    } else if (mode === "endless") {
      text = `I scored ${score} in Sudoku Endless Mode! Streak: ${endlessStreak}. Play at playmini.fun/sudoku`;
    } else {
      text = `I solved a Sudoku in ${timeStr}! Play at playmini.fun/sudoku`;
    }

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

  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      hearts.push(
        <span key={i} className={`text-2xl ${i < lives ? "text-red-500" : "text-slate-700"}`}>
          {i < lives ? "❤" : "♡"}
        </span>
      );
    }
    return hearts;
  };

  const getStars = (level: number) => {
    return campaignProgress[level] || 0;
  };

  const renderStars = (level: number) => {
    const stars = getStars(level);
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map((s) => (
          <span key={s} className={`text-sm ${s <= stars ? "text-yellow-400" : "text-slate-700"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const errors = getErrors(board);
  const wrongCells = showCheckHighlight
    ? board
        .map((row, r) =>
          row.map((cell, c) => {
            if (cell.value === 0 || cell.given) return null;
            if (cell.value !== cell.solution) return [r, c];
            return null;
          })
        )
        .flat()
        .filter((x) => x !== null) as [number, number][]
    : [];

  // MENU SCREEN
  if (mode === "menu") {
    return (
      <div className="flex flex-col items-center gap-6 p-4 min-h-screen bg-slate-900">
        <h1 className="text-4xl font-bold text-white mt-8">Sudoku</h1>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={() => setMode("campaign")}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded transition"
          >
            Campaign Mode
          </button>
          <button
            onClick={startEndless}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded transition"
          >
            Endless Mode
            {endlessBest > 0 && (
              <div className="text-sm font-normal mt-1">Best: {endlessBest}</div>
            )}
          </button>
          <button
            onClick={() => setMode("classic")}
            className="w-full py-4 bg-green-700 hover:bg-green-600 text-white text-xl font-bold rounded transition"
          >
            Classic Mode
          </button>
        </div>

        <div className="text-slate-400 text-sm max-w-md text-center mt-4">
          <p className="font-bold mb-2">Campaign: 10 levels, 3 lives, power-ups</p>
          <p className="font-bold mb-2">Endless: Survive as long as you can!</p>
          <p className="font-bold">Classic: Traditional Sudoku, no lives</p>
        </div>
      </div>
    );
  }

  // CAMPAIGN LEVEL SELECT
  if (mode === "campaign" && !isRunning) {
    return (
      <div className="flex flex-col items-center gap-6 p-4 min-h-screen bg-slate-900">
        <button
          onClick={() => setMode("menu")}
          className="self-start px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white">Campaign Levels</h1>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {CAMPAIGN_LEVELS.map((level) => {
            const isLocked = level.level > 1 && getStars(level.level - 1) === 0;
            return (
              <button
                key={level.level}
                onClick={() => !isLocked && startCampaignLevel(level.level)}
                disabled={isLocked}
                className={`p-4 rounded-lg border-2 transition ${
                  isLocked
                    ? "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
                    : "bg-slate-800 border-blue-600 text-white hover:bg-slate-700"
                }`}
              >
                <div className="text-xl font-bold mb-1">Level {level.level}</div>
                <div className="text-sm mb-2">{level.name}</div>
                {isLocked ? (
                  <div className="text-2xl">🔒</div>
                ) : (
                  renderStars(level.level)
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // CLASSIC DIFFICULTY SELECT
  if (mode === "classic" && !isRunning) {
    return (
      <div className="flex flex-col items-center gap-6 p-4 min-h-screen bg-slate-900">
        <button
          onClick={() => setMode("menu")}
          className="self-start px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-4">Classic Mode</h1>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={() => startClassic(40)}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded transition"
          >
            Easy (40 clues)
          </button>
          <button
            onClick={() => startClassic(30)}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white text-xl font-bold rounded transition"
          >
            Medium (30 clues)
          </button>
          <button
            onClick={() => startClassic(22)}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded transition"
          >
            Hard (22 clues)
          </button>
        </div>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <button
          onClick={() => {
            setMode("menu");
            setIsRunning(false);
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm"
        >
          ← Menu
        </button>

        {mode !== "classic" && <div className="flex gap-2">{renderHearts()}</div>}

        <div className="text-xl font-mono font-bold text-white">{formatTime(timer)}</div>
      </div>

      {/* Level/Score Info */}
      <div className="text-center">
        {mode === "campaign" && (
          <div className="text-white font-bold">
            Level {currentLevel}: {CAMPAIGN_LEVELS[currentLevel - 1].name}
          </div>
        )}
        {mode === "endless" && (
          <div className="text-white font-bold">
            Score: {score} | Streak: {endlessStreak}
          </div>
        )}
        {mode === "classic" && <div className="text-slate-400">Classic Mode</div>}
      </div>

      {/* Game Over */}
      {lives === 0 && !won && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center w-full max-w-md">
          <div className="text-2xl font-bold text-red-400 mb-2">Game Over!</div>
          <div className="text-slate-300 mb-3">3 mistakes - try again!</div>
          <button
            onClick={() => {
              if (mode === "campaign") {
                startCampaignLevel(currentLevel);
              } else if (mode === "endless") {
                setMode("menu");
              } else {
                setMode("menu");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition"
          >
            {mode === "campaign" ? "Retry Level" : "Back to Menu"}
          </button>
        </div>
      )}

      {/* Win Message */}
      {won && (
        <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 text-center w-full max-w-md">
          <div className="text-2xl font-bold text-green-400 mb-2">Puzzle Solved!</div>
          {mode === "campaign" && (
            <div className="text-slate-300 mb-2">
              Score: {score}
              <div className="flex justify-center gap-1 mt-1">
                {renderStars(currentLevel)}
              </div>
            </div>
          )}
          {mode === "endless" && (
            <div className="text-slate-300 mb-2">
              Total Score: {score} | Streak: {endlessStreak}
            </div>
          )}
          <div className="text-slate-400 text-sm mb-3">Time: {formatTime(timer)}</div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
            >
              Share
            </button>
            {mode === "campaign" && currentLevel < 10 && (
              <button
                onClick={() => startCampaignLevel(currentLevel + 1)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition"
              >
                Next Level
              </button>
            )}
            {mode === "endless" && (
              <button
                onClick={nextEndlessPuzzle}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition"
              >
                Next Puzzle
              </button>
            )}
            <button
              onClick={() => {
                setMode("menu");
                setIsRunning(false);
              }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-medium transition"
            >
              Menu
            </button>
          </div>
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
              const isWrongHighlighted = wrongCells.some((e) => e[0] === r && e[1] === c);

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
                    ${hasError || isWrongHighlighted ? "bg-red-900/50 text-red-400" : ""}
                    ${cell.given ? "text-slate-400 font-bold" : "text-white"}
                    ${!cell.given && !hasError && lives > 0 ? "hover:bg-slate-700" : ""}
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

      {/* Power-Ups (Campaign & Endless only) */}
      {mode !== "classic" && lives > 0 && (
        <div className="flex gap-2 justify-center flex-wrap w-full max-w-md">
          <button
            onClick={() => usePowerUp("reveal")}
            disabled={powerUps.find((p) => p.type === "reveal")!.count === 0 || !selectedCell}
            className="px-3 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            Reveal Cell ({powerUps.find((p) => p.type === "reveal")!.count})
          </button>
          <button
            onClick={() => usePowerUp("check")}
            disabled={powerUps.find((p) => p.type === "check")!.count === 0}
            className="px-3 py-2 bg-orange-700 hover:bg-orange-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            Check Board ({powerUps.find((p) => p.type === "check")!.count})
          </button>
          <button
            onClick={() => usePowerUp("eliminate")}
            disabled={powerUps.find((p) => p.type === "eliminate")!.count === 0 || !selectedCell}
            className="px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            Eliminate ({powerUps.find((p) => p.type === "eliminate")!.count})
          </button>
        </div>
      )}

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
            disabled={!selectedCell || won || lives === 0}
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
              disabled={!selectedCell || won || lives === 0}
              className="aspect-square bg-slate-800 text-white text-xl font-bold rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleErase}
            disabled={!selectedCell || won || lives === 0}
            className="col-span-1 aspect-square bg-red-800 text-white text-xl font-bold rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
