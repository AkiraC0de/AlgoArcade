import { useState } from "react";
import { usePlayback } from "../../hooks/usePlayback";
import { runNaive, type NaiveStep } from "../../engine/strings/naive";
import { runRabinKarp, type RKStep } from "../../engine/strings/rabinKarp";
import { runBoyerMoore, type BMStep } from "../../engine/strings/boyerMoore";
import { BM_DOC_PATTERN, BM_DOC_TEXT, DOC_PATTERN, DOC_TEXT, WORST_CASE_PATTERN, WORST_CASE_TEXT } from "../../engine/strings/presets";
import { PlaybackControls } from "../../components/PlaybackControls";
import { TimelineScrubber } from "../../components/TimelineScrubber";
import { InsightCard } from "../../components/InsightCard";
import { ComplexityBars } from "../../components/ComplexityBars";
import { StepLog } from "../../components/StepLog";
import { StringViz } from "../../components/StringViz";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useBookmarks } from "../../hooks/useBookmarks";
import { Field, inputCls, Panel, PixelButton } from "../../components/ui";

type Algo = "naive" | "rabin-karp" | "boyer-moore";

const COMPLEXITY: Record<Algo, { best: string; worst: string; space: string; note: string }> = {
  naive: {
    best: "O(n) \u2014 pattern found at first position with all chars matching",
    worst: "O(n\u00b7m) \u2014 e.g. text=AAAAAA, pattern=AAAB",
    space: "O(1)",
    note: "Slides one position at a time, restarts comparisons from scratch at each shift.",
  },
  "rabin-karp": {
    best: "O(n+m) \u2014 no hash collisions except true matches",
    worst: "O(n\u00b7m) \u2014 many spurious hash collisions",
    space: "O(1)",
    note: "Rolling hash with d=10, q=241. Character verification only when hashes match.",
  },
  "boyer-moore": {
    best: "O(n/m) \u2014 sublinear! Skips large sections via bad-character rule",
    worst: "O(n\u00b7m) \u2014 without good-suffix rule (not implemented here)",
    space: "O(m) for the bad-match table",
    note: "Compares right-to-left, uses Bad Match Table to skip ahead. Good Suffix rule mentioned in course but not implemented (v1).",
  },
};

export function StringsPlayground() {
  const [text, setText] = useState(DOC_TEXT);
  const [pattern, setPattern] = useState(DOC_PATTERN);
  const [algo, setAlgo] = useState<Algo>("naive");
  const [error, setError] = useState("");

  const pb = usePlayback<NaiveStep | RKStep | BMStep>(1600);
  const { bookmarks, add: addBookmark } = useBookmarks();
  useKeyboardShortcuts(pb);

  const run = () => {
    setError("");
    if (!text || !pattern) {
      setError("Both text and pattern are required.");
      return;
    }
    if (pattern.length > text.length) {
      setError("Pattern is longer than text \u2014 no match possible.");
      return;
    }
    let steps: (NaiveStep | RKStep | BMStep)[];
    if (algo === "naive") steps = runNaive(text, pattern).steps;
    else if (algo === "rabin-karp") steps = runRabinKarp(text, pattern).steps;
    else steps = runBoyerMoore(text, pattern).steps;
    pb.setSteps(steps);
    pb.play();
  };

  const loadPreset = (t: string, p: string) => {
    setText(t);
    setPattern(p);
    pb.setSteps([]);
    setError("");
  };

  const complexity = COMPLEXITY[algo];
  const comparisons = pb.done ? (pb.steps.at(-1)?.comparisons ?? 0) : 0;
  const matches = pb.done ? (pb.steps.at(-1)?.matches ?? []) : [];

  return (
    <div className="space-y-4">
      {/* Input panel */}
      <Panel title="CONTROL PANEL" accent="border-neon-cyan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="TEXT">
            <input
              className={inputCls}
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              maxLength={40}
              aria-label="Text to search in"
            />
          </Field>
          <Field label="PATTERN">
            <input
              className={inputCls}
              value={pattern}
              onChange={(e) => setPattern(e.target.value.toUpperCase())}
              maxLength={12}
              aria-label="Pattern to search for"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Field label="ALGORITHM">
            <select
              className={inputCls}
              value={algo}
              onChange={(e) => setAlgo(e.target.value as Algo)}
              aria-label="Select algorithm"
            >
              <option value="naive">Naive (Brute Force)</option>
              <option value="rabin-karp">Rabin-Karp (Rolling Hash)</option>
              <option value="boyer-moore">Boyer-Moore (Bad Character)</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <PixelButton variant="green" onClick={run}>\u25b6 RUN</PixelButton>
          <PixelButton variant="dim" onClick={() => loadPreset(DOC_TEXT, DOC_PATTERN)}>
            DOC: FLOODCONTROL/CONT
          </PixelButton>
          <PixelButton variant="dim" onClick={() => loadPreset(BM_DOC_TEXT, BM_DOC_PATTERN)}>
            DOC: FLOODCONTOTN/TOTN
          </PixelButton>
          <PixelButton variant="dim" onClick={() => loadPreset(WORST_CASE_TEXT, WORST_CASE_PATTERN)}>
            WORST: AAAAAA/AAAB
          </PixelButton>
          <PixelButton
            variant="dim"
            onClick={() => addBookmark(text, pattern)}
            disabled={!text || !pattern}
          >
            \ud83d\udcbe SAVE
          </PixelButton>
        </div>
        {bookmarks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {bookmarks.map((b) => (
              <button
                key={b.id}
                className="text-[10px] font-term text-neon-cyan border border-grid px-1.5 py-0.5 hover:border-neon-cyan"
                onClick={() => loadPreset(b.text, b.pattern)}
                title={`${b.text} / ${b.pattern}`}
              >
                {`${b.text}/${b.pattern}`.slice(0, 18)}
              </button>
            ))}
          </div>
        )}
        {error && <p className="text-neon-red text-xs mt-2 font-term" role="alert">{error}</p>}
        <p className="text-[10px] text-dim mt-2 font-term">
          Keyboard: Space = play/pause \u00b7 \u2190/\u2192 = step \u00b7 R = reset
        </p>
      </Panel>

      {/* Main area: side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Panel title="EXECUTION VIEWER" accent="border-neon-green">
            <StringViz text={text} pattern={pattern} step={pb.step} algorithm={algo} />
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
            { label: "Comparisons", value: comparisons },
            { label: "Matches found", value: matches.length },
            { label: "Total steps", value: pb.count },
          ]}
          tip={
            algo === "naive"
              ? "Notice how the pattern restarts from scratch at every shift. Try Boyer-Moore on the same input to see how skipping reduces comparisons."
              : algo === "rabin-karp"
              ? "Rabin-Karp only verifies characters when hashes collide. Try an input with many repeated characters to see more hash checks."
              : "Boyer-Moore skips positions using the bad-character table. Try a pattern with all unique characters vs one with repeats to feel the difference."
          }
          nextAction={
            algo !== "boyer-moore"
              ? { label: `Try ${algo === "naive" ? "Rabin-Karp" : "Boyer-Moore"} on same input`, onClick: () => { setAlgo(algo === "naive" ? "rabin-karp" : "boyer-moore"); pb.setSteps([]); } }
              : undefined
          }
        />
      )}

      {/* Complexity bars */}
      {pb.done && (
        <ComplexityBars
          actual={comparisons}
          worst={text.length * pattern.length}
          best={pattern.length}
        />
      )}

      {/* Complexity reference */}
      <Panel title="COMPLEXITY INTEL" accent="border-neon-magenta">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-term">
          <div>
            <dt className="text-neon-magenta font-pixel text-[8px] mb-1">BEST CASE</dt>
            <dd className="text-white">{complexity.best}</dd>
          </div>
          <div>
            <dt className="text-neon-magenta font-pixel text-[8px] mb-1">WORST CASE</dt>
            <dd className="text-white">{complexity.worst}</dd>
          </div>
          <div>
            <dt className="text-neon-magenta font-pixel text-[8px] mb-1">SPACE</dt>
            <dd className="text-white">{complexity.space}</dd>
          </div>
          <div>
            <dt className="text-neon-magenta font-pixel text-[8px] mb-1">CHARACTER</dt>
            <dd className="text-dim">{complexity.note}</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
