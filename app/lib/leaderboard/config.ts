export const SITE = "pm";

export type GameCfg = { min: number; max: number; lowerIsBetter: boolean };

// Pilot scope, expanded in batch 1 (2026-07-26) to 6 games total.
export const GAMES: Record<string, GameCfg> = {
  "2048": { min: 4, max: 500000, lowerIsBetter: false },
  // Snake: score += 10 per food eaten (app/components/SnakeGame.tsx). Grid is
  // 20x20 = 400 cells, snake starts at length 3, so the mathematical ceiling
  // (filling the entire board) is (400-3)*10 = 3970. min=10 rejects a
  // trivial 0-food game over; max=4000 sits just above the hard ceiling.
  snake: { min: 10, max: 4000, lowerIsBetter: false },
  // Flappy Bird: score += 1 per pipe passed (app/components/FlappyBird.tsx).
  // Pipe speed/gap never increase (no difficulty ramp), so a skilled/very
  // long run can keep scoring indefinitely. min=1 rejects a 0-pipe crash;
  // max=2000 is far beyond realistic elite human runs (typically low
  // hundreds) while still bounding absurd injected values.
  flappy: { min: 1, max: 2000, lowerIsBetter: false },
  // Block Drop (Tetris-like): score comes from two sources
  // (app/components/BlockDrop.tsx) — hard-drop soft points (+2/row) and line
  // clears (LINE_POINTS[n] * level, level = floor(lines/10)+1, uncapped).
  // This is mathematically unbounded (endless mode), so max is a pragmatic
  // ceiling, not a hard limit: reaching level 50 (490 lines) needed for a
  // single 40,000-pt tetris clear already implies a long marathon session.
  // min=1 rejects a trivial 0-drop, 0-clear game over; max=200000 is far
  // beyond what a genuine (non-bot) marathon session would realistically
  // accumulate.
  "block-drop": { min: 1, max: 200000, lowerIsBetter: false },
  // Breakout: +10 per brick (60 bricks/level, unscaled by level) + a flat
  // +100 level-clear bonus (app/components/BreakoutGame.tsx) = 700/level
  // cleared. Ball/paddle speed scale up with level without a level cap, so
  // in practice human skill caps out well before absurd scores. min=1
  // rejects the trivial "lost all 3 lives without breaking a brick" case;
  // max=50000 (~70+ levels) generously exceeds elite human play.
  breakout: { min: 1, max: 50000, lowerIsBetter: false },
  // Space Invaders: normal alien=10, tough=20, elite=30
  // (app/components/SpaceInvaders.tsx). Rows/cols cap at 8x11 by level ~20,
  // so per-level value plateaus around ~1800-2000; levels are endless
  // afterward, capped in practice by human reflexes as alien speed and
  // shot interval keep scaling. min=1 rejects a trivial 0-kill game over;
  // max=100000 (~50+ post-cap levels) generously exceeds elite human play.
  "space-invaders": { min: 1, max: 100000, lowerIsBetter: false },
};

// Single source of truth for score direction across the family scoreboard —
// derived once here so FamilyBoard, storage's cross-tab merge, and any
// future consumer read the same table instead of each keeping an
// independently-derived copy that can silently drift from GAMES.
export const LOWER_BOARDS: ReadonlySet<string> = new Set(
  Object.entries(GAMES)
    .filter(([, cfg]) => cfg.lowerIsBetter)
    .map(([id]) => id),
);
