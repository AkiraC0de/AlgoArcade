import { DEFAULT_SAVE, type SaveData } from "./schema";

const KEY = "algo-arcade:v1";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Load the save blob. Any corruption / missing fields fall back to safe defaults. */
export function loadSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_SAVE);
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1) {
      return structuredClone(DEFAULT_SAVE);
    }
    const d = parsed as Partial<SaveData>;
    return {
      version: 1,
      progress: {
        xp: typeof d.progress?.xp === "number" ? d.progress.xp : 0,
        coins: typeof d.progress?.coins === "number" ? d.progress.coins : 0,
      },
      challenges: isRecord(d.challenges) ? (d.challenges as SaveData["challenges"]) : {},
      quizScores: isRecord(d.quizScores) ? (d.quizScores as SaveData["quizScores"]) : {},
      settings: {
        animSpeed:
          d.settings?.animSpeed === "slow" || d.settings?.animSpeed === "fast"
            ? d.settings.animSpeed
            : "normal",
        reducedMotion: !!d.settings?.reducedMotion,
        scanlines: d.settings ? d.settings.scanlines !== false : true,
      },
    };
  } catch {
    return structuredClone(DEFAULT_SAVE);
  }
}

/** Persist the save blob. Returns false on quota/access failure (app keeps working). */
export function persistSave(data: SaveData): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
