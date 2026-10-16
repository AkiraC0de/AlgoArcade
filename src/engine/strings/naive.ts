/**
 * Naive (Brute-Force) string matching.
 * Slides the pattern one position at a time, comparing left to right,
 * restarting comparisons from scratch at every shift.
 */

export type NaiveStepKind = "compare" | "mismatch" | "match" | "done";

export interface NaiveStep {
  kind: NaiveStepKind;
  /** Window start in the text (-1 for done). */
  shift: number;
  /** Pattern index involved (for compare/mismatch). */
  j: number;
  comparisons: number;
  matches: number[];
  note: string;
}

export interface NaiveResult {
  steps: NaiveStep[];
  matches: number[];
  comparisons: number;
}

export function runNaive(text: string, pattern: string): NaiveResult {
  const steps: NaiveStep[] = [];
  const matches: number[] = [];
  let comparisons = 0;
  const n = text.length;
  const m = pattern.length;

  const snap = (kind: NaiveStepKind, shift: number, j: number, note: string) => {
    steps.push({ kind, shift, j, comparisons, matches: [...matches], note });
  };

  if (m === 0) {
    snap("done", -1, -1, "Empty pattern — nothing to search for.");
    return { steps, matches, comparisons };
  }
  if (m > n) {
    snap("done", -1, -1, "Pattern is longer than the text — no possible match.");
    return { steps, matches, comparisons };
  }

  for (let s = 0; s <= n - m; s++) {
    let j = 0;
    while (j < m) {
      comparisons += 1;
      const ok = text[s + j] === pattern[j];
      snap(
        "compare",
        s,
        j,
        `Shift ${s}: is "${text[s + j]}" equal to "${pattern[j]}"? ${ok ? "YES ✓" : "NO ✗"}`
      );
      if (!ok) {
        snap("mismatch", s, j, `Mismatch at text index ${s + j}. Slide the pattern one position right.`);
        break;
      }
      j += 1;
    }
    if (j === m) {
      matches.push(s);
      snap("match", s, m - 1, `Match found at index ${s}.`);
    }
  }

  snap(
    "done",
    -1,
    -1,
    matches.length > 0
      ? `Search complete: ${matches.length} occurrence(s) at [${matches.join(", ")}] after ${comparisons} comparisons.`
      : `Search complete: no match after ${comparisons} comparisons.`
  );

  return { steps, matches, comparisons };
}