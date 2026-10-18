import { useState } from "react";
import { Bookmark, Play, RefreshCw } from "lucide-react";
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
import { Button, Card, Field, inputCls } from "../../components/ui";

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
      <Card title="Input & configuration" accent="border-primary/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Text">
            <input
              className={inputCls}
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              maxLength={40}
              aria-label="Text to search in"
            />
          </Field>
          <Field label="Pattern">
            <input
              className={inputCls}
              value={pattern}
              onChange={(e) => setPattern(e.target.value.toUpperCase())}
              maxLength={12}
              aria-label="Pattern to search for"
            />
          </Field>
        </div>
        <div className="mt-3 max-w-xs">
          <Field label="Algorithm">
            <select
              className={`${inputCls} cursor-pointer`}
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
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="accent" onClick={run}>
            <Play className="w-4 h-4" aria-hidden /> Run
          </Button>
          <Button variant="ghost" onClick={() => loadPreset(DOC_TEXT, DOC_PATTERN)}>Doc: FLOODCONTROL/CONT</Button>
          <Button variant="ghost" onClick={() => loadPreset(BM_DOC_TEXT, BM_DOC_PATTERN)}>Doc: FLOODCONTOTN/TOTN</Button>
          <Button variant="ghost" onClick={() => loadPreset(WORST_CASE_TEXT, WORST_CASE_PATTERN)}>Worst: AAAAAA/AAAB</Button>
          <Button variant="secondary" onClick={() => addBookmark(text, pattern)} disabled={!text || !pattern}>
            <Bookmark className="w-4 h-4" aria-hidden /> Save input
          </Button>
        </div>
        {bookmarks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {bookmarks.map((b) => (
              <button
                key={b.id}
                className="text-xs font-body font-bold text-primary border-2 border-line bg-card rounded-full px-3 py-1.5 min-h-9 hover:border-primary transition-colors duration-200 cursor-pointer"
                onClick={() => loadPreset(b.text, b.pattern)}
                title={`${b.text} / ${b.pattern}`}
              >
                {`${b.text}/${b.pattern}`.slice(0, 18)}
              </button>
            ))}
          </div>
        )}
        {error && <p className="text-danger text-sm mt-2 font-body font-bold" role="alert">{error}</p>}
        <p className="text-xs text-muted-fg mt-3 font-body">
          Keyboard: Space = play/pause \u00b7 \u2190/\u2192 = step \u00b7 R = reset \u00b7 1\u20134 = speed
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Card title="Execution viewer" accent="border-ok/40">
            <StringViz text={text} pattern={pattern} step={pb.step} algorithm={algo} />
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
              ? {
                  label: `Try ${algo === "naive" ? "Rabin-Karp" : "Boyer-Moore"} on the same input`,
                  onClick: () => {
                    setAlgo(algo === "naive" ? "rabin-karp" : "boyer-moore");
                    pb.setSteps([]);
                  },
                }
              : undefined
          }
        />
      )}

      {pb.done && (
        <ComplexityBars
          actual={comparisons}
          worst={text.length * pattern.length}
          best={pattern.length}
        />
      )}

      <Card title="Complexity reference" accent="border-accent/40">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-body">
          <div className="clay-sm p-3">
            <dt className="font-display font-bold text-xs text-primary uppercase tracking-wide mb-1">Best case</dt>
            <dd className="text-ink">{complexity.best}</dd>
          </div>
          <div className="clay-sm p-3">
            <dt className="font-display font-bold text-xs text-danger uppercase tracking-wide mb-1">Worst case</dt>
            <dd className="text-ink">{complexity.worst}</dd>
          </div>
          <div className="clay-sm p-3">
            <dt className="font-display font-bold text-xs text-info uppercase tracking-wide mb-1">Space</dt>
            <dd className="text-ink">{complexity.space}</dd>
          </div>
          <div className="clay-sm p-3">
            <dt className="font-display font-bold text-xs text-muted-fg uppercase tracking-wide mb-1">Character</dt>
            <dd className="text-muted-fg">{complexity.note}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
