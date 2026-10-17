export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: Record<string, string> = {
  "augmenting path": "A path from source to sink in the residual graph along which additional flow can be pushed.",
  "residual capacity": "The remaining capacity on an edge: c(u,v) - f(u,v). Also includes reverse-edge capacity f(v,u).",
  "residual graph": "A graph showing remaining capacity on every edge, including reverse edges that allow undoing flow.",
  "bottleneck": "The minimum residual capacity along an augmenting path — the maximum flow that can be pushed on that path.",
  "max-flow min-cut": "The theorem stating that the maximum flow value equals the capacity of the minimum s-t cut.",
  "bad character rule": "Boyer-Moore heuristic: when a mismatch occurs at position j, shift the pattern so the mismatched text character aligns with its rightmost occurrence in the pattern (or past it).",
  "bad-match table": "A precomputed table mapping each character to the maximum shift it allows under the bad character rule.",
  "rolling hash": "A hash function where the hash of the next window is computed from the previous window in O(1) by removing the leading character and adding the trailing one.",
  "spurious hit": "A hash match between pattern and window that does not correspond to an actual string match — requires character verification.",
  "comparison": "A single character-vs-character equality check performed by the algorithm.",
  "shift": "Moving the pattern one or more positions to the right relative to the text.",
  "worst case": "The input configuration that forces the algorithm to perform the maximum number of comparisons.",
  "sublinear": "An algorithm whose running time grows slower than the input size — Boyer-Moore's best case is O(n/m).",
};
