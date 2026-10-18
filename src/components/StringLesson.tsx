import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { getTopic, LEARNING_STAGES } from "../data/module6Lessons";
import { runNaive, type NaiveStep } from "../engine/strings/naive";
import { runRabinKarp, type RKStep } from "../engine/strings/rabinKarp";
import { runBoyerMoore, type BMStep } from "../engine/strings/boyerMoore";
import { usePlayback } from "../hooks/usePlayback";
import { PlaybackControls } from "./PlaybackControls";
import { StepLog } from "./StepLog";
import { StringViz } from "./StringViz";
import { TimelineScrubber } from "./TimelineScrubber";
import { Button, Card, inputCls } from "./ui";

const KEY = "module6:learn-progress";

type Algorithm = "naive" | "rabin-karp" | "boyer-moore";
type StringStep = NaiveStep | RKStep | BMStep;

const ALGORITHMS: ReadonlyArray<{
  id: Algorithm;
  label: string;
  shortLabel: string;
  color: string;
}> = [
  { id: "naive", label: "Naive", shortLabel: "Naive", color: "text-primary" },
  { id: "rabin-karp", label: "Rabin–Karp", shortLabel: "Rabin–Karp", color: "text-info" },
  { id: "boyer-moore", label: "Boyer–Moore", shortLabel: "Boyer–Moore", color: "text-accent" },
];

function readProgress(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function persist(progress: Record<string, number>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // The lesson remains usable when storage is unavailable.
  }
}

function buildTrace(algorithm: Algorithm, text: string, pattern: string): StringStep[] {
  if (algorithm === "naive") return runNaive(text, pattern).steps;
  if (algorithm === "rabin-karp") return runRabinKarp(text, pattern).steps;
  return runBoyerMoore(text, pattern).steps;
}

function algorithmLabel(algorithm: Algorithm) {
  return ALGORITHMS.find((item) => item.id === algorithm)?.label ?? "String matcher";
}

function CharacterBoxes({
  value,
  tone = "bg-card border-line text-ink",
  label,
}: {
  value: string;
  tone?: string;
  label: string;
}) {
  return (
    <div className="flex min-w-max items-center gap-1" aria-label={`${label}: ${value || "empty"}`}>
      {value ? (
        value.split("").map((character, index) => (
          <span
            key={`${character}-${index}`}
            className={`flex h-8 w-7 items-center justify-center rounded-md border-2 text-sm font-body font-bold ${tone}`}
          >
            {character === " " ? "·" : character}
          </span>
        ))
      ) : (
        <span className="rounded-md border-2 border-dashed border-line px-3 py-1.5 text-xs text-muted-fg">empty</span>
      )}
    </div>
  );
}

function AlignmentVisual() {
  const text = "FLOODCONTROL";
  const pattern = "CONT";
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
      <div className="min-w-[560px] space-y-2 font-mono text-xs">
        <div className="grid grid-cols-[4.5rem_repeat(12,1.75rem)] items-center gap-1">
          <span className="font-display font-bold text-muted-fg">text</span>
          {text.split("").map((character, index) => (
            <span
              key={`${character}-${index}`}
              className="flex h-8 items-center justify-center rounded-md border-2 border-line bg-card font-bold text-ink"
            >
              {character}
            </span>
          ))}
          <span className="font-display font-bold text-muted-fg">index</span>
          {text.split("").map((_, index) => (
            <span key={index} className="text-center text-[10px] text-muted-fg">
              {index}
            </span>
          ))}
          <span className="font-display font-bold text-primary">pattern</span>
          <div className="col-start-7 col-span-4 flex gap-1">
            {pattern.split("").map((character, index) => (
              <span
                key={`${character}-${index}`}
                className="flex h-8 w-7 items-center justify-center rounded-md border-2 border-primary bg-primary/10 font-bold text-primary"
              >
                {character}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pl-[4.75rem] text-primary">
          <span aria-hidden>↳</span>
          <span className="font-display font-bold">aligned at start index 5</span>
          <span className="rounded bg-primary/10 px-2 py-1">shift = 5</span>
        </div>
      </div>
    </div>
  );
}

function MechanismVisuals() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <article className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-black text-ink">Naive</h3>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-display font-bold text-primary">shift +1</span>
        </div>
        <div className="mt-3 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 text-muted-fg">text</span>
            <CharacterBoxes value="ABCD" label="Naive text window" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 text-primary">pat.</span>
            <CharacterBoxes value="ABX" tone="bg-primary/10 border-primary text-primary" label="Naive pattern" />
          </div>
          <p className="font-display font-bold text-muted-fg">A = A → B = B → C ≠ X</p>
          <p className="text-primary">slide one position, restart at 0</p>
        </div>
      </article>

      <article className="rounded-xl border-2 border-info/20 bg-info/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-black text-ink">Rabin–Karp</h3>
          <span className="rounded-full bg-info/10 px-2 py-1 text-[10px] font-display font-bold text-info">hash first</span>
        </div>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-center gap-2 font-mono text-xs">
            <span className="rounded-lg border-2 border-info/30 bg-card px-2 py-1">H(windowᵢ)</span>
            <span className="text-info">= ?</span>
            <span className="rounded-lg border-2 border-primary/30 bg-primary/10 px-2 py-1 text-primary">H(pattern)</span>
          </div>
          <code className="block rounded-lg bg-ink p-2 text-[11px] text-white">
            Hᵢ₊₁ = (d(Hᵢ − out·dᵐ⁻¹) + in) mod q
          </code>
          <p className="text-xs leading-relaxed text-muted-fg">Equal fingerprints trigger character-by-character verification.</p>
        </div>
      </article>

      <article className="rounded-xl border-2 border-accent/20 bg-accent/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-black text-ink">Boyer–Moore</h3>
          <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-display font-bold text-accent">skip ahead</span>
        </div>
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-1 font-mono text-xs">
            {["A", "B", "X", "D"].map((character, index) => (
              <span
                key={character}
                className={`flex h-8 w-7 items-center justify-center rounded-md border-2 font-bold ${index === 3 ? "border-accent bg-accent/10 text-accent" : "border-line bg-card text-ink"}`}
              >
                {character}
              </span>
            ))}
            <span className="ml-2 font-display font-bold text-accent">← compare</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
            {["A→2", "B→1", "X→3", "*→4"].map((item) => (
              <span key={item} className="rounded bg-card px-1.5 py-1 text-muted-fg">
                {item}
              </span>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-muted-fg">A bad-character lookup decides how far the next alignment can jump.</p>
        </div>
      </article>
    </div>
  );
}

function ComparisonMatrix() {
  const rows = [
    ["Direction", "Left → right", "Hash window first", "Right → left"],
    ["Movement", "Shift by one", "Slide one window", "Bad-character shift"],
    ["Extra information", "None", "Rolling fingerprint", "Mismatch table"],
    ["Best use", "Small or simple inputs", "Many pattern searches", "Long text with useful skips"],
  ];
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-line">
      <table className="min-w-[680px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">Comparison of the three string matching algorithms</caption>
        <thead className="bg-muted text-xs uppercase tracking-wide text-muted-fg">
          <tr>
            <th scope="col" className="border-b-2 border-line px-3 py-3 font-display font-black">Choice</th>
            <th scope="col" className="border-b-2 border-line px-3 py-3 font-display font-black text-primary">Naive</th>
            <th scope="col" className="border-b-2 border-line px-3 py-3 font-display font-black text-info">Rabin–Karp</th>
            <th scope="col" className="border-b-2 border-line px-3 py-3 font-display font-black text-accent">Boyer–Moore</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([choice, naive, rabinKarp, boyerMoore]) => (
            <tr key={choice} className="odd:bg-card even:bg-muted/40">
              <th scope="row" className="border-b border-line px-3 py-3 font-display font-bold text-ink">{choice}</th>
              <td className="border-b border-line px-3 py-3 text-muted-fg">{naive}</td>
              <td className="border-b border-line px-3 py-3 text-muted-fg">{rabinKarp}</td>
              <td className="border-b border-line px-3 py-3 text-muted-fg">{boyerMoore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TraceLab({ mode }: { mode: "interact" | "watch" }) {
  const [text, setText] = useState("FLOODCONTROL");
  const [pattern, setPattern] = useState("CONT");
  const [algorithm, setAlgorithm] = useState<Algorithm>("naive");
  const [runState, setRunState] = useState<{
    text: string;
    pattern: string;
    algorithm: Algorithm;
  } | null>(null);
  const pb = usePlayback<StringStep>(900);

  const run = (nextAlgorithm: Algorithm = algorithm) => {
    const nextText = text.slice(0, 72);
    const nextPattern = pattern.slice(0, 24);
    setAlgorithm(nextAlgorithm);
    setRunState({ text: nextText, pattern: nextPattern, algorithm: nextAlgorithm });
    pb.setSteps(buildTrace(nextAlgorithm, nextText, nextPattern));
  };

  const displayed = runState ?? { text, pattern, algorithm };
  const currentNote = pb.step?.note ?? "Run a trace to see the engine's next decision.";

  return (
    <Card
      title={mode === "interact" ? "Interactive lab · edit the search" : "Watch the algorithm · choose a real trace"}
      accent={mode === "interact" ? "border-primary/40" : "border-info/40"}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-muted-fg">
          <span className="font-display text-xs font-bold uppercase tracking-wide">Text</span>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={72}
            className={inputCls}
            aria-label="Search text"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-fg">
          <span className="font-display text-xs font-bold uppercase tracking-wide">Pattern</span>
          <input
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            maxLength={24}
            className={inputCls}
            aria-label="Search pattern"
          />
        </label>
      </div>

      {mode === "interact" ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex min-w-[190px] flex-col gap-1.5 text-sm text-muted-fg">
            <span className="font-display text-xs font-bold uppercase tracking-wide">Algorithm</span>
            <select
              value={algorithm}
              onChange={(event) => setAlgorithm(event.target.value as Algorithm)}
              className={inputCls}
              aria-label="Choose string matching algorithm"
            >
              {ALGORITHMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <Button type="button" variant="primary" onClick={() => run()}>
            <Play className="h-4 w-4" aria-hidden /> Run {algorithmLabel(algorithm)}
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Choose a trace to watch">
          {ALGORITHMS.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={runState?.algorithm === item.id ? "primary" : "secondary"}
              onClick={() => run(item.id)}
              aria-pressed={runState?.algorithm === item.id}
            >
              <Play className="h-4 w-4" aria-hidden />
              Watch {item.shortLabel}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-xl border-2 border-line bg-muted/30 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display font-black text-ink">{algorithmLabel(displayed.algorithm)} trace</p>
            <p className="text-xs text-muted-fg">{runState ? "The visualization uses the last submitted inputs." : "The boxes will highlight the current comparison."}</p>
          </div>
          {runState && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-display font-bold text-primary" aria-live="polite">
              {pb.step?.comparisons ?? 0} comparison{(pb.step?.comparisons ?? 0) === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <StringViz
          text={displayed.text}
          pattern={displayed.pattern}
          step={runState ? pb.step : null}
          algorithm={displayed.algorithm}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)]">
        <div>
          <PlaybackControls pb={pb} />
          <TimelineScrubber pb={pb} />
          <p className="mt-3 rounded-xl bg-primary/5 px-3 py-2 text-sm leading-relaxed text-ink" aria-live="polite">
            <span className="font-display font-bold text-primary">Current decision: </span>
            {currentNote}
          </p>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-display font-black uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" aria-hidden /> Step log
          </p>
          <StepLog notes={pb.steps.map((step) => step.note)} current={pb.index} />
        </div>
      </div>
    </Card>
  );
}

function KnowledgeCheck({
  onResult,
}: {
  onResult: (selected: number | null, checked: boolean) => void;
}) {
  const topic = getTopic("strings");
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === topic.check.answer;

  const choose = (index: number) => {
    setSelected(index);
    onResult(index, false);
  };

  const check = () => {
    setChecked(true);
    onResult(selected, true);
  };

  const retry = () => {
    setSelected(null);
    setChecked(false);
    onResult(null, false);
  };

  return (
    <Card title="Quick knowledge check" accent="border-accent/40">
      <div className="flex gap-3">
        <CircleHelp className="h-5 w-5 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-black text-ink">{topic.check.question}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {topic.check.options.map((option, index) => (
              <button
                key={option}
                type="button"
                disabled={checked}
                onClick={() => choose(index)}
                className={`min-h-12 rounded-xl border-2 px-4 text-left font-body transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  selected === index
                    ? checked
                      ? correct
                        ? "border-ok bg-ok/10 text-ok"
                        : "border-danger bg-danger/10 text-danger"
                      : "border-primary bg-primary/10 text-ink"
                    : "border-line bg-card text-ink hover:border-primary/40"
                }`}
              >
                <b className="mr-2 font-display">{String.fromCharCode(65 + index)}</b>
                {option}
              </button>
            ))}
          </div>
          {!checked ? (
            <Button type="button" variant="accent" className="mt-4" disabled={selected === null} onClick={check}>
              Check answer
            </Button>
          ) : (
            <div className={`mt-4 rounded-xl p-4 ${correct ? "bg-ok/10 text-ok" : "bg-amber-50 text-amber-900"}`}>
              <p className="font-display font-bold">{correct ? "Correct." : "Not yet — use the alignment."}</p>
              <p className="mt-1 text-sm leading-relaxed">{topic.check.explanation}</p>
              {!correct && (
                <Button type="button" variant="ghost" className="mt-3" onClick={retry}>
                  Try again
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function StringLesson() {
  const topic = getTopic("strings");
  const [stage, setStage] = useState(() => Math.min(readProgress().strings ?? 0, LEARNING_STAGES.length - 1));
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const current = topic.stages[stage];

  const setStageAndSave = (next: number) => {
    const bounded = Math.max(0, Math.min(LEARNING_STAGES.length - 1, next));
    const previous = readProgress();
    setStage(bounded);
    persist({ ...previous, strings: Math.max(previous.strings ?? 0, bounded) });
    setSelected(null);
    setChecked(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const answerCorrect = selected === topic.check.answer;

  return (
    <div className="space-y-4">
      <Card accent="border-primary/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-display font-black uppercase tracking-wide text-primary">Guided lesson · visual edition</p>
            <h2 className="mt-1 font-display text-2xl font-black text-ink">{topic.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-fg">Align a pattern, compare three strategies, and watch the real search state change one step at a time.</p>
          </div>
          <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
            <p className="text-xs text-muted-fg">Stage</p>
            <p className="font-display font-black text-primary">{stage + 1}/6</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-1.5 sm:grid-cols-6" aria-label="String matching lesson stages">
          {LEARNING_STAGES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStageAndSave(index)}
              aria-current={stage === index ? "step" : undefined}
              className={`min-h-14 rounded-xl border-2 px-1 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                stage === index
                  ? "border-primary bg-primary text-white"
                  : stage > index
                    ? "border-ok/30 bg-ok/10 text-ok"
                    : "border-line bg-card text-muted-fg hover:border-primary/40"
              }`}
            >
              <span className="block text-[10px] font-display font-black">{item.number}</span>
              <span className="mt-1 block text-[10px] font-display font-bold leading-tight">{item.title}</span>
            </button>
          ))}
        </div>
      </Card>

      <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Card title={`${LEARNING_STAGES[stage].number} · ${current.title}`} accent="border-primary/30">
          <p className="font-display font-bold text-primary">{current.lead}</p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
            {current.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {current.bullets && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {current.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 rounded-xl bg-muted/60 p-3 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>
          )}
          {current.formula && <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-ink p-4 font-mono text-sm text-white">{current.formula}</pre>}
        </Card>

        {stage === 0 && (
          <Card title="Visual model · every search is an alignment" accent="border-primary/40">
            <AlignmentVisual />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Window", "A pattern-sized slice of the text."],
                ["Shift", "Move the pattern to a new starting index."],
                ["Match", "The window equals the pattern character by character."],
              ].map(([label, description]) => (
                <div key={label} className="rounded-xl bg-muted/60 p-3">
                  <p className="font-display font-bold text-ink">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-fg">{description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {stage === 1 && (
          <>
            <Card title="Three strategies · same answer, different evidence" accent="border-primary/40">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                  <p className="font-display font-black text-primary">Naive</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">Compares <strong>left-to-right</strong> and <strong>shifts by one</strong> after each alignment.</p>
                </div>
                <div className="rounded-xl border-2 border-info/20 bg-info/5 p-4">
                  <p className="font-display font-black text-info">Rabin–Karp</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">Fingerprints windows with a <strong>rolling hash</strong>; a hash match is <strong>verified</strong> character by character.</p>
                </div>
                <div className="rounded-xl border-2 border-accent/20 bg-accent/5 p-4">
                  <p className="font-display font-black text-accent">Boyer–Moore</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">Compares <strong>right-to-left</strong> and uses <strong>bad-character shifts</strong> to skip windows.</p>
                </div>
              </div>
            </Card>
            <MechanismVisuals />
            <Card title="Comparison matrix" accent="border-ok/30">
              <ComparisonMatrix />
              <p className="mt-3 text-xs leading-relaxed text-muted-fg">All three engines return the same match positions. Their advantage comes from how much work they avoid between alignments.</p>
            </Card>
          </>
        )}

        {stage === 2 && <TraceLab mode="interact" />}

        {stage === 3 && (
          <>
            <TraceLab mode="watch" />
            <Card title="Trace legend" accent="border-info/30">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Compare", "The engine is checking characters.", "bg-amber-500"],
                  ["Mismatch", "This alignment cannot finish.", "bg-red-500"],
                  ["Hash / table", "A numeric or lookup decision is happening.", "bg-info"],
                  ["Match", "The pattern was verified here.", "bg-ok"],
                ].map(([label, description, color]) => (
                  <div key={label} className="flex items-start gap-2 rounded-xl bg-muted/60 p-3">
                    <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${color}`} aria-hidden />
                    <div><p className="font-display text-sm font-bold text-ink">{label}</p><p className="mt-1 text-xs leading-relaxed text-muted-fg">{description}</p></div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {stage === 4 && (
          <KnowledgeCheck
            onResult={(nextSelected, nextChecked) => {
              setSelected(nextSelected);
              setChecked(nextChecked);
            }}
          />
        )}

        {stage === 5 && (
          <>
            <Card title="Reflect · information changes movement" accent="border-ok/40">
              <div className="flex gap-3">
                <Trophy className="h-6 w-6 shrink-0 text-ok" aria-hidden />
                <div>
                  <p className="font-display text-xl font-black text-ink">{topic.takeaway}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-fg">When you meet a new matching problem, ask what evidence can be reused: partial comparisons, a rolling fingerprint, or mismatch information.</p>
                </div>
              </div>
            </Card>
            <Card title="One-minute recap" accent="border-primary/30">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-primary/5 p-4"><Target className="h-5 w-5 text-primary" aria-hidden /><p className="mt-2 font-display font-bold text-ink">Align</p><p className="mt-1 text-xs leading-relaxed text-muted-fg">A pattern-sized window gives every matcher a common starting point.</p></div>
                <div className="rounded-xl bg-info/5 p-4"><Sparkles className="h-5 w-5 text-info" aria-hidden /><p className="mt-2 font-display font-bold text-ink">Measure</p><p className="mt-1 text-xs leading-relaxed text-muted-fg">Hashes and tables turn previous work into a cheaper next decision.</p></div>
                <div className="rounded-xl bg-ok/10 p-4"><Check className="h-5 w-5 text-ok" aria-hidden /><p className="mt-2 font-display font-bold text-ink">Verify</p><p className="mt-1 text-xs leading-relaxed text-muted-fg">A final match is always about the actual characters, not only a shortcut.</p></div>
              </div>
            </Card>
          </>
        )}
      </motion.div>

      <div className="flex flex-wrap justify-between gap-2">
        <Button type="button" variant="ghost" disabled={stage === 0} onClick={() => setStageAndSave(stage - 1)}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
        </Button>
        <div className="flex gap-2">
          {stage === 5 && (
            <Button type="button" variant="ghost" onClick={() => setStageAndSave(0)}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Restart
            </Button>
          )}
          {stage < 5 && (
            <Button
              type="button"
              variant="primary"
              disabled={stage === 4 && (!checked || !answerCorrect)}
              onClick={() => setStageAndSave(stage + 1)}
            >
              Continue <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
