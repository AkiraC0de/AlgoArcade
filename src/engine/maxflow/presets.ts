import type { FlowGraph } from "./fordFulkerson";

/** Course document example 1: "Simple 17" network (S, A, B, T). Expected max flow 17. */
export const SIMPLE_17: FlowGraph = {
  nodes: ["S", "A", "B", "T"],
  edges: [
    { from: "S", to: "A", capacity: 10 },
    { from: "S", to: "B", capacity: 10 },
    { from: "A", to: "T", capacity: 7 },
    { from: "B", to: "T", capacity: 10 },
  ],
  source: "S",
  sink: "T",
};

/** Course document example 2: "Practice 13" network (S, A, B, C, T). Expected max flow 13. */
export const PRACTICE_13: FlowGraph = {
  nodes: ["S", "A", "B", "C", "T"],
  edges: [
    { from: "S", to: "A", capacity: 8 },
    { from: "S", to: "B", capacity: 10 },
    { from: "A", to: "C", capacity: 4 },
    { from: "A", to: "B", capacity: 3 },
    { from: "B", to: "C", capacity: 5 },
    { from: "B", to: "T", capacity: 7 },
    { from: "C", to: "T", capacity: 6 },
  ],
  source: "S",
  sink: "T",
};

/** Fixed SVG layouts (viewBox 0..400 x 0..240) for the preset networks. */
export const PRESET_LAYOUTS: Record<string, Record<string, [number, number]>> = {
  simple17: { S: [50, 120], A: [200, 50], B: [200, 190], T: [350, 120] },
  practice13: { S: [40, 120], A: [150, 45], B: [150, 195], C: [260, 120], T: [365, 120] },
};