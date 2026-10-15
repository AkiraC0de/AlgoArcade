# Module 6: Advanced Algorithms — Interactive Arcade Learning Playground

**Course:** Algorithm and Complexity (BSCS-3B, Group 6) · **Stack:** Vite + React + TypeScript · **Storage:** LocalStorage only · **Theme:** Retro Arcade

> ⚠️ **Scope reality check (evidence-based):** The course document's own table-of-contents line reads *"Covers: Recap · Maximum Flow · String Matching"*. A keyword scan of the full extracted text confirms: **0** mentions of computational geometry, convex hull, parallel, thread, or worker. "Hash" appears only inside the Rabin-Karp section (rolling hash). **The document teaches 2 of the 5 listed subtopics.** This plan therefore builds two full playgrounds — Maximum Flow and String Matching — plus three locked "coming soon" cabinets that unlock only when real course material is provided. Nothing is invented.

---

## A. Course Content Analysis

### A.1 Recap (previous module — supporting content only)
The document opens with a one-paragraph-per-topic review: BFS (O(V+E)), DFS, Topological Sorting, Dijkstra (priority queue, non-negative weights), Bellman-Ford (negative weights, negative-cycle detection), Floyd-Warshall (all-pairs DP), Prim's, and Kruskal's. **Not new Module 6 material** — used as an optional "Recap Room" quiz mini-game (deferred phase).

### A.2 Maximum Flow
**Concepts taught:**
- Definition: greatest total traffic/data/liquid from Source to Sink through capacity-limited pathways.
- **Two Core Rules:** (1) Capacity Constraint — flow on an edge ≤ its capacity; (2) Flow Conservation — inflow = outflow at every intermediate node.
- Core vocabulary: Source (S), Sink (T), Capacity, Flow.
- **Bottleneck principle:** in path S→A→T with capacities 10 and 7, flow = 7 (narrowest link limits the path).

**The Ford–Fulkerson Algorithm** — greedy, iterative, residual-graph powered. The document's 3-step loop:
1. **Augmenting Path:** find any S→T path with remaining capacity.
2. **Bottleneck:** push the minimum residual capacity along that path.
3. **Update residuals + reverse edges** (the document's "undo mechanism" so later iterations can reroute sub-optimal choices).

**Worked examples in the document:**
- *Simple network* (S, A, B, T): S→A 10, S→B 10, A→T 7, B→T 10. Path S→A→T pushes 7; path S→B→T pushes 10; no paths remain → **Max Flow = 17** (A→T 7/7, B→T 10/10).
- *Practice network* (S, A, B, C, T): S→A 8, S→B 10, A→C 4, A→B 3, B→C 5, B→T 7, C→T 6. Document walkthrough: Path 1 S→A→C→T bottleneck 4 → Path 2 S→B→T bottleneck 7 → Path 3 S→A→B→C→T bottleneck min(4, 3, 5, 2) = 2 (residual S→A = 8−4, residual C→T = 6−4) → **Max Flow = 4 + 7 + 2 = 13**.

**Takeaways (document's own):** max flow value; the two core rules; Ford-Fulkerson as the standard method; the 3-step loop; **path-choice flexibility** — different valid path orders arrive at the same maximum flow.

**Not stated in the document:** Ford-Fulkerson time complexity (flagged in §J).

### A.3 String Matching
**Definition taught:** comparing a string against another to determine identity or occurrence (example: "cat" in "The cat is sleeping").
**Running example:** pattern **"CONT"** (m=4) in text **"FLOODCONTROL"** (n=12) → match at index 5.

The document personifies each algorithm as a detective — this maps directly onto an arcade **character-select screen**:

| # | Detective persona | Algorithm | Mechanism (per document) | Complexity (per document) |
|---|---|---|---|---|
| 1 | "The Clumsy Rookie" | Naive / Brute-Force | Slide pattern one position at a time; compare each letter; restart comparisons from scratch at every shift | Time O((n−m+1)·m) → worst O(n·m); best O(n) (immediate mismatches); discards partial-match info |
| 2 | "The Digital Fingerprint" | Rabin-Karp (Rolling Hash) | Map chars to numbers (base d = alphabet size); compute h(P) and h(window) mod prime q; roll the hash in O(1) per slide; character-verify only on hash match | Average O(n+m); worst O(n·m) on collisions; best for multi-pattern/plagiarism. Doc example: hash 81 = 81 → match index 5–8 |
| 3 | "Detective #3" | Boyer-Moore | Compare right→left within the window; **Bad Character Rule** (realign rightmost occurrence of mismatching char) + **Good Suffix Shift**; shift by the larger; precomputed **Bad Match Table** | Best O(n/m) sub-linear; worst O(n·m) (rare with a good table). Doc example: pattern "TOTN" in "FLOODCONTOTN", table {*:4, T:1, O:2, N:4} → match index 8–11 |

**Not in the document:** standalone hashing/hash tables, computational geometry, parallel algorithms, KMP.

---

## B. Pages and Navigation

Arcade framing — the app is a **virtual arcade hall**; each topic is a cabinet/world.

| Route | Page | Purpose |
|---|---|---|
| `/` | **Arcade Entrance** | "MODULE 6 ARCADE" marquee, INSERT-COIN prompt, grid of cabinets. 2 playable: **PIPE WORKS** (Max Flow), **TEXT HUNTERS** (String Matching). 3 locked cabinets (Hashing, Geometry, Parallel) with "NEW CARTRIDGE REQUIRED" signs → tooltip explains material isn't in the course doc. Optional **RECAP ROOM** cabinet. Top HUD: XP, level, coins, sound toggle. |
| `/max-flow` | **Pipe Works world** | Sub-tabs: **Learn** (concept cards: two rules, bottleneck, 3-step loop) → **Playground** → **Challenges**. |
| `/string-matching` | **Text Hunters world** | Sub-tabs: **Character Select** (the 3 detectives with bios from the doc) → **Playground** (per selected algorithm) → **Versus Mode** (all 3 race on the same input) → **Challenges** ("case files"). |
| `/recap` | **Recap Room** | Optional quiz on the 8 previous-module algorithms (deferred). |
| `/player` | **Player Card** | XP/level bar, badges/achievements, per-challenge stars, quiz scores, storage disclaimer + **Reset Progress** button. |

Navigation model: Home is the hub; each world is a self-contained loop (Learn → Play → Challenge); the HUD persists globally. No dead ends — every completion screen routes back to hub or next challenge.

---

## C. Playground Specifications

### C.1 PIPE WORKS — Maximum Flow (Ford–Fulkerson)

- **Learning objective:** internalize capacity constraint, flow conservation, bottleneck, augmenting paths, residual updates/reverse edges, and termination; see that path order doesn't change the max flow.
- **Inputs:**
  - Preset graphs (loaded one click): *Simple 17* and *Practice 13* — exactly the document's two examples.
  - Custom builder: add up to 8 nodes, add directed edges with integer capacities, designate source/sink.
- **Controls:** Run, Step ▸, Step ◂, Play/Pause (speed slider), Reset; **Choose-Your-Path mode** toggle: the student picks the next augmenting path themselves instead of auto-selection.
- **Visualization (SVG directed graph):**
  - Edges labeled `flow/capacity`; saturated edges glow red.
  - Residual-view toggle: shows remaining forward capacity + dashed reverse edges.
  - During a step: the augmenting path lights up segment by segment; the bottleneck edge pulses with the `min(...)` expression rendered beside it; flow particles animate along the pushed path; running total ticks up like an arcade score counter.
- **Intermediate states displayed:** path search (frontier highlight), bottleneck computation, flow push, residual update, "any paths left?" termination check.
- **Step log:** one line per iteration, e.g. `ITER 2: PATH S→B→T · BOTTLENECK min(10,7)=7 · PUSHED 7 · TOTAL 17`. Final screen: max-flow value, per-edge flow table, saturated edges, and the doc's takeaways.
- **Validation:** capacities = positive integers; source ≠ sink; sink reachable from source (else warning); ≤ 8 nodes; duplicate-edge guard.
- **Complexity display:** the document states no complexity for FF. Show the doc's qualitative facts (greedy, iterative, terminates when no augmenting path remains) and, behind an "EXTENSION" label, the standard O(E·|f*|) bound — or omit it entirely (decision in §J).
- **Challenges (missions):**
  1. *Bottleneck Bingo* — given a displayed path, predict the bottleneck before reveal (1★–3★ by speed/attempts).
  2. *The 13 Job* — run the document's practice network to max flow 13; score by number of paths used.
  3. *Your Route, Same Loot* — reach max flow using a *different* path order than the walkthrough; proves path-choice flexibility.
  4. *Rule Patrol* — spot the violation in a presented state (flow > capacity, or conservation broken).

### C.2 TEXT HUNTERS — String Matching (shared shell, 3 algorithms)

**Shared inputs:** text + pattern text fields (defaults: `FLOODCONTROL` / `CONT`), plus per-algorithm parameter panels. A "Load Doc Example" button restores the exact course examples.

**C.2a Naive — "The Clumsy Rookie"**
- Visualization: text row with index labels; pattern window slides underneath one cell at a time; per-character comparison lamps (green ✓ / red ✗) light in order; shift animation on mismatch; counters for comparisons and shifts.
- Intermediate states: alignment → character-by-character compare → mismatch+shift → full match celebration ("SUSPECT FOUND AT INDEX 5").
- Presets to feel the worst case: `AAAAAB` / `AAAB` style repetitive inputs vs. the doc example.
- Complexity badge: worst O(n·m), best O(n) — with the doc's "discards all partial-match info" note.

**C.2b Rabin-Karp — "The Digital Fingerprint"**
- Parameters exposed: base **d** (alphabet size) and modulus prime **q**, with sensible defaults and a note that the doc's example shows hash value 81 (§J item 2).
- Visualization: (1) pattern hash build-up shown arithmetically, term by term, mod q; (2) window slide with the rolling-hash update formula displayed live: `h' = (d·(h − T[i]·d^(m−1)) + T[i+m]) mod q`; (3) hash-vs-hash meter — on equality, a "VERIFY!" popup runs the character check (collision rule-out); (4) collision demo preset where hashes match but strings don't.
- Complexity badge: average O(n+m), worst O(n·m) on collisions, best for multi-pattern search (doc).

**C.2c Boyer-Moore — "Detective #3"**
- Interactive **Bad Match Table** built live from the student's pattern (the doc's TOTN table {*:4, T:1, O:2, N:4} is the reference test case).
- Visualization: comparisons run **right-to-left** inside the window (visible direction arrow); on mismatch, the bad-character rule lookup is shown (char → table value), the shift amount is announced, and the pattern jumps — the skip itself is the teaching moment. Good Suffix: explained conceptually with the doc's one-liner and flagged "simplified in this build" (§J item 3).
- Doc-example mode: `FLOODCONTOTN` / `TOTN` → match at 8–11, reproduced exactly.
- Complexity badge: best O(n/m) sub-linear, worst O(n·m).

**C.2d Versus Mode (comparison):** same text+pattern fed to all three simultaneously; race lanes show comparisons, shifts, and hash operations as live counters; finish board ranks them. Directly reinforces the doc's "each with different trade-offs" framing and lets students discover when naive wins (tiny inputs) vs. when BM skips big.

**Challenges ("case files"):** predict the next BM shift; predict whether hashes match before verify; identify which index naive wastes comparisons on; complexity matchups (quiz format).

---

## D. Interaction and Learning Flow

1. **Enter arcade** → marquee + cabinets (curiosity hook, 5 seconds to first interaction).
2. **Learn** → short doc-grounded concept cards with one embedded micro-interaction each (e.g., drag flow onto an edge and watch the capacity constraint reject overflow).
3. **Play (exploration mode)** → free sandbox, all controls, no scoring pressure.
4. **Challenge (missions)** → attempts, hints after 2 misses, 1★–3★ scoring, coins awarded.
5. **Player Card** → XP levels, badges, progress bars per world, reset option.

Prediction interactions (the highest-value mechanic per the brief): before revealing bottleneck / shift / hash-match, the student picks an answer from options; wrong answers get a hint explaining *why*, never just "incorrect". Exploration and challenge modes share the same playground component — mode is a prop, not a fork.

---

## E. Visual Design — Arcade Theme

Grounded in the retro-arcade design language (pixel-font, dotted-border, high-contrast 8-bit aesthetic):

- **Base:** near-black surface (#0A0A12 range) with subtle CRT scanline overlay + optional vignette; dark mode only (arcade cabinets are dark).
- **Palette (neon on black):** primary electric blue #2A3FE5, neon cyan, hot magenta/pink, arcade yellow (coins/score), success green #16A34A, danger red #DC2626. Per-world accents: Pipe Works = cyan/blue pipes; Text Hunters = magenta/yellow detective-noir.
- **Typography:** Press Start 2P for headings, HUD numbers, and marquee text (display sizes ONLY — illegible in body); readable monospace/sans body face for explanations and step logs. Numbers rendered tabular.
- **Borders & surfaces:** dotted/stepped pixel borders, chunky 2–4px outlines, hard offset shadows (no soft blurs) — pressed-button states shift down-right by the shadow offset.
- **HUD:** persistent top bar styled as a cabinet scoreboard: XP, level, coins, sound toggle. Score/total counters tick digit-by-digit.
- **Feedback:** match found → jingle + pixel burst; mismatch → buzz + red flash; level-up → badge drop-in. Every effect honors a `reducedMotion` setting.
- **Iconography:** pixel-art cabinet sprites on the home grid; locked cabinets get a chain + "NEW CARTRIDGE REQUIRED" sign.
- **Responsive:** desktop-first; ≤768px stacks visualization above controls, HUD compresses to icon row; touch targets ≥44px; keyboard-first focus rings (accessibility: WCAG AA contrast on neon-on-black, visible focus states).

---

## F. React Architecture and Directory Structure

**Core architectural decision: trace-based execution.** Every algorithm is a pure TypeScript function `input → Trace`, where `Trace = Step[]` and `Step` is a typed, serializable record of one observable event (compare, shift, path-found, push, verify, terminate...). The UI *only* renders `steps[i]`. This makes step-back free (just `i−1`), keeps algorithms 100% unit-testable without React, and guarantees the visualization can never lie — it is generated from the real execution for the student's own input, never hardcoded.

```
src/
  main.tsx · App.tsx · router.tsx
  theme/              # arcade design tokens, global CSS, pixel fonts, scanline/CRT effects
  components/         # shared: Hud, PixelButton, Panel, StepLog,
                      #   PlaybackControls, ComplexityBadge, CabinetCard, StarRating
  engine/             # PURE LOGIC — zero React imports
    steps.ts          # shared Step/Trace discriminated unions
    maxflow/
      types.ts        # Graph, Edge, FlowState
      fordFulkerson.ts   # returns Trace<MaxFlowStep>
      residual.ts     # residual graph + reverse-edge bookkeeping
      presets.ts      # the document's Simple-17 and Practice-13 graphs
      validate.ts
    strings/
      types.ts
      naive.ts        # returns Trace<StringStep>
      rabinKarp.ts    # rolling hash arithmetic recorded per step
      boyerMoore.ts   # bad-match-table builder + search trace
      presets.ts      # FLOODCONTROL/CONT, FLOODCONTOTN/TOTN, worst-case sets
  hooks/
    usePlayback.ts    # index, play/pause, speed, step fwd/back over a Trace
    useProgress.ts    # XP/coins/stars facade over storage
  storage/
    storage.ts        # the ONLY module that touches localStorage (§G)
    schema.ts         # versioned types + migration/reset logic
  pages/
    Home.tsx
    maxflow/ { LearnPage, Playground, Challenges }
    strings/ { CharacterSelect, Playground, Versus, Challenges }
    recap/   { QuizPage }
    PlayerCard.tsx
  challenges/         # data-driven challenge definitions (id, world, prompt, check fn, stars)
  engine/**/*.test.ts # co-located Vitest unit tests
```

**State management:** React state for inputs; a small store (Zustand preferred for playback selectors) holds trace + cursor + playback status; progress flows through `useProgress`. No global store for algorithm internals — the trace is immutable data.

**Project status:** the `AlgoComplexity` folder is currently empty (verified) — greenfield scaffold in Phase 1; no existing code to migrate.

---

## G. LocalStorage Data Design

Single versioned key `algo-arcade:v1` holding one JSON blob — components never call `localStorage` directly:

```ts
interface SaveData {
  version: 1;
  progress: { xp: number; level: number; coins: number };
  challenges: Record<string, { stars: 0|1|2|3; bestScore: number; completedAt: string }>;
  quizScores?: Record<string, { correct: number; total: number }>;
  settings: { sound: boolean; animSpeed: 'slow'|'normal'|'fast'; reducedMotion: boolean };
  lastSession?: { playground: string; inputs: unknown }; // optional resume; NOT step state
}
```

Storage module responsibilities: `load()` (try/catch parse, schema-shape check, fill missing fields with defaults, version mismatch → migrate-or-reset with a visible notice), `save()` (debounced), `clearAll()`. Animation frames, playback cursor, and in-flight traces stay in memory only. UI notes on the Player Card: progress is **per-browser and per-origin**, not synced across devices, and not tamper-proof (a student can edit localStorage — acceptable for this context, stated plainly).

---

## H. Dependencies and Technical Decisions

**Required:** `react`, `react-dom`, `react-router-dom`, `zustand`, `tailwindcss` v4 (arcade theme expressed as custom tokens: neon palette, pixel-border utilities, scanline overlay).
**Dev:** `vite`, `typescript`, `vitest`, `@testing-library/react`, `jsdom`.
**Fonts:** Press Start 2P + a readable body face — bundled locally so the app works offline. Pixel font restricted to display sizes for legibility.
**Deliberately NOT added:** D3, framer-motion, canvas libs, graph libs — ≤8-node SVG graphs + CSS transitions + `requestAnimationFrame` playback cover everything; fewer deps, easier correctness audits. No sound library — Web Audio beeps are ~20 lines if wanted.

---

## I. Testing Strategy

- **Engine unit tests (Vitest) — the correctness backbone:**
  - Ford-Fulkerson on the doc's Simple network ⇒ max flow 17; on Practice network ⇒ 13. For *every* intermediate state in the trace, assert capacity constraint and flow conservation hold (programmatic invariant checks, not eyeballing).
  - Path-order invariance: run FF with different augmenting-path orders on presets ⇒ same max flow (the doc's flexibility takeaway, encoded as a test).
  - Naive, Rabin-Karp, Boyer-Moore on `FLOODCONTROL`/`CONT` ⇒ [5]; BM doc case `FLOODCONTOTN`/`TOTN` ⇒ [8]; RK hash trace reproduces documented values under chosen d, q.
  - Boyer-Moore bad-match table for `TOTN` ⇒ `{*:4, T:1, O:2, N:4}` exactly as in the document.
  - Edge cases: empty pattern, pattern longer than text, no match, multiple/overlapping matches, single-char inputs.
- **Property-style cross-check:** on randomized inputs, all three string algorithms return identical match-index sets.
- **Component tests:** PlaybackControls walk a known trace forward/backward; storage falls back to defaults on corrupted JSON; challenge scoring awards correct stars.
- **Manual QA pass:** responsive breakpoints (desktop / tablet / mobile — graph viz stacks above controls on small screens), reduced-motion setting, keyboard navigation of playback controls, AA contrast on neon palette.

---

## J. Priorities and Implementation Roadmap

| Phase | Deliverable | Exit criteria | Depends on |
|---|---|---|---|
| **1. Foundation** | Vite+React+TS scaffold, router, arcade theme tokens, HUD/layout shell, storage layer, `engine/steps.ts` + `usePlayback` | Empty worlds render; playback hook steps through a dummy trace | — |
| **2. First playable (Naive)** | Naive engine + trace, Text Hunters playground + Learn cards | Full learn→play→step-through loop on the doc example | 1 |
| **3. Complete Text Hunters** | Rabin-Karp, Boyer-Moore, Character Select, Versus mode, case-file challenges + XP | All 3 detectives verified against doc examples; versus race works | 2 |
| **4. Pipe Works** | FF engine + invariant-checked trace, SVG graph viz, residual/reverse-edge overlay, graph builder, challenges | Both doc networks reproduce 17 and 13 step-for-step | 1 (parallel-safe with 3) |
| **5. Meta & polish** | Player Card, locked cabinets, Recap Room quiz, sound, reduced motion, responsive QA | Everything persisted survives reload; reset works | 3, 4 |

Essential for v1: Phases 1–4. Deferrable: Recap Room, sound, achievements beyond stars, choose-your-path mode.

---

## K. Open Questions and Risks

1. **Missing topics (blocking for scope):** Hashing (standalone), Computational Geometry, and Parallel Algorithms are absent from the document (0 keyword hits; TOC confirms coverage). Plan: locked placeholder cabinets. If those worlds are *required* for the deliverable, instructor material is needed — otherwise building them means inventing course content, which the brief forbids.
2. **Rabin-Karp "81":** the document shows hash value 81 but never fixes base d or modulus q. The engine parameterizes both; the doc-example replay reproduces 81 only under a chosen (d, q) pair. Confirm intended parameters or accept a labeled default.
3. **Boyer-Moore good suffix:** mentioned but not detailed in the document (no table, no example). v1 fully implements the Bad Character rule and explains good suffix conceptually, labeled as simplified. Confirm whether a full good-suffix implementation is expected.
4. **Ford-Fulkerson complexity:** not stated in the document. Decide: show standard O(E·|f*|) behind an "EXTENSION" tag, or omit entirely.
5. **Naive best case "O(n)":** as written in the document; keep verbatim with a tooltip noting it's the immediate-mismatch case.
6. **Custom graph layout risk:** hand-rolled SVG needs node placement — mitigate with fixed layouts for presets and a simple circular layout for custom graphs.
7. **Pixel-font legibility:** arcade fonts only at display sizes; body text uses a readable face (accessibility guardrail, tested in Phase 5 QA).