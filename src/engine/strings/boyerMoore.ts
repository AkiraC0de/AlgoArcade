/**
 * Boyer-Moore string matching.
 * Compares right-to-left inside the window and uses the Bad Character
 * rule (precomputed Bad Match Table) to skip sections of the text.
 *
 * Bad Match Table convention (as taught in the course document):
 *   value(c) = m - 1 - rightmostIndex(c)   when that value is > 0
 *   value(c) = m                           when c only occurs at the last position
 *   value("*") = m                         (characters not in the pattern)
 * For pattern "TOTN" this yields exactly the doc's table:
 *   { "*": 4, T: 1, O: 2, N: 4 }.
 *
 * The Good Suffix rule is explained conceptually in the UI but not
 * implemented (the course document does not detail it) — v1 simplification.
 */

export type BMStepKind = "table" | "compare" | "mismatch" | "match" | "done";

export type BadMatchTable = Record<string, number>;

export interface BMStep {
  kind: BMStepKind;
  shift: number;
  /** Pattern index being compared (right-to-left). */
  j: number;
  table: BadMatchTable;
  /** Shift actually applied after a mismatch. */
  shiftAmount?: number;
  /** Text character that caused a mismatch. */
  mismatchChar?: string;
  comparisons: number;
  matches: number[];
  note: string;
}

export interface BMResult {
  steps: BMStep[];
  matches: number[];
  comparisons: number;
  table: BadMatchTable;
}

export function buildBadMatchTable(pattern: string): BadMatchTable {
  const m = pattern.length;
  const table: BadMatchTable = { "*": m };
  for (let i = 0; i < m; i++) {
    const dist = m - 1 - i;
    // Later (more rightward) occurrences overwrite earlier ones.
    table[pattern[i]] = dist === 0 ? m : dist;
  }
  return table;
}

export function runBoyerMoore(text: string, pattern: string): BMResult {
  const steps: BMStep[] = [];
  const matches: number[] = [];
  let comparisons = 0;
  const n = text.length;
  const m = pattern.length;
  const table = buildBadMatchTable(pattern);

  const snap = (kind: BMStepKind, shift: number, j: number, note: string, extra?: Partial<BMStep>) => {
    steps.push({ kind, shift, j, table, comparisons, matches: [...matches], note, ...extra });
  };

  snap(
    "table",
    -1,
    -1,
    `Bad Match Table built for "${pattern}": ${Object.entries(table)
      .map(([k, v]) => `${k}→${v}`)
      .join(", ")}`
  );

  if (m === 0 || m > n) {
    snap("done", -1, -1, m === 0 ? "Empty pattern — nothing to search for." : "Pattern longer than text — no possible match.");
    return { steps, matches, comparisons, table };
  }

  let s = 0;
  while (s <= n - m) {
    let j = m - 1;
    while (j >= 0 && text[s + j] === pattern[j]) {
      comparisons += 1;
      snap("compare", s, j, `Compare right-to-left: "${text[s + j]}" == "${pattern[j]}" ✓`);
      j -= 1;
    }

    if (j < 0) {
      matches.push(s);
      snap("match", s, 0, `Match found at index ${s}. Slide by 1 to continue searching.`);
      s += 1;
      continue;
    }

    comparisons += 1;
    const c = text[s + j];
    const base = table[c] ?? table["*"];
    const shiftAmount = Math.max(1, base - (m - 1 - j));
    snap(
      "mismatch",
      s,
      j,
      `Mismatch: "${c}" ≠ "${pattern[j]}". Bad Character lookup: "${c}" → ${base}. Shift = max(1, ${base} − ${m - 1 - j}) = ${shiftAmount}. Skip ahead!`,
      { shiftAmount, mismatchChar: c }
    );
    s += shiftAmount;
  }

  snap(
    "done",
    -1,
    -1,
    matches.length > 0
      ? `Search complete: ${matches.length} occurrence(s) at [${matches.join(", ")}] after ${comparisons} comparisons.`
      : `Search complete: no match after ${comparisons} comparisons.`
  );

  return { steps, matches, comparisons, table };
}