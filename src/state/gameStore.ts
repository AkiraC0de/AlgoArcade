import { create } from "zustand";
import type { SaveData } from "../storage/schema";
import { clearSave, loadSave, persistSave } from "../storage/storage";

const REWARD_XP_PER_STAR = 25;
const REWARD_COINS_PER_STAR = 50;

interface GameStore {
  data: SaveData;
  /** Award a challenge result. Stars never decrease; rewards are paid once per challenge. */
  completeChallenge: (id: string, stars: 1 | 2 | 3) => void;
  /** Bump the attempt counter without awarding stars (wrong answer submitted). */
  addAttempt: (id: string) => void;
  recordQuiz: (id: string, correct: number, total: number) => void;
  updateSettings: (patch: Partial<SaveData["settings"]>) => void;
  resetAll: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  data: loadSave(),

  completeChallenge: (id, stars) =>
    set((s) => {
      const prev = s.data.challenges[id];
      const alreadyDone = !!prev && prev.stars > 0;
      const next: SaveData = {
        ...s.data,
        progress: {
          xp: s.data.progress.xp + (alreadyDone ? 0 : stars * REWARD_XP_PER_STAR),
          coins: s.data.progress.coins + (alreadyDone ? 0 : stars * REWARD_COINS_PER_STAR),
        },
        challenges: {
          ...s.data.challenges,
          [id]: {
            stars: Math.max(prev?.stars ?? 0, stars) as 1 | 2 | 3,
            attempts: (prev?.attempts ?? 0) + 1,
            completedAt: prev?.completedAt ?? new Date().toISOString(),
          },
        },
      };
      persistSave(next);
      return { data: next };
    }),

  addAttempt: (id) =>
    set((s) => {
      const prev = s.data.challenges[id];
      const next: SaveData = {
        ...s.data,
        challenges: {
          ...s.data.challenges,
          [id]: {
            stars: prev?.stars ?? 0,
            attempts: (prev?.attempts ?? 0) + 1,
            completedAt: prev?.completedAt,
          },
        },
      };
      persistSave(next);
      return { data: next };
    }),

  recordQuiz: (id, correct, total) =>
    set((s) => {
      const best = s.data.quizScores[id];
      if (best && best.correct >= correct) return {};
      const next: SaveData = {
        ...s.data,
        quizScores: { ...s.data.quizScores, [id]: { correct, total } },
      };
      persistSave(next);
      return { data: next };
    }),

  updateSettings: (patch) =>
    set((s) => {
      const next: SaveData = {
        ...s.data,
        settings: { ...s.data.settings, ...patch },
      };
      persistSave(next);
      return { data: next };
    }),

  resetAll: () =>
    set(() => {
      clearSave();
      return { data: loadSave() };
    }),
}));

/** Stars from attempt count: first try = 3, second = 2, after that = 1. */
export function starsForAttempts(attempts: number): 1 | 2 | 3 {
  if (attempts <= 1) return 3;
  if (attempts === 2) return 2;
  return 1;
}
