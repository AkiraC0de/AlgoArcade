import { describe, expect, it } from "vitest";
import { edgeKey, runFordFulkerson, validateFlowGraph, type FlowGraph } from "./fordFulkerson";
import { PRACTICE_13, SIMPLE_17 } from "./presets";

describe("Ford-Fulkerson (course examples)", () => {
  it("Simple network reaches max flow 17", () => {
    expect(runFordFulkerson(SIMPLE_17).maxFlow).toBe(17);
  });

  it("Practice network reaches max flow 13", () => {
    expect(runFordFulkerson(PRACTICE_13).maxFlow).toBe(13);
  });

  it("path-choice flexibility: bfs and dfs orders give the same max flow", () => {
    for (const g of [SIMPLE_17, PRACTICE_13]) {
      const bfs = runFordFulkerson(g, "bfs");
      const dfs = runFordFulkerson(g, "dfs");
      expect(dfs.maxFlow).toBe(bfs.maxFlow);
    }
  });

  it("every intermediate snapshot satisfies capacity constraint and flow conservation", () => {
    for (const g of [SIMPLE_17, PRACTICE_13]) {
      const { steps } = runFordFulkerson(g);
      expect(steps.length).toBeGreaterThan(2);
      for (const st of steps) {
        // Capacity constraint: 0 <= flow <= capacity on every original edge.
        for (const e of g.edges) {
          const f = st.flows[edgeKey(e.from, e.to)] ?? 0;
          expect(f).toBeGreaterThanOrEqual(0);
          expect(f).toBeLessThanOrEqual(e.capacity);
        }
        // Flow conservation at every intermediate node.
        for (const node of g.nodes) {
          if (node === g.source || node === g.sink) continue;
          let inF = 0;
          let outF = 0;
          for (const e of g.edges) {
            const f = st.flows[edgeKey(e.from, e.to)] ?? 0;
            if (e.to === node) inF += f;
            if (e.from === node) outF += f;
          }
          expect(inF).toBe(outF);
        }
      }
    }
  });

  it("final snapshot total equals sum of flows out of source", () => {
    for (const g of [SIMPLE_17, PRACTICE_13]) {
      const res = runFordFulkerson(g);
      const last = res.steps[res.steps.length - 1];
      const outOfSource = g.edges
        .filter((e) => e.from === g.source)
        .reduce((sum, e) => sum + (last.flows[edgeKey(e.from, e.to)] ?? 0), 0);
      expect(outOfSource).toBe(res.maxFlow);
    }
  });

  it("validation rejects broken graphs", () => {
    const bad: FlowGraph = { nodes: ["S", "T"], edges: [{ from: "S", to: "T", capacity: 5 }], source: "S", sink: "S" };
    expect(validateFlowGraph(bad).length).toBeGreaterThan(0);

    const unreachable: FlowGraph = {
      nodes: ["S", "A", "T"],
      edges: [{ from: "A", to: "T", capacity: 3 }],
      source: "S",
      sink: "T",
    };
    expect(validateFlowGraph(unreachable).some((e) => e.includes("No path"))).toBe(true);

    expect(validateFlowGraph(SIMPLE_17)).toEqual([]);
    expect(validateFlowGraph(PRACTICE_13)).toEqual([]);
  });
});