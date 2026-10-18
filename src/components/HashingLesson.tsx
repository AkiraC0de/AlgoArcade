import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Hash, Play, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Button, Card, Field, inputCls } from "./ui";
import { getTopic, LEARNING_STAGES } from "../data/module6Lessons";
import { useGameStore } from "../state/gameStore";

const STORAGE_KEY = "module6:learn-progress";
const HASH_TRACE_KEYS = [3, 6, 9] as const;

type Progress = Record<string, number>;

type HashTraceStep = {
  title: string;
  note: string;
  inserted: number[];
  collision: boolean;
};

const HASH_TRACE: HashTraceStep[] = [
  {
    title: "Start with an empty table",
    note: "There is no key to place yet. The three buckets are ready.",
    inserted: [],
    collision: false,
  },
  {
    title: "Insert key 3",
    note: "3 mod 3 = 0, so key 3 starts a chain in bucket 0.",
    inserted: [3],
    collision: false,
  },
  {
    title: "Insert key 6",
    note: "6 mod 3 = 0 too. This is a collision, so chaining appends 6 after 3.",
    inserted: [3, 6],
    collision: true,
  },
  {
    title: "Insert key 9",
    note: "9 mod 3 = 0 again. The chain now keeps 3 → 6 → 9 in bucket 0.",
    inserted: [3, 6, 9],
    collision: true,
  },
];

function readProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Progress) : {};
  } catch {
    return {};
  }
}

function saveProgress(topicId: string, stage: number) {
  if (typeof window === "undefined") return;
  try {
    const previous = readProgress();
    const prior = Number(previous[topicId]);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...previous,
        [topicId]: Math.max(Number.isFinite(prior) ? prior : 0, stage),
      }),
    );
  } catch {
    // The lesson remains usable when storage is unavailable.
  }
}

function moduloIndex(key: number, tableSize: number) {
  return ((key % tableSize) + tableSize) % tableSize;
}

function parseKeys(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && Number.isFinite(Number(part)))
    .map(Number);
}

function HashPipeline({ keyValue, tableSize }: { keyValue: number; tableSize: number }) {
  const slot = moduloIndex(keyValue, tableSize);
  return (
    <figure className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 sm:p-5">
      <figcaption className="flex items-center gap-2 text-xs font-display font-black uppercase tracking-wide text-primary">
        <Hash className="h-4 w-4" aria-hidden="true" />
        Visual hash pipeline
      </figcaption>
      <div className="mt-4 grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-xl border-2 border-info/30 bg-card px-4 py-3 text-center">
          <span className="block text-[10px] font-display font-black uppercase tracking-wide text-muted-fg">input key</span>
          <strong className="mt-1 block font-display text-xl text-info">{keyValue}</strong>
        </div>
        <ArrowRight className="mx-auto h-5 w-5 rotate-90 text-primary sm:rotate-0" aria-hidden="true" />
        <div className="rounded-xl border-2 border-primary/30 bg-card px-4 py-3 text-center">
          <span className="block text-[10px] font-display font-black uppercase tracking-wide text-muted-fg">hash + modulo</span>
          <strong className="mt-1 block font-mono text-sm text-primary">h({keyValue}) = {keyValue} mod {tableSize}</strong>
        </div>
        <ArrowRight className="mx-auto h-5 w-5 rotate-90 text-primary sm:rotate-0" aria-hidden="true" />
        <div className="rounded-xl border-2 border-ok/30 bg-ok/10 px-4 py-3 text-center">
          <span className="block text-[10px] font-display font-black uppercase tracking-wide text-muted-fg">table location</span>
          <strong className="mt-1 block font-display text-xl text-ok">bucket {slot}</strong>
        </div>
      </div>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-fg">
        The hash function produces a value; modulo turns it into a valid table index.
      </p>
    </figure>
  );
}

function HashConcepts() {
  const concepts = [
    ["Hash function", "A fast rule that maps a key to a fixed-size hash value. A good one spreads likely keys across the table."],
    ["Modulo indexing", "For a table with m slots, h(k) = k mod m chooses a bucket from 0 through m − 1."],
    ["Collision", "Two different keys can produce the same index. Collisions are normal; the table needs a resolution strategy."],
    ["Chaining / open addressing", "Chaining stores a small list at one bucket. Open addressing probes other slots until it finds an empty one."],
    ["Not encryption", "A hash is designed for comparison and lookup, not secret recovery. It is one-way in intent, while encryption is reversible with a key."],
  ];

  return (
    <Card title="Mental model · five words to keep" accent="border-primary/30">
      <div className="grid gap-3 sm:grid-cols-2">
        {concepts.map(([title, detail], index) => (
          <div
            key={title}
            className={`rounded-xl border-2 p-4 ${index === concepts.length - 1 ? "border-accent/30 bg-accent/5 sm:col-span-2" : "border-line bg-muted/40"}`}
          >
            <p className="font-display font-black text-ink">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-fg">{detail}</p>
          </div>
        ))}
      </div>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-sm text-white">h(k) = k mod m</pre>
    </Card>
  );
}

function LiveHashTable({
  keysText,
  onKeysChange,
  tableSize,
  onTableSizeChange,
}: {
  keysText: string;
  onKeysChange: (value: string) => void;
  tableSize: number;
  onTableSizeChange: (value: number) => void;
}) {
  const keys = parseKeys(keysText);
  const buckets = Array.from({ length: tableSize }, (_, index) =>
    keys.filter((key) => moduloIndex(key, tableSize) === index),
  );
  const collisionCount = buckets.reduce((total, bucket) => total + Math.max(0, bucket.length - 1), 0);

  return (
    <Card title="Interact · build a live hash table" accent="border-info/40">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <Field label="Keys, separated by commas">
          <input
            className={inputCls}
            value={keysText}
            onChange={(event) => onKeysChange(event.target.value)}
            aria-describedby="hash-table-help"
            spellCheck={false}
          />
        </Field>
        <Field label="Table size (m)">
          <input
            className={inputCls}
            type="number"
            min={1}
            max={12}
            value={tableSize}
            onChange={(event) => {
              const next = Number(event.target.value);
              onTableSizeChange(Math.min(12, Math.max(1, Number.isFinite(next) && next > 0 ? next : 1)));
            }}
          />
        </Field>
      </div>
      <p id="hash-table-help" className="mt-3 text-xs leading-relaxed text-muted-fg">
        Try <strong className="text-ink">3, 6, 9</strong> with m = 3. Each key hashes to bucket 0, so the table must keep a chain there.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={`Hash table with ${tableSize} buckets`}>
        {buckets.map((bucket, index) => (
          <div
            key={index}
            role="listitem"
            className={`min-h-28 rounded-xl border-2 p-3 ${bucket.length > 1 ? "border-accent/50 bg-accent/5" : bucket.length === 1 ? "border-primary/30 bg-primary/5" : "border-line bg-muted/40"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-xs font-black uppercase tracking-wide text-muted-fg">bucket {index}</span>
              <span className="font-mono text-xs text-muted-fg">{bucket.length} item{bucket.length === 1 ? "" : "s"}</span>
            </div>
            {bucket.length === 0 ? (
              <p className="mt-5 text-sm italic text-muted-fg">empty</p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label={`Keys in bucket ${index}`}>
                {bucket.map((key, keyIndex) => (
                  <span key={`${key}-${keyIndex}`} className="inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-card px-2.5 py-1.5 font-mono text-sm font-bold text-primary">
                    {key}
                    {keyIndex < bucket.length - 1 && <span aria-hidden="true" className="text-accent">→</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/60 p-3 text-sm">
        <span className="text-muted-fg">Resolved with <strong className="text-ink">chaining</strong>: a bucket can hold a short linked list.</span>
        <span className="font-display font-black text-primary">{collisionCount} collision{collisionCount === 1 ? "" : "s"} counted</span>
      </div>
    </Card>
  );
}

function CollisionTrace() {
  const [traceStep, setTraceStep] = useState(0);
  const step = HASH_TRACE[traceStep];
  const buckets = [0, 1, 2].map((index) => step.inserted.filter((key) => moduloIndex(key, 3) === index));

  return (
    <Card title="Watch · 3, 6, 9 into m = 3" accent="border-ok/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-black text-ink">{step.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-fg">{step.note}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-display font-black text-primary">step {traceStep + 1}/4</span>
      </div>
      <div className="mt-4 flex gap-1.5" aria-label="Trace progress">
        {HASH_TRACE.map((item, index) => (
          <span key={item.title} className={`h-2 flex-1 rounded-full ${index <= traceStep ? "bg-primary" : "bg-muted"}`} aria-hidden="true" />
        ))}
      </div>
      <motion.div key={traceStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid gap-3 sm:grid-cols-3" aria-live="polite">
        {buckets.map((bucket, index) => (
          <div key={index} className={`min-h-28 rounded-xl border-2 p-3 ${index === 0 && bucket.length > 1 ? "border-accent/60 bg-accent/10" : "border-line bg-muted/40"}`}>
            <p className="font-display text-xs font-black uppercase tracking-wide text-muted-fg">bucket {index}</p>
            <div className="mt-4 flex min-h-9 flex-wrap items-center gap-1.5">
              {bucket.length === 0 ? <span className="text-sm italic text-muted-fg">empty</span> : bucket.map((key, keyIndex) => (
                <motion.span key={key} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-lg bg-card px-2.5 py-1.5 font-mono text-sm font-bold text-primary shadow-clay-sm">
                  {key}{keyIndex < bucket.length - 1 && <span aria-hidden="true" className="ml-1.5 text-accent">→</span>}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
      {step.collision && (
        <div className="mt-4 rounded-xl border-2 border-accent/30 bg-accent/10 p-3 text-sm text-accent" role="status">
          <strong className="font-display">Collision detected.</strong> Different keys share index 0; chaining preserves every key in order.
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setTraceStep(0)} disabled={traceStep === 0}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </Button>
        <Button onClick={() => setTraceStep((current) => Math.min(HASH_TRACE.length - 1, current + 1))} disabled={traceStep === HASH_TRACE.length - 1}>
          <Play className="h-4 w-4" aria-hidden="true" />
          {traceStep === 0 ? "Insert 3" : "Next insertion"}
        </Button>
      </div>
    </Card>
  );
}

export function HashingLesson() {
  const topic = getTopic("hashing");
  const setLessonProgress = useGameStore((state) => state.setLessonProgress);
  const [stage, setStage] = useState(() => {
    const saved = Number(readProgress()[topic.id]);
    return Number.isFinite(saved) ? Math.min(Math.max(saved, 0), LEARNING_STAGES.length - 1) : 0;
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [keysText, setKeysText] = useState("3, 6, 9");
  const [tableSize, setTableSize] = useState(3);
  const current = topic.stages[stage];
  const previewKey = parseKeys(keysText)[0] ?? 8;
  const answerCorrect = selectedAnswer === topic.check.answer;

  const moveToStage = (next: number) => {
    const bounded = Math.min(Math.max(next, 0), LEARNING_STAGES.length - 1);
    setStage(bounded);
    const nextProgress = Math.max(Number(readProgress()[topic.id]) || 0, bounded);
    saveProgress(topic.id, nextProgress);
    setLessonProgress(topic.id, nextProgress);
    setSelectedAnswer(null);
    setChecked(false);
  };

  return (
    <div className="space-y-4">
      <Card accent="border-primary/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-display font-black uppercase tracking-wide text-primary">Guided lesson · visual edition</p>
            <h2 className="mt-1 font-display text-2xl font-black text-ink">{topic.title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-fg">{topic.objective}</p>
          </div>
          <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
            <p className="text-xs text-muted-fg">Stage</p>
            <p className="font-display text-xl font-black text-primary">{stage + 1}/6</p>
          </div>
        </div>
        <nav className="mt-5 grid grid-cols-3 gap-1.5 sm:grid-cols-6" aria-label="Hashing lesson stages">
          {LEARNING_STAGES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => moveToStage(index)}
              aria-current={stage === index ? "step" : undefined}
              className={`min-h-14 rounded-xl border-2 px-1 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${stage === index ? "border-primary bg-primary text-white" : stage > index ? "border-ok/30 bg-ok/10 text-ok" : "border-line bg-card text-muted-fg hover:border-primary/50"}`}
            >
              <span className="block text-[10px] font-display font-black">{item.number}</span>
              <span className="mt-1 block text-[10px] font-display font-bold leading-tight">{item.title}</span>
            </button>
          ))}
        </nav>
      </Card>

      <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Card title={`${LEARNING_STAGES[stage].number} · ${current.title}`} accent="border-primary/30">
          <p className="font-display font-bold text-primary">{current.lead}</p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
            {current.paragraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}
          </div>
          {current.bullets && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {current.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {bullet}
                </li>
              ))}
            </ul>
          )}
          {current.formula && <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-ink p-4 font-mono text-sm text-white">{current.formula}</pre>}
        </Card>

        {stage === 0 && <Card title="See the shortcut" accent="border-info/30"><HashPipeline keyValue={previewKey} tableSize={tableSize} /></Card>}
        {stage === 1 && <HashConcepts />}
        {stage === 2 && <LiveHashTable keysText={keysText} onKeysChange={setKeysText} tableSize={tableSize} onTableSizeChange={setTableSize} />}
        {stage === 3 && <CollisionTrace />}
        {stage === 4 && (
          <Card title="Test · predict the bucket" accent="border-accent/30">
            <div className="flex gap-3">
              <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-black text-ink">{topic.check.question}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {topic.check.options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      disabled={checked}
                      onClick={() => setSelectedAnswer(index)}
                      className={`min-h-12 rounded-xl border-2 px-4 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selectedAnswer === index ? checked ? (answerCorrect ? "border-ok bg-ok/10 text-ok" : "border-danger bg-danger/10 text-danger") : "border-primary bg-primary/10 text-ink" : "border-line bg-card text-ink hover:border-primary/50"} disabled:cursor-not-allowed`}
                    >
                      <span className="mr-2 font-display font-black">{String.fromCharCode(65 + index)}</span>{option}
                    </button>
                  ))}
                </div>
                {!checked ? (
                  <Button className="mt-4" variant="accent" disabled={selectedAnswer === null} onClick={() => setChecked(true)}>Check answer</Button>
                ) : (
                  <div className={`mt-4 rounded-xl p-4 text-sm leading-relaxed ${answerCorrect ? "bg-ok/10 text-ok" : "bg-amber-50 text-amber-900"}`} role="status">
                    <p className="font-display font-bold">{answerCorrect ? "Correct." : "Use the remainder, not the original key."}</p>
                    <p className="mt-1">{topic.check.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
        {stage === 5 && (
          <Card title="Reflect · keep the useful idea" accent="border-ok/30">
            <div className="flex gap-3">
              <Trophy className="mt-0.5 h-6 w-6 shrink-0 text-ok" aria-hidden="true" />
              <div>
                <p className="font-display text-xl font-black text-ink">{topic.takeaway}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {["Map a key to a value", "Expect collisions", "Use hashing, not encryption, for the right job"].map((item) => <div key={item} className="rounded-xl bg-ok/10 p-3 text-sm font-display font-bold text-ok">{item}</div>)}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-fg">When you meet a new hash table, ask two questions: how are keys mapped, and how are collisions resolved?</p>
              </div>
            </div>
          </Card>
        )}
      </motion.div>

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="ghost" disabled={stage === 0} onClick={() => moveToStage(stage - 1)}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous
        </Button>
        <div className="flex gap-2">
          {stage === 5 && <Button variant="secondary" onClick={() => moveToStage(0)}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Restart</Button>}
          {stage < 5 && <Button variant="primary" disabled={stage === 4 && !checked} onClick={() => moveToStage(stage + 1)}>Continue <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>}
        </div>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-fg"><Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> Your furthest stage is saved locally for this topic.</p>
    </div>
  );
}
