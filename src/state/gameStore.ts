import { create } from "zustand";
import type { SaveData } from "../storage/schema";
import { XP_PER_EXERCISE, XP_PER_LESSON_STAGE } from "../storage/schema";
import { clearSave, loadSave, persistSave } from "../storage/storage";

interface GameStore {
  data: SaveData;
  /** Complete an exercise and award XP once. */
  completeChallenge: (id: string) => void;
  /** Bump the attempt counter without awarding XP (wrong answer submitted). */
  addAttempt: (id: string) => void;
  recordQuiz: (id: string, correct: number, total: number) => void;
  updateSettings: (patch: Partial<SaveData["settings"]>) => void;
  setLessonProgress: (topic: string, stage: number) => void;
  resetAll: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  data: loadSave(),

  completeChallenge: (id) =>
    set((s) => {
      const prev = s.data.challenges[id];
      const alreadyDone = prev?.completed === true;
      const next: SaveData = {
        ...s.data,
        progress: {
          xp: s.data.progress.xp + (alreadyDone ? 0 : XP_PER_EXERCISE),
        },
        challenges: {
          ...s.data.challenges,
          [id]: {
            completed: true,
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
            completed: prev?.completed ?? false,
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

  setLessonProgress: (topic, stage) =>
    set((s) => {
      const current = s.data.lessons[topic] ?? 0;
      const nextStage = Math.max(current, stage);
      const xpGain = nextStage > current ? (nextStage - current) * XP_PER_LESSON_STAGE : 0;
      const next: SaveData = {
        ...s.data,
        progress: { xp: s.data.progress.xp + xpGain },
        lessons: { ...s.data.lessons, [topic]: nextStage },
      };
      persistSave(next);
      return { data: next };
    }),

  resetAll: () =>
    set(() => {
      clearSave();
      try {
        window.localStorage.removeItem("module6:learn-progress");
        window.localStorage.removeItem("module6:exercise-progress");
      } catch {
        /* ignore storage access failures */
      }
      return { data: loadSave() };
    }),
}));
