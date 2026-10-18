import { useMemo, useState } from "react";
import { Play, Shuffle } from "lucide-react";
import { usePlayback } from "../../hooks/usePlayback";
import { runFordFulkerson, validateFlowGraph, type FlowGraph, type MaxFlowStep, type PathMode } from "../../engine/maxflow/fordFulkerson";
import { CLASSIC_23, DIAMOND_9, PRACTICE_13, SIMPLE_17, SOURCE_LIMIT_11 } from "../../engine/maxflow/presets";
import { FlowGraphViz } from "../../components/FlowGraphViz";
import { PlaybackControls } from "../../components/PlaybackControls";
import { TimelineScrubber } from "../../components/TimelineScrubber";
import { InsightCard } from "../../components/InsightCard";
import { StepLog } from "../../components/StepLog";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { Button, Card, Field, inputCls } from "../../components/ui";

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
      <Card title="Input & configuration" accent="border-primary/40">
        <div className="flex flex-wrap gap-3 items-end">
          <Field label="Network">
            <select
              className={`${inputCls} cursor-pointer`}
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
          <Field label="Path strategy">
            <select
              className={`${inputCls} cursor-pointer`}
              value={pathMode}
              onChange={(e) => setPathMode(e.target.value as PathMode)}
              aria-label="Select path-finding strategy"
            >
              <option value="bfs">BFS (Edmonds-Karp order)</option>
              <option value="dfs">DFS</option>
            </select>
          </Field>
          <Button variant="accent" onClick={run}>
            <Play className="w-4 h-4" aria-hidden /> Run
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setPathMode((m) => (m === "bfs" ? "dfs" : "bfs"));
              pb.setSteps([]);
            }}
          >
            <Shuffle className="w-4 h-4" aria-hidden /> Toggle strategy
          </Button>
        </div>
        {error && <p className="text-danger text-sm mt-2 font-body font-bold" role="alert">{error}</p>}
        <p className="text-sm text-muted-fg mt-3 font-body leading-relaxed">
          Ford\u2013Fulkerson: repeatedly find an augmenting path in the residual graph, push flow equal
          to the bottleneck, update residual capacities, and repeat until no path exists.
        </p>
        <p className="text-xs text-muted-fg mt-1 font-body">
          Keyboard: Space = play/pause \u00b7 \u2190/\u2192 = step \u00b7 R = reset \u00b7 1\u20134 = speed
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Card title="Flow network" accent="border-primary/40">
            <FlowGraphViz graph={graph} step={pb.step} layoutId={presetId} />
          </Card>
          <Card title="Playback" accent="border-secondary/50">
            <PlaybackControls pb={pb} />
            <TimelineScrubber pb={pb} />
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Card title="Execution log" accent="border-amber-300">
            <StepLog notes={pb.steps.map((s) => s.note)} current={pb.index} />
          </Card>
        </div>
      </div>

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

      <Card title="Complexity reference" accent="border-ok/40">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p>
            <span className="font-display font-bold text-xs text-primary uppercase tracking-wide">Time:</span>{" "}
            O(E \u00b7 |f*|) where |f*| is the maximum flow value (Ford\u2013Fulkerson with arbitrary path choice).
            With BFS (Edmonds-Karp): O(V \u00b7 E\u00b2).
          </p>
          <p>
            <span className="font-display font-bold text-xs text-info uppercase tracking-wide">Space:</span>{" "}
            O(V + E) for the residual graph.
          </p>
          <p className="text-muted-fg">
            Note: The course document does not state Ford\u2013Fulkerson&#39;s complexity explicitly.
            The O(E\u00b7|f*|) bound assumes integer capacities; the BFS bound (Edmonds-Karp) is a
            well-known refinement.
          </p>
        </div>
      </Card>
    </div>
  );
}
