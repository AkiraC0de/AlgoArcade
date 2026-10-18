import { Card } from "../../components/ui";
import { Term } from "../../components/Term";

export function StringsLearn() {
  return (
    <div className="space-y-4">
      <Card title="The problem" accent="border-primary/40">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p>
            Given a <Term>text</Term> of length <em>n</em> and a <Term>pattern</Term> of length{" "}
            <em>m</em>, find all positions where the pattern occurs in the text.
          </p>
          <p className="text-muted-fg">
            Example: text = "FLOODCONTROL", pattern = "CONT" → match at index 5.
          </p>
        </div>
      </Card>

      <Card title="Algorithm 1 · Naive (brute-force)" accent="border-ok/40">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p>
            Slides the pattern one position at a time, left to right. At each position it compares
            characters from the start; on mismatch it shifts by 1 and restarts.
          </p>
          <p className="text-muted-fg">Time: O(n·m) worst case. Space: O(1). Simple but slow on repetitive inputs.</p>
        </div>
      </Card>

      <Card title="Algorithm 2 · Rabin-Karp (rolling hash)" accent="border-secondary/50">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p>
            Computes a <span className="text-primary font-bold">rolling hash</span> of each window. Only when
            the hash matches the pattern&#39;s hash does it verify character-by-character.
          </p>
          <p>
            Course parameters: base <span className="text-accent font-bold">d = 10</span>, modulus{" "}
            <span className="text-accent font-bold">q = 241</span>, character values A=1…Z=26.
          </p>
          <p className="text-muted-fg">
            Doc example: hash("CONT") = (3·10³ + 15·10² + 14·10 + 20) mod 241 = 4660 mod 241 = <strong>81</strong>.
          </p>
          <p className="text-muted-fg">Average O(n+m); worst O(n·m) if many hash collisions.</p>
        </div>
      </Card>

      <Card title="Algorithm 3 · Boyer-Moore (bad character rule)" accent="border-accent/40">
        <div className="text-sm font-body text-ink space-y-2 leading-relaxed">
          <p>
            Compares <span className="text-accent font-bold">right-to-left</span> inside the window. On mismatch,
            it uses the <span className="text-accent font-bold">Bad Match Table</span> to skip ahead.
          </p>
          <p>
            Table rule: value(c) = m−1−rightmost(c) if &gt; 0, else m. For "TOTN": &#123;"*": 4, T: 1, O: 2, N: 4&#125;.
          </p>
          <p className="text-muted-fg">
            Best case O(n/m) — sublinear! The Good Suffix rule is mentioned in the course but not implemented here (v1).
          </p>
        </div>
      </Card>

      <Card title="Key takeaways" accent="border-amber-300">
        <ul className="text-sm font-body text-ink space-y-1.5 list-disc list-inside leading-relaxed">
          <li>All three algorithms find the same matches — they differ in <em>how many comparisons</em> they make.</li>
          <li>Naive is simplest but worst-case slowest.</li>
          <li>Rabin-Karp trades character comparisons for hash computations.</li>
          <li>Boyer-Moore can skip entire sections of the text.</li>
          <li>Use the Playground to run all three on the same input and compare comparison counts.</li>
        </ul>
      </Card>
    </div>
  );
}
