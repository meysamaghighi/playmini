"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Player = "RED" | "BLACK" | null;
type Piece = { player: Player; isKing: boolean } | null;
type Board = Piece[][];
type GameState = "START" | "PLAYING" | "PLAYER_WON" | "AI_WON" | "DRAW";
type Position = { row: number; col: number };
type Move = { from: Position; to: Position; captures: Position[] };

const BOARD_SIZE = 8;
const CELL_SIZE = 60;
const PADDING = 10;
const CANVAS_WIDTH = BOARD_SIZE * CELL_SIZE + PADDING * 2;
const CANVAS_HEIGHT = BOARD_SIZE * CELL_SIZE + PADDING * 2;

interface Stats {
  wins: number;
  losses: number;
  draws: number;
}

export default function CheckersGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>("START");
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("RED");
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, draws: 0 });
  const [moveCount, setMoveCount] = useState(0);

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pb-checkers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed);
      } catch {}
    }
  }, []);

  const saveStats = (newStats: Stats) => {
    setStats(newStats);
    localStorage.setItem("pb-checkers", JSON.stringify(newStats));
  };

  function createInitialBoard(): Board {
    const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

    // Place RED pieces (bottom, player)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: "RED", isKing: false };
        }
      }
    }

    // Place BLACK pieces (top, AI)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: "BLACK", isKing: false };
        }
      }
    }

    return board;
  }

  function isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  function getValidMoves(board: Board, player: Player): Move[] {
    const moves: Move[] = [];
    const captureMoves: Move[] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece && piece.player === player) {
          const pieceMoves = getValidMovesForPiece(board, row, col);
          pieceMoves.forEach(move => {
            if (move.captures.length > 0) {
              captureMoves.push(move);
            } else {
              moves.push(move);
            }
          });
        }
      }
    }

    // If there are capture moves, only return those (mandatory captures)
    return captureMoves.length > 0 ? captureMoves : moves;
  }

  function getValidMovesForPiece(board: Board, row: number, col: number): Move[] {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: Move[] = [];
    const directions = piece.isKing
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] // Kings move in all diagonal directions
      : piece.player === "RED"
      ? [[-1, -1], [-1, 1]] // Red moves up
      : [[1, -1], [1, 1]]; // Black moves down

    // Check normal moves
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
        moves.push({
          from: { row, col },
          to: { row: newRow, col: newCol },
          captures: []
        });
      }
    }

    // Check capture moves (can jump in all diagonal directions)
    const allDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of allDirections) {
      const captureRow = row + dr;
      const captureCol = col + dc;
      const landRow = row + dr * 2;
      const landCol = col + dc * 2;

      if (
        isValidPosition(landRow, landCol) &&
        isValidPosition(captureRow, captureCol)
      ) {
        const capturedPiece = board[captureRow][captureCol];
        const landPiece = board[landRow][landCol];

        if (
          capturedPiece &&
          capturedPiece.player !== piece.player &&
          !landPiece
        ) {
          // Check for multi-jump
          const multiJumps = findMultiJumps(
            board,
            landRow,
            landCol,
            piece,
            [{ row: captureRow, col: captureCol }]
          );
          moves.push(...multiJumps);
        }
      }
    }

    return moves;
  }

  function findMultiJumps(
    board: Board,
    row: number,
    col: number,
    piece: Piece,
    capturedSoFar: Position[]
  ): Move[] {
    const moves: Move[] = [];
    const allDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    let foundJump = false;

    for (const [dr, dc] of allDirections) {
      const captureRow = row + dr;
      const captureCol = col + dc;
      const landRow = row + dr * 2;
      const landCol = col + dc * 2;

      if (
        isValidPosition(landRow, landCol) &&
        isValidPosition(captureRow, captureCol)
      ) {
        const capturedPiece = board[captureRow][captureCol];
        const landPiece = board[landRow][landCol];

        // Don't capture same piece twice
        const alreadyCaptured = capturedSoFar.some(
          p => p.row === captureRow && p.col === captureCol
        );

        if (
          capturedPiece &&
          capturedPiece.player !== piece!.player &&
          !landPiece &&
          !alreadyCaptured
        ) {
          foundJump = true;
          const newCaptured = [...capturedSoFar, { row: captureRow, col: captureCol }];
          const furtherJumps = findMultiJumps(board, landRow, landCol, piece, newCaptured);
          moves.push(...furtherJumps);
        }
      }
    }

    // If no further jumps, this is an end position
    if (!foundJump) {
      const originalPos = capturedSoFar.length > 0
        ? { row: row - (row - capturedSoFar[0].row) * 2, col: col - (col - capturedSoFar[0].col) * 2 }
        : { row, col };

      // Find original position by working backwards from first capture
      let fromRow = row;
      let fromCol = col;
      for (let i = capturedSoFar.length - 1; i >= 0; i--) {
        const cap = capturedSoFar[i];
        fromRow = fromRow - (fromRow > cap.row ? 2 : -2);
        fromCol = fromCol - (fromCol > cap.col ? 2 : -2);
      }

      moves.push({
        from: { row: fromRow, col: fromCol },
        to: { row, col },
        captures: capturedSoFar
      });
    }

    return moves;
  }

  function makeMove(board: Board, move: Move): Board {
    const newBoard = board.map(row => row.map(cell => cell ? { ...cell } : null));
    const piece = newBoard[move.from.row][move.from.col];

    if (!piece) return newBoard;

    // Remove captured pieces
    move.captures.forEach(cap => {
      newBoard[cap.row][cap.col] = null;
    });

    // Move piece
    newBoard[move.from.row][move.from.col] = null;
    newBoard[move.to.row][move.to.col] = piece;

    // Check for king promotion
    if (piece.player === "RED" && move.to.row === 0) {
      newBoard[move.to.row][move.to.col]!.isKing = true;
    } else if (piece.player === "BLACK" && move.to.row === BOARD_SIZE - 1) {
      newBoard[move.to.row][move.to.col]!.isKing = true;
    }

    return newBoard;
  }

  function evaluateBoard(board: Board): number {
    let score = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = piece.isKing ? 30 : 10;
          const positionBonus = piece.player === "BLACK"
            ? (BOARD_SIZE - 1 - row) * 0.5 // Black wants to advance down
            : row * 0.5; // Red wants to advance up

          if (piece.player === "BLACK") {
            score += value + positionBonus;
          } else {
            score -= value + positionBonus;
          }
        }
      }
    }

    return score;
  }

  function minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean
  ): [number, Move | null] {
    const currentPlayerColor = maximizingPlayer ? "BLACK" : "RED";
    const moves = getValidMoves(board, currentPlayerColor);

    if (depth === 0 || moves.length === 0) {
      return [evaluateBoard(board), null];
    }

    if (maximizingPlayer) {
      let maxScore = -Infinity;
      let bestMove = moves[Math.floor(Math.random() * moves.length)];

      for (const move of moves) {
        const newBoard = makeMove(board, move);
        const [score] = minimax(newBoard, depth - 1, alpha, beta, false);

        if (score > maxScore) {
          maxScore = score;
          bestMove = move;
        }

        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }

      return [maxScore, bestMove];
    } else {
      let minScore = Infinity;
      let bestMove = moves[Math.floor(Math.random() * moves.length)];

      for (const move of moves) {
        const newBoard = makeMove(board, move);
        const [score] = minimax(newBoard, depth - 1, alpha, beta, true);

        if (score < minScore) {
          minScore = score;
          bestMove = move;
        }

        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }

      return [minScore, bestMove];
    }
  }

  function getBestMove(board: Board): Move | null {
    const [, move] = minimax(board, 5, -Infinity, Infinity, true);
    return move;
  }

  function checkGameOver(board: Board, player: Player): "WON" | "LOST" | "DRAW" | null {
    const playerMoves = getValidMoves(board, player);
    const opponentMoves = getValidMoves(board, player === "RED" ? "BLACK" : "RED");

    if (playerMoves.length === 0 && opponentMoves.length === 0) {
      return "DRAW";
    }

    if (playerMoves.length === 0) {
      return player === "RED" ? "LOST" : "WON";
    }

    if (opponentMoves.length === 0) {
      return player === "RED" ? "WON" : "LOST";
    }

    // Draw after 100 moves without capture
    if (moveCount > 100) {
      return "DRAW";
    }

    return null;
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== "PLAYING" || currentPlayer !== "RED" || isAiThinking) {
      return;
    }

    const piece = board[row][col];

    // If clicking on own piece, select it
    if (piece && piece.player === "RED") {
      setSelectedPiece({ row, col });
      const moves = getValidMovesForPiece(board, row, col);
      const allMoves = getValidMoves(board, "RED");
      const hasCaptureMove = allMoves.some(m => m.captures.length > 0);

      // If there are capture moves available, only show capture moves for this piece
      const filteredMoves = hasCaptureMove
        ? moves.filter(m => m.captures.length > 0)
        : moves;

      setValidMoves(filteredMoves);
      return;
    }

    // If no piece selected, do nothing
    if (!selectedPiece) return;

    // Check if this is a valid move
    const move = validMoves.find(m => m.to.row === row && m.to.col === col);
    if (!move) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    // Make the move
    const newBoard = makeMove(board, move);
    setBoard(newBoard);
    setSelectedPiece(null);
    setValidMoves([]);
    setMoveCount(move.captures.length > 0 ? 0 : moveCount + 1);

    // Check game over
    const gameOver = checkGameOver(newBoard, "RED");
    if (gameOver === "WON") {
      setGameState("PLAYER_WON");
      saveStats({ ...stats, wins: stats.wins + 1 });
      return;
    }
    if (gameOver === "LOST") {
      setGameState("AI_WON");
      saveStats({ ...stats, losses: stats.losses + 1 });
      return;
    }
    if (gameOver === "DRAW") {
      setGameState("DRAW");
      saveStats({ ...stats, draws: stats.draws + 1 });
      return;
    }

    // AI's turn
    setCurrentPlayer("BLACK");
    setIsAiThinking(true);

    setTimeout(() => {
      const aiMove = getBestMove(newBoard);
      if (!aiMove) {
        setGameState("PLAYER_WON");
        saveStats({ ...stats, wins: stats.wins + 1 });
        setIsAiThinking(false);
        return;
      }

      const aiBoard = makeMove(newBoard, aiMove);
      setBoard(aiBoard);
      setMoveCount(aiMove.captures.length > 0 ? 0 : moveCount + 1);

      const aiGameOver = checkGameOver(aiBoard, "BLACK");
      if (aiGameOver === "WON") {
        setGameState("AI_WON");
        saveStats({ ...stats, losses: stats.losses + 1 });
        setIsAiThinking(false);
        return;
      }
      if (aiGameOver === "LOST") {
        setGameState("PLAYER_WON");
        saveStats({ ...stats, wins: stats.wins + 1 });
        setIsAiThinking(false);
        return;
      }
      if (aiGameOver === "DRAW") {
        setGameState("DRAW");
        saveStats({ ...stats, draws: stats.draws + 1 });
        setIsAiThinking(false);
        return;
      }

      setCurrentPlayer("RED");
      setIsAiThinking(false);
    }, 600);
  }, [gameState, currentPlayer, isAiThinking, board, selectedPiece, validMoves, stats, moveCount]);

  const startGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer("RED");
    setGameState("PLAYING");
    setSelectedPiece(null);
    setValidMoves([]);
    setIsAiThinking(false);
    setMoveCount(0);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const x = PADDING + col * CELL_SIZE;
        const y = PADDING + row * CELL_SIZE;

        // Checkerboard pattern
        ctx.fillStyle = (row + col) % 2 === 0 ? "#9ca3af" : "#4b5563";
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        // Highlight selected piece
        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
          ctx.fillStyle = "rgba(59, 130, 246, 0.5)";
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }

        // Highlight valid moves
        const isValidMove = validMoves.some(m => m.to.row === row && m.to.col === col);
        if (isValidMove) {
          ctx.fillStyle = "rgba(34, 197, 94, 0.4)";
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

          // Draw indicator circle
          ctx.fillStyle = "rgba(34, 197, 94, 0.8)";
          ctx.beginPath();
          ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw pieces
        const piece = board[row][col];
        if (piece) {
          const centerX = x + CELL_SIZE / 2;
          const centerY = y + CELL_SIZE / 2;
          const radius = CELL_SIZE / 2 - 8;

          // Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.beginPath();
          ctx.arc(centerX + 2, centerY + 2, radius, 0, Math.PI * 2);
          ctx.fill();

          // Piece gradient
          const gradient = ctx.createRadialGradient(
            centerX - radius / 3,
            centerY - radius / 3,
            0,
            centerX,
            centerY,
            radius
          );

          if (piece.player === "RED") {
            gradient.addColorStop(0, "#fca5a5");
            gradient.addColorStop(0.7, "#ef4444");
            gradient.addColorStop(1, "#b91c1c");
          } else {
            gradient.addColorStop(0, "#6b7280");
            gradient.addColorStop(0.7, "#374151");
            gradient.addColorStop(1, "#1f2937");
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();

          // Border
          ctx.strokeStyle = piece.player === "RED" ? "#7f1d1d" : "#111827";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.beginPath();
          ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 4, 0, Math.PI * 2);
          ctx.fill();

          // King crown
          if (piece.isKing) {
            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("♔", centerX, centerY);
          }
        }
      }
    }
  }, [board, selectedPiece, validMoves]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const col = Math.floor((x * scaleX - PADDING) / CELL_SIZE);
    const row = Math.floor((y * scaleY - PADDING) / CELL_SIZE);

    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
      handleCellClick(row, col);
    }
  };

  const handleShare = async () => {
    const text = `I won ${stats.wins} games in Checkers! Can you beat me? https://playmini.fun/checkers`;
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
          className="rounded-2xl max-w-full h-auto cursor-pointer"
          style={{ touchAction: "none" }}
        />

        {gameState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🔴⚫</div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-red-400 to-gray-500 bg-clip-text text-transparent mb-2">
              Checkers
            </h2>
            <p className="text-gray-400 mb-6 text-sm">Click a piece to see valid moves</p>
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
              <DownloadButton canvasRef={canvasRef} filename="checkers-win" label="Save" />
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
              <p className="text-white text-lg font-bold">Game ended in a draw</p>
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
              {currentPlayer === "RED"
                ? selectedPiece
                  ? "Click a highlighted square to move"
                  : "Your turn - Select a red piece"
                : "AI's turn"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
