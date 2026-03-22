"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Player = "RED" | "YELLOW" | null;
type Board = Player[][];
type GameState = "START" | "PLAYING" | "PLAYER_WON" | "AI_WON" | "DRAW";

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

export default function Connect4Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>("START");
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("RED");
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, draws: 0 });
  const [dropAnimation, setDropAnimation] = useState<{ col: number; row: number; player: Player; progress: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pb-connect4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed);
      } catch {}
    }
  }, []);

  const saveStats = (newStats: Stats) => {
    setStats(newStats);
    localStorage.setItem("pb-connect4", JSON.stringify(newStats));
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

  function evaluateWindow(window: Player[], player: Player): number {
    const opponent = player === "RED" ? "YELLOW" : "RED";
    const playerCount = window.filter(c => c === player).length;
    const opponentCount = window.filter(c => c === opponent).length;
    const emptyCount = window.filter(c => c === null).length;

    if (playerCount === 4) return 100;
    if (playerCount === 3 && emptyCount === 1) return 5;
    if (playerCount === 2 && emptyCount === 2) return 2;
    if (opponentCount === 3 && emptyCount === 1) return -4;
    return 0;
  }

  function scorePosition(board: Board, player: Player): number {
    let score = 0;

    // Center column preference
    const centerCol = Math.floor(COLS / 2);
    const centerCount = board.filter(row => row[centerCol] === player).length;
    score += centerCount * 3;

    // Horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
        score += evaluateWindow(window, player);
      }
    }

    // Vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
        score += evaluateWindow(window, player);
      }
    }

    // Diagonal (down-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
        score += evaluateWindow(window, player);
      }
    }

    // Diagonal (down-left)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        const window = [board[row][col], board[row + 1][col - 1], board[row + 2][col - 2], board[row + 3][col - 3]];
        score += evaluateWindow(window, player);
      }
    }

    return score;
  }

  function minimax(board: Board, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): [number, number | null] {
    const validCols = Array.from({ length: COLS }, (_, i) => i).filter(col => isValidMove(board, col));
    const { winner } = checkWinner(board);
    const isFull = isBoardFull(board);

    if (depth === 0 || winner || isFull) {
      if (winner === "YELLOW") return [100000, null];
      if (winner === "RED") return [-100000, null];
      if (isFull) return [0, null];
      return [scorePosition(board, "YELLOW"), null];
    }

    if (maximizingPlayer) {
      let maxScore = -Infinity;
      let bestCol = validCols[Math.floor(Math.random() * validCols.length)];
      for (const col of validCols) {
        const newBoard = makeMove(board, col, "YELLOW");
        const [score] = minimax(newBoard, depth - 1, alpha, beta, false);
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
        const [score] = minimax(newBoard, depth - 1, alpha, beta, true);
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

  function getBestMove(board: Board): number {
    const [, col] = minimax(board, 5, -Infinity, Infinity, true);
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

  const handleColumnClick = useCallback((col: number) => {
    if (gameState !== "PLAYING" || currentPlayer !== "RED" || isAiThinking || !isValidMove(board, col)) {
      return;
    }

    const targetRow = getNextOpenRow(board, col);
    if (targetRow === -1) return;

    animateDrop(col, targetRow, "RED", () => {
      const newBoard = makeMove(board, col, "RED");
      setBoard(newBoard);

      const { winner, cells } = checkWinner(newBoard);
      if (winner === "RED") {
        setWinningCells(cells);
        setGameState("PLAYER_WON");
        saveStats({ ...stats, wins: stats.wins + 1 });
        return;
      }

      if (isBoardFull(newBoard)) {
        setGameState("DRAW");
        saveStats({ ...stats, draws: stats.draws + 1 });
        return;
      }

      setCurrentPlayer("YELLOW");
      setIsAiThinking(true);

      // AI move after a short delay
      setTimeout(() => {
        const aiCol = getBestMove(newBoard);
        const aiTargetRow = getNextOpenRow(newBoard, aiCol);

        animateDrop(aiCol, aiTargetRow, "YELLOW", () => {
          const aiBoard = makeMove(newBoard, aiCol, "YELLOW");
          setBoard(aiBoard);

          const { winner: aiWinner, cells: aiCells } = checkWinner(aiBoard);
          if (aiWinner === "YELLOW") {
            setWinningCells(aiCells);
            setGameState("AI_WON");
            saveStats({ ...stats, losses: stats.losses + 1 });
            setIsAiThinking(false);
            return;
          }

          if (isBoardFull(aiBoard)) {
            setGameState("DRAW");
            saveStats({ ...stats, draws: stats.draws + 1 });
            setIsAiThinking(false);
            return;
          }

          setCurrentPlayer("RED");
          setIsAiThinking(false);
        });
      }, 600);
    });
  }, [gameState, currentPlayer, isAiThinking, board, stats, animateDrop]);

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer("RED");
    setGameState("PLAYING");
    setWinningCells([]);
    setIsAiThinking(false);
    setDropAnimation(null);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Board (blue)
    ctx.fillStyle = "#2563eb";
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
    if (gameState === "PLAYING" && currentPlayer === "RED" && !isAiThinking && hoverCol !== null && !dropAnimation && isValidMove(board, hoverCol)) {
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
  }, [board, winningCells, hoverCol, gameState, currentPlayer, isAiThinking, dropAnimation]);

  useEffect(() => {
    draw();
  }, [draw]);

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
    const text = `I won ${stats.wins} games in Connect 4! Can you beat me? https://playmini.fun/connect4`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      {/* Stats */}
      <div className="flex gap-6 text-center">
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

        {gameState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🔴🟡</div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-red-400 to-yellow-500 bg-clip-text text-transparent mb-2">
              Connect 4
            </h2>
            <p className="text-gray-400 mb-6 text-sm">Click a column to drop your piece</p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play vs AI
            </button>
          </div>
        )}

        {gameState === "PLAYER_WON" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-green-400 mb-4">You Won!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Wins: {stats.wins}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">AI Won!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Better luck next time!</p>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        )}

        {gameState === "DRAW" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-yellow-400 mb-4">Draw!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Board is full!</p>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {gameState === "PLAYING" && (
        <div className="text-center">
          {isAiThinking ? (
            <p className="text-yellow-400 font-semibold">AI is thinking...</p>
          ) : (
            <p className="text-gray-400">
              {currentPlayer === "RED" ? "Your turn (Red)" : "AI's turn (Yellow)"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
