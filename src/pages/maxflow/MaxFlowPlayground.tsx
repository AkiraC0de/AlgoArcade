import { useMemo, useState } from "react";
import { usePlayback } from "../../hooks/usePlayback";
import { runFordFulkerson, validateFlowGraph, type FlowGraph, type MaxFlowStep, type PathMode } from "../../engine/maxflow/fordFulkerson";
import { PRACTICE_13, SIMPLE_17 } from "../../engine/maxflow/presets";
import { FlowGraphViz } from "../../components/FlowGraphViz";
import { PlaybackControls } from "../../components/PlaybackControls";
import { StepLog } from "../../components/StepLog";
import { Field, inputCls, Panel, PixelButton } from "../../components/ui";

type PresetId = "simple17" | "practice13" | "custom";

const PRESETS: Record<string, FlowGraph> = {
  simple17: SIMPLE_17,
  practice13: PRACTICE_13,
};

export function MaxFlowPlayground() {
  const [presetId, setPresetId] = useState<PresetId>("simple17");
  const [pathMode, setPathMode] = useState<PathMode>("bfs");
  const [error, setError] = useState("");

  const graph = useMemo(() => {
    if (presetId === "custom") return SIMPLE_17; // placeholder for v1
    return PRESETS[presetId];
  }, [presetId]);

  const pb = usePlayback<MaxFlowStep>(1200);

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
          <PixelButton variant="green" onClick={run}>▶ RUN</PixelButton>
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
          Ford–Fulkerson: repeatedly find an augmenting path in the residual graph, push flow equal
          to the bottleneck, update residual capacities, repeat until no path exists.
        </p>
      </Panel>

      {/* Graph visualization */}
      <Panel title="PIPE NETWORK" accent="border-neon-cyan">
        <FlowGraphViz graph={graph} step={pb.step} layoutId={presetId !== "custom" ? presetId : undefined} />
      </Panel>

      {/* Playback */}
      <Panel title="PLAYBACK" accent="border-neon-purple">
        <PlaybackControls pb={pb} />
      </Panel>

      {/* Step log */}
      <Panel title="EXECUTION LOG" accent="border-neon-yellow">
        <StepLog notes={pb.steps.map((s) => s.note)} current={pb.index} />
      </Panel>

      {/* Complexity */}
      <Panel title="COMPLEXITY INTEL" accent="border-neon-green">
        <div className="text-sm font-term text-white space-y-2">
          <p>
            <span className="text-neon-magenta font-pixel text-[8px]">TIME:</span>{" "}
            O(E · |f*|) where |f*| is the maximum flow value (Ford–Fulkerson with arbitrary path choice).
            With BFS (Edmonds-Karp): O(V · E²).
          </p>
          <p>
            <span className="text-neon-magenta font-pixel text-[8px]">SPACE:</span>{" "}
            O(V + E) for the residual graph.
          </p>
          <p className="text-dim">
            Note: The course document does not state Ford–Fulkerson's complexity explicitly.
            The O(E·|f*|) bound assumes integer capacities; the BFS bound (Edmonds-Karp) is a
            well-known refinement.
          </p>
        </div>
      </Panel>
    </div>
  );
}