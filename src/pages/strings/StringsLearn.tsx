import { Panel } from "../../components/ui";

export function StringsLearn() {
  return (
    <div className="space-y-4">
      <Panel title="THE PROBLEM" accent="border-neon-cyan">
        <div className="text-sm font-term text-white space-y-2">
          <p>
            Given a <span className="text-neon-cyan">text</span> of length <em>n</em> and a{" "}
            <span className="text-neon-magenta">pattern</span> of length <em>m</em>, find all positions
            where the pattern occurs in the text.
          </p>
          <p className="text-dim">
            Example: text = "FLOODCONTROL", pattern = "CONT" → match at index 5.
          </p>
        </div>
      </Panel>

      <Panel title="DETECTIVE #1 · THE CLUMSY ROOKIE (NAIVE)" accent="border-neon-green">
        <div className="text-sm font-term text-white space-y-2">
          <p>Slides the pattern one position at a time, left to right. At each position, compares characters from the start. On mismatch, shifts by 1 and restarts.</p>
          <p className="text-dim">Time: O(n·m) worst case. Space: O(1). Simple but slow on repetitive inputs.</p>
        </div>
      </Panel>

      <Panel title="DETECTIVE #2 · THE DIGITAL FINGERPRINT (RABIN-KARP)" accent="border-neon-purple">
        <div className="text-sm font-term text-white space-y-2">
          <p>
            Computes a <span className="text-neon-purple">rolling hash</span> of each window. Only when the
            hash matches the pattern's hash does it verify character-by-character.
          </p>
          <p>
            Course parameters: base <span className="text-neon-yellow">d = 10</span>, modulus{" "}
            <span className="text-neon-yellow">q = 241</span>, character values A=1…Z=26.
          </p>
          <p className="text-dim">
            Doc example: hash("CONT") = (3·10³ + 15·10² + 14·10 + 20) mod 241 = 4660 mod 241 = <strong>81</strong>.
          </p>
          <p className="text-dim">Average O(n+m); worst O(n·m) if many hash collisions.</p>
        </div>
      </Panel>

      <Panel title="DETECTIVE #3 · THE SKIP MASTER (BOYER-MOORE)" accent="border-neon-magenta">
        <div className="text-sm font-term text-white space-y-2">
          <p>
            Compares <span className="text-neon-magenta">right-to-left</span> inside the window. On mismatch,
            uses the <span className="text-neon-yellow">Bad Match Table</span> to skip ahead.
          </p>
          <p>
            Table rule: value(c) = m−1−rightmost(c) if &gt;0, else m. For "TOTN": {"{"}"*":4, T:1, O:2, N:4{"}"}.
          </p>
          <p className="text-dim">
            Best case O(n/m) — sublinear! The Good Suffix rule is mentioned in the course but not implemented here (v1).
          </p>
        </div>
      </Panel>

      <Panel title="KEY TAKEAWAYS" accent="border-neon-yellow">
        <ul className="text-sm font-term text-white space-y-1 list-disc list-inside">
          <li>All three algorithms find the same matches — they differ in <em>how many comparisons</em> they make.</li>
          <li>Naive is simplest but worst-case slowest.</li>
          <li>Rabin-Karp trades character comparisons for hash computations.</li>
          <li>Boyer-Moore can skip entire sections of the text.</li>
          <li>Use the Playground to race them on the same input and compare comparison counts.</li>
        </ul>
      </Panel>
    </div>
  );
}