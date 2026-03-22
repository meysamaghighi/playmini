'use client';

import { useState, useEffect } from 'react';

type Cell = 'X' | 'O' | null;
type Board = Cell[];
type GameMode = 'ai' | 'friend';
type Difficulty = 'easy' | 'medium' | 'hard';
type WinLine = [number, number, number] | null;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6] // diagonals
];

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [winner, setWinner] = useState<'X' | 'O' | 'Draw' | null>(null);
  const [winLine, setWinLine] = useState<WinLine>(null);
  const [scores, setScores] = useState({ xWins: 0, oWins: 0, draws: 0 });
  const [isThinking, setIsThinking] = useState(false);

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pb-tictactoe');
    if (saved) {
      try {
        const stats = JSON.parse(saved);
        setScores(stats);
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('pb-tictactoe', JSON.stringify(scores));
  }, [scores]);

  // AI move effect
  useEffect(() => {
    if (gameMode === 'ai' && !isXNext && !winner && board.some(cell => cell === null)) {
      setIsThinking(true);
      const timeout = setTimeout(() => {
        makeAIMove();
        setIsThinking(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isXNext, winner, board, gameMode, difficulty]);

  const checkWinner = (currentBoard: Board): { winner: 'X' | 'O' | 'Draw' | null, line: WinLine } => {
    // Check winning combinations
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a] as 'X' | 'O', line: [a, b, c] };
      }
    }

    // Check for draw
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'Draw', line: null };
    }

    return { winner: null, line: null };
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || (gameMode === 'ai' && !isXNext)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinLine(result.line);
      updateScores(result.winner);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const makeAIMove = () => {
    const newBoard = [...board];
    let moveIndex: number;

    if (difficulty === 'easy') {
      // 50% random
      if (Math.random() < 0.5) {
        moveIndex = getRandomMove(newBoard);
      } else {
        moveIndex = getBestMove(newBoard);
      }
    } else if (difficulty === 'medium') {
      // 20% random
      if (Math.random() < 0.2) {
        moveIndex = getRandomMove(newBoard);
      } else {
        moveIndex = getBestMove(newBoard);
      }
    } else {
      // Hard: always best move
      moveIndex = getBestMove(newBoard);
    }

    newBoard[moveIndex] = 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinLine(result.line);
      updateScores(result.winner);
    } else {
      setIsXNext(true);
    }
  };

  const getRandomMove = (currentBoard: Board): number => {
    const available = currentBoard.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
    return available[Math.floor(Math.random() * available.length)];
  };

  const getBestMove = (currentBoard: Board): number => {
    let bestScore = -Infinity;
    let bestMove = 0;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const minimax = (currentBoard: Board, depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(currentBoard);

    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const updateScores = (result: 'X' | 'O' | 'Draw') => {
    if (result === 'X') {
      setScores(prev => ({ ...prev, xWins: prev.xWins + 1 }));
    } else if (result === 'O') {
      setScores(prev => ({ ...prev, oWins: prev.oWins + 1 }));
    } else {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinLine(null);
  };

  const resetScores = () => {
    setScores({ xWins: 0, oWins: 0, draws: 0 });
    localStorage.setItem('pb-tictactoe', JSON.stringify({ xWins: 0, oWins: 0, draws: 0 }));
  };

  const handleShare = async () => {
    const text = `I've played Tic-Tac-Toe on PlayMini!\n\nX Wins: ${scores.xWins} | O Wins: ${scores.oWins} | Draws: ${scores.draws}\n\nPlay at playmini.fun/tic-tac-toe`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Stats copied to clipboard!');
    }
  };

  const winSet = new Set(winLine ?? []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => { setGameMode('ai'); resetGame(); }}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            gameMode === 'ai'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          vs AI
        </button>
        <button
          onClick={() => { setGameMode('friend'); resetGame(); }}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            gameMode === 'friend'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          vs Friend
        </button>
      </div>

      {/* Difficulty Selector (AI mode only) */}
      {gameMode === 'ai' && (
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => { setDifficulty('easy'); resetGame(); }}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              difficulty === 'easy'
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => { setDifficulty('medium'); resetGame(); }}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              difficulty === 'medium'
                ? 'bg-yellow-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => { setDifficulty('hard'); resetGame(); }}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              difficulty === 'hard'
                ? 'bg-red-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Hard
          </button>
        </div>
      )}

      {/* Game Status */}
      <div className="text-center mb-6">
        {winner ? (
          <div className="animate-bounce-in">
            <p className="text-3xl font-bold mb-2">
              {winner === 'Draw' ? (
                <span className="text-slate-300">It's a Draw!</span>
              ) : (
                <span className={winner === 'X' ? 'text-cyan-400' : 'text-rose-400'}>
                  {winner} Wins!
                </span>
              )}
            </p>
          </div>
        ) : (
          <p className="text-xl text-slate-300">
            {isThinking ? (
              <span className="text-rose-400">AI is thinking...</span>
            ) : (
              <>
                Next: <span className={isXNext ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isXNext ? 'X' : 'O'}
                </span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Board */}
      <div className="bg-slate-900 p-6 rounded-xl mb-6">
        <div className="relative aspect-square max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3 h-full">
            {board.map((cell, index) => {
              const isWin = winSet.has(index);
              return (
                <button
                  key={index}
                  onClick={() => handleClick(index)}
                  disabled={!!cell || !!winner || (gameMode === 'ai' && !isXNext)}
                  className={`rounded-lg flex items-center justify-center text-5xl font-bold transition-all ${
                    isWin
                      ? 'bg-green-600/40 ring-2 ring-green-400'
                      : 'bg-slate-800'
                  } ${
                    !cell && !winner && !(gameMode === 'ai' && !isXNext)
                      ? 'hover:bg-slate-700 cursor-pointer'
                      : 'cursor-default'
                  } ${cell === 'X' ? 'text-cyan-400' : cell === 'O' ? 'text-rose-400' : ''}`}
                  style={{ minHeight: '80px' }}
                >
                  {cell && (
                    <span className={cell === 'X' ? 'animate-draw-x' : 'animate-draw-o'}>
                      {cell}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="bg-slate-800 p-6 rounded-xl mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-cyan-400 text-3xl font-bold">{scores.xWins}</p>
            <p className="text-slate-400 text-sm mt-1">X Wins</p>
          </div>
          <div>
            <p className="text-slate-300 text-3xl font-bold">{scores.draws}</p>
            <p className="text-slate-400 text-sm mt-1">Draws</p>
          </div>
          <div>
            <p className="text-rose-400 text-3xl font-bold">{scores.oWins}</p>
            <p className="text-slate-400 text-sm mt-1">O Wins</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
        >
          {winner ? 'Play Again' : 'New Game'}
        </button>
        <button
          onClick={resetScores}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-colors"
        >
          Reset Scores
        </button>
        <button
          onClick={handleShare}
          className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold transition-colors"
        >
          Share Stats
        </button>
      </div>

      <style jsx>{`
        @keyframes draw-x {
          from {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes draw-o {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-draw-x {
          animation: draw-x 0.3s ease-out;
        }

        .animate-draw-o {
          animation: draw-o 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
