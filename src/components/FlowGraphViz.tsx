import { AnimatePresence, motion } from "motion/react";
import type { FlowGraph, MaxFlowStep } from "../engine/maxflow/fordFulkerson";
import { edgeKey } from "../engine/maxflow/fordFulkerson";
import { PRESET_LAYOUTS } from "../engine/maxflow/presets";

/**
 * SVG-based flow network visualization.
 * Shows nodes, edges with capacity/flow labels, and highlights
 * the current augmenting path from the execution trace.
 */
export function FlowGraphViz({
  graph,
  step,
  layoutId,
}: {
  graph: FlowGraph;
  step: MaxFlowStep | null;
  layoutId?: string;
}) {
  const layout = layoutId && PRESET_LAYOUTS[layoutId]
    ? PRESET_LAYOUTS[layoutId]
    : computeCircularLayout(graph.nodes);

  const W = 420;
  const H = 260;
  const NODE_R = 18;

  const activePath = step?.path ?? [];
  const activeEdges = new Set<string>();
  for (let i = 0; i < activePath.length - 1; i++) {
    activeEdges.add(`${activePath[i]}->${activePath[i + 1]}`);
    activeEdges.add(`${activePath[i + 1]}->${activePath[i]}`); // reverse too
  }

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-lg mx-auto"
        role="img"
        aria-label="Flow network visualization"
      >
        {/* Edges */}
        {graph.edges.map((e) => {
          const from = layout[e.from];
          const to = layout[e.to];
          if (!from || !to) return null;

          const key = edgeKey(e.from, e.to);
          const flow = step?.flows[key] ?? 0;
          const isActive = activeEdges.has(`${e.from}->${e.to}`);
          const residual = e.capacity - flow;

          // Offset line slightly to avoid overlap with reverse edge
          const dx = to[0] - from[0];
          const dy = to[1] - from[1];
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const ox = (dy / len) * 4;
          const oy = (-dx / len) * 4;

          const x1 = from[0] + ox;
          const y1 = from[1] + oy;
          const x2 = to[0] + ox;
          const y2 = to[1] + oy;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;

          return (
            <g key={key}>
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                initial={false}
                animate={{
                  stroke: isActive ? "#fbbf24" : flow > 0 ? "#4ade80" : "#26264d",
                  strokeWidth: isActive ? 3 : 2,
                }}
                transition={{ duration: 0.25 }}
                markerEnd={isActive ? "url(#arrowActive)" : "url(#arrow)"}
              />
              {/* Marching dashes show flow direction during a push step */}
              {isActive && step?.kind === "push" && (
                <motion.line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#fef3c7"
                  strokeWidth={1.5}
                  strokeDasharray="5 7"
                  initial={{ strokeDashoffset: 24 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                />
              )}
              <motion.rect
                x={mx - 22}
                y={my - 10}
                width={44}
                height={20}
                rx={2}
                fill="#10101d"
                initial={false}
                animate={{ stroke: isActive ? "#fbbf24" : "#26264d" }}
                transition={{ duration: 0.25 }}
                strokeWidth={1}
              />
              <motion.text
                x={mx}
                y={my + 4}
                textAnchor="middle"
                fontSize={9}
                fontFamily="Space Mono, monospace"
                initial={false}
                animate={{
                  fill: isActive ? "#fbbf24" : residual === 0 ? "#f87171" : "#8b8bb0",
                }}
                transition={{ duration: 0.25 }}
              >
                {flow}/{e.capacity}
              </motion.text>
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((n, idx) => {
          const pos = layout[n];
          if (!pos) return null;
          const isSource = n === graph.source;
          const isSink = n === graph.sink;
          const inPath = activePath.includes(n);

          return (
            <g key={n}>
              {/* Pulse ring while the node is on the active path */}
              {inPath && (
                <motion.circle
                  cx={pos[0]}
                  cy={pos[1]}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  initial={{ r: NODE_R, opacity: 0.7 }}
                  animate={{ r: NODE_R + 12, opacity: 0 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <motion.circle
                cx={pos[0]}
                cy={pos[1]}
                initial={{ r: 0 }}
                animate={{ r: NODE_R }}
                transition={{ delay: idx * 0.06, type: "spring", stiffness: 320, damping: 20 }}
                fill={inPath ? "#171730" : "#10101d"}
                stroke={isSource ? "#22d3ee" : isSink ? "#e879f9" : inPath ? "#fbbf24" : "#26264d"}
                strokeWidth={inPath ? 3 : 2}
              />
              <motion.text
                x={pos[0]}
                y={pos[1] + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fontFamily="Press Start 2P, monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.06 + 0.1, duration: 0.2 }}
                fill={isSource ? "#22d3ee" : isSink ? "#e879f9" : inPath ? "#fbbf24" : "#e6e6f2"}
              >
                {n}
              </motion.text>
              {(isSource || isSink) && (
                <text
                  x={pos[0]}
                  y={pos[1] + NODE_R + 12}
                  textAnchor="middle"
                  fontSize={7}
                  fontFamily="Press Start 2P, monospace"
                  fill={isSource ? "#22d3ee" : "#e879f9"}
                >
                  {isSource ? "SRC" : "SINK"}
                </text>
              )}
            </g>
          );
        })}

        {/* Arrow markers */}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#26264d" />
          </marker>
          <marker id="arrowActive" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#fbbf24" />
          </marker>
        </defs>
      </svg>

      {/* Status bar — animates on every new step */}
      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={`${step.kind}-${step.iteration}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-2 flex flex-wrap gap-3 text-xs font-term"
          >
            {step.kind === "path" && (
              <span className="text-neon-yellow">
                🔍 Found augmenting path: {step.path?.join(" → ")}
              </span>
            )}
            {step.kind === "push" && (
              <span className="text-neon-green">
                ⚡ Pushed {step.bottleneck} unit(s) along {step.path?.join(" → ")}
              </span>
            )}
            {step.kind === "no-path" && (
              <span className="text-neon-red">
                🚫 No more augmenting paths — algorithm terminates.
              </span>
            )}
            <span className="text-neon-cyan ml-auto">
              Total flow: <strong className="text-neon-yellow">{step.totalFlow}</strong>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function computeCircularLayout(nodes: string[]): Record<string, [number, number]> {
  const cx = 210;
  const cy = 130;
  const r = 90;
  const layout: Record<string, [number, number]> = {};
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    layout[n] = [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
  return layout;
}