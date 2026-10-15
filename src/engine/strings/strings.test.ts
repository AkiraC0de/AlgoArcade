import { describe, expect, it } from "vitest";
import { runNaive } from "./naive";
import { charValue, runRabinKarp } from "./rabinKarp";
import { buildBadMatchTable, runBoyerMoore } from "./boyerMoore";
import { BM_DOC_PATTERN, BM_DOC_TEXT, DOC_PATTERN, DOC_TEXT } from "./presets";

const CASES: Array<[string, string]> = [
  ["FLOODCONTROL", "CONT"],
  ["FLOODCONTOTN", "TOTN"],
  ["AAAAAA", "AAA"],
  ["ABABAB", "ABA"],
  ["ABC", "XYZ"],
  ["A", "A"],
  ["SHORT", "LONGERPATTERN"],
];

describe("cross-algorithm agreement", () => {
  it("naive, rabin-karp and boyer-moore report identical match positions", () => {
    for (const [text, pattern] of CASES) {
      const a = runNaive(text, pattern).matches;
      const rk = runRabinKarp(text, pattern).matches;
      const bm = runBoyerMoore(text, pattern).matches;
      expect(rk, `RK on ${text}/${pattern}`).toEqual(a);
      expect(bm, `BM on ${text}/${pattern}`).toEqual(a);
    }
  });
});

describe("course document examples", () => {
  it(`naive finds "${DOC_PATTERN}" in "${DOC_TEXT}" at index 5`, () => {
    expect(runNaive(DOC_TEXT, DOC_PATTERN).matches).toEqual([5]);
  });

  it(`rabin-karp finds "${DOC_PATTERN}" at index 5 with hash 81 (d=10, q=241)`, () => {
    const res = runRabinKarp(DOC_TEXT, DOC_PATTERN);
    expect(res.matches).toEqual([5]);
    expect(res.patternHash).toBe(81);
    expect(charValue("C")).toBe(3);
    expect(charValue("T")).toBe(20);
  });

  it("rabin-karp respects custom d/q", () => {
    const res = runRabinKarp(DOC_TEXT, DOC_PATTERN, 26, 101);
    expect(res.matches).toEqual([5]);
  });

  it(`boyer-moore builds the doc's Bad Match Table for "${BM_DOC_PATTERN}"`, () => {
    expect(buildBadMatchTable(BM_DOC_PATTERN)).toEqual({ "*": 4, T: 1, O: 2, N: 4 });
  });

  it(`boyer-moore finds "${BM_DOC_PATTERN}" in "${BM_DOC_TEXT}" at index 8`, () => {
    const res = runBoyerMoore(BM_DOC_TEXT, BM_DOC_PATTERN);
    expect(res.matches).toEqual([8]);
    // The doc's walk: mismatch at window 0 (O vs N, shift), window 6 (O vs N, shift), then match.
    const mismatches = res.steps.filter((s) => s.kind === "mismatch");
    expect(mismatches.length).toBeGreaterThan(0);
    for (const mm of mismatches) expect(mm.shiftAmount).toBeGreaterThanOrEqual(1);
  });

  it("boyer-moore can beat naive on comparison count (sub-linear flavor)", () => {
    const text = "FLOODCONTOTN";
    const pattern = "TOTN";
    expect(runBoyerMoore(text, pattern).comparisons).toBeLessThan(runNaive(text, pattern).comparisons);
  });
});

describe("edge cases", () => {
  it("empty pattern returns no matches without crashing", () => {
    expect(runNaive("ABC", "").matches).toEqual([]);
    expect(runRabinKarp("ABC", "").matches).toEqual([]);
    expect(runBoyerMoore("ABC", "").matches).toEqual([]);
  });

  it("pattern longer than text returns no matches", () => {
    expect(runNaive("AB", "ABCD").matches).toEqual([]);
    expect(runRabinKarp("AB", "ABCD").matches).toEqual([]);
    expect(runBoyerMoore("AB", "ABCD").matches).toEqual([]);
  });

  it("overlapping matches are all reported", () => {
    expect(runNaive("ABABAB", "ABA").matches).toEqual([0, 2]);
    expect(runBoyerMoore("ABABAB", "ABA").matches).toEqual([0, 2]);
    expect(runRabinKarp("ABABAB", "ABA").matches).toEqual([0, 2]);
  });

  it("every trace ends with a done step", () => {
    for (const [t, p] of CASES) {
      expect(runNaive(t, p).steps.at(-1)?.kind).toBe("done");
      expect(runRabinKarp(t, p).steps.at(-1)?.kind).toBe("done");
      expect(runBoyerMoore(t, p).steps.at(-1)?.kind).toBe("done");
    }
  });
});