/**
 * Rabin-Karp string matching — "The Digital Fingerprint".
 * Rolling hash with base d and modulus q; character-by-character
 * verification only when hashes collide.
 *
 * Doc-example calibration: with d = 10, q = 241 and A=1..Z=26,
 * the pattern "CONT" hashes to 81 — exactly the value shown in the
 * course slides (4660 mod 241 = 81).
 */

export type RKStepKind = "hash-pattern" | "roll" | "hash-match" | "verify" | "collision" | "match" | "done";

export interface RKStep {
  kind: RKStepKind;
  shift: number;
  hash?: number;
  patternHash?: number;
  comparisons: number;
  matches: number[];
  note: string;
}

export interface RKResult {
  steps: RKStep[];
  matches: number[];
  comparisons: number;
  patternHash: number;
  d: number;
  q: number;
}

/** A=1 .. Z=26 (course convention). Other characters fall back to a positive code. */
export function charValue(ch: string): number {
  const code = ch.codePointAt(0) ?? 0;
  if (code >= 65 && code <= 90) return code - 64; // A-Z
  if (code >= 97 && code <= 122) return code - 96; // a-z
  return (code % 26) + 1;
}

function hashOf(s: string, d: number, q: number): number {
  let h = 0;
  for (const ch of s) h = (h * d + charValue(ch)) % q;
  return h;
}

export function runRabinKarp(rawText: string, rawPattern: string, d = 10, q = 241): RKResult {
  const text = rawText.toUpperCase();
  const pattern = rawPattern.toUpperCase();
  const steps: RKStep[] = [];
  const matches: number[] = [];
  let comparisons = 0;
  const n = text.length;
  const m = pattern.length;

  const snap = (kind: RKStepKind, shift: number, note: string, hash?: number) => {
    steps.push({ kind, shift, hash, patternHash, comparisons, matches: [...matches], note });
  };

  const patternHash = m > 0 ? hashOf(pattern, d, q) : 0;

  if (m === 0 || m > n) {
    snap("done", -1, m === 0 ? "Empty pattern — nothing to search for." : "Pattern longer than text — no possible match.");
    return { steps, matches, comparisons, patternHash, d, q };
  }

  snap("hash-pattern", -1, `Fingerprint the pattern: h("${pattern}") = ${patternHash} (base d=${d}, mod q=${q}).`, patternHash);

  // d^(m-1) mod q — weight of the leading character when rolling.
  let hHigh = 1;
  for (let i = 0; i < m - 1; i++) hHigh = (hHigh * d) % q;

  let h = hashOf(text.slice(0, m), d, q);

  for (let s = 0; s <= n - m; s++) {
    snap("roll", s, s === 0 ? `Window [${s}..${s + m - 1}] = "${text.slice(s, s + m)}" → initial hash ${h}.` : `Roll hash: window [${s}..${s + m - 1}] = "${text.slice(s, s + m)}" → hash ${h} in O(1).`, h);

    if (h === patternHash) {
      snap("hash-match", s, `Fingerprints match: ${h} = ${patternHash}. VERIFY character by character to rule out a collision.`);
      let ok = true;
      for (let j = 0; j < m; j++) {
        comparisons += 1;
        if (text[s + j] !== pattern[j]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        matches.push(s);
        snap("match", s, `Verified! SUSPECT FOUND at index ${s}.`);
      } else {
        snap("collision", s, `Hash collision! Fingerprints matched but the characters differ. Keep sliding.`);
      }
    }

    if (s < n - m) {
      h = (d * (h - charValue(text[s]) * hHigh) + charValue(text[s + m])) % q;
      if (h < 0) h += q;
    }
  }

  snap(
    "done",
    -1,
    matches.length > 0
      ? `Search complete: ${matches.length} occurrence(s) at [${matches.join(", ")}] (${comparisons} character checks).`
      : `Search complete: no match (${comparisons} character checks).`
  );

  return { steps, matches, comparisons, patternHash, d, q };
}