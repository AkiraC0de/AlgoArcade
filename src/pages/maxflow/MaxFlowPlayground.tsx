import { useMemo, useState } from "react";
import { usePlayback } from "../../hooks/usePlayback";
import { runFordFulkerson, validateFlowGraph, type FlowGraph, type MaxFlowStep, type PathMode } from "../../engine/maxflow/fordFulkerson";
import { CLASSIC_23, DIAMOND_9, PRACTICE_13, SIMPLE_17, SOURCE_LIMIT_11 } from "../../engine/maxflow/presets";
import { FlowGraphViz } from "../../components/FlowGraphViz";
import { PlaybackControls } from "../../components/PlaybackControls";
import { TimelineScrubber } from "../../components/TimelineScrubber";
import { InsightCard } from "../../components/InsightCard";
import { StepLog } from "../../components/StepLog";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { Field, inputCls, Panel, PixelButton } from "../../components/ui";

type PresetId = "simple17" | "practice13" | "diamond9" | "classic23" | "sourceLimit11";

const PRESETS: Record<PresetId, FlowGraph> = {
  simple17: SIMPLE_17,
  practice13: PRACTICE_13,
  diamond9: DIAMOND_9,
  classic23: CLASSIC_23,
  sourceLimit11: SOURCE_LIMIT_11,
};

export function MaxFlowPlayground() {
  const [presetId, setPresetId] = useState<PresetId>("simple17");
  const [pathMode, setPathMode] = useState<PathMode>("bfs");
  const [error, setError] = useState("");

  const graph = useMemo(() => PRESETS[presetId], [presetId]);
  const pb = usePlayback<MaxFlowStep>(2400);
  useKeyboardShortcuts(pb);

  const run = () => {
    setError("");
    const issues = validateFlowGraph(graph);
    if (issues.length > 0) {
      setError(issues.join("; "));
      return;
    }
    const result = runFordFulkerson(graph, pathMode);
    pb.setSteps(result.steps);
    pb.play();
  };

  const lastStep = pb.steps.at(-1);
  const maxFlow = pb.done ? (lastStep?.totalFlow ?? 0) : 0;
  const augmentations = pb.done ? pb.steps.filter((s) => s.kind === "push").length : 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Panel title="CONTROL PANEL" accent="border-neon-magenta">
        <div className="flex flex-wrap gap-3 items-end">
          <Field label="NETWORK">
            <select
              className={inputCls}
              value={presetId}
              onChange={(e) => {
                setPresetId(e.target.value as PresetId);
                pb.setSteps([]);
                setError("");
              }}
              aria-label="Select network preset"
            >
              <option value="simple17">Simple (max flow = 17)</option>
              <option value="practice13">Practice (max flow = 13)</option>
              <option value="diamond9">Diamond (max flow = 9)</option>
              <option value="classic23">Classic 6-node (max flow = 23)</option>
              <option value="sourceLimit11">Source-bottleneck (max flow = 11)</option>
            </select>
          </Field>
          <Field label="PATH STRATEGY">
            <select
              className={inputCls}
              value={pathMode}
              onChange={(e) => setPathMode(e.target.value as PathMode)}
              aria-label="Select path-finding strategy"
            >
              <option value="bfs">BFS (Edmonds-Karp order)</option>
              <option value="dfs">DFS</option>
            </select>
          </Field>
          <PixelButton variant="green" onClick={run}>\u25b6 RUN</PixelButton>
          <PixelButton
            variant="dim"
            onClick={() => {
              setPathMode((m) => (m === "bfs" ? "dfs" : "bfs"));
              pb.setSteps([]);
            }}
          >
            TOGGLE STRATEGY
          </PixelButton>
        </div>
        {error && <p className="text-neon-red text-xs mt-2 font-term" role="alert">{error}</p>}
        <p className="text-[11px] text-dim mt-2 font-term">
          Ford\u2013Fulkerson: repeatedly find an augmenting path in the residual graph, push flow equal
          to the bottleneck, update residual capacities, repeat until no path exists.
        </p>
        <p className="text-[10px] text-dim mt-1 font-term">
          Keyboard: Space = play/pause \u00b7 \u2190/\u2192 = step \u00b7 R = reset
        </p>
      </Panel>

      {/* Main area: side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Panel title="FLOW NETWORK" accent="border-neon-cyan">
            <FlowGraphViz graph={graph} step={pb.step} layoutId={presetId} />
          </Panel>
          <Panel title="PLAYBACK" accent="border-neon-purple">
            <PlaybackControls pb={pb} />
            <TimelineScrubber pb={pb} />
          </Panel>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Panel title="EXECUTION LOG" accent="border-neon-yellow">
            <StepLog notes={pb.steps.map((s) => s.note)} current={pb.index} />
          </Panel>
        </div>
      </div>

      {/* Post-run insight */}
      {pb.done && (
        <InsightCard
          rows={[
            { label: "Max flow", value: maxFlow },
            { label: "Augmentations", value: augmentations },
            { label: "Total steps", value: pb.count },
          ]}
          tip={
            pathMode === "bfs"
              ? "BFS always picks the shortest augmenting path first. Switch to DFS and re-run to see a different path order arriving at the same max flow."
              : "DFS may pick longer paths first. Switch to BFS (Edmonds-Karp) to see the shortest-path-first strategy."
          }
          nextAction={{
            label: pathMode === "bfs" ? "Re-run with DFS" : "Re-run with BFS",
            onClick: () => {
              setPathMode((m) => (m === "bfs" ? "dfs" : "bfs"));
              pb.setSteps([]);
            },
          }}
        />
      )}

      {/* Complexity */}
      <Panel title="COMPLEXITY INTEL" accent="border-neon-green">
        <div className="text-sm font-term text-white space-y-2">
          <p>
            <span className="text-neon-magenta font-pixel text-[8px]">TIME:</span>{" "}
            O(E \u00b7 |f*|) where |f*| is the maximum flow value (Ford\u2013Fulkerson with arbitrary path choice).
            With BFS (Edmonds-Karp): O(V \u00b7 E\u00b2).
          </p>
          <p>
            <span className="text-neon-magenta font-pixel text-[8px]">SPACE:</span>{" "}
            O(V + E) for the residual graph.
          </p>
          <p className="text-dim">
            Note: The course document does not state Ford\u2013Fulkerson's complexity explicitly.
            The O(E\u00b7|f*|) bound assumes integer capacities; the BFS bound (Edmonds-Karp) is a
            well-known refinement.
          </p>
        </div>
      </Panel>
    </div>
  );
}
