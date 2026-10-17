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

/** Diamond network — small 4-node graph. Expected max flow 9 (min cut {S,B} = S→A + B→T). */
export const DIAMOND_9: FlowGraph = {
  nodes: ["S", "A", "B", "T"],
  edges: [
    { from: "S", to: "A", capacity: 5 },
    { from: "S", to: "B", capacity: 8 },
    { from: "A", to: "T", capacity: 6 },
    { from: "B", to: "T", capacity: 4 },
    { from: "A", to: "B", capacity: 2 },
  ],
  source: "S",
  sink: "T",
};

/** Classic textbook (CLRS) network — 6 nodes. Expected max flow 23. */
export const CLASSIC_23: FlowGraph = {
  nodes: ["S", "A", "B", "C", "D", "T"],
  edges: [
    { from: "S", to: "A", capacity: 16 },
    { from: "S", to: "B", capacity: 13 },
    { from: "A", to: "B", capacity: 10 },
    { from: "B", to: "A", capacity: 4 },
    { from: "A", to: "C", capacity: 12 },
    { from: "B", to: "D", capacity: 14 },
    { from: "C", to: "B", capacity: 9 },
    { from: "D", to: "C", capacity: 7 },
    { from: "C", to: "T", capacity: 20 },
    { from: "D", to: "T", capacity: 4 },
  ],
  source: "S",
  sink: "T",
};

/** Source-bottleneck network — 5 nodes. Expected max flow 11 (limited by S→A + S→B). */
export const SOURCE_LIMIT_11: FlowGraph = {
  nodes: ["S", "A", "B", "C", "T"],
  edges: [
    { from: "S", to: "A", capacity: 7 },
    { from: "S", to: "B", capacity: 4 },
    { from: "A", to: "T", capacity: 3 },
    { from: "B", to: "T", capacity: 6 },
    { from: "A", to: "C", capacity: 5 },
    { from: "B", to: "C", capacity: 3 },
    { from: "C", to: "T", capacity: 8 },
  ],
  source: "S",
  sink: "T",
};

/** Fixed SVG layouts (viewBox 0..420 x 0..260) for the preset networks. */
export const PRESET_LAYOUTS: Record<string, Record<string, [number, number]>> = {
  simple17: { S: [50, 120], A: [200, 50], B: [200, 190], T: [350, 120] },
  practice13: { S: [40, 120], A: [150, 45], B: [150, 195], C: [260, 120], T: [365, 120] },
  diamond9: { S: [50, 130], A: [200, 50], B: [200, 210], T: [360, 130] },
  classic23: { S: [40, 130], A: [150, 50], B: [150, 210], C: [280, 50], D: [280, 210], T: [385, 130] },
  sourceLimit11: { S: [40, 130], A: [160, 50], B: [160, 210], C: [270, 130], T: [380, 130] },
};