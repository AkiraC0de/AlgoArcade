import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Zap, Ban } from "lucide-react";
import type { FlowGraph, MaxFlowStep } from "../engine/maxflow/fordFulkerson";
import { edgeKey } from "../engine/maxflow/fordFulkerson";
import { PRESET_LAYOUTS } from "../engine/maxflow/presets";

const IDLE_EDGE = "#c9dcc6";
const FLOW_EDGE = "#15803d";
const ACTIVE_EDGE = "#f59e0b";

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
  const [animatedEdgeIndex, setAnimatedEdgeIndex] = useState(0);

  useEffect(() => {
    setAnimatedEdgeIndex(0);
    if (!step || step.kind !== "push" || activePath.length < 2) return;
    const timers: number[] = [];
    activePath.slice(1).forEach((_, index) => {
      timers.push(window.setTimeout(() => setAnimatedEdgeIndex(index), index * 850));
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [step?.kind, step?.iteration, activePath.join("->")]);

  const activeEdges = new Set<string>();
  const visibleEdgeIndex = step?.kind === "push" ? animatedEdgeIndex : activePath.length - 2;
  if (activePath.length >= 2 && visibleEdgeIndex >= 0) {
    const from = activePath[visibleEdgeIndex];
    const to = activePath[visibleEdgeIndex + 1];
    if (from && to) {
      activeEdges.add(`${from}->${to}`);
      activeEdges.add(`${to}->${from}`);
    }
  }

  const animatedSegment = step?.kind === "push" && activePath.length >= 2
    ? `${activePath[animatedEdgeIndex]} → ${activePath[animatedEdgeIndex + 1]}`
    : null;

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
                  stroke: isActive ? ACTIVE_EDGE : flow > 0 ? FLOW_EDGE : IDLE_EDGE,
                  strokeWidth: isActive ? 4 : 2,
                  opacity: isActive ? 1 : activePath.length > 1 && step?.kind === "push" ? 0.72 : 1,
                }}
                transition={{ duration: 0.25 }}
                markerEnd={isActive ? "url(#arrowActive)" : flow > 0 ? "url(#arrowFlow)" : "url(#arrow)"}
              />
              {isActive && step?.kind === "push" && (
                <motion.line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#d97706"
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
                rx={8}
                fill="#ffffff"
                initial={false}
                animate={{ stroke: isActive ? ACTIVE_EDGE : IDLE_EDGE }}
                transition={{ duration: 0.25 }}
                strokeWidth={1.5}
              />
              <motion.text
                x={mx}
                y={my + 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fontFamily="Comic Neue, sans-serif"
                initial={false}
                animate={{
                  fill: isActive ? "#b45309" : residual === 0 ? "#dc2626" : "#4d5c50",
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
              {inPath && (
                <motion.circle
                  cx={pos[0]}
                  cy={pos[1]}
                  fill="none"
                  stroke={ACTIVE_EDGE}
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
                fill="#ffffff"
                stroke={isSource ? "#047857" : isSink ? "#b45309" : inPath ? ACTIVE_EDGE : IDLE_EDGE}
                strokeWidth={inPath ? 3 : 2}
              />
              <motion.text
                x={pos[0]}
                y={pos[1] + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fontFamily="Baloo 2, sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.06 + 0.1, duration: 0.2 }}
                fill={isSource ? "#047857" : isSink ? "#b45309" : inPath ? "#b45309" : "#16281d"}
              >
                {n}
              </motion.text>
              {(isSource || isSink) && (
                <text
                  x={pos[0]}
                  y={pos[1] + NODE_R + 13}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fontFamily="Baloo 2, sans-serif"
                  fill={isSource ? "#047857" : "#b45309"}
                >
                  {isSource ? "SOURCE" : "SINK"}
                </text>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#c9dcc6" />
          </marker>
          <marker id="arrowFlow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#15803d" />
          </marker>
          <marker id="arrowActive" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#f59e0b" />
          </marker>
        </defs>
      </svg>

      {/* Status bar */}
      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={`${step.kind}-${step.iteration}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-2 flex flex-wrap gap-3 text-sm font-body items-center"
          >
            {step.kind === "path" && (
              <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold">
                <Search className="w-4 h-4" aria-hidden /> Augmenting path: {step.path?.join(" → ")}
              </span>
            )}
            {step.kind === "push" && (
              <span className="inline-flex items-center gap-1.5 text-ok font-bold">
                <Zap className="w-4 h-4" aria-hidden /> Pushed {step.bottleneck} unit(s) along {step.path?.join(" → ")}
              </span>
            )}
            {animatedSegment && (
              <motion.span
                key={animatedSegment}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 font-display text-xs font-black text-amber-800"
              >
                Current edge: {animatedSegment}
              </motion.span>
            )}
            {step.kind === "no-path" && (
              <span className="inline-flex items-center gap-1.5 text-danger font-bold">
                <Ban className="w-4 h-4" aria-hidden /> No more augmenting paths — algorithm terminates.
              </span>
            )}
            <span className="text-primary font-bold ml-auto">
              Total flow: <span className="text-ink">{step.totalFlow}</span>
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
