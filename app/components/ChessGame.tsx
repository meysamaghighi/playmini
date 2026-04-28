"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Color = "w" | "b";
type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
type Piece = { type: PieceType; color: Color };
type Square = Piece | null;
type Board = Square[][];
type Pos = { r: number; c: number };

const CELL = 64;
const W = CELL * 8;
const H = CELL * 8;

const GLYPHS: Record<PieceType, string> = { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙" };
const GLYPHS_B: Record<PieceType, string> = { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" };

function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function startBoard(): Board {
  const b = emptyBoard();
  const backRank: PieceType[] = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: backRank[c], color: "b" };
    b[1][c] = { type: "P", color: "b" };
    b[6][c] = { type: "P", color: "w" };
    b[7][c] = { type: backRank[c], color: "w" };
  }
  return b;
}

function inBounds(r: number, c: number) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function getRawMoves(board: Board, r: number, c: number, enPassant: Pos | null): Pos[] {
  const piece = board[r][c];
  if (!piece) return [];
  const { type, color } = piece;
  const moves: Pos[] = [];
  const enemy = color === "w" ? "b" : "w";

  const slide = (dr: number, dc: number) => {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      if (board[nr][nc]) {
        if (board[nr][nc]!.color === enemy) moves.push({ r: nr, c: nc });
        break;
      }
      moves.push({ r: nr, c: nc });
      nr += dr; nc += dc;
    }
  };

  const jump = (dr: number, dc: number) => {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push({ r: nr, c: nc });
  };

  switch (type) {
    case "R": slide(1,0); slide(-1,0); slide(0,1); slide(0,-1); break;
    case "B": slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1); break;
    case "Q": slide(1,0); slide(-1,0); slide(0,1); slide(0,-1); slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1); break;
    case "N": [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => jump(dr,dc)); break;
    case "K": [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => jump(dr,dc)); break;
    case "P": {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;
      if (inBounds(r + dir, c) && !board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (r === startRow && !board[r + 2 * dir][c]) moves.push({ r: r + 2 * dir, c });
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (inBounds(nr, nc)) {
          if (board[nr][nc]?.color === enemy) moves.push({ r: nr, c: nc });
          if (enPassant && enPassant.r === nr && enPassant.c === nc) moves.push({ r: nr, c: nc });
        }
      }
      break;
    }
  }
  return moves;
}

function applyMove(board: Board, from: Pos, to: Pos, enPassant: Pos | null, promoteTo: PieceType = "Q"): Board {
  const b = board.map(row => [...row]);
  const piece = b[from.r][from.c]!;
  b[to.r][to.c] = piece;
  b[from.r][from.c] = null;
  // En passant capture
  if (piece.type === "P" && enPassant && to.r === enPassant.r && to.c === enPassant.c) {
    b[from.r][to.c] = null;
  }
  // Promotion
  if (piece.type === "P" && (to.r === 0 || to.r === 7)) {
    b[to.r][to.c] = { type: promoteTo, color: piece.color };
  }
  // Castling
  if (piece.type === "K" && Math.abs(to.c - from.c) === 2) {
    if (to.c === 6) { b[from.r][5] = b[from.r][7]; b[from.r][7] = null; }
    else { b[from.r][3] = b[from.r][0]; b[from.r][0] = null; }
  }
  return b;
}

function findKing(board: Board, color: Color): Pos | null {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (board[r][c]?.type === "K" && board[r][c]?.color === color) return { r, c };
  return null;
}

function isAttacked(board: Board, pos: Pos, byColor: Color): boolean {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (p?.color !== byColor) continue;
    const moves = getRawMoves(board, r, c, null);
    if (moves.some(m => m.r === pos.r && m.c === pos.c)) return true;
  }
  return false;
}

function getLegalMoves(board: Board, r: number, c: number, enPassant: Pos | null, castleRights: CastleRights): Pos[] {
  const piece = board[r][c];
  if (!piece) return [];
  const raw = getRawMoves(board, r, c, enPassant);
  const legal = raw.filter(to => {
    const next = applyMove(board, { r, c }, to, enPassant);
    const king = findKing(next, piece.color);
    return king && !isAttacked(next, king, piece.color === "w" ? "b" : "w");
  });
  // Castling
  if (piece.type === "K") {
    const color = piece.color;
    const enemy = color === "w" ? "b" : "w";
    const row = color === "w" ? 7 : 0;
    if (r === row && c === 4 && !isAttacked(board, { r, c }, enemy)) {
      // Kingside
      if ((color === "w" ? castleRights.wK : castleRights.bK) &&
          !board[row][5] && !board[row][6] &&
          !isAttacked(board, { r: row, c: 5 }, enemy) && !isAttacked(board, { r: row, c: 6 }, enemy)) {
        legal.push({ r: row, c: 6 });
      }
      // Queenside
      if ((color === "w" ? castleRights.wQ : castleRights.bQ) &&
          !board[row][3] && !board[row][2] && !board[row][1] &&
          !isAttacked(board, { r: row, c: 3 }, enemy) && !isAttacked(board, { r: row, c: 2 }, enemy)) {
        legal.push({ r: row, c: 2 });
      }
    }
  }
  return legal;
}

interface CastleRights { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean; }

function updateCastle(cr: CastleRights, from: Pos, piece: Piece): CastleRights {
  const n = { ...cr };
  if (piece.type === "K") { if (piece.color === "w") { n.wK = false; n.wQ = false; } else { n.bK = false; n.bQ = false; } }
  if (piece.type === "R") {
    if (from.r === 7 && from.c === 7) n.wK = false;
    if (from.r === 7 && from.c === 0) n.wQ = false;
    if (from.r === 0 && from.c === 7) n.bK = false;
    if (from.r === 0 && from.c === 0) n.bQ = false;
  }
  return n;
}

// --- Simple AI ---
const PIECE_VALUE: Record<PieceType, number> = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };
const PST: Partial<Record<PieceType, number[][]>> = {
  P: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
  N: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
  B: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
};

function evalBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (!p) continue;
    const v = PIECE_VALUE[p.type];
    const pr = p.color === "w" ? 7 - r : r;
    const pst = PST[p.type]?.[pr]?.[c] ?? 0;
    score += p.color === "b" ? (v + pst) : -(v + pst);
  }
  return score;
}

function getAllMoves(board: Board, color: Color, ep: Pos | null, cr: CastleRights): Array<{ from: Pos; to: Pos }> {
  const moves: Array<{ from: Pos; to: Pos }> = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c]?.color !== color) continue;
    for (const to of getLegalMoves(board, r, c, ep, cr)) moves.push({ from: { r, c }, to });
  }
  return moves;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, ep: Pos | null, cr: CastleRights): number {
  if (depth === 0) return evalBoard(board);
  const color: Color = maximizing ? "b" : "w";
  const moves = getAllMoves(board, color, ep, cr);
  if (moves.length === 0) {
    const king = findKing(board, color);
    if (king && isAttacked(board, king, color === "w" ? "b" : "w")) return maximizing ? -99999 : 99999;
    return 0; // stalemate
  }
  if (maximizing) {
    let best = -Infinity;
    for (const { from, to } of moves) {
      const next = applyMove(board, from, to, ep);
      best = Math.max(best, minimax(next, depth - 1, alpha, beta, false, null, cr));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const { from, to } of moves) {
      const next = applyMove(board, from, to, ep);
      best = Math.min(best, minimax(next, depth - 1, alpha, beta, true, null, cr));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(board: Board, ep: Pos | null, cr: CastleRights): { from: Pos; to: Pos } | null {
  const moves = getAllMoves(board, "b", ep, cr);
  if (moves.length === 0) return null;
  let best = -Infinity;
  let bestMove = moves[0];
  // Shuffle for variety
  for (let i = moves.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [moves[i], moves[j]] = [moves[j], moves[i]];
  }
  for (const move of moves) {
    const next = applyMove(board, move.from, move.to, ep);
    const score = minimax(next, 2, -Infinity, Infinity, false, null, cr);
    if (score > best) { best = score; bestMove = move; }
  }
  return bestMove;
}

export default function ChessGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<Board>(startBoard);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [legalMoves, setLegalMoves] = useState<Pos[]>([]);
  const [turn, setTurn] = useState<Color>("w");
  const [enPassant, setEnPassant] = useState<Pos | null>(null);
  const [castleRights, setCastleRights] = useState<CastleRights>({ wK: true, wQ: true, bK: true, bQ: true });
  const [status, setStatus] = useState<"playing" | "check" | "checkmate" | "stalemate">("playing");
  const [aiThinking, setAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Pos; to: Pos } | null>(null);
  const [capturedW, setCapturedW] = useState<Piece[]>([]);
  const [capturedB, setCapturedB] = useState<Piece[]>([]);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const light = (r + c) % 2 === 0;
        // Base square
        ctx.fillStyle = light ? "#f0d9b5" : "#b58863";
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        // Last move highlight
        if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c))) {
          ctx.fillStyle = "rgba(205,210,106,0.5)";
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        }
        // Selected highlight
        if (selected && selected.r === r && selected.c === c) {
          ctx.fillStyle = "rgba(20,85,30,0.5)";
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        }
        // Legal move dots
        const isLegal = legalMoves.some(m => m.r === r && m.c === c);
        if (isLegal) {
          if (board[r][c]) {
            ctx.strokeStyle = "rgba(20,85,30,0.6)";
            ctx.lineWidth = 4;
            ctx.strokeRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4);
          } else {
            ctx.fillStyle = "rgba(20,85,30,0.35)";
            ctx.beginPath();
            ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, 12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Piece
        const piece = board[r][c];
        if (piece) {
          ctx.font = `${CELL - 8}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const glyph = piece.color === "w" ? GLYPHS[piece.type] : GLYPHS_B[piece.type];
          // Shadow
          ctx.fillStyle = piece.color === "w" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.15)";
          ctx.fillText(glyph, c * CELL + CELL / 2 + 2, r * CELL + CELL / 2 + 2);
          ctx.fillStyle = piece.color === "w" ? "#fff" : "#1a1a1a";
          ctx.fillText(glyph, c * CELL + CELL / 2, r * CELL + CELL / 2);
        }
        // Coordinates
        if (c === 0) {
          ctx.fillStyle = light ? "#b58863" : "#f0d9b5";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(String(8 - r), c * CELL + 2, r * CELL + 2);
        }
        if (r === 7) {
          ctx.fillStyle = light ? "#b58863" : "#f0d9b5";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.fillText("abcdefgh"[c], c * CELL + CELL - 2, r * CELL + CELL - 2);
        }
      }
    }
  }, [board, selected, legalMoves, lastMove]);

  useEffect(() => { drawBoard(); }, [drawBoard]);

  const checkGameStatus = useCallback((b: Board, toMove: Color, ep: Pos | null, cr: CastleRights) => {
    const moves = getAllMoves(b, toMove, ep, cr);
    const king = findKing(b, toMove);
    const inCheck = king ? isAttacked(b, king, toMove === "w" ? "b" : "w") : false;
    if (moves.length === 0) return inCheck ? "checkmate" : "stalemate";
    return inCheck ? "check" : "playing";
  }, []);

  const handleSquareClick = useCallback((r: number, c: number) => {
    if (turn !== "w" || aiThinking || status === "checkmate" || status === "stalemate") return;

    if (selected) {
      const isLegal = legalMoves.some(m => m.r === r && m.c === c);
      if (isLegal) {
        const piece = board[selected.r][selected.c]!;
        const captured = board[r][c];
        const newBoard = applyMove(board, selected, { r, c }, enPassant);
        const newCR = updateCastle(castleRights, selected, piece);

        // En passant square
        let newEP: Pos | null = null;
        if (piece.type === "P" && Math.abs(r - selected.r) === 2) newEP = { r: (r + selected.r) / 2, c };

        // Captured pieces
        const epCaptured = piece.type === "P" && enPassant && r === enPassant.r && c === enPassant.c;
        if (captured) setCapturedB(prev => [...prev, captured]);
        if (epCaptured) setCapturedB(prev => [...prev, { type: "P", color: "b" }]);

        setLastMove({ from: selected, to: { r, c } });
        setBoard(newBoard);
        setSelected(null);
        setLegalMoves([]);
        setEnPassant(newEP);
        setCastleRights(newCR);

        const newStatus = checkGameStatus(newBoard, "b", newEP, newCR);
        setStatus(newStatus);
        if (newStatus === "checkmate" || newStatus === "stalemate") { setTurn("b"); return; }
        setTurn("b");

        // AI move
        setAiThinking(true);
        setTimeout(() => {
          const aiMove = getBestMove(newBoard, newEP, newCR);
          if (!aiMove) { setAiThinking(false); return; }
          const aiCaptured = newBoard[aiMove.to.r][aiMove.to.c];
          const aiPiece = newBoard[aiMove.from.r][aiMove.from.c]!;
          const afterAI = applyMove(newBoard, aiMove.from, aiMove.to, newEP);
          const aiCR = updateCastle(newCR, aiMove.from, aiPiece);
          let aiEP: Pos | null = null;
          if (aiPiece.type === "P" && Math.abs(aiMove.to.r - aiMove.from.r) === 2)
            aiEP = { r: (aiMove.to.r + aiMove.from.r) / 2, c: aiMove.to.c };
          if (aiCaptured) setCapturedW(prev => [...prev, aiCaptured]);
          setBoard(afterAI);
          setLastMove(aiMove);
          setEnPassant(aiEP);
          setCastleRights(aiCR);
          const finalStatus = checkGameStatus(afterAI, "w", aiEP, aiCR);
          setStatus(finalStatus);
          setTurn("w");
          setAiThinking(false);
        }, 80);
        return;
      }
      // Clicked same or invalid — deselect or select new
      if (board[r][c]?.color === "w") {
        setSelected({ r, c });
        setLegalMoves(getLegalMoves(board, r, c, enPassant, castleRights));
        return;
      }
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    if (board[r][c]?.color === "w") {
      setSelected({ r, c });
      setLegalMoves(getLegalMoves(board, r, c, enPassant, castleRights));
    }
  }, [board, selected, legalMoves, turn, enPassant, castleRights, aiThinking, status, checkGameStatus]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    handleSquareClick(Math.floor(y / CELL), Math.floor(x / CELL));
  }, [handleSquareClick]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const t = e.changedTouches[0];
    const x = (t.clientX - rect.left) * scaleX;
    const y = (t.clientY - rect.top) * scaleY;
    handleSquareClick(Math.floor(y / CELL), Math.floor(x / CELL));
  }, [handleSquareClick]);

  const restart = () => {
    setBoard(startBoard());
    setSelected(null);
    setLegalMoves([]);
    setTurn("w");
    setEnPassant(null);
    setCastleRights({ wK: true, wQ: true, bK: true, bQ: true });
    setStatus("playing");
    setAiThinking(false);
    setLastMove(null);
    setCapturedW([]);
    setCapturedB([]);
  };

  const renderCaptured = (pieces: Piece[]) => {
    const counts: Partial<Record<PieceType, number>> = {};
    for (const p of pieces) counts[p.type] = (counts[p.type] ?? 0) + 1;
    return Object.entries(counts).map(([type, count]) => (
      <span key={type} className="text-sm">
        {(pieces[0]?.color === "w" ? GLYPHS : GLYPHS_B)[type as PieceType]}
        {count! > 1 && <sup className="text-xs">{count}</sup>}
      </span>
    ));
  };

  const statusMsg = status === "checkmate"
    ? (turn === "w" ? "Checkmate — Black wins!" : "Checkmate — White wins!")
    : status === "stalemate" ? "Stalemate — Draw!"
    : status === "check" ? (turn === "w" ? "White is in check!" : "Black is in check!")
    : aiThinking ? "AI thinking…"
    : turn === "w" ? "Your turn (White)" : "Black's turn";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Captured by white (black pieces) */}
      <div className="flex gap-1 items-center min-h-[24px] w-full max-w-[512px] px-1">
        <span className="text-xs text-ink-3 mr-1">Captured:</span>
        {renderCaptured(capturedB)}
      </div>

      {/* Board */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="max-w-full h-auto rounded border-2 border-line cursor-pointer touch-none"
        onClick={handleCanvasClick}
        onTouchEnd={handleTouchEnd}
      />

      {/* Captured by black (white pieces) */}
      <div className="flex gap-1 items-center min-h-[24px] w-full max-w-[512px] px-1">
        <span className="text-xs text-ink-3 mr-1">Captured:</span>
        {renderCaptured(capturedW)}
      </div>

      {/* Status */}
      <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
        status === "checkmate" ? "bg-red-900/50 text-red-300"
        : status === "check" ? "bg-yellow-900/50 text-yellow-300"
        : status === "stalemate" ? "bg-paper-2 text-ink-2"
        : aiThinking ? "bg-blue-900/50 text-blue-300 animate-pulse"
        : "bg-paper-2 text-ink-2"
      }`}>
        {statusMsg}
      </div>

      {(status === "checkmate" || status === "stalemate") && (
        <button
          onClick={restart}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-ink rounded-lg font-semibold transition-colors"
        >
          Play Again
        </button>
      )}

      {status === "playing" && !aiThinking && (
        <button
          onClick={restart}
          className="text-xs text-ink-3 hover:text-ink-2 transition-colors"
        >
          New game
        </button>
      )}
    </div>
  );
}
