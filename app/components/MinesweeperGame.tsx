"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Difficulty = "easy" | "medium" | "hard";
type GameMode = "menu" | "classic" | "campaign" | "levelSelect";
type PowerUpType = "reveal" | "shield" | "scanner";

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

interface LevelConfig extends GameConfig {
  name: string;
  fog?: boolean;
  fogCount?: number;
  shiftingMines?: boolean;
  shiftInterval?: number;
  hiddenNumbers?: boolean;
}

const LEVELS: LevelConfig[] = [
  { name: "First Steps", rows: 8, cols: 8, mines: 8 },
  { name: "Getting Careful", rows: 9, cols: 9, mines: 12 },
  { name: "Thinking Ahead", rows: 10, cols: 10, mines: 15, fog: true, fogCount: 15 },
  { name: "Fog of War", rows: 10, cols: 10, mines: 18, fog: true, fogCount: 25 },
  { name: "Shifting Danger", rows: 12, cols: 12, mines: 25, shiftingMines: true, shiftInterval: 10 },
  { name: "Dark Zones", rows: 12, cols: 12, mines: 30, fog: true, fogCount: 20, hiddenNumbers: true },
  { name: "Minefield", rows: 14, cols: 14, mines: 40, shiftingMines: true, shiftInterval: 10, fog: true, fogCount: 25 },
  { name: "Expert Territory", rows: 14, cols: 14, mines: 50, fog: true, fogCount: 30, shiftingMines: true, shiftInterval: 10, hiddenNumbers: true },
  { name: "Danger Zone", rows: 16, cols: 16, mines: 60, shiftingMines: true, shiftInterval: 8, fog: true, fogCount: 35 },
  { name: "Ultimate Sweep", rows: 16, cols: 16, mines: 70, fog: true, fogCount: 40, shiftingMines: true, shiftInterval: 8, hiddenNumbers: true },
];

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  isClickedMine?: boolean;
  isFoggy?: boolean;
  hasHiddenNumber?: boolean;
}

interface PowerUp {
  type: PowerUpType;
  count: number;
}

export default function MinesweeperGame() {
  // Mode and level state
  const [gameMode, setGameMode] = useState<GameMode>("menu");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [isEndless, setIsEndless] = useState(false);

  // Classic mode state
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  // Game state
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [timer, setTimer] = useState(0);
  const [minesLeft, setMinesLeft] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  // Campaign features
  const [lives, setLives] = useState(3);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: "reveal", count: 0 },
    { type: "shield", count: 0 },
    { type: "scanner", count: 0 },
  ]);
  const [shieldActive, setShieldActive] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [revealsCount, setRevealsCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [mineShiftPulse, setMineShiftPulse] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);

  const config = gameMode === "classic" ? DIFFICULTIES[difficulty] :
                 isEndless ? { rows: 16, cols: 16, mines: 55 + Math.floor(Math.random() * 21) } :
                 LEVELS[currentLevel];

  // Load saved progress
  useEffect(() => {
    if (gameMode === "classic") {
      const key = `pb-mines-${difficulty}`;
      const stored = localStorage.getItem(key);
      setPersonalBest(stored ? parseInt(stored) : null);
    } else if (gameMode === "campaign" || gameMode === "levelSelect") {
      const stored = localStorage.getItem("pb-mines-campaign");
      const completed = stored ? parseInt(stored) : 0;
      setLevelsCompleted(completed);

      // Load power-ups
      const powerUpData = localStorage.getItem("mines-powerups");
      if (powerUpData) {
        setPowerUps(JSON.parse(powerUpData));
      }
    }
  }, [difficulty, gameMode]);

  // Initialize board
  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = [];
    const levelConfig = isEndless ?
      { ...config, fog: true, fogCount: 30, shiftingMines: true, shiftInterval: 10, hiddenNumbers: true } :
      LEVELS[currentLevel];

    for (let row = 0; row < config.rows; row++) {
      const boardRow: Cell[] = [];
      for (let col = 0; col < config.cols; col++) {
        boardRow.push({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
          isFoggy: false,
          hasHiddenNumber: false,
        });
      }
      newBoard.push(boardRow);
    }

    // Add fog if level has it
    if (gameMode === "campaign" && (levelConfig.fog || isEndless)) {
      const fogCount = (levelConfig as any).fogCount || 0;
      let fogsPlaced = 0;
      while (fogsPlaced < fogCount) {
        const row = Math.floor(Math.random() * config.rows);
        const col = Math.floor(Math.random() * config.cols);
        if (!newBoard[row][col].isFoggy) {
          newBoard[row][col].isFoggy = true;
          fogsPlaced++;
        }
      }
    }

    setBoard(newBoard);
    setGameState("playing");
    setTimer(0);
    setMinesLeft(config.mines);
    setFirstClick(true);
    setRevealsCount(0);
    setShieldActive(false);
    setScannerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [config.rows, config.cols, config.mines, currentLevel, gameMode, isEndless]);

  useEffect(() => {
    if (gameMode === "classic" || gameMode === "campaign") {
      initializeBoard();
    }
  }, [initializeBoard, gameMode]);

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

    // Mark cells with hidden numbers
    if (gameMode === "campaign" && !isEndless) {
      const levelConfig = LEVELS[currentLevel];
      if (levelConfig.hiddenNumbers) {
        for (let row = 0; row < config.rows; row++) {
          for (let col = 0; col < config.cols; col++) {
            if (!newBoard[row][col].isMine && newBoard[row][col].adjacentMines > 0) {
              if (Math.random() < 0.3) {
                newBoard[row][col].hasHiddenNumber = true;
              }
            }
          }
        }
      }
    } else if (isEndless) {
      // Endless mode has hidden numbers
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          if (!newBoard[row][col].isMine && newBoard[row][col].adjacentMines > 0) {
            if (Math.random() < 0.3) {
              newBoard[row][col].hasHiddenNumber = true;
            }
          }
        }
      }
    }

    setBoard(newBoard);
    return newBoard;
  }, [board, config.mines, config.rows, config.cols, currentLevel, gameMode, isEndless]);

  // Shift mines (for levels with shifting mechanic)
  const shiftMines = useCallback(() => {
    const levelConfig = isEndless ? { shiftingMines: true } : LEVELS[currentLevel];
    if (gameMode !== "campaign" || !levelConfig.shiftingMines) return;

    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => row.map((cell) => ({ ...cell })));

      // Find a random mine to move
      const mines: [number, number][] = [];
      const empties: [number, number][] = [];

      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          if (newBoard[row][col].isMine && !newBoard[row][col].isRevealed && !newBoard[row][col].isFlagged) {
            mines.push([row, col]);
          } else if (!newBoard[row][col].isMine && !newBoard[row][col].isRevealed) {
            empties.push([row, col]);
          }
        }
      }

      if (mines.length > 0 && empties.length > 0) {
        const [mineRow, mineCol] = mines[Math.floor(Math.random() * mines.length)];
        const [emptyRow, emptyCol] = empties[Math.floor(Math.random() * empties.length)];

        // Move mine
        newBoard[mineRow][mineCol].isMine = false;
        newBoard[emptyRow][emptyCol].isMine = true;

        // Recalculate adjacent mines for affected cells
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const checkCells = [
              [mineRow + dr, mineCol + dc],
              [emptyRow + dr, emptyCol + dc],
            ];

            for (const [r, c] of checkCells) {
              if (r >= 0 && r < config.rows && c >= 0 && c < config.cols && !newBoard[r][c].isMine) {
                let count = 0;
                for (let dr2 = -1; dr2 <= 1; dr2++) {
                  for (let dc2 = -1; dc2 <= 1; dc2++) {
                    const nr = r + dr2;
                    const nc = c + dc2;
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
                newBoard[r][c].adjacentMines = count;
              }
            }
          }
        }

        // Show pulse animation
        setMineShiftPulse(true);
        setTimeout(() => setMineShiftPulse(false), 1000);
      }

      return newBoard;
    });
  }, [config.rows, config.cols, currentLevel, gameMode, isEndless]);

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

    // Clear fog from adjacent cells
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
          board[nr][nc].isFoggy = false;
        }
      }
    }

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

  // Handle level complete
  const handleLevelComplete = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("won");

    if (gameMode === "campaign" && !isEndless) {
      // Award power-up
      const newPowerUps = [...powerUps];
      const randomType = ["reveal", "shield", "scanner"][Math.floor(Math.random() * 3)] as PowerUpType;
      const powerUpIndex = newPowerUps.findIndex(p => p.type === randomType);
      if (newPowerUps[powerUpIndex].count < 3) {
        newPowerUps[powerUpIndex].count++;
        setPowerUps(newPowerUps);
        localStorage.setItem("mines-powerups", JSON.stringify(newPowerUps));
      }

      // Update completed levels
      if (currentLevel >= levelsCompleted) {
        const newCompleted = currentLevel + 1;
        setLevelsCompleted(newCompleted);
        localStorage.setItem("pb-mines-campaign", newCompleted.toString());
      }

      // Show level up animation
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 1500);
    } else if (gameMode === "classic") {
      // Save personal best for classic mode
      const key = `pb-mines-${difficulty}`;
      const currentBest = localStorage.getItem(key);
      if (!currentBest || timer < parseInt(currentBest)) {
        localStorage.setItem(key, timer.toString());
        setPersonalBest(timer);
      }
    }
  }, [gameMode, currentLevel, levelsCompleted, powerUps, difficulty, timer, isEndless]);

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
      // Handle mine click
      if (gameMode === "campaign") {
        if (shieldActive) {
          // Shield protects from this mine
          setShieldActive(false);
          return;
        } else if (lives > 1) {
          // Lose a life
          setLives(lives - 1);
          newBoard[row][col].isRevealed = true;
          newBoard[row][col].isFlagged = true;
          setBoard(newBoard);
          return;
        } else {
          // Game over
          newBoard[row][col].isClickedMine = true;
          for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
              if (newBoard[r][c].isMine) {
                newBoard[r][c].isRevealed = true;
              }
            }
          }
          setBoard(newBoard);
          setGameState("lost");
          setLives(0);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      } else {
        // Classic mode - instant game over
        newBoard[row][col].isClickedMine = true;
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
      }
    } else {
      // Reveal cell and flood fill if empty
      floodFill(newBoard, row, col);
      setBoard(newBoard);

      // Increment reveals and check for mine shift
      const newReveals = revealsCount + 1;
      setRevealsCount(newReveals);

      if (gameMode === "campaign") {
        const levelConfig = isEndless ? { shiftInterval: 10 } : LEVELS[currentLevel];
        if (levelConfig.shiftInterval && newReveals % levelConfig.shiftInterval === 0) {
          setTimeout(() => shiftMines(), 300);
        }
      }

      // Check for win
      if (checkWin(newBoard)) {
        handleLevelComplete();
      }
    }
  }, [board, gameState, firstClick, generateMines, startTimer, floodFill, checkWin, config.rows, config.cols, difficulty, timer, gameMode, lives, shieldActive, revealsCount, currentLevel, handleLevelComplete, shiftMines, isEndless]);

  // Handle right click (flag)
  const handleCellRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameState !== "playing" || board[row][col].isRevealed || firstClick) return;

    const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setMinesLeft((prev) => prev + (newBoard[row][col].isFlagged ? -1 : 1));

    // If hidden numbers are active, check if flagging reveals adjacent numbers
    if (gameMode === "campaign") {
      const levelConfig = isEndless ? { hiddenNumbers: true } : LEVELS[currentLevel];
      if (levelConfig.hiddenNumbers || isEndless) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
              // Check if this cell has all adjacent mines flagged
              let adjacentFlags = 0;
              for (let dr2 = -1; dr2 <= 1; dr2++) {
                for (let dc2 = -1; dc2 <= 1; dc2++) {
                  const nr2 = nr + dr2;
                  const nc2 = nc + dc2;
                  if (nr2 >= 0 && nr2 < config.rows && nc2 >= 0 && nc2 < config.cols) {
                    if (newBoard[nr2][nc2].isFlagged && newBoard[nr2][nc2].isMine) {
                      adjacentFlags++;
                    }
                  }
                }
              }
              if (adjacentFlags > 0) {
                newBoard[nr][nc].hasHiddenNumber = false;
              }
            }
          }
        }
        setBoard(newBoard);
      }
    }
  }, [board, gameState, firstClick, gameMode, currentLevel, config.rows, config.cols, isEndless]);

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

  // Power-up handlers
  const usePowerUp = useCallback((type: PowerUpType) => {
    const powerUpIndex = powerUps.findIndex(p => p.type === type);
    if (powerUps[powerUpIndex].count === 0 || gameState !== "playing" || firstClick) return;

    const newPowerUps = [...powerUps];
    newPowerUps[powerUpIndex].count--;
    setPowerUps(newPowerUps);
    localStorage.setItem("mines-powerups", JSON.stringify(newPowerUps));

    if (type === "reveal") {
      // Reveal a random safe cell
      const unrevealed: [number, number][] = [];
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          if (!board[row][col].isRevealed && !board[row][col].isMine && !board[row][col].isFlagged) {
            unrevealed.push([row, col]);
          }
        }
      }

      if (unrevealed.length > 0) {
        const [row, col] = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
        floodFill(newBoard, row, col);
        setBoard(newBoard);

        if (checkWin(newBoard)) {
          handleLevelComplete();
        }
      }
    } else if (type === "shield") {
      setShieldActive(true);
    } else if (type === "scanner") {
      setScannerActive(true);
      setTimeout(() => setScannerActive(false), 3000);
    }
  }, [powerUps, gameState, firstClick, board, config.rows, config.cols, floodFill, checkWin, handleLevelComplete]);

  // Share score
  const handleShare = useCallback(async () => {
    let text = "";
    if (gameMode === "campaign") {
      if (isEndless) {
        text = `I survived Endless Minesweeper for ${timer} seconds! Can you beat my time? Play at playmini.fun/minesweeper`;
      } else {
        text = `I completed Minesweeper Level ${currentLevel + 1}: ${LEVELS[currentLevel].name}! Play at playmini.fun/minesweeper`;
      }
    } else {
      text = `I solved ${difficulty} Minesweeper in ${timer} seconds! Can you beat my time? Play at playmini.fun/minesweeper`;
    }

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
  }, [difficulty, timer, gameMode, currentLevel, isEndless]);

  // Get cell content
  const getCellContent = (cell: Cell, row: number, col: number) => {
    if (cell.isFlagged && !cell.isRevealed) return "🚩";
    if (!cell.isRevealed) return "";
    if (cell.isMine) return "💣";
    if (cell.adjacentMines === 0) return "";
    if (cell.hasHiddenNumber && !cell.isRevealed) return "?";
    if (cell.hasHiddenNumber && cell.isRevealed) return "?";
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

  // Check if cell should glow (scanner active and adjacent to mine)
  const shouldCellGlow = useCallback((row: number, col: number) => {
    if (!scannerActive) return false;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
          if (board[nr][nc].isMine) {
            return true;
          }
        }
      }
    }
    return false;
  }, [scannerActive, board, config.rows, config.cols]);

  const getFaceEmoji = () => {
    if (gameState === "won") return "😎";
    if (gameState === "lost") return "😵";
    return "😊";
  };

  // Start a level
  const startLevel = (level: number, endless = false) => {
    setCurrentLevel(level);
    setIsEndless(endless);
    setGameMode("campaign");
    setLives(3);
    setShieldActive(false);
    setScannerActive(false);
    setRevealsCount(0);
  };

  // Reset campaign progress
  const resetCampaign = () => {
    if (confirm("Reset all campaign progress? This will delete your level progress and power-ups.")) {
      localStorage.removeItem("pb-mines-campaign");
      localStorage.removeItem("mines-powerups");
      setLevelsCompleted(0);
      setPowerUps([
        { type: "reveal", count: 0 },
        { type: "shield", count: 0 },
        { type: "scanner", count: 0 },
      ]);
      setGameMode("menu");
    }
  };

  // Get power-up description
  const getPowerUpDescription = (type: PowerUpType) => {
    switch (type) {
      case "reveal":
        return "Reveals a random safe cell";
      case "shield":
        return "Next mine click won't hurt you";
      case "scanner":
        return "Highlights mine-adjacent cells for 3s";
    }
  };

  // Get power-up emoji
  const getPowerUpEmoji = (type: PowerUpType) => {
    switch (type) {
      case "reveal":
        return "🔍";
      case "shield":
        return "🛡️";
      case "scanner":
        return "📡";
    }
  };

  // MENU SCREEN
  if (gameMode === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Minesweeper
            </h1>
            <p className="text-slate-300 text-xl">
              Choose your game mode
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setGameMode("levelSelect")}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold text-2xl py-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Campaign Mode
              <div className="text-sm mt-2 opacity-90">
                10 Levels + Endless • Power-ups • Lives System
              </div>
            </button>

            <button
              onClick={() => setGameMode("classic")}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-2xl py-8 rounded-xl transition-all shadow-lg"
            >
              Classic Mode
              <div className="text-sm mt-2 opacity-80">
                Traditional Minesweeper • Easy / Medium / Hard
              </div>
            </button>
          </div>

          <div className="mt-12 bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">How to Play:</h3>
            <ul className="text-slate-300 space-y-2">
              <li>• <strong>Left Click / Tap:</strong> Reveal a cell</li>
              <li>• <strong>Right Click / Long Press:</strong> Place or remove a flag</li>
              <li>• Numbers show how many mines are adjacent to that cell</li>
              <li>• In Campaign: earn power-ups, use lives wisely!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // LEVEL SELECT SCREEN
  if (gameMode === "levelSelect") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Campaign Levels
            </h1>
            <p className="text-slate-300 text-lg">
              Complete levels to unlock more and earn power-ups!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {LEVELS.map((level, index) => {
              const isLocked = index > levelsCompleted;
              const isCompleted = index < levelsCompleted;

              return (
                <button
                  key={index}
                  onClick={() => !isLocked && startLevel(index)}
                  disabled={isLocked}
                  className={`p-6 rounded-lg text-left transition-all ${
                    isLocked
                      ? "bg-slate-800 opacity-50 cursor-not-allowed"
                      : isCompleted
                      ? "bg-green-900/30 border border-green-500 hover:bg-green-900/50"
                      : "bg-yellow-900/30 border border-yellow-500 hover:bg-yellow-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">Level {index + 1}</span>
                    {isLocked && <span className="text-2xl">🔒</span>}
                    {isCompleted && <span className="text-2xl">✅</span>}
                    {!isLocked && !isCompleted && <span className="text-2xl">⭐</span>}
                  </div>
                  <div className="text-lg font-semibold text-yellow-400 mb-2">
                    {level.name}
                  </div>
                  <div className="text-sm text-slate-300 space-y-1">
                    <div>{level.rows}×{level.cols}, {level.mines} mines</div>
                    {level.fog && <div className="text-purple-400">• Fog zones</div>}
                    {level.shiftingMines && <div className="text-red-400">• Shifting mines</div>}
                    {level.hiddenNumbers && <div className="text-blue-400">• Hidden numbers</div>}
                  </div>
                </button>
              );
            })}

            {/* Endless Mode */}
            <button
              onClick={() => startLevel(0, true)}
              disabled={levelsCompleted < 10}
              className={`p-6 rounded-lg text-left transition-all ${
                levelsCompleted < 10
                  ? "bg-slate-800 opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500 hover:opacity-80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">Endless</span>
                {levelsCompleted < 10 && <span className="text-2xl">🔒</span>}
                {levelsCompleted >= 10 && <span className="text-2xl">∞</span>}
              </div>
              <div className="text-lg font-semibold text-purple-400 mb-2">
                Ultimate Challenge
              </div>
              <div className="text-sm text-slate-300 space-y-1">
                <div>16×16, random mines</div>
                <div className="text-purple-400">• All mechanics active</div>
                <div className="text-yellow-400">• Unlock by beating Level 10</div>
              </div>
            </button>
          </div>

          {/* Power-ups Display */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Your Power-ups:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {powerUps.map((powerUp) => (
                <div key={powerUp.type} className="bg-slate-700 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">{getPowerUpEmoji(powerUp.type)}</div>
                  <div className="font-semibold capitalize mb-1">{powerUp.type}</div>
                  <div className="text-sm text-slate-300 mb-2">{getPowerUpDescription(powerUp.type)}</div>
                  <div className="text-xl font-bold text-yellow-400">×{powerUp.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setGameMode("menu")}
              className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Menu
            </button>
            <button
              onClick={resetCampaign}
              className="bg-red-900/50 hover:bg-red-900/70 border border-red-500 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Reset Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CLASSIC MODE
  if (gameMode === "classic") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Minesweeper - Classic
            </h1>
            <button
              onClick={() => setGameMode("menu")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              ← Back to Menu
            </button>
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
                        min-w-[24px] min-h-[24px] sm:min-w-[28px] sm:min-h-[28px] md:min-w-[32px] md:min-h-[32px]
                        flex items-center justify-center font-bold text-xs sm:text-sm md:text-base
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
                      {getCellContent(cell, rowIndex, colIndex)}
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

  // CAMPAIGN MODE GAMEPLAY
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Level Up Animation */}
        {showLevelUp && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-4xl font-bold px-12 py-8 rounded-2xl shadow-2xl animate-pulse">
              LEVEL COMPLETE!
            </div>
          </div>
        )}

        {/* Mine Shift Pulse */}
        {mineShiftPulse && (
          <div className="fixed inset-0 bg-yellow-500/10 pointer-events-none animate-pulse z-40" />
        )}

        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {isEndless ? "Endless Mode" : `Level ${currentLevel + 1}: ${LEVELS[currentLevel].name}`}
          </h1>
          <button
            onClick={() => setGameMode("levelSelect")}
            className="text-slate-300 hover:text-white transition-colors text-sm"
          >
            ← Back to Level Select
          </button>
        </div>

        {/* Level Info */}
        {!isEndless && (
          <div className="flex flex-wrap justify-center gap-2 mb-4 text-sm">
            {LEVELS[currentLevel].fog && (
              <span className="bg-purple-900/50 border border-purple-500 px-3 py-1 rounded">
                Fog Zones Active
              </span>
            )}
            {LEVELS[currentLevel].shiftingMines && (
              <span className="bg-red-900/50 border border-red-500 px-3 py-1 rounded">
                Mines Shift Every {LEVELS[currentLevel].shiftInterval} Reveals
              </span>
            )}
            {LEVELS[currentLevel].hiddenNumbers && (
              <span className="bg-blue-900/50 border border-blue-500 px-3 py-1 rounded">
                Some Numbers Hidden
              </span>
            )}
          </div>
        )}

        {/* Game Status Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {/* Lives */}
          <div className="bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="font-semibold">Lives:</span>
            <span className="text-xl">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i}>{i < lives ? "❤️" : "🖤"}</span>
              ))}
            </span>
          </div>

          {/* Mines Left */}
          <div className="bg-slate-800 px-4 py-2 rounded-lg font-bold">
            💣 {minesLeft}
          </div>

          {/* Reset Button */}
          <button
            onClick={initializeBoard}
            className="text-3xl hover:scale-110 transition-transform bg-slate-800 px-4 py-2 rounded-lg"
          >
            {getFaceEmoji()}
          </button>

          {/* Timer */}
          <div className="bg-slate-800 px-4 py-2 rounded-lg font-bold">
            ⏱️ {timer}s
          </div>

          {/* Shield Active */}
          {shieldActive && (
            <div className="bg-blue-900/50 border border-blue-500 px-4 py-2 rounded-lg font-bold animate-pulse">
              🛡️ Shield Active
            </div>
          )}
        </div>

        {/* Power-ups */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {powerUps.map((powerUp) => (
            <button
              key={powerUp.type}
              onClick={() => usePowerUp(powerUp.type)}
              disabled={powerUp.count === 0 || gameState !== "playing" || firstClick}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                powerUp.count > 0 && gameState === "playing" && !firstClick
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cursor-pointer"
                  : "bg-slate-700 opacity-50 cursor-not-allowed"
              }`}
              title={getPowerUpDescription(powerUp.type)}
            >
              <div className="text-2xl mb-1">{getPowerUpEmoji(powerUp.type)}</div>
              <div className="text-xs capitalize">{powerUp.type}</div>
              <div className="text-xs">×{powerUp.count}</div>
            </button>
          ))}
        </div>

        {/* Win Message */}
        {gameState === "won" && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              🎉 {isEndless ? "Amazing Run!" : "Level Complete!"}
            </h2>
            <p className="text-slate-300 mb-4">
              {isEndless
                ? `You survived for ${timer} seconds!`
                : `Completed in ${timer} seconds`}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleShare}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Share Score
              </button>
              {!isEndless && currentLevel < LEVELS.length - 1 && (
                <button
                  onClick={() => startLevel(currentLevel + 1)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Next Level →
                </button>
              )}
              {!isEndless && currentLevel === LEVELS.length - 1 && (
                <button
                  onClick={() => startLevel(0, true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Try Endless Mode
                </button>
              )}
              <button
                onClick={() => setGameMode("levelSelect")}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Level Select
              </button>
            </div>
          </div>
        )}

        {/* Game Over Message */}
        {gameState === "lost" && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">💥 Game Over!</h2>
            <p className="text-slate-300 mb-4">Out of lives! Try again?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={initializeBoard}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Retry Level
              </button>
              <button
                onClick={() => setGameMode("levelSelect")}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Level Select
              </button>
            </div>
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
                row.map((cell, colIndex) => {
                  const isGlowing = shouldCellGlow(rowIndex, colIndex);
                  const isFoggy = cell.isFoggy && !cell.isRevealed;

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                      onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
                      onTouchEnd={handleTouchEnd}
                      className={`
                        min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px] md:min-w-[28px] md:min-h-[28px]
                        flex items-center justify-center font-bold text-xs sm:text-sm
                        transition-all select-none relative
                        ${
                          cell.isRevealed
                            ? cell.isClickedMine
                              ? "bg-red-600"
                              : "bg-slate-700"
                            : isFoggy
                            ? "bg-slate-900 backdrop-blur-sm"
                            : "bg-slate-800 hover:bg-slate-700 active:bg-slate-600"
                        }
                        ${isGlowing ? "ring-2 ring-yellow-400 bg-yellow-900/50" : ""}
                        ${cell.adjacentMines > 0 && cell.isRevealed && !cell.hasHiddenNumber ? getCellColor(cell.adjacentMines) : ""}
                        ${cell.hasHiddenNumber && cell.isRevealed ? "border border-dashed border-slate-500" : ""}
                      `}
                      disabled={gameState !== "playing"}
                    >
                      {cell.hasHiddenNumber && cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
                        ? "?"
                        : getCellContent(cell, rowIndex, colIndex)}
                      {isFoggy && !cell.isFlagged && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800 rounded-lg p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-3">Campaign Controls:</h3>
          <ul className="text-slate-300 space-y-2 text-sm">
            <li>• <strong>Left Click / Tap:</strong> Reveal a cell</li>
            <li>• <strong>Right Click / Long Press:</strong> Place or remove a flag</li>
            <li>• <strong>Lives:</strong> You have 3 lives - hitting a mine costs one life</li>
            <li>• <strong>Power-ups:</strong> Earn one random power-up per level completed (max 3 of each)</li>
            <li>• <strong>Reveal:</strong> Safely reveals a random empty cell</li>
            <li>• <strong>Shield:</strong> Next mine click won't hurt you</li>
            <li>• <strong>Scanner:</strong> Highlights all mine-adjacent cells for 3 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
