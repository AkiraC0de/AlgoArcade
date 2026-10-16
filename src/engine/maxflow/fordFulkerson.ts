/**
 * Ford-Fulkerson maximum flow, trace-based.
 * Every step is a full, serializable snapshot so playback can move
 * forward and backward freely. Pure logic — no React imports.
 *
 * The course document describes Ford-Fulkerson with arbitrary augmenting
 * path choice ("path choice flexibility"). We support two deterministic
 * pickers (BFS = Edmonds-Karp order, DFS) so students can see different
 * path orders arriving at the same maximum flow.
 */

export interface FlowEdge {
  from: string;
  to: string;
  capacity: number;
}

export interface FlowGraph {
  nodes: string[];
  edges: FlowEdge[];
  source: string;
  sink: string;
}

export type PathMode = "bfs" | "dfs";

export type MaxFlowStepKind = "init" | "path" | "push" | "no-path";

export interface MaxFlowStep {
  kind: MaxFlowStepKind;
  iteration: number;
  /** Augmenting path for this iteration (path/push steps). */
  path?: string[];
  /** Bottleneck amount for this iteration (path/push steps). */
  bottleneck?: number;
  /** Flow on every original edge, keyed "U->V". */
  flows: Record<string, number>;
  /** Residual capacity snapshot, keyed "U->V" (includes reverse edges). */
  residual: Record<string, number>;
  totalFlow: number;
  note: string;
}

export interface MaxFlowResult {
  steps: MaxFlowStep[];
  maxFlow: number;
  flows: Record<string, number>;
}

export const edgeKey = (from: string, to: string): string => `${from}->${to}`;

export function validateFlowGraph(g: FlowGraph): string[] {
  const errors: string[] = [];
  if (g.nodes.length < 2) errors.push("Need at least 2 nodes.");
  if (g.nodes.length > 8) errors.push("Max 8 nodes supported.");
  if (new Set(g.nodes).size !== g.nodes.length) errors.push("Node names must be unique.");
  if (g.source === g.sink) errors.push("Source and sink must be different nodes.");
  if (!g.nodes.includes(g.source)) errors.push("Source node missing.");
  if (!g.nodes.includes(g.sink)) errors.push("Sink node missing.");
  if (g.edges.length === 0) errors.push("Add at least one pipe (edge).");
  for (const e of g.edges) {
    if (!g.nodes.includes(e.from) || !g.nodes.includes(e.to))
      errors.push(`Edge ${e.from}->${e.to} references an unknown node.`);
    if (e.from === e.to) errors.push(`Edge ${e.from}->${e.to} is a self-loop.`);
    if (!Number.isInteger(e.capacity) || e.capacity <= 0)
      errors.push(`Edge ${e.from}->${e.to} capacity must be a positive integer.`);
  }
  if (errors.length === 0) {
    const residual = new Map<string, number>();
    for (const e of g.edges)
      residual.set(edgeKey(e.from, e.to), (residual.get(edgeKey(e.from, e.to)) ?? 0) + e.capacity);
    if (!findPath(g.nodes, residual, g.source, g.sink, "bfs"))
      errors.push("No path exists from source to sink.");
  }
  return errors;
}

function pairsOf(path: string[]): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (let i = 0; i < path.length - 1; i++) out.push([path[i], path[i + 1]]);
  return out;
}

function findPath(
  nodes: string[],
  residual: Map<string, number>,
  source: string,
  sink: string,
  mode: PathMode
): string[] | null {
  const adj = new Map<string, string[]>();
  for (const [key, cap] of residual) {
    if (cap <= 0) continue;
    const sep = key.indexOf("->");
    const u = key.slice(0, sep);
    const v = key.slice(sep + 2);
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push(v);
  }
  const order = new Map(nodes.map((n, i) => [n, i]));
  for (const list of adj.values())
    list.sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99));

  if (mode === "bfs") {
    const prev = new Map<string, string>();
    const seen = new Set<string>([source]);
    const queue: string[] = [source];
    while (queue.length > 0) {
      const u = queue.shift()!;
      if (u === sink) break;
      for (const v of adj.get(u) ?? []) {
        if (!seen.has(v)) {
          seen.add(v);
          prev.set(v, u);
          queue.push(v);
        }
      }
    }
    if (!seen.has(sink)) return null;
    const path: string[] = [sink];
    let cur = sink;
    while (cur !== source) {
      cur = prev.get(cur)!;
      path.push(cur);
    }
    return path.reverse();
  }

  const seen = new Set<string>();
  const path: string[] = [];
  const walk = (u: string): boolean => {
    seen.add(u);
    path.push(u);
    if (u === sink) return true;
    for (const v of adj.get(u) ?? []) {
      if (!seen.has(v) && walk(v)) return true;
    }
    path.pop();
    return false;
  };
  return walk(source) ? [...path] : null;
}

export function runFordFulkerson(graph: FlowGraph, mode: PathMode = "bfs"): MaxFlowResult {
  const residual = new Map<string, number>();
  for (const e of graph.edges) {
    const k = edgeKey(e.from, e.to);
    residual.set(k, (residual.get(k) ?? 0) + e.capacity);
  }
  const flows: Record<string, number> = {};
  for (const e of graph.edges) flows[edgeKey(e.from, e.to)] = 0;

  const steps: MaxFlowStep[] = [];
  let totalFlow = 0;

  const snap = (kind: MaxFlowStepKind, iteration: number, note: string, extra?: Partial<MaxFlowStep>) => {
    steps.push({
      kind,
      iteration,
      flows: { ...flows },
      residual: Object.fromEntries(residual),
      totalFlow,
      note,
      ...extra,
    });
  };

  snap("init", 0, "Initial network: all flows are 0. Hunt for a path from source to sink with spare capacity.");

  let iteration = 0;
  // Hard safety cap — real graphs here are tiny.
  while (iteration < 200) {
    const path = findPath(graph.nodes, residual, graph.source, graph.sink, mode);
    if (!path) {
      snap(
        "no-path",
        iteration,
        "No augmenting path remains — every route from source to sink is saturated. MAX FLOW REACHED."
      );
      break;
    }
    iteration += 1;
    const segs = pairsOf(path);
    const bottleneck = Math.min(...segs.map(([u, v]) => residual.get(edgeKey(u, v)) ?? 0));

    snap(
      "path",
      iteration,
      `Augmenting path found: ${path.join(" → ")}. Bottleneck = min(${segs
        .map(([u, v]) => residual.get(edgeKey(u, v)))
        .join(", ")}) = ${bottleneck}.`,
      { path: [...path], bottleneck }
    );

    for (const [u, v] of segs) {
      const fwd = edgeKey(u, v);
      const rev = edgeKey(v, u);
      residual.set(fwd, (residual.get(fwd) ?? 0) - bottleneck);
      residual.set(rev, (residual.get(rev) ?? 0) + bottleneck);
      if (flows[fwd] !== undefined) flows[fwd] += bottleneck;
      else if (flows[rev] !== undefined) flows[rev] -= bottleneck;
    }
    totalFlow += bottleneck;

    snap(
      "push",
      iteration,
      `Pushed ${bottleneck} units along ${path.join(" → ")}. Reverse edges updated (undo mechanism). Total flow: ${totalFlow}.`,
      { path: [...path], bottleneck }
    );
  }

  return { steps, maxFlow: totalFlow, flows };
}