import { useMemo, useState } from "react";
import { usePlayback } from "../../hooks/usePlayback";
import { runNaive, type NaiveStep } from "../../engine/strings/naive";
import { runRabinKarp, type RKStep } from "../../engine/strings/rabinKarp";
import { runBoyerMoore, type BMStep } from "../../engine/strings/boyerMoore";
import { BM_DOC_PATTERN, BM_DOC_TEXT, DOC_PATTERN, DOC_TEXT, WORST_CASE_PATTERN, WORST_CASE_TEXT } from "../../engine/strings/presets";
import { PlaybackControls } from "../../components/PlaybackControls";
import { StepLog } from "../../components/StepLog";
import { StringViz } from "../../components/StringViz";
import { Field, inputCls, Panel, PixelButton } from "../../components/ui";

type Algo = "naive" | "rabin-karp" | "boyer-moore";

const COMPLEXITY: Record<Algo, { best: string; worst: string; space: string; note: string }> = {
  naive: {
    best: "O(n) — pattern found at first position with all chars matching",
    worst: "O(n·m) — e.g. text=AAAAAA, pattern=AAAB",
    space: "O(1)",
    note: "The Clumsy Rookie: slides one position at a time, restarts comparisons from scratch.",
  },
  "rabin-karp": {
    best: "O(n+m) — no hash collisions except true matches",
    worst: "O(n·m) — many spurious hash collisions",
    space: "O(1)",
    note: "The Digital Fingerprint: rolling hash d=10, q=241. Character verification only on hash match.",
  },
  "boyer-moore": {
    best: "O(n/m) — sublinear! Skips large sections via bad-character rule",
    worst: "O(n·m) — without good-suffix rule (not implemented here)",
    space: "O(m) for the bad-match table",
    note: "Detective #3: compares right-to-left, uses Bad Match Table to skip. Good Suffix rule mentioned in course but not implemented (v1).",
  },
};

export function StringsPlayground() {
  const [text, setText] = useState(DOC_TEXT);
  const [pattern, setPattern] = useState(DOC_PATTERN);
  const [algo, setAlgo] = useState<Algo>("naive");
  const [error, setError] = useState("");

  const pb = usePlayback<NaiveStep | RKStep | BMStep>(800);

  const run = () => {
    setError("");
    if (!text || !pattern) {
      setError("Both text and pattern are required.");
      return;
    }
    if (pattern.length > text.length) {
      setError("Pattern is longer than text — no match possible.");
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
          <PixelButton variant="green" onClick={run}>▶ RUN</PixelButton>
          <PixelButton variant="dim" onClick={() => loadPreset(DOC_TEXT, DOC_PATTERN)}>
            DOC: FLOODCONTROL/CONT
          </PixelButton>
          <PixelButton variant="dim" onClick={() => loadPreset(BM_DOC_TEXT, BM_DOC_PATTERN)}>
            DOC: FLOODCONTOTN/TOTN
          </PixelButton>
          <PixelButton variant="dim" onClick={() => loadPreset(WORST_CASE_TEXT, WORST_CASE_PATTERN)}>
            WORST: AAAAAA/AAAB
          </PixelButton>
        </div>
        {error && <p className="text-neon-red text-xs mt-2 font-term" role="alert">{error}</p>}
      </Panel>

      {/* Visualization */}
      <Panel title="EXECUTION VIEWER" accent="border-neon-green">
        <StringViz text={text} pattern={pattern} step={pb.step} algorithm={algo} />
      </Panel>

      {/* Playback */}
      <Panel title="PLAYBACK" accent="border-neon-purple">
        <PlaybackControls pb={pb} />
      </Panel>

      {/* Step log */}
      <Panel title="EXECUTION LOG" accent="border-neon-yellow">
        <StepLog
          notes={pb.steps.map((s) => s.note)}
          current={pb.index}
        />
      </Panel>

      {/* Complexity */}
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