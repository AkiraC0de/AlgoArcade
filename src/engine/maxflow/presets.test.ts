import { describe, expect, it } from "vitest";
import { runFordFulkerson } from "./fordFulkerson";
import { CLASSIC_23, DIAMOND_9, SOURCE_LIMIT_11 } from "./presets";

describe("new network presets", () => {
  it("Diamond network reaches max flow 9", () => {
    expect(runFordFulkerson(DIAMOND_9).maxFlow).toBe(9);
  });

  it("Classic 6-node (CLRS) network reaches max flow 23", () => {
    expect(runFordFulkerson(CLASSIC_23).maxFlow).toBe(23);
  });

  it("Source-bottleneck network reaches max flow 11", () => {
    expect(runFordFulkerson(SOURCE_LIMIT_11).maxFlow).toBe(11);
  });

  it("all presets validate and agree across path strategies", () => {
    for (const g of [DIAMOND_9, CLASSIC_23, SOURCE_LIMIT_11]) {
      expect(runFordFulkerson(g, "bfs").maxFlow).toBe(runFordFulkerson(g, "dfs").maxFlow);
    }
  });
});