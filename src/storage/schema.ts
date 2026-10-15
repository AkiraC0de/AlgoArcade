export type AnimSpeed = "slow" | "normal" | "fast";

export interface ChallengeRecord {
  stars: 0 | 1 | 2 | 3;
  attempts: number;
  completedAt?: string;
}

export interface SaveData {
  version: 1;
  progress: { xp: number; coins: number };
  challenges: Record<string, ChallengeRecord>;
  quizScores: Record<string, { correct: number; total: number }>;
  settings: {
    animSpeed: AnimSpeed;
    reducedMotion: boolean;
    scanlines: boolean;
  };
}

export const DEFAULT_SAVE: SaveData = {
  version: 1,
  progress: { xp: 0, coins: 0 },
  challenges: {},
  quizScores: {},
  settings: { animSpeed: "normal", reducedMotion: false, scanlines: true },
};

export const XP_PER_LEVEL = 100;

export function levelFor(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}
