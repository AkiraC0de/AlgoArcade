import { Card } from "../../components/ui";
import { Term } from "../../components/Term";

export function MaxFlowLearn() {
  return (
    <div className="space-y-4">
      <Card title="The problem" accent="border-primary/40">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p>
            Given a directed graph where each edge has a <span className="text-primary font-bold">capacity</span>,
            a <span className="text-ok font-bold">source</span> node <em>s</em>, and a{" "}
            <span className="text-accent font-bold">sink</span> node <em>t</em>, find the maximum total
            flow from <em>s</em> to <em>t</em> that respects edge capacities and flow conservation.
          </p>
          <p className="text-muted-fg">
            Constraints: (1) flow on each edge ≤ capacity, (2) flow into any intermediate node = flow out.
          </p>
        </div>
      </Card>

      <Card title="Ford-Fulkerson method" accent="border-ok/40">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p>The course document describes Ford–Fulkerson as a 3-step loop:</p>
          <ol className="list-decimal list-inside space-y-1.5">
            <li><span className="text-accent font-bold">Find</span> an augmenting path from source to sink in the residual graph.</li>
            <li><span className="text-accent font-bold">Push</span> flow equal to the minimum residual capacity (bottleneck) along that path.</li>
            <li><span className="text-accent font-bold">Update</span> residual capacities: subtract on forward edges, add on reverse edges.</li>
          </ol>
          <p>Repeat until no augmenting path exists. The total flow at that point is maximum.</p>
        </div>
      </Card>

      <Card title="Key concepts" accent="border-secondary/50">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p><Term>residual graph</Term>: shows remaining capacity on each edge. Reverse edges represent the ability to "undo" previously sent flow.</p>
          <p><Term>augmenting path</Term>: any path from source to sink in the residual graph where every edge has positive <Term>residual capacity</Term>.</p>
          <p><Term>bottleneck</Term>: the minimum residual capacity along the chosen path — determines how much flow to push.</p>
          <p>
            <span className="text-primary font-bold">Path choice flexibility:</span> the document emphasizes that different path
            orders can be chosen, but the final maximum flow value is always the same (Max-Flow Min-Cut theorem).
          </p>
        </div>
      </Card>

      <Card title="Worked examples (from the document)" accent="border-amber-300">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p><span className="text-accent font-bold">Example 1 — "Simple 17":</span> Nodes S, A, B, T. Edges: S→A(10), S→B(10), A→T(7), B→T(10). Maximum flow = <strong>17</strong>.</p>
          <p><span className="text-accent font-bold">Example 2 — "Practice 13":</span> Nodes S, A, B, C, T. Edges: S→A(8), S→B(10), A→C(4), A→B(3), B→C(5), B→T(7), C→T(6). Maximum flow = <strong>13</strong>.</p>
          <p className="text-muted-fg">Use the Playground to step through both networks and verify these results yourself.</p>
        </div>
      </Card>

      <Card title="Max-flow min-cut theorem" accent="border-accent/40">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p>
            The maximum flow equals the minimum cut capacity. A <span className="text-accent font-bold">cut</span> partitions
            nodes into two sets (one containing source, one containing sink); its capacity is the sum of
            edges crossing from the source side to the sink side.
          </p>
          <p className="text-muted-fg">
            When Ford–Fulkerson terminates (no augmenting path), the reachable set in the residual graph
            defines a min-cut whose capacity equals the max flow.
          </p>
        </div>
      </Card>
    </div>
  );
}
