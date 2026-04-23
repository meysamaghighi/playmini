"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Side = "r" | "b";
type Piece = { side: Side; king: boolean };
type Board = (Piece | null)[][];
type Pos = [number, number];
type Move = { from: Pos; to: Pos; captured: Pos[] };

function initialBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) b[r][c] = { side: "b", king: false };
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) b[r][c] = { side: "r", king: false };
    }
  }
  return b;
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function pieceDirs(p: Piece): [number, number][] {
  if (p.king) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  return p.side === "r"
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]];
}

function findCaptureChains(
  board: Board,
  r: number,
  c: number,
  piece: Piece,
  captured: Pos[] = []
): Move[] {
  const chains: Move[] = [];
  for (const [dr, dc] of pieceDirs(piece)) {
    const mr = r + dr;
    const mc = c + dc;
    const lr = r + dr * 2;
    const lc = c + dc * 2;
    if (!inBounds(lr, lc)) continue;
    const mid = board[mr]?.[mc];
    if (!mid || mid.side === piece.side) continue;
    if (board[lr][lc]) continue;
    if (captured.some(([cr, cc]) => cr === mr && cc === mc)) continue;

    const newBoard = board.map((row) => row.slice());
    newBoard[r][c] = null;
    newBoard[mr][mc] = null;
    newBoard[lr][lc] = piece;
    const nextCaptured = [...captured, [mr, mc] as Pos];
    const sub = findCaptureChains(newBoard, lr, lc, piece, nextCaptured);
    if (sub.length === 0) {
      chains.push({ from: [r, c], to: [lr, lc], captured: nextCaptured });
    } else {
      for (const s of sub) {
        chains.push({ from: [r, c], to: s.to, captured: s.captured });
      }
    }
  }
  return chains;
}

function legalMoves(board: Board, side: Side): Move[] {
  const caps: Move[] = [];
  const quiet: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.side !== side) continue;
      const chains = findCaptureChains(board, r, c, p);
      caps.push(...chains);
      if (chains.length === 0) {
        for (const [dr, dc] of pieceDirs(p)) {
          const nr = r + dr;
          const nc = c + dc;
          if (inBounds(nr, nc) && !board[nr][nc]) {
            quiet.push({ from: [r, c], to: [nr, nc], captured: [] });
          }
        }
      }
    }
  }
  return caps.length ? caps : quiet;
}

function applyMove(board: Board, move: Move): Board {
  const next = board.map((row) => row.slice());
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = next[fr][fc]!;
  next[fr][fc] = null;
  for (const [cr, cc] of move.captured) next[cr][cc] = null;
  const promoted =
    (piece.side === "r" && tr === 0) || (piece.side === "b" && tr === 7);
  next[tr][tc] = { ...piece, king: piece.king || promoted };
  return next;
}

function evalBoard(board: Board): number {
  let score = 0;
  for (const row of board) {
    for (const p of row) {
      if (!p) continue;
      const val = p.king ? 3 : 1;
      score += p.side === "b" ? val : -val;
    }
  }
  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  side: Side
): { score: number; move: Move | null } {
  const moves = legalMoves(board, side);
  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      return { score: side === "b" ? -9999 : 9999, move: null };
    }
    return { score: evalBoard(board), move: null };
  }
  let bestMove: Move | null = moves[0];
  if (side === "b") {
    let value = -Infinity;
    for (const m of moves) {
      const { score } = minimax(applyMove(board, m), depth - 1, alpha, beta, "r");
      if (score > value) {
        value = score;
        bestMove = m;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { score: value, move: bestMove };
  } else {
    let value = Infinity;
    for (const m of moves) {
      const { score } = minimax(applyMove(board, m), depth - 1, alpha, beta, "b");
      if (score < value) {
        value = score;
        bestMove = m;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return { score: value, move: bestMove };
  }
}

export default function CheckersGame() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [turn, setTurn] = useState<Side>("r");
  const [selected, setSelected] = useState<Pos | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [winner, setWinner] = useState<Side | null>(null);

  const moves = useMemo(() => legalMoves(board, turn), [board, turn]);

  useEffect(() => {
    if (moves.length === 0) {
      setWinner(turn === "r" ? "b" : "r");
    }
  }, [moves, turn]);

  useEffect(() => {
    if (turn !== "b" || winner) return;
    setAiThinking(true);
    const t = setTimeout(() => {
      const { move } = minimax(board, 5, -Infinity, Infinity, "b");
      if (move) {
        setBoard(applyMove(board, move));
        setTurn("r");
      }
      setAiThinking(false);
    }, 300);
    return () => clearTimeout(t);
  }, [turn, board, winner]);

  const movesFromSelected = useMemo(() => {
    if (!selected) return [];
    const [sr, sc] = selected;
    return moves.filter((m) => m.from[0] === sr && m.from[1] === sc);
  }, [moves, selected]);

  const newGame = () => {
    setBoard(initialBoard());
    setTurn("r");
    setSelected(null);
    setAiThinking(false);
    setWinner(null);
  };

  const onCellClick = (r: number, c: number) => {
    if (winner || aiThinking || turn !== "r") return;
    const piece = board[r][c];

    if (selected) {
      const move = movesFromSelected.find((m) => m.to[0] === r && m.to[1] === c);
      if (move) {
        setBoard(applyMove(board, move));
        setTurn("b");
        setSelected(null);
        return;
      }
    }
    if (piece && piece.side === "r") {
      if (moves.some((m) => m.from[0] === r && m.from[1] === c)) {
        setSelected([r, c]);
      }
    } else {
      setSelected(null);
    }
  };

  const isMoveTarget = (r: number, c: number) =>
    movesFromSelected.some((m) => m.to[0] === r && m.to[1] === c);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-lg">
        {winner ? (
          <span className="font-bold text-yellow-400">
            {winner === "r" ? "You win!" : "AI wins"}
          </span>
        ) : (
          <span>
            Turn:{" "}
            <span className={turn === "r" ? "text-red-400 font-bold" : "text-gray-300 font-bold"}>
              {turn === "r" ? "You (Red)" : "AI (Black)"}
            </span>
            {aiThinking && " (thinking…)"}
          </span>
        )}
      </div>

      <div className="inline-block bg-amber-900 p-2 rounded">
        <div className="grid grid-cols-8 border-2 border-amber-950">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const dark = (r + c) % 2 === 1;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const target = isMoveTarget(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => onCellClick(r, c)}
                  className={`relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center ${
                    dark ? "bg-amber-800" : "bg-amber-200"
                  } ${isSelected ? "ring-4 ring-yellow-400 ring-inset" : ""}`}
                  aria-label={`Row ${r + 1} col ${c + 1}`}
                >
                  {piece && (
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg ${
                        piece.side === "r"
                          ? "bg-red-600 text-white"
                          : "bg-gray-900 text-white"
                      } shadow-md`}
                    >
                      {piece.king ? "♚" : ""}
                    </div>
                  )}
                  {target && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3 h-3 rounded-full bg-green-400/70" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <button
        onClick={newGame}
        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
      >
        New Game
      </button>

      <p className="text-sm text-gray-400 text-center max-w-md">
        Captures are mandatory. Pieces reaching the far row become kings and can move backward.
      </p>
    </div>
  );
}
