export const SITE = "pm";

export type GameCfg = { min: number; max: number; lowerIsBetter: boolean };

// Pilot scope: exactly one game per site (spec 2026-07-18-leaderboard-design).
export const GAMES: Record<string, GameCfg> = {
  "2048": { min: 4, max: 500000, lowerIsBetter: false },
};
