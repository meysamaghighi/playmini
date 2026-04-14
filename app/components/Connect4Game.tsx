"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Player = "RED" | "YELLOW" | null;
type Board = Player[][];
type GameState = "MENU" | "LEVEL_SELECT" | "CAMPAIGN" | "ENDLESS" | "QUICK_PLAY" | "PLAYER_WON" | "AI_WON" | "DRAW" | "GAME_OVER";
type PowerUpType = "undo" | "bomb" | "double";

const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 60;
const PADDING = 10;
const CANVAS_WIDTH = COLS * CELL_SIZE + PADDING * 2;
const CANVAS_HEIGHT = ROWS * CELL_SIZE + PADDING * 2;

interface Stats {
  wins: number;
  losses: number;
  draws: number;
}

interface CampaignProgress {
  [key: number]: number; // level -> stars (0-3)
}

interface PowerUp {
  type: PowerUpType;
  remaining: number;
}

interface LevelConfig {
  level: number;
  name: string;
  emoji: string;
  depth: number;
  description: string;
  boardTheme: { primary: string; secondary: string };
  preferCenter?: boolean;
}

const LEVELS: LevelConfig[] = [
  { level: 1, name: "Beginner Bot", emoji: "🤖", depth: 0, description: "Random moves", boardTheme: { primary: "#3b82f6", secondary: "#1e3a8a" } },
  { level: 2, name: "Casual Bot", emoji: "😊", depth: 1, description: "Thinks 1 move ahead", boardTheme: { primary: "#8b5cf6", secondary: "#4c1d95" } },
  { level: 3, name: "Thinker", emoji: "🤔", depth: 2, description: "Thinks 2 moves ahead", boardTheme: { primary: "#10b981", secondary: "#065f46" } },
  { level: 4, name: "Strategist", emoji: "🧠", depth: 3, description: "Plans 3 moves ahead", boardTheme: { primary: "#f59e0b", secondary: "#78350f" } },
  { level: 5, name: "Tactician", emoji: "⚔️", depth: 4, description: "Blocks your wins", boardTheme: { primary: "#ef4444", secondary: "#7f1d1d" } },
  { level: 6, name: "Expert", emoji: "🎯", depth: 5, description: "Advanced tactics", boardTheme: { primary: "#06b6d4", secondary: "#164e63" } },
  { level: 7, name: "Master", emoji: "🏆", depth: 6, description: "Calculates deeply", boardTheme: { primary: "#ec4899", secondary: "#831843" } },
  { level: 8, name: "Champion", emoji: "👑", depth: 6, description: "Superior evaluation", boardTheme: { primary: "#6366f1", secondary: "#312e81" } },
  { level: 9, name: "Grandmaster", emoji: "🧙", depth: 7, description: "Opening book + deep search", boardTheme: { primary: "#14b8a6", secondary: "#134e4a" }, preferCenter: true },
  { level: 10, name: "Unbeatable", emoji: "🔥", depth: 8, description: "Perfect play", boardTheme: { primary: "#f97316", secondary: "#7c2d12" } },
];

export default function Connect4Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("RED");
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, draws: 0 });
  const [dropAnimation, setDropAnimation] = useState<{ col: number; row: number; player: Player; progress: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Campaign state
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>({});
  const [currentLevel, setCurrentLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [powerUpsUsed, setPowerUpsUsed] = useState(0);
  const [lastBoard, setLastBoard] = useState<Board | null>(null);
  const [lastAiMove, setLastAiMove] = useState<number | null>(null);
  const [doubleMoveActive, setDoubleMoveActive] = useState(false);
  const [activeMode, setActiveMode] = useState<"campaign" | "endless" | "quickplay">("campaign");

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pb-connect4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed);
      } catch {}
    }

    const campaignSaved = localStorage.getItem("pb-connect4-campaign");
    if (campaignSaved) {
      try {
        const parsed = JSON.parse(campaignSaved);
        setCampaignProgress(parsed);
      } catch {}
    }
  }, []);

  const saveStats = (newStats: Stats) => {
    setStats(newStats);
    localStorage.setItem("pb-connect4", JSON.stringify(newStats));
  };

  const saveCampaignProgress = (progress: CampaignProgress) => {
    setCampaignProgress(progress);
    localStorage.setItem("pb-connect4-campaign", JSON.stringify(progress));
  };

  function createEmptyBoard(): Board {
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  }

  function isValidMove(board: Board, col: number): boolean {
    return board[0][col] === null;
  }

  function getNextOpenRow(board: Board, col: number): number {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) return row;
    }
    return -1;
  }

  function makeMove(board: Board, col: number, player: Player): Board {
    const newBoard = board.map(row => [...row]);
    const row = getNextOpenRow(board, col);
    if (row !== -1) {
      newBoard[row][col] = player;
    }
    return newBoard;
  }

  function checkWinner(board: Board): { winner: Player; cells: [number, number][] } {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const player = board[row][col];
        if (player && board[row][col + 1] === player && board[row][col + 2] === player && board[row][col + 3] === player) {
          return { winner: player, cells: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]] };
        }
      }
    }

    // Check vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        const player = board[row][col];
        if (player && board[row + 1][col] === player && board[row + 2][col] === player && board[row + 3][col] === player) {
          return { winner: player, cells: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]] };
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const player = board[row][col];
        if (player && board[row + 1][col + 1] === player && board[row + 2][col + 2] === player && board[row + 3][col + 3] === player) {
          return { winner: player, cells: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]] };
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        const player = board[row][col];
        if (player && board[row + 1][col - 1] === player && board[row + 2][col - 2] === player && board[row + 3][col - 3] === player) {
          return { winner: player, cells: [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]] };
        }
      }
    }

    return { winner: null, cells: [] };
  }

  function isBoardFull(board: Board): boolean {
    return board[0].every(cell => cell !== null);
  }

  function evaluateWindow(window: Player[], player: Player, isChampion: boolean): number {
    const opponent = player === "RED" ? "YELLOW" : "RED";
    const playerCount = window.filter(c => c === player).length;
    const opponentCount = window.filter(c => c === opponent).length;
    const emptyCount = window.filter(c => c === null).length;

    if (playerCount === 4) return 100;
    if (playerCount === 3 && emptyCount === 1) return isChampion ? 8 : 5;
    if (playerCount === 2 && emptyCount === 2) return isChampion ? 4 : 2;
    if (opponentCount === 3 && emptyCount === 1) return isChampion ? -6 : -4;
    return 0;
  }

  function scorePosition(board: Board, player: Player, isChampion: boolean): number {
    let score = 0;

    // Center column preference
    const centerCol = Math.floor(COLS / 2);
    const centerCount = board.filter(row => row[centerCol] === player).length;
    score += centerCount * 3;

    // Horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
        score += evaluateWindow(window, player, isChampion);
      }
    }

    // Vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
        score += evaluateWindow(window, player, isChampion);
      }
    }

    // Diagonal (down-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
        score += evaluateWindow(window, player, isChampion);
      }
    }

    // Diagonal (down-left)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        const window = [board[row][col], board[row + 1][col - 1], board[row + 2][col - 2], board[row + 3][col - 3]];
        score += evaluateWindow(window, player, isChampion);
      }
    }

    return score;
  }

  function minimax(board: Board, depth: number, alpha: number, beta: number, maximizingPlayer: boolean, isChampion: boolean): [number, number | null] {
    const validCols = Array.from({ length: COLS }, (_, i) => i).filter(col => isValidMove(board, col));
    const { winner } = checkWinner(board);
    const isFull = isBoardFull(board);

    if (depth === 0 || winner || isFull) {
      if (winner === "YELLOW") return [100000, null];
      if (winner === "RED") return [-100000, null];
      if (isFull) return [0, null];
      return [scorePosition(board, "YELLOW", isChampion), null];
    }

    if (maximizingPlayer) {
      let maxScore = -Infinity;
      let bestCol = validCols[Math.floor(Math.random() * validCols.length)];
      for (const col of validCols) {
        const newBoard = makeMove(board, col, "YELLOW");
        const [score] = minimax(newBoard, depth - 1, alpha, beta, false, isChampion);
        if (score > maxScore) {
          maxScore = score;
          bestCol = col;
        }
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return [maxScore, bestCol];
    } else {
      let minScore = Infinity;
      let bestCol = validCols[Math.floor(Math.random() * validCols.length)];
      for (const col of validCols) {
        const newBoard = makeMove(board, col, "RED");
        const [score] = minimax(newBoard, depth - 1, alpha, beta, true, isChampion);
        if (score < minScore) {
          minScore = score;
          bestCol = col;
        }
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return [minScore, bestCol];
    }
  }

  function getBestMove(board: Board, levelConfig: LevelConfig): number {
    // Random moves for level 1
    if (levelConfig.depth === 0) {
      const validCols = Array.from({ length: COLS }, (_, i) => i).filter(col => isValidMove(board, col));
      return validCols[Math.floor(Math.random() * validCols.length)];
    }

    // Opening book for Grandmaster
    if (levelConfig.preferCenter && board.flat().filter(c => c).length < 4) {
      const centerCol = Math.floor(COLS / 2);
      if (isValidMove(board, centerCol)) return centerCol;
      if (isValidMove(board, centerCol - 1)) return centerCol - 1;
      if (isValidMove(board, centerCol + 1)) return centerCol + 1;
    }

    const isChampion = levelConfig.level >= 8;
    const [, col] = minimax(board, levelConfig.depth, -Infinity, Infinity, true, isChampion);
    return col ?? 3;
  }

  const animateDrop = useCallback((col: number, targetRow: number, player: Player, onComplete: () => void) => {
    let startTime: number | null = null;
    const duration = 400; // ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setDropAnimation({ col, row: targetRow, player, progress });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDropAnimation(null);
        onComplete();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const calculateScore = (levelNum: number, moves: number, powerUpsUsedCount: number): number => {
    const baseScore = levelNum * 100;
    const speedBonus = Math.max(0, 200 - moves * 5);
    const noPowerUpBonus = powerUpsUsedCount === 0 ? 100 : 0;
    return baseScore + speedBonus + noPowerUpBonus;
  };

  const handleWin = useCallback(() => {
    const levelScore = calculateScore(currentLevel, moveCount, powerUpsUsed);
    const newScore = score + levelScore;
    setScore(newScore);

    // Calculate stars: 3 = no powerups, 2 = used powerups, 1 = barely won (>15 moves)
    let stars = 3;
    if (powerUpsUsed > 0) stars = 2;
    if (moveCount > 15) stars = Math.min(stars, 1);

    const newProgress = { ...campaignProgress };
    newProgress[currentLevel] = Math.max(newProgress[currentLevel] || 0, stars);
    saveCampaignProgress(newProgress);

    if (gameState === "CAMPAIGN") {
      if (currentLevel >= 10) {
        // Campaign complete
        setGameState("PLAYER_WON");
      } else {
        // Advance to next level
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
          startLevel(currentLevel + 1);
        }, 2000);
      }
    } else if (gameState === "ENDLESS") {
      // Continue to next level in endless
      if (currentLevel >= 10) {
        setCurrentLevel(1);
        startLevel(1);
      } else {
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
          startLevel(currentLevel + 1);
        }, 1500);
      }
    } else {
      saveStats({ ...stats, wins: stats.wins + 1 });
      setGameState("PLAYER_WON");
    }
  }, [currentLevel, moveCount, powerUpsUsed, score, campaignProgress, gameState, stats]);

  const handleLoss = useCallback(() => {
    if (gameState === "CAMPAIGN" || gameState === "ENDLESS") {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setGameState("GAME_OVER");
      } else {
        setGameState("AI_WON");
      }
    } else {
      saveStats({ ...stats, losses: stats.losses + 1 });
      setGameState("AI_WON");
    }
  }, [lives, gameState, stats]);

  const handleDraw = useCallback(() => {
    if (gameState === "CAMPAIGN" || gameState === "ENDLESS") {
      // No life lost on draw, just replay
      setGameState("DRAW");
    } else {
      saveStats({ ...stats, draws: stats.draws + 1 });
      setGameState("DRAW");
    }
  }, [gameState, stats]);

  const handleColumnClick = useCallback((col: number) => {
    if (!["CAMPAIGN", "ENDLESS", "QUICK_PLAY"].includes(gameState) || currentPlayer !== "RED" || isAiThinking || !isValidMove(board, col)) {
      return;
    }

    const targetRow = getNextOpenRow(board, col);
    if (targetRow === -1) return;

    // Save state for undo
    setLastBoard(board);
    setMoveCount(moveCount + 1);

    animateDrop(col, targetRow, "RED", () => {
      const newBoard = makeMove(board, col, "RED");
      setBoard(newBoard);

      const { winner, cells } = checkWinner(newBoard);
      if (winner === "RED") {
        setWinningCells(cells);
        handleWin();
        return;
      }

      if (isBoardFull(newBoard)) {
        handleDraw();
        return;
      }

      // Check double move
      if (doubleMoveActive) {
        setDoubleMoveActive(false);
        // Player gets another turn
        return;
      }

      setCurrentPlayer("YELLOW");
      setIsAiThinking(true);

      // AI move after a short delay
      setTimeout(() => {
        const levelConfig = LEVELS[currentLevel - 1];
        const aiCol = getBestMove(newBoard, levelConfig);
        const aiTargetRow = getNextOpenRow(newBoard, aiCol);
        setLastAiMove(aiCol);

        animateDrop(aiCol, aiTargetRow, "YELLOW", () => {
          const aiBoard = makeMove(newBoard, aiCol, "YELLOW");
          setBoard(aiBoard);

          const { winner: aiWinner, cells: aiCells } = checkWinner(aiBoard);
          if (aiWinner === "YELLOW") {
            setWinningCells(aiCells);
            handleLoss();
            setIsAiThinking(false);
            return;
          }

          if (isBoardFull(aiBoard)) {
            handleDraw();
            setIsAiThinking(false);
            return;
          }

          setCurrentPlayer("RED");
          setIsAiThinking(false);
        });
      }, 600);
    });
  }, [gameState, currentPlayer, isAiThinking, board, moveCount, currentLevel, doubleMoveActive, handleWin, handleLoss, handleDraw, animateDrop]);

  const startLevel = (levelNum: number) => {
    setBoard(createEmptyBoard());
    setCurrentPlayer("RED");
    setWinningCells([]);
    setIsAiThinking(false);
    setDropAnimation(null);
    setPowerUps([
      { type: "undo", remaining: 1 },
      { type: "bomb", remaining: 1 },
      { type: "double", remaining: 1 },
    ]);
    setMoveCount(0);
    setPowerUpsUsed(0);
    setLastBoard(null);
    setLastAiMove(null);
    setDoubleMoveActive(false);
  };

  const startCampaign = () => {
    setCurrentLevel(1);
    setLives(3);
    setScore(0);
    setGameState("CAMPAIGN");
    setActiveMode("campaign");
    startLevel(1);
  };

  const startEndless = () => {
    setCurrentLevel(1);
    setLives(3);
    setScore(0);
    setGameState("ENDLESS");
    setActiveMode("endless");
    startLevel(1);
  };

  const startQuickPlay = () => {
    setCurrentLevel(6); // Default to Expert level
    setGameState("QUICK_PLAY");
    setActiveMode("quickplay");
    startLevel(6);
  };

  const startLevelFromSelect = (levelNum: number) => {
    setCurrentLevel(levelNum);
    setLives(3);
    setScore(0);
    setGameState("CAMPAIGN");
    setActiveMode("campaign");
    startLevel(levelNum);
  };

  const usePowerUp = (type: PowerUpType) => {
    const powerUp = powerUps.find(p => p.type === type);
    if (!powerUp || powerUp.remaining <= 0 || !["CAMPAIGN", "ENDLESS", "QUICK_PLAY"].includes(gameState) || currentPlayer !== "RED" || isAiThinking) {
      return;
    }

    if (type === "undo") {
      if (!lastBoard) return;
      setBoard(lastBoard);
      setLastBoard(null);
      setLastAiMove(null);
      setPowerUps(powerUps.map(p => p.type === "undo" ? { ...p, remaining: 0 } : p));
      setPowerUpsUsed(powerUpsUsed + 1);
    } else if (type === "bomb") {
      // Player must click a column to bomb
      const clickHandler = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const scaleX = canvas.width / rect.width;
        const col = Math.floor((x * scaleX - PADDING) / CELL_SIZE);
        if (col >= 0 && col < COLS) {
          // Remove top piece from column
          let removed = false;
          const newBoard = board.map(row => [...row]);
          for (let row = 0; row < ROWS; row++) {
            if (newBoard[row][col] !== null) {
              newBoard[row][col] = null;
              // Drop pieces above
              for (let r = row; r > 0; r--) {
                newBoard[r][col] = newBoard[r - 1][col];
              }
              newBoard[0][col] = null;
              removed = true;
              break;
            }
          }
          if (removed) {
            setBoard(newBoard);
            setPowerUps(powerUps.map(p => p.type === "bomb" ? { ...p, remaining: 0 } : p));
            setPowerUpsUsed(powerUpsUsed + 1);
          }
          canvas.removeEventListener("click", clickHandler);
          canvas.style.cursor = "pointer";
        }
      };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener("click", clickHandler, { once: true });
        canvas.style.cursor = "crosshair";
      }
    } else if (type === "double") {
      setDoubleMoveActive(true);
      setPowerUps(powerUps.map(p => p.type === "double" ? { ...p, remaining: 0 } : p));
      setPowerUpsUsed(powerUpsUsed + 1);
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const levelConfig = LEVELS[currentLevel - 1];
    const theme = levelConfig.boardTheme;

    // Background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Board with theme color
    const boardGradient = ctx.createLinearGradient(PADDING, PADDING, PADDING, PADDING + ROWS * CELL_SIZE);
    boardGradient.addColorStop(0, theme.primary);
    boardGradient.addColorStop(1, theme.secondary);
    ctx.fillStyle = boardGradient;
    ctx.fillRect(PADDING, PADDING, COLS * CELL_SIZE, ROWS * CELL_SIZE);

    // Draw cells and pieces
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = PADDING + col * CELL_SIZE + CELL_SIZE / 2;
        const y = PADDING + row * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 - 6;

        // Cell cutout (dark background showing through)
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Piece
        const piece = board[row][col];
        if (piece) {
          const isWinning = winningCells.some(([r, c]) => r === row && c === col);

          // Glow for winning pieces
          if (isWinning) {
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 8);
            glowGradient.addColorStop(0, piece === "RED" ? "rgba(239, 68, 68, 0.6)" : "rgba(234, 179, 8, 0.6)");
            glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
            ctx.fill();
          }

          // Piece gradient
          const gradient = ctx.createRadialGradient(x - radius / 3, y - radius / 3, 0, x, y, radius);
          if (piece === "RED") {
            gradient.addColorStop(0, "#fca5a5");
            gradient.addColorStop(0.7, "#ef4444");
            gradient.addColorStop(1, "#b91c1c");
          } else {
            gradient.addColorStop(0, "#fef08a");
            gradient.addColorStop(0.7, "#eab308");
            gradient.addColorStop(1, "#a16207");
          }
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.beginPath();
          ctx.arc(x - radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw dropping animation
    if (dropAnimation) {
      const { col, row: targetRow, player, progress } = dropAnimation;
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const startY = PADDING - CELL_SIZE / 2;
      const endY = PADDING + targetRow * CELL_SIZE + CELL_SIZE / 2;
      const y = startY + (endY - startY) * easeProgress;
      const x = PADDING + col * CELL_SIZE + CELL_SIZE / 2;
      const radius = CELL_SIZE / 2 - 6;

      const gradient = ctx.createRadialGradient(x - radius / 3, y - radius / 3, 0, x, y, radius);
      if (player === "RED") {
        gradient.addColorStop(0, "#fca5a5");
        gradient.addColorStop(0.7, "#ef4444");
        gradient.addColorStop(1, "#b91c1c");
      } else {
        gradient.addColorStop(0, "#fef08a");
        gradient.addColorStop(0.7, "#eab308");
        gradient.addColorStop(1, "#a16207");
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(x - radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hover preview (only when player's turn and not animating)
    if (["CAMPAIGN", "ENDLESS", "QUICK_PLAY"].includes(gameState) && currentPlayer === "RED" && !isAiThinking && hoverCol !== null && !dropAnimation && isValidMove(board, hoverCol)) {
      const x = PADDING + hoverCol * CELL_SIZE + CELL_SIZE / 2;
      const y = PADDING - CELL_SIZE / 2;
      const radius = CELL_SIZE / 2 - 6;

      ctx.globalAlpha = 0.5;
      const gradient = ctx.createRadialGradient(x - radius / 3, y - radius / 3, 0, x, y, radius);
      gradient.addColorStop(0, "#fca5a5");
      gradient.addColorStop(0.7, "#ef4444");
      gradient.addColorStop(1, "#b91c1c");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }, [board, winningCells, hoverCol, gameState, currentPlayer, isAiThinking, dropAnimation, currentLevel]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const col = Math.floor((x * scaleX - PADDING) / CELL_SIZE);
    if (col >= 0 && col < COLS) {
      handleColumnClick(col);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const col = Math.floor((x * scaleX - PADDING) / CELL_SIZE);
    if (col >= 0 && col < COLS) {
      setHoverCol(col);
    } else {
      setHoverCol(null);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoverCol(null);
  };

  const handleShare = async () => {
    const text = gameState === "GAME_OVER"
      ? `I scored ${score} points in Connect 4 Endless Mode! Can you beat me? https://playmini.fun/connect4`
      : `I beat level ${currentLevel} in Connect 4! Can you beat me? https://playmini.fun/connect4`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  const levelConfig = LEVELS[currentLevel - 1];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      {gameState === "MENU" && (
        <div className="max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🔴🟡</div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-red-400 to-yellow-500 bg-clip-text text-transparent mb-2">
              Connect 4
            </h2>
            <p className="text-gray-400">Drop pieces to connect four in a row</p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={startCampaign}
              className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-xl font-black text-white mb-1">Campaign</div>
              <div className="text-sm text-blue-100">10 levels, 3 lives, power-ups</div>
            </button>

            <button
              onClick={() => setGameState("LEVEL_SELECT")}
              className="p-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-xl font-black text-white mb-1">Level Select</div>
              <div className="text-sm text-green-100">Practice any unlocked level</div>
            </button>

            <button
              onClick={startEndless}
              className="p-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-xl font-black text-white mb-1">Endless</div>
              <div className="text-sm text-orange-100">Face all AI in sequence, high score</div>
            </button>

            <button
              onClick={startQuickPlay}
              className="p-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-xl font-black text-white mb-1">Quick Play</div>
              <div className="text-sm text-slate-100">Classic mode vs Expert AI</div>
            </button>
          </div>
        </div>
      )}

      {gameState === "LEVEL_SELECT" && (
        <div className="max-w-2xl w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white mb-2">Select Level</h2>
            <p className="text-gray-400">Choose your opponent</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {LEVELS.map((level) => {
              const stars = campaignProgress[level.level] || 0;
              const isUnlocked = level.level === 1 || (campaignProgress[level.level - 1] || 0) > 0;
              return (
                <button
                  key={level.level}
                  onClick={() => isUnlocked && startLevelFromSelect(level.level)}
                  disabled={!isUnlocked}
                  className={`p-4 rounded-xl transition-all ${
                    isUnlocked
                      ? "bg-slate-800 hover:bg-slate-700 hover:scale-105 active:scale-95"
                      : "bg-slate-900 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-3xl mb-2">{level.emoji}</div>
                  <div className="text-lg font-bold text-white">{level.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{level.description}</div>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={`text-xl ${s <= stars ? "text-yellow-400" : "text-gray-600"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setGameState("MENU")}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
          >
            Back to Menu
          </button>
        </div>
      )}

      {["CAMPAIGN", "ENDLESS", "QUICK_PLAY"].includes(gameState) && (
        <>
          {/* Stats Bar */}
          <div className="flex gap-6 text-center flex-wrap justify-center">
            {(gameState === "CAMPAIGN" || gameState === "ENDLESS") && (
              <>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
                  <div className="text-2xl font-black text-blue-400 tabular-nums">{currentLevel}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
                  <div className="text-2xl font-black text-red-400">{"❤️".repeat(lives)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
                  <div className="text-2xl font-black text-yellow-400 tabular-nums">{score}</div>
                </div>
              </>
            )}
            {gameState === "QUICK_PLAY" && (
              <>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Wins</div>
                  <div className="text-2xl font-black text-green-400 tabular-nums">{stats.wins}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Losses</div>
                  <div className="text-2xl font-black text-red-400 tabular-nums">{stats.losses}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Draws</div>
                  <div className="text-2xl font-black text-yellow-400 tabular-nums">{stats.draws}</div>
                </div>
              </>
            )}
          </div>

          {/* AI Personality */}
          <div className="text-center bg-slate-800 rounded-xl px-6 py-3">
            <div className="text-2xl mb-1">{levelConfig.emoji}</div>
            <div className="text-lg font-bold text-white">{levelConfig.name}</div>
            <div className="text-sm text-gray-400">{levelConfig.description}</div>
          </div>

          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              className="rounded-2xl max-w-full h-auto cursor-pointer"
              style={{ touchAction: "none" }}
            />
          </div>

          {/* Power-ups */}
          {(gameState === "CAMPAIGN" || gameState === "ENDLESS") && (
            <div className="flex gap-3">
              {powerUps.map((powerUp) => {
                const label = powerUp.type === "undo" ? "↩️ Undo" : powerUp.type === "bomb" ? "💣 Bomb" : "⚡ Double";
                return (
                  <button
                    key={powerUp.type}
                    onClick={() => usePowerUp(powerUp.type)}
                    disabled={powerUp.remaining <= 0 || currentPlayer !== "RED" || isAiThinking}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      powerUp.remaining > 0 && currentPlayer === "RED" && !isAiThinking
                        ? "bg-purple-600 hover:bg-purple-500 text-white hover:scale-105 active:scale-95"
                        : "bg-slate-800 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {label} {powerUp.remaining > 0 ? `(${powerUp.remaining})` : "(used)"}
                  </button>
                );
              })}
            </div>
          )}

          {/* Turn Indicator */}
          <div className="text-center">
            {isAiThinking ? (
              <p className="text-yellow-400 font-semibold animate-pulse">{levelConfig.name} is thinking...</p>
            ) : (
              <p className="text-gray-400">
                {currentPlayer === "RED" ? "Your turn (Red)" : `${levelConfig.name}'s turn (Yellow)`}
              </p>
            )}
            {doubleMoveActive && <p className="text-purple-400 font-bold">Double Drop Active - Drop one more!</p>}
          </div>
        </>
      )}

      {gameState === "PLAYER_WON" && (
        <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 text-center">
          <h2 className="text-4xl font-black text-green-400 mb-4">Victory!</h2>
          <div className="text-6xl mb-4">🏆</div>
          {currentLevel >= 10 ? (
            <p className="text-lg text-white mb-6">Campaign Complete! Final Score: {score}</p>
          ) : (
            <p className="text-lg text-white mb-6">Level {currentLevel} Complete! +{calculateScore(currentLevel, moveCount, powerUpsUsed)} points</p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setGameState("MENU")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Menu
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Share
            </button>
            <DownloadButton canvasRef={canvasRef} filename="connect4-win" label="Save" />
          </div>
        </div>
      )}

      {gameState === "AI_WON" && (
        <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 text-center">
          <h2 className="text-4xl font-black text-red-400 mb-4">Defeated!</h2>
          <div className="text-6xl mb-4">{levelConfig.emoji}</div>
          <p className="text-lg text-white mb-2">{levelConfig.name} won!</p>
          <p className="text-gray-400 mb-6">Lives remaining: {lives}</p>
          <button
            onClick={() => {
              if (activeMode === "quickplay") {
                setGameState("QUICK_PLAY");
                startLevel(currentLevel);
              } else if (lives > 0) {
                setGameState("CAMPAIGN");
                startLevel(currentLevel);
              } else {
                setGameState("GAME_OVER");
              }
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            {activeMode === "quickplay" ? "Play Again" : "Try Again"}
          </button>
        </div>
      )}

      {gameState === "DRAW" && (
        <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 text-center">
          <h2 className="text-4xl font-black text-yellow-400 mb-4">Draw!</h2>
          <div className="text-6xl mb-4">🤝</div>
          <p className="text-lg text-white mb-6">Board is full! No life lost.</p>
          <button
            onClick={() => {
              setGameState(activeMode === "quickplay" ? "QUICK_PLAY" : "CAMPAIGN");
              startLevel(currentLevel);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Replay Level
          </button>
        </div>
      )}

      {gameState === "GAME_OVER" && (
        <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 text-center">
          <h2 className="text-4xl font-black text-red-400 mb-4">Game Over!</h2>
          <div className="text-6xl mb-4">💀</div>
          <p className="text-lg text-white mb-2">You reached level {currentLevel}</p>
          <p className="text-2xl text-yellow-400 font-bold mb-6">Final Score: {score}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setGameState("MENU")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Menu
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Share Score
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
