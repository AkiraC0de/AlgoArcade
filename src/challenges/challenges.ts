export interface Challenge {
  id: string;
  world: "strings" | "maxflow";
  title: string;
  prompt: string;
  hint: string;
  kind: "choice" | "number";
  options?: string[];
  /** For choice: index into options. For number: the numeric answer. */
  answer: number;
}

export const CHALLENGES: Challenge[] = [
  // ── TEXT HUNTERS case files ─────────────────────────────────────────────
  {
    id: "case-naive-index",
    world: "strings",
    title: "CASE 01 · ROOKIE REPORT",
    prompt:
      'The Clumsy Rookie (Naive) searches "CONT" inside "FLOODCONTROL". At which index does it report the match?',
    hint: "Count from 0: F(0) L(1) O(2) O(3) D(4) C(5)… the window starts where the pattern's first letter aligns.",
    kind: "number",
    answer: 5,
  },
  {
    id: "case-rk-window",
    world: "strings",
    title: "CASE 02 · FINGERPRINT CHECK",
    prompt:
      'Rabin-Karp (d=10, q=241) slides to shift 4 over "FLOODCONTROL", window "DCON". Pattern hash is 81. What happens?',
    hint: "h(DCON) = (((4·10+3)·10+15)·10+14) mod 241 = 4514 mod 241.",
    kind: "choice",
    options: ["Hash match (81 = 81) → verify characters", "No match — window hash is 176", "No match — window hash is 44"],
    answer: 1,
  },
  {
    id: "case-bm-shift",
    world: "strings",
    title: "CASE 03 · THE BIG SKIP",
    prompt:
      'Boyer-Moore compares "TOTN" against "FLOODCONTOTN" right-to-left. First mismatch: text "O" vs pattern "N" at pattern index 3. Table: *→4, T→1, O→2, N→4. How far does the pattern shift?',
    hint: "shift = max(1, table[O] − (m − 1 − j)) = max(1, 2 − 0).",
    kind: "number",
    answer: 2,
  },
  // ── PIPE WORKS missions ─────────────────────────────────────────────────
  {
    id: "mf-bottleneck",
    world: "maxflow",
    title: "MISSION 01 · BOTTLENECK BINGO",
    prompt: "On the Simple network (S→A 10, S→B 10, A→T 7, B→T 10), path S → B → T is chosen. What is the bottleneck flow pushed?",
    hint: "The bottleneck is the minimum capacity along the path: min(10, 10).",
    kind: "number",
    answer: 10,
  },
  {
    id: "mf-thirteen",
    world: "maxflow",
    title: "MISSION 02 · THE 13 JOB",
    prompt:
      "Practice network: S→A 8, S→B 10, A→C 4, A→B 3, B→C 5, B→T 7, C→T 6. What is the maximum flow from S to T?",
    hint: "The edges into T cap everything: B→T (7) + C→T (6). Try the walkthrough: 4 + 7 + 2.",
    kind: "number",
    answer: 13,
  },
  {
    id: "mf-rule-patrol",
    world: "maxflow",
    title: "MISSION 03 · RULE PATROL",
    prompt: "A snapshot shows edge S→A with capacity 10 carrying flow 12, while every intermediate node still has inflow = outflow. Which core rule is broken?",
    hint: "One rule limits flow by capacity; the other balances inflow and outflow at intermediate nodes.",
    kind: "choice",
    options: ["Capacity Constraint", "Flow Conservation", "Neither — this is a valid flow"],
    answer: 0,
  },
  {
    id: "mf-flex",
    world: "maxflow",
    title: "MISSION 04 · ROUTE FLEX",
    prompt:
      "True or false: Ford–Fulkerson can pick augmenting paths in a different order and still arrive at the same maximum flow.",
    hint: "The document's 'Path Choice Flexibility' takeaway.",
    kind: "choice",
    options: ["True", "False"],
    answer: 0,
  },
];