import { Panel } from "../../components/ui";
import { Term } from "../../components/Term";

export function MaxFlowLearn() {
  return (
    <div className="space-y-4">
      <Panel title="THE PROBLEM" accent="border-neon-cyan">
        <div className="text-sm font-term text-white space-y-2">
          <p>
            Given a directed graph where each edge has a <span className="text-neon-cyan">capacity</span>,
            a <span className="text-neon-green">source</span> node <em>s</em>, and a{" "}
            <span className="text-neon-magenta">sink</span> node <em>t</em>, find the maximum total
            flow from <em>s</em> to <em>t</em> that respects edge capacities and flow conservation.
          </p>
          <p className="text-dim">
            Constraints: (1) flow on each edge ≤ capacity, (2) flow into any intermediate node = flow out.
          </p>
        </div>
      </Panel>

      <Panel title="FORD-FULKERSON METHOD" accent="border-neon-green">
        <div className="text-sm font-term text-white space-y-2">
          <p>The course document describes Ford–Fulkerson as a 3-step loop:</p>
          <ol className="list-decimal list-inside space-y-1 text-white">
            <li><span className="text-neon-yellow">Find</span> an augmenting path from source to sink in the residual graph.</li>
            <li><span className="text-neon-yellow">Push</span> flow equal to the minimum residual capacity (bottleneck) along that path.</li>
            <li><span className="text-neon-yellow">Update</span> residual capacities: subtract on forward edges, add on reverse edges.</li>
          </ol>
          <p>Repeat until no augmenting path exists. The total flow at that point is maximum.</p>
        </div>
      </Panel>

      <Panel title="KEY CONCEPTS" accent="border-neon-purple">
        <div className="text-sm font-term text-white space-y-2">
          <p><Term>residual graph</Term>: shows remaining capacity on each edge. Reverse edges represent the ability to "undo" previously sent flow.</p>
          <p><Term>augmenting path</Term>: any path from source to sink in the residual graph where every edge has positive <Term>residual capacity</Term>.</p>
          <p><Term>bottleneck</Term>: the minimum residual capacity along the chosen path — determines how much flow to push.</p>
          <p><span className="text-neon-purple">Path choice flexibility:</span> the document emphasizes that different path orders can be chosen, but the final maximum flow value is always the same (Max-Flow Min-Cut theorem).</p>
        </div>
      </Panel>

      <Panel title="WORKED EXAMPLES (FROM THE DOCUMENT)" accent="border-neon-yellow">
        <div className="text-sm font-term text-white space-y-2">
          <p><span className="text-neon-yellow">Example 1 — "Simple 17":</span> Nodes S, A, B, T. Edges: S→A(10), S→B(10), A→T(7), B→T(10). Maximum flow = <strong>17</strong>.</p>
          <p><span className="text-neon-yellow">Example 2 — "Practice 13":</span> Nodes S, A, B, C, T. Edges: S→A(8), S→B(10), A→C(4), A→B(3), B→C(5), B→T(7), C→T(6). Maximum flow = <strong>13</strong>.</p>
          <p className="text-dim">Use the Playground to step through both networks and verify these results yourself.</p>
        </div>
      </Panel>

      <Panel title="MAX-FLOW MIN-CUT THEOREM" accent="border-neon-magenta">
        <div className="text-sm font-term text-white space-y-2">
          <p>
            The maximum flow equals the minimum cut capacity. A <span className="text-neon-magenta">cut</span> partitions
            nodes into two sets (one containing source, one containing sink); its capacity is the sum of
            edges crossing from the source side to the sink side.
          </p>
          <p className="text-dim">
            When Ford–Fulkerson terminates (no augmenting path), the reachable set in the residual graph
            defines a min-cut whose capacity equals the max flow.
          </p>
        </div>
      </Panel>
    </div>
  );
}