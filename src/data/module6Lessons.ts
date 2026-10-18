export type TopicId = "maxflow" | "strings" | "hashing" | "geometry" | "parallel";

export interface StageContent {
  title: string;
  lead: string;
  paragraphs: string[];
  bullets?: string[];
  formula?: string;
}

export interface KnowledgeCheck {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Module6Topic {
  id: TopicId;
  title: string;
  shortTitle: string;
  summary: string;
  objective: string;
  lessonLength: string;
  complexity: string;
  accent: "primary" | "accent" | "info" | "ok" | "violet";
  stages: StageContent[];
  check: KnowledgeCheck;
  takeaway: string;
}

export const LEARNING_STAGES = [
  { id: "discover", number: "01", title: "Discover", hint: "Why this problem matters" },
  { id: "understand", number: "02", title: "Understand", hint: "Build the mental model" },
  { id: "interact", number: "03", title: "Interact", hint: "Try the idea yourself" },
  { id: "watch", number: "04", title: "Watch the algorithm", hint: "Follow the real state changes" },
  { id: "test", number: "05", title: "Test understanding", hint: "Make a prediction" },
  { id: "reflect", number: "06", title: "Reflect and continue", hint: "Keep the useful idea" },
] as const;

export const MODULE6_TOPICS: Module6Topic[] = [
  {
    id: "maxflow",
    title: "Maximum Flow",
    shortTitle: "Flow networks",
    summary: "Find the greatest amount of traffic that can move from a source to a sink without breaking capacity or conservation rules.",
    objective: "Explain capacity, conservation, residual capacity, augmenting paths, and bottlenecks.",
    lessonLength: "12 min",
    complexity: "O(E · |f*|)",
    accent: "primary",
    stages: [
      {
        title: "A network has a limit",
        lead: "Imagine data moving through a network of pipes.",
        paragraphs: [
          "Every edge has a capacity. The source creates flow, the sink receives it, and intermediate nodes only pass along what they receive.",
          "The question is not whether one path works. It is how much total flow can reach the sink when every path shares limited edges."
        ],
        bullets: ["Source S: where flow starts", "Sink T: where flow ends", "Capacity: the maximum an edge can carry"]
      },
      {
        title: "Three ideas explain the whole method",
        lead: "Ford–Fulkerson repeatedly improves a valid flow.",
        paragraphs: [
          "An augmenting path is a source-to-sink route with remaining capacity. Its bottleneck is the smallest remaining capacity on that route.",
          "After pushing flow, the residual graph records what is still available. Reverse residual edges let a later iteration undo or reroute an earlier choice."
        ],
        bullets: ["Capacity constraint: flow ≤ capacity", "Flow conservation: in-flow = out-flow at intermediate nodes", "Stop when no augmenting path remains"]
      },
      {
        title: "Move the flow yourself",
        lead: "Use the network below as a small laboratory.",
        paragraphs: ["Choose a path strategy, run the real trace, then pause and inspect how each edge's flow and residual capacity changes."]
      },
      {
        title: "Watch Find → Push → Update",
        lead: "The visualization is driven by the Ford–Fulkerson trace.",
        paragraphs: ["Each highlighted path is a real augmenting path from the engine. The pushed amount is the minimum residual capacity on that path, not a decorative animation."]
      },
      {
        title: "Check the bottleneck idea",
        lead: "A correct prediction should use the smallest remaining capacity on the selected path.",
        paragraphs: ["Before you answer, look at the path S → A → T in the worked example: capacities are 10 and 7."]
      },
      {
        title: "The reusable idea",
        lead: "Maximum flow is a repeated improvement process.",
        paragraphs: ["Find a route that can still carry flow, push only as much as its narrowest edge allows, update the residual network, and repeat."],
        formula: "max flow = flow when the residual graph has no S → T path"
      }
    ],
    check: { question: "On S → A → T with residual capacities 10 and 7, what is the bottleneck?", options: ["3", "7", "10", "17"], answer: 1, explanation: "The bottleneck is the minimum residual capacity on the path: min(10, 7) = 7." },
    takeaway: "A path's bottleneck limits the immediate push; the residual graph determines whether more flow can be found later."
  },
  {
    id: "strings",
    title: "String Matching",
    shortTitle: "Find a pattern",
    summary: "Search for every occurrence of a pattern inside a larger text, while comparing how much work different algorithms perform.",
    objective: "Contrast Naive, Rabin–Karp, and Boyer–Moore using comparisons, hashes, shifts, and verification.",
    lessonLength: "14 min",
    complexity: "O(n·m) worst-case",
    accent: "accent",
    stages: [
      { title: "Searching is alignment", lead: "A pattern becomes meaningful only when it is aligned with a text window.", paragraphs: ["For text FLOODCONTROL and pattern CONT, the goal is to find the starting index where the pattern occurs.", "Every algorithm makes the same promise—find the same matches—but chooses a different way to move and compare."], bullets: ["n = text length", "m = pattern length", "A shift moves the pattern to a new text window"] },
      { title: "Three strategies, one answer", lead: "The difference is the work performed between the first and final match.", paragraphs: ["Naive compares left-to-right and shifts by one. Rabin–Karp compares rolling hash values first. Boyer–Moore compares right-to-left and uses a bad-character shift to skip windows."], bullets: ["Naive: simplest baseline", "Rabin–Karp: cheap numeric screening", "Boyer–Moore: skip using mismatch information"] },
      { title: "Edit the search problem", lead: "Change the text or pattern, then predict where the next window will land.", paragraphs: ["Use the saved examples or create a repeated-character input to expose the differences between the algorithms."] },
      { title: "Watch comparisons and shifts", lead: "The aligned boxes show the actual current window.", paragraphs: ["A yellow comparison, red mismatch, green match, and purple hash state each correspond to a step emitted by the selected engine."] },
      { title: "Predict the match", lead: "Use the text and pattern, not a memorized index.", paragraphs: ["For FLOODCONTROL and CONT, count from zero. The pattern starts after the first five characters."] },
      { title: "The reusable idea", lead: "String matching is a trade-off between information and movement.", paragraphs: ["Naive throws away partial-match information. Rabin–Karp reuses a rolling hash. Boyer–Moore reuses mismatch information to jump further."], formula: "Rabin–Karp average: O(n + m) · Naive worst-case: O(n · m)" }
    ],
    check: { question: "In FLOODCONTROL, at which zero-based index does CONT begin?", options: ["3", "4", "5", "8"], answer: 2, explanation: "F L O O D occupy indices 0–4, so C begins at index 5." },
    takeaway: "The algorithms return the same match positions; their real difference is how much information they reuse to reduce comparisons."
  },
  {
    id: "hashing",
    title: "Hashing",
    shortTitle: "Keys to slots",
    summary: "Convert data into a fixed-size value, then use that value to locate information quickly.",
    objective: "Distinguish a hash function, hash value, table index, and collision—and connect them to real uses.",
    lessonLength: "10 min",
    complexity: "O(1) average lookup",
    accent: "info",
    stages: [
      { title: "A shortcut to stored data", lead: "A hash table tries to jump directly to where a key belongs.", paragraphs: ["Instead of scanning every stored item, a hash function maps an input key to a compact hash value or table index.", "The mapping is fast, but different keys can still land in the same slot."], bullets: ["Input key: the data being stored or searched", "Hash function: the mapping process", "Hash value: the produced output"] },
      { title: "Hashing is not encryption", lead: "A hash is a fixed-size representation, not a promise that the original can be recovered.", paragraphs: ["The course lists MD5, SHA-1, SHA-256, and SHA-512 as examples with different lengths and security properties.", "Hashing supports password protection, data integrity, file verification, and caching."], bullets: ["MD5: 128-bit, weak", "SHA-1: 160-bit, weak", "SHA-256: 256-bit, strong", "SHA-512: 512-bit, strong"] },
      { title: "Try a table index", lead: "Change the key and table size to see the modulo mapping.", paragraphs: ["This lesson uses the course example h(k) = k mod m. The resulting slot is useful only when you also handle collisions."], formula: "h(k) = k mod m" },
      { title: "Watch collisions appear", lead: "Keys 3, 6, and 9 all map to slot 0 when m = 3.", paragraphs: ["That is a collision: different inputs produce the same table location. A collision strategy such as chaining is needed to keep both values."], bullets: ["3 mod 3 = 0", "6 mod 3 = 0", "9 mod 3 = 0"] },
      { title: "Check the slot", lead: "Calculate before you click.", paragraphs: ["Use the modulo formula, then compare your answer with the highlighted bucket."] },
      { title: "The reusable idea", lead: "Fast lookup depends on a useful distribution.", paragraphs: ["A good hash function spreads keys across slots. A table implementation must still resolve collisions correctly."], formula: "same slot ≠ same key" }
    ],
    check: { question: "With h(k) = k mod 3, where does key 8 go?", options: ["0", "1", "2", "8"], answer: 2, explanation: "8 mod 3 leaves remainder 2, so the key maps to slot 2." },
    takeaway: "Hashing turns keys into locations, but collisions are expected behavior that the table must handle."
  },
  {
    id: "geometry",
    title: "Computational Geometry",
    shortTitle: "Algorithms for shapes",
    summary: "Use coordinates, distance, orientation, and area calculations to answer questions about points, lines, and polygons.",
    objective: "Connect geometric formulas to convex hulls, closest pairs, intersections, and point-in-polygon tests.",
    lessonLength: "15 min",
    complexity: "Graham scan: O(n log n)",
    accent: "violet",
    stages: [
      { title: "Give the computer a shape problem", lead: "Maps, games, robotics, and graphics all ask geometric questions.", paragraphs: ["Which points form the outer boundary? How far apart are two locations? Do two segments cross? Is a point inside a region?", "Computational geometry turns these visual questions into reliable calculations."], bullets: ["Convex hull", "Closest pair", "Line intersection", "Point-in-polygon"] },
      { title: "Three formulas do a lot", lead: "The same coordinate operations support many algorithms.", paragraphs: ["Distance measures separation. The cross product tells whether a turn is left, right, or collinear. The shoelace formula finds polygon area."], formula: "d = √((x₂−x₁)² + (y₂−y₁)²)\ncross = (xB−xA)(yC−yA) − (yB−yA)(xC−xA)\narea = ½ |sum of cross-products|" },
      { title: "Move the points", lead: "Drag the three points or choose a worked example.", paragraphs: ["Observe how the triangle's distance, turn direction, and area change as the coordinates move."] },
      { title: "Watch a hull decision", lead: "A positive cross product means a left turn.", paragraphs: ["Graham scan repeatedly uses this orientation test while sweeping through sorted points. A right turn can signal that a point should be removed from the current hull."], bullets: ["Positive: left turn", "Negative: right turn", "Zero: collinear"] },
      { title: "Predict the orientation", lead: "Look at the arrows A → B → C.", paragraphs: ["The answer comes from the sign of the cross product, not from the visual angle alone."] },
      { title: "The reusable idea", lead: "Geometry algorithms make visual structure computable.", paragraphs: ["Once distance, orientation, and area are reliable primitives, larger algorithms can build hulls, detect intersections, and partition space."], formula: "visual question → coordinate calculation → algorithmic decision" }
    ],
    check: { question: "For A(0,0), B(4,0), C(2,3), what does a positive cross product indicate?", options: ["A right turn", "A left turn", "Collinearity", "A collision only"], answer: 1, explanation: "A positive cross product means the path A → B → C makes a left turn." },
    takeaway: "Distance, orientation, and area are small mathematical tools that let algorithms reason about shapes."
  },
  {
    id: "parallel",
    title: "Parallel Algorithms",
    shortTitle: "Work together",
    summary: "Divide a large problem into tasks that multiple processors can execute at the same time, then combine the results.",
    objective: "Distinguish data, task, and pipeline parallelism and understand the MapReduce pattern.",
    lessonLength: "11 min",
    complexity: "simulated speedup",
    accent: "ok",
    stages: [
      { title: "One problem, many workers", lead: "Parallelism changes how work is scheduled.", paragraphs: ["A parallel algorithm divides a large task, distributes pieces to processors, processes them simultaneously, and combines the results.", "The goal is not merely more processors. The work must be divided with manageable dependencies and synchronization."], bullets: ["Divide", "Distribute", "Process", "Combine"] },
      { title: "Three ways to split work", lead: "The course presents data, task, and pipeline parallelism.", paragraphs: ["Data parallelism applies the same operation to different data ranges. Task parallelism assigns different jobs to different processors. Pipeline parallelism divides work into stages that overlap across inputs."], bullets: ["Data: same operation, different records", "Task: different operations at once", "Pipeline: different stages overlap"] },
      { title: "Set up a simulation", lead: "Adjust worker count and the amount of work.", paragraphs: ["The visualization below is a scheduling simulation—not a measurement of real hardware performance. It makes the allocation pattern visible."] },
      { title: "Watch the lanes", lead: "Each lane represents one worker processing its assigned tasks.", paragraphs: ["MapReduce adds a useful mental model: Map processes partitions in parallel, then Reduce combines partial results."], bullets: ["Map: parallel partial work", "Reduce: combine partial results"] },
      { title: "Predict the speedup", lead: "More workers can reduce the simulated work per lane, but not every problem scales perfectly.", paragraphs: ["Look for the difference between sequential units and the longest worker lane."] },
      { title: "The reusable idea", lead: "Parallel algorithms are about coordination.", paragraphs: ["A good design balances work, respects dependencies, and has a clear combine step. The speedup shown here is a teaching simulation."], formula: "parallel time ≈ longest worker lane + coordination cost" }
    ],
    check: { question: "Which pattern applies the same operation to different data partitions?", options: ["Task parallelism", "Data parallelism", "Pipeline parallelism", "Serial search"], answer: 1, explanation: "Data parallelism applies the same operation to separate data ranges simultaneously." },
    takeaway: "Parallelism works when independent work can be distributed and the partial results can be combined safely."
  }
];

export function getTopic(id: TopicId): Module6Topic {
  return MODULE6_TOPICS.find((topic) => topic.id === id) ?? MODULE6_TOPICS[0];
}
