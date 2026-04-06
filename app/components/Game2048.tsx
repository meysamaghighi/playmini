"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// Import DownloadButton pattern (not used but kept for consistency)
// import DownloadButton from "./DownloadButton";

const SIZE = 4;

type CellValue = number | null;
type TileType = "normal" | "locked" | "timer" | "stone";

interface TileData {
  value: number | null;
  type: TileType;
  timerCount?: number;
}

type GameBoard = TileData[][];
type GameMode = "levelSelect" | "playing";
type PowerUpType = "undo" | "remove" | "shuffle";
type AnimState = "new" | "merge" | null;

interface LevelConfig {
  name: string;
  target: number;
  lockedTiles: number;
  timerTiles: number;
  stoneTiles: number;
}

// Tile colors with shadows for visual appeal
const TILE_COLORS: Record<number, { bg: string; text: string; shadow: string }> = {
  2:    { bg: "#eee4da", text: "#776e65", shadow: "rgba(238,228,218,0.4)" },
  4:    { bg: "#ede0c8", text: "#776e65", shadow: "rgba(237,224,200,0.4)" },
  8:    { bg: "#f2b179", text: "#f9f6f2", shadow: "rgba(242,177,121,0.5)" },
  16:   { bg: "#f59563", text: "#f9f6f2", shadow: "rgba(245,149,99,0.5)" },
  32:   { bg: "#f67c5f", text: "#f9f6f2", shadow: "rgba(246,124,95,0.5)" },
  64:   { bg: "#f65e3b", text: "#f9f6f2", shadow: "rgba(246,94,59,0.5)" },
  128:  { bg: "#edcf72", text: "#f9f6f2", shadow: "rgba(237,207,114,0.6)" },
  256:  { bg: "#edcc61", text: "#f9f6f2", shadow: "rgba(237,204,97,0.6)" },
  512:  { bg: "#edc850", text: "#f9f6f2", shadow: "rgba(237,200,80,0.6)" },
  1024: { bg: "#edc53f", text: "#f9f6f2", shadow: "rgba(237,197,63,0.7)" },
  2048: { bg: "#edc22e", text: "#f9f6f2", shadow: "rgba(237,194,46,0.8)" },
  4096: { bg: "#3c3a32", text: "#f9f6f2", shadow: "rgba(60,58,50,0.8)" },
  8192: { bg: "#3c3a32", text: "#f9f6f2", shadow: "rgba(60,58,50,0.9)" },
};

// 10 levels with progressive difficulty
const LEVELS: LevelConfig[] = [
  { name: "Getting Started", target: 500, lockedTiles: 0, timerTiles: 0, stoneTiles: 0 },
  { name: "Warming Up", target: 1200, lockedTiles: 0, timerTiles: 0, stoneTiles: 0 },
  { name: "Building Up", target: 2500, lockedTiles: 2, timerTiles: 0, stoneTiles: 0 },
  { name: "Tricky Tiles", target: 4000, lockedTiles: 3, timerTiles: 0, stoneTiles: 0 },
  { name: "Speed Merge", target: 6000, lockedTiles: 1, timerTiles: 2, stoneTiles: 0 },
  { name: "Obstacle Course", target: 8500, lockedTiles: 0, timerTiles: 0, stoneTiles: 2 },
  { name: "Double Trouble", target: 12000, lockedTiles: 2, timerTiles: 0, stoneTiles: 2 },
  { name: "Race Against Time", target: 16000, lockedTiles: 0, timerTiles: 3, stoneTiles: 2 },
  { name: "Expert Mode", target: 22000, lockedTiles: 2, timerTiles: 2, stoneTiles: 2 },
  { name: "Ultimate Challenge", target: 30000, lockedTiles: 3, timerTiles: 3, stoneTiles: 3 },
];

// ============================================================================
// BOARD UTILITY FUNCTIONS
// ============================================================================

function emptyGameBoard(): GameBoard {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ value: null, type: "normal" as TileType }))
  );
}

function addRandomTile(board: GameBoard, level: number, isEndless: boolean): GameBoard {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].value === null && board[r][c].type === "normal") {
        empty.push([r, c]);
      }
    }
  }

  if (empty.length === 0) return board;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = board.map(row => row.map(cell => ({ ...cell })));

  const config = isEndless ? LEVELS[9] : LEVELS[level - 1];
  const shouldBeSpecial = Math.random() < 0.15;

  // Add special tiles based on level config
  if (shouldBeSpecial && level >= 3) {
    const types: TileType[] = [];
    if (config.lockedTiles > 0) types.push("locked");
    if (config.timerTiles > 0) types.push("timer");

    if (types.length > 0) {
      const type = types[Math.floor(Math.random() * types.length)];
      next[r][c] = {
        value: Math.random() < 0.9 ? 2 : 4,
        type,
        timerCount: type === "timer" ? 5 : undefined,
      };
      return next;
    }
  }

  // Regular tile
  next[r][c] = {
    value: Math.random() < 0.9 ? 2 : 4,
    type: "normal",
  };
  return next;
}

function addStoneTiles(board: GameBoard, count: number): GameBoard {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].value === null && board[r][c].type === "normal") {
        empty.push([r, c]);
      }
    }
  }

  if (empty.length === 0) return board;

  const next = board.map(row => row.map(cell => ({ ...cell })));
  const toPlace = Math.min(count, empty.length);

  for (let i = 0; i < toPlace; i++) {
    const idx = Math.floor(Math.random() * empty.length);
    const [r, c] = empty.splice(idx, 1)[0];
    next[r][c] = { value: 0, type: "stone" };
  }

  return next;
}

function unlockAdjacentTiles(board: GameBoard, r: number, c: number): GameBoard {
  const next = board.map(row => row.map(cell => ({ ...cell })));
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && next[nr][nc].type === "locked") {
      next[nr][nc].type = "normal";
    }
  }

  return next;
}

function decrementTimers(board: GameBoard): GameBoard {
  const next = board.map(row => row.map(cell => ({ ...cell })));

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = next[r][c];
      if (cell.type === "timer" && cell.value !== null && cell.timerCount !== undefined) {
        cell.timerCount--;

        // When timer expires, split tile into two half-value tiles
        if (cell.timerCount <= 0) {
          const halfVal = Math.floor(cell.value / 2);
          if (halfVal >= 2) {
            // Find empty spot for second half
            const empty: [number, number][] = [];
            for (let i = 0; i < SIZE; i++) {
              for (let j = 0; j < SIZE; j++) {
                if (next[i][j].value === null && next[i][j].type === "normal") {
                  empty.push([i, j]);
                }
              }
            }

            if (empty.length > 0) {
              const [er, ec] = empty[Math.floor(Math.random() * empty.length)];
              next[er][ec] = { value: halfVal, type: "normal" };
            }
            next[r][c] = { value: halfVal, type: "normal" };
          } else {
            next[r][c] = { value: null, type: "normal" };
          }
        }
      }
    }
  }

  return next;
}

function removeLowestTiles(board: GameBoard, count: number): GameBoard {
  const tiles: { r: number; c: number; value: number }[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].value !== null && board[r][c].type === "normal" && board[r][c].value! > 0) {
        tiles.push({ r, c, value: board[r][c].value! });
      }
    }
  }

  tiles.sort((a, b) => a.value - b.value);
  const toRemove = tiles.slice(0, Math.min(count, tiles.length));

  const next = board.map(row => row.map(cell => ({ ...cell })));
  toRemove.forEach(({ r, c }) => {
    next[r][c] = { value: null, type: "normal" };
  });

  return next;
}

// ============================================================================
// MOVEMENT FUNCTIONS
// ============================================================================

function slideRow(row: TileData[]): {
  result: TileData[];
  points: number;
  moved: boolean;
  unlockPositions: number[]
} {
  // Extract movable tiles (not stone or locked)
  const tiles = row.filter(t => t.value !== null && t.type !== "stone" && t.type !== "locked");
  const stones = row.map((t, i) => t.type === "stone" ? i : -1).filter(i => i >= 0);
  const locked = row.map((t, i) => t.type === "locked" ? i : -1).filter(i => i >= 0);

  const result: TileData[] = Array.from({ length: SIZE }, () => ({ value: null, type: "normal" as TileType }));
  let points = 0;
  const unlockPositions: number[] = [];

  // Place stones and locked tiles back
  stones.forEach(pos => {
    result[pos] = { value: 0, type: "stone" };
  });

  locked.forEach(pos => {
    result[pos] = { ...row[pos] };
  });

  // Find first empty position
  let writeIdx = 0;
  while (writeIdx < SIZE && result[writeIdx].type === "stone") writeIdx++;

  // Process tiles with merging
  let i = 0;
  while (i < tiles.length) {
    if (writeIdx >= SIZE) break;

    // Skip stones and locked tiles
    if (result[writeIdx].type === "stone" || result[writeIdx].type === "locked") {
      writeIdx++;
      continue;
    }

    // Check for merge
    if (i + 1 < tiles.length &&
        tiles[i].value === tiles[i + 1].value &&
        tiles[i].type === "normal" &&
        tiles[i + 1].type === "normal") {
      const merged = tiles[i].value! * 2;
      result[writeIdx] = { value: merged, type: "normal" };
      points += merged;
      unlockPositions.push(writeIdx);
      i += 2;
      writeIdx++;
      while (writeIdx < SIZE && (result[writeIdx].type === "stone" || result[writeIdx].type === "locked")) {
        writeIdx++;
      }
    } else {
      result[writeIdx] = { ...tiles[i] };
      i++;
      writeIdx++;
      while (writeIdx < SIZE && (result[writeIdx].type === "stone" || result[writeIdx].type === "locked")) {
        writeIdx++;
      }
    }
  }

  // Check if board actually changed
  const moved = row.some((cell, idx) => {
    if (cell.type === "stone" || cell.type === "locked") return false;
    return cell.value !== result[idx].value || cell.type !== result[idx].type;
  });

  return { result, points, moved, unlockPositions };
}

function transpose(board: GameBoard): GameBoard {
  return board[0].map((_, c) => board.map(row => ({ ...row[c] })));
}

function reverseRows(board: GameBoard): GameBoard {
  return board.map(row => [...row].reverse().map(cell => ({ ...cell })));
}

function moveLeft(board: GameBoard) {
  let totalPoints = 0;
  let anyMoved = false;
  const unlocks: [number, number][] = [];

  const next = board.map((row, r) => {
    const { result, points, moved, unlockPositions } = slideRow(row);
    totalPoints += points;
    if (moved) anyMoved = true;
    unlockPositions.forEach(c => unlocks.push([r, c]));
    return result;
  });

  return { board: next, points: totalPoints, moved: anyMoved, unlocks };
}

function moveRight(board: GameBoard) {
  const flipped = reverseRows(board);
  const { board: moved, points, moved: anyMoved, unlocks } = moveLeft(flipped);
  const finalBoard = reverseRows(moved);
  const flippedUnlocks: [number, number][] = unlocks.map(([r, c]) => [r, SIZE - 1 - c]);
  return { board: finalBoard, points, moved: anyMoved, unlocks: flippedUnlocks };
}

function moveUp(board: GameBoard) {
  const t = transpose(board);
  const { board: moved, points, moved: anyMoved, unlocks } = moveLeft(t);
  const finalBoard = transpose(moved);
  const transposedUnlocks: [number, number][] = unlocks.map(([r, c]) => [c, r]);
  return { board: finalBoard, points, moved: anyMoved, unlocks: transposedUnlocks };
}

function moveDown(board: GameBoard) {
  const t = transpose(board);
  const { board: moved, points, moved: anyMoved, unlocks } = moveRight(t);
  const finalBoard = transpose(moved);
  const transposedUnlocks: [number, number][] = unlocks.map(([r, c]) => [c, r]);
  return { board: finalBoard, points, moved: anyMoved, unlocks: transposedUnlocks };
}

function canMove(board: GameBoard): boolean {
  // Check for empty cells
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].value === null && board[r][c].type === "normal") return true;

      const cell = board[r][c];
      if (cell.value !== null && cell.type === "normal") {
        // Check right neighbor
        if (c < SIZE - 1) {
          const right = board[r][c + 1];
          if (right.type === "normal" && right.value === cell.value) return true;
        }
        // Check down neighbor
        if (r < SIZE - 1) {
          const down = board[r + 1][c];
          if (down.type === "normal" && down.value === cell.value) return true;
        }
      }
    }
  }
  return false;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Game2048() {
  // Mode and level state
  const [mode, setMode] = useState<GameMode>("levelSelect");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isEndless, setIsEndless] = useState(false);
  const [maxLevel, setMaxLevel] = useState(1);

  // Game state
  const [board, setBoard] = useState<GameBoard>(emptyGameBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Power-ups state (earned every 2 levels)
  const [powerUps, setPowerUps] = useState<Record<PowerUpType, number>>({
    undo: 0,
    remove: 0,
    shuffle: 0,
  });
  const [removingTile, setRemovingTile] = useState(false);
  const [history, setHistory] = useState<{ board: GameBoard; score: number; lives: number }[]>([]);

  // Animation state
  const [anims, setAnims] = useState<AnimState[][]>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  );
  const [scorePopup, setScorePopup] = useState<{ value: number; key: number } | null>(null);
  const [levelUpText, setLevelUpText] = useState<string | null>(null);
  const [powerUpFeedback, setPowerUpFeedback] = useState<{ type: PowerUpType; action: "used" | "earned" } | null>(null);

  // Refs
  const prevBoardRef = useRef<GameBoard>(emptyGameBoard());
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const popupKeyRef = useRef(0);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const saved = localStorage.getItem("pb-2048");
    if (saved) setBest(parseInt(saved, 10));

    const savedLevel = localStorage.getItem("pb-2048-level");
    if (savedLevel) setMaxLevel(parseInt(savedLevel, 10));
  }, []);

  // ============================================================================
  // LEVEL MANAGEMENT
  // ============================================================================

  const startLevel = (level: number, endless: boolean = false) => {
    let b = emptyGameBoard();
    b = addRandomTile(b, level, endless);
    b = addRandomTile(b, level, endless);

    // Add initial stone tiles for levels with obstacles
    if (!endless && level >= 6) {
      const config = LEVELS[level - 1];
      b = addStoneTiles(b, Math.min(config.stoneTiles, 1));
    }

    setBoard(b);
    prevBoardRef.current = b;
    setScore(0);
    setLives(3);
    setGameOver(false);
    setCurrentLevel(level);
    setIsEndless(endless);
    setHistory([]);
    setRemovingTile(false);
    setLevelUpText(null);
    setMode("playing");

    // Animate initial tiles
    const a: AnimState[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c].value !== null && b[r][c].value! > 0) a[r][c] = "new";
      }
    }
    setAnims(a);
  };

  const levelUp = () => {
    if (isEndless) return;

    const nextLevel = currentLevel + 1;
    if (nextLevel > 10) {
      setGameOver(true);
      return;
    }

    setCurrentLevel(nextLevel);

    // Update max level
    if (nextLevel > maxLevel) {
      setMaxLevel(nextLevel);
      localStorage.setItem("pb-2048-level", nextLevel.toString());
    }

    // Award power-ups every 2 levels (max 3 of each)
    if (nextLevel % 2 === 0) {
      setPowerUps(prev => ({
        undo: Math.min(3, prev.undo + 1),
        remove: Math.min(3, prev.remove + 1),
        shuffle: Math.min(3, prev.shuffle + 1),
      }));

      // Show power-up earned notification
      setTimeout(() => {
        setPowerUpFeedback({ type: "undo", action: "earned" });
        setTimeout(() => setPowerUpFeedback(null), 2000);
      }, 1600);
    }

    // Show level-up animation
    setLevelUpText(`Level ${nextLevel}: ${LEVELS[nextLevel - 1].name}`);
    setTimeout(() => setLevelUpText(null), 1500);

    // Add more obstacles for higher levels
    const config = LEVELS[nextLevel - 1];
    let newBoard = board;

    if (config.stoneTiles > 0 && Math.random() < 0.5) {
      newBoard = addStoneTiles(newBoard, 1);
    }

    setBoard(newBoard);
    prevBoardRef.current = newBoard;
  };

  // ============================================================================
  // MOVEMENT HANDLING
  // ============================================================================

  const doMove = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (gameOver || removingTile) return;

      const moveFn = { left: moveLeft, right: moveRight, up: moveUp, down: moveDown }[dir];
      const { board: moved, points, moved: anyMoved, unlocks } = moveFn(board);

      if (!anyMoved) return;

      // Save history for undo (keep last 5)
      setHistory(prev => [
        ...prev,
        { board: board.map(r => r.map(c => ({ ...c }))), score, lives }
      ].slice(-5));

      // Unlock adjacent tiles after merges
      let afterUnlock = moved;
      unlocks.forEach(([r, c]) => {
        afterUnlock = unlockAdjacentTiles(afterUnlock, r, c);
      });

      // Decrement timers and handle expired ones
      const afterTimer = decrementTimers(afterUnlock);

      // Add new random tile
      const withNew = addRandomTile(afterTimer, currentLevel, isEndless);

      // Update score
      const newScore = score + points;
      setScore(newScore);
      if (newScore > best) {
        setBest(newScore);
        localStorage.setItem("pb-2048", newScore.toString());
      }

      // Show score popup
      if (points > 0) {
        popupKeyRef.current += 1;
        setScorePopup({ value: points, key: popupKeyRef.current });
        setTimeout(() => {
          setScorePopup(prev => prev?.key === popupKeyRef.current ? null : prev);
        }, 800);
      }

      // Animate tiles
      const a: AnimState[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          // New tile
          if (withNew[r][c].value !== null && withNew[r][c].value! > 0 && moved[r][c].value === null) {
            a[r][c] = "new";
          }
          // Merged tile
          else if (
            withNew[r][c].value !== null &&
            withNew[r][c].value! > 0 &&
            prevBoardRef.current[r][c].value !== null &&
            withNew[r][c].value! > prevBoardRef.current[r][c].value!
          ) {
            a[r][c] = "merge";
          }
        }
      }
      setAnims(a);

      prevBoardRef.current = withNew;
      setBoard(withNew);

      // Check for level completion
      if (!isEndless) {
        const target = LEVELS[currentLevel - 1].target;
        if (newScore >= target) {
          setTimeout(() => levelUp(), 500);
        }
      }

      // Check for game over (lives system)
      if (!canMove(withNew)) {
        if (lives > 1) {
          // Lose a life, remove 3 lowest tiles
          setLives(lives - 1);
          const cleared = removeLowestTiles(withNew, 3);
          setBoard(cleared);
          prevBoardRef.current = cleared;
        } else {
          // Game over
          setGameOver(true);
        }
      }
    },
    [board, score, best, gameOver, lives, currentLevel, isEndless, removingTile]
  );

  // ============================================================================
  // INPUT HANDLING
  // ============================================================================

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      if (map[e.key]) {
        e.preventDefault();
        doMove(map[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doMove]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (removingTile) return;
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current || removingTile) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      doMove(dx > 0 ? "right" : "left");
    } else {
      doMove(dy > 0 ? "down" : "up");
    }
  };

  // ============================================================================
  // POWER-UPS
  // ============================================================================

  const usePowerUp = (type: PowerUpType) => {
    if (powerUps[type] <= 0 || gameOver) return;

    // Show feedback immediately
    setPowerUpFeedback({ type, action: "used" });
    setTimeout(() => setPowerUpFeedback(null), 1000);

    if (type === "undo") {
      if (history.length === 0) return;
      const last = history[history.length - 1];
      setBoard(last.board.map(r => r.map(c => ({ ...c }))));
      setScore(last.score);
      setLives(last.lives);
      setHistory(prev => prev.slice(0, -1));
      prevBoardRef.current = last.board;
      setPowerUps(prev => ({ ...prev, undo: prev.undo - 1 }));
    }
    else if (type === "remove") {
      setRemovingTile(true);
      setPowerUps(prev => ({ ...prev, remove: prev.remove - 1 }));
    }
    else if (type === "shuffle") {
      // Collect all normal tiles with values
      const tiles = board.flat().filter(t => t.value !== null && t.type === "normal" && t.value! > 0);
      const positions: [number, number][] = [];

      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (board[r][c].value !== null && board[r][c].type === "normal" && board[r][c].value! > 0) {
            positions.push([r, c]);
          }
        }
      }

      // Shuffle tiles
      const shuffled = [...tiles].sort(() => Math.random() - 0.5);
      const next = board.map(row => row.map(cell => ({ ...cell })));

      // Clear positions
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (next[r][c].value !== null && next[r][c].type === "normal" && next[r][c].value! > 0) {
            next[r][c] = { value: null, type: "normal" };
          }
        }
      }

      // Place shuffled tiles
      positions.forEach((pos, i) => {
        next[pos[0]][pos[1]] = shuffled[i];
      });

      setBoard(next);
      prevBoardRef.current = next;
      setPowerUps(prev => ({ ...prev, shuffle: prev.shuffle - 1 }));
    }
  };

  const handleTileClick = (r: number, c: number) => {
    if (!removingTile) return;

    // Can only remove normal tiles with values
    if (board[r][c].value === null || board[r][c].type !== "normal" || board[r][c].value! <= 0) {
      setRemovingTile(false);
      return;
    }

    const next = board.map(row => row.map(cell => ({ ...cell })));
    next[r][c] = { value: null, type: "normal" };
    setBoard(next);
    prevBoardRef.current = next;
    setRemovingTile(false);
  };

  // ============================================================================
  // SHARING
  // ============================================================================

  const handleShare = async () => {
    const levelText = isEndless ? "Endless Mode" : `Level ${currentLevel}`;
    const text = `I scored ${score} in 2048 (${levelText})! https://playmini.fun/2048`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Score copied to clipboard!");
      } catch {}
    }
  };

  // ============================================================================
  // RENDERING HELPERS
  // ============================================================================

  const fontSize = (val: number) => {
    if (val >= 1024) return "text-base sm:text-lg";
    if (val >= 128) return "text-lg sm:text-xl";
    return "text-xl sm:text-2xl";
  };

  // ============================================================================
  // RENDER: LEVEL SELECT SCREEN
  // ============================================================================

  if (mode === "levelSelect") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-slate-800 rounded-2xl p-6 mb-4">
          <h2 className="text-2xl font-black text-white mb-4 text-center">Select Level</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {LEVELS.map((level, i) => {
              const levelNum = i + 1;
              const unlocked = levelNum <= maxLevel;
              return (
                <button
                  key={i}
                  onClick={() => unlocked && startLevel(levelNum)}
                  disabled={!unlocked}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    unlocked
                      ? "bg-amber-600 hover:bg-amber-500 text-white hover:scale-105 active:scale-95"
                      : "bg-slate-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <div className="text-sm opacity-80">Level {levelNum}</div>
                  <div className="text-base">{level.name}</div>
                  <div className="text-xs opacity-60 mt-1">Target: {level.target}</div>
                  {!unlocked && <div className="text-xs mt-1">🔒</div>}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => startLevel(1, true)}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Endless Mode
          </button>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-sm">High Score</div>
          <div className="text-2xl font-black text-amber-400 tabular-nums">{best}</div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: PLAYING SCREEN
  // ============================================================================

  const target = isEndless ? 0 : LEVELS[currentLevel - 1].target;
  const progress = isEndless ? 0 : Math.min(100, (score / target) * 100);

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Level info bar */}
      <div className="bg-slate-800 rounded-xl p-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              {isEndless ? "Endless Mode" : `Level ${currentLevel}`}
            </div>
            <div className="text-sm font-bold text-white">
              {isEndless ? "No Limit" : LEVELS[currentLevel - 1].name}
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 ${i < lives ? "text-red-500" : "text-gray-700"}`}
              >
                ♥
              </div>
            ))}
          </div>
        </div>
        {!isEndless && (
          <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Score bar */}
      <div className="flex justify-between items-center mb-3 gap-2">
        <div className="bg-slate-800 rounded-xl px-4 py-2 text-center min-w-[70px] relative">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Score</div>
          <div className="text-lg font-black text-white tabular-nums">{score}</div>
          {scorePopup && (
            <div
              key={scorePopup.key}
              className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 font-black text-sm pointer-events-none"
              style={{ animation: "scoreFloat 800ms ease-out forwards" }}
            >
              +{scorePopup.value}
            </div>
          )}
        </div>
        <div className="bg-slate-800 rounded-xl px-4 py-2 text-center min-w-[70px]">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-lg font-black text-amber-400 tabular-nums">{best}</div>
        </div>
        <button
          onClick={() => setMode("levelSelect")}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 text-sm"
        >
          Menu
        </button>
      </div>

      {/* Level-up flash (non-blocking) */}
      {levelUpText && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            className="bg-amber-500 text-white font-black text-2xl px-8 py-4 rounded-2xl shadow-2xl"
            style={{ animation: "fadeInOut 1500ms ease-out" }}
          >
            {levelUpText}
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {gameOver && (
        <div className="bg-slate-800 border-2 border-amber-500/50 rounded-xl p-4 mb-3 text-center">
          <div className="text-2xl font-black text-white mb-1">Game Over!</div>
          <p className="text-gray-400 text-sm mb-3">
            {isEndless ? `Score: ${score}` : `Level ${currentLevel} - Score: ${score}`}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => startLevel(currentLevel, isEndless)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Retry
            </button>
            <button
              onClick={handleShare}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Share
            </button>
          </div>
        </div>
      )}

      {/* Game board */}
      <div
        className="bg-slate-800 rounded-2xl p-2.5 sm:p-3 mb-3"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {board.flat().map((tile, i) => {
            const r = Math.floor(i / SIZE);
            const c = i % SIZE;
            const anim = anims[r][c];

            let bgColor = "#1e293b";
            let textColor = "transparent";
            let shadow = "none";
            let displayValue: string | number = "";

            // Stone tile (gray, immovable)
            if (tile.type === "stone") {
              bgColor = "#64748b";
              textColor = "#1e293b";
            }
            // Normal tiles
            else if (tile.value !== null && tile.value > 0) {
              const colors = TILE_COLORS[tile.value] || {
                bg: "#3c3a32",
                text: "#f9f6f2",
                shadow: "rgba(60,58,50,0.5)"
              };
              bgColor = colors.bg;
              textColor = colors.text;
              shadow = `0 2px 8px ${colors.shadow}`;
              displayValue = tile.value;
            }

            // Animation classes
            let animStyle = "";
            if (anim === "new") animStyle = "tile-new";
            else if (anim === "merge") animStyle = "tile-merge";

            // Clickable when removing
            const isClickable = removingTile && tile.value !== null && tile.type === "normal" && tile.value > 0;

            return (
              <div
                key={i}
                onClick={() => handleTileClick(r, c)}
                className={`aspect-square rounded-lg sm:rounded-xl flex items-center justify-center font-extrabold relative ${animStyle} ${
                  isClickable ? "cursor-pointer ring-2 ring-red-500 ring-offset-2 ring-offset-slate-800" : ""
                }`}
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  boxShadow: shadow,
                }}
              >
                {/* Locked tile overlay */}
                {tile.type === "locked" && tile.value !== null && tile.value > 0 && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <div className="absolute top-1 right-1 text-xs">🔒</div>
                  </div>
                )}

                {/* Timer tile countdown */}
                {tile.type === "timer" && tile.value !== null && tile.value > 0 && (
                  <div className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {tile.timerCount}
                  </div>
                )}

                {/* Tile value */}
                {displayValue && (
                  <span className={fontSize(tile.value!)}>
                    {displayValue}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Power-up feedback popup */}
      {powerUpFeedback && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            className={`${
              powerUpFeedback.action === "earned" ? "bg-green-500" : "bg-amber-500"
            } text-white font-black text-xl px-6 py-3 rounded-xl shadow-2xl`}
            style={{ animation: "fadeInOut 1000ms ease-out" }}
          >
            {powerUpFeedback.action === "earned"
              ? "+1 Power-up (All Types)"
              : `${powerUpFeedback.type.charAt(0).toUpperCase() + powerUpFeedback.type.slice(1)} Used!`}
          </div>
        </div>
      )}

      {/* Power-ups (3 buttons) */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => usePowerUp("undo")}
          disabled={powerUps.undo <= 0 || gameOver}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm transition-all border-2 ${
            powerUps.undo > 0 && !gameOver
              ? "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95 border-blue-400"
              : "bg-slate-700/50 text-gray-400 cursor-not-allowed border-slate-600"
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <span>↶</span>
            <span>Undo</span>
          </div>
          <div className={`text-xs font-bold mt-0.5 ${powerUps.undo > 0 ? "opacity-90" : "opacity-60"}`}>
            {powerUps.undo}/3
          </div>
        </button>
        <button
          onClick={() => usePowerUp("remove")}
          disabled={powerUps.remove <= 0 || gameOver}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm transition-all border-2 ${
            powerUps.remove > 0 && !gameOver
              ? removingTile
                ? "bg-red-700 text-white border-red-500 ring-2 ring-red-400"
                : "bg-red-600 hover:bg-red-500 text-white hover:scale-105 active:scale-95 border-red-400"
              : "bg-slate-700/50 text-gray-400 cursor-not-allowed border-slate-600"
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <span>✖</span>
            <span>Remove</span>
          </div>
          <div className={`text-xs font-bold mt-0.5 ${powerUps.remove > 0 ? "opacity-90" : "opacity-60"}`}>
            {powerUps.remove}/3
          </div>
        </button>
        <button
          onClick={() => usePowerUp("shuffle")}
          disabled={powerUps.shuffle <= 0 || gameOver}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm transition-all border-2 ${
            powerUps.shuffle > 0 && !gameOver
              ? "bg-purple-600 hover:bg-purple-500 text-white hover:scale-105 active:scale-95 border-purple-400"
              : "bg-slate-700/50 text-gray-400 cursor-not-allowed border-slate-600"
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <span>⟲</span>
            <span>Shuffle</span>
          </div>
          <div className={`text-xs font-bold mt-0.5 ${powerUps.shuffle > 0 ? "opacity-90" : "opacity-60"}`}>
            {powerUps.shuffle}/3
          </div>
        </button>
      </div>

      {/* Instructions */}
      <p className="text-center text-gray-600 text-xs">
        <span className="hidden md:inline">Arrow keys to move</span>
        <span className="md:hidden">Swipe to move</span>
        {removingTile && <span className="block text-red-500 font-bold mt-1">Click a tile to remove it</span>}
      </p>

      {/* Animations CSS */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popMerge {
          0% { transform: scale(0.8); }
          40% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes scoreFloat {
          0% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -30px); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1.05); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        .tile-new {
          animation: popIn 200ms ease-out;
        }
        .tile-merge {
          animation: popMerge 250ms ease-out;
        }
      `}</style>
    </div>
  );
}
