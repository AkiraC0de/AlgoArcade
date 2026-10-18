import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Cpu,
  GitBranch,
  Layers3,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button, Card, Field, inputCls } from "./ui";
import { getTopic, LEARNING_STAGES } from "../data/module6Lessons";
import { useGameStore } from "../state/gameStore";

const STORAGE_KEY = "module6:learn-progress";
const TOPIC_ID = "parallel" as const;
const MAX_STAGE = LEARNING_STAGES.length - 1;

const stageLabels = LEARNING_STAGES.map((stage) =>
  stage.title === "Reflect and continue" ? "Reflect" : stage.title,
);

const patterns = [
  {
    id: "data",
    label: "Data parallelism",
    shortLabel: "Same job",
    color: "primary",
    description: "Every worker applies the same operation to a different slice of data.",
    example: "Filter 1,000 records by the same rule.",
    visual: "slices",
  },
  {
    id: "task",
    label: "Task parallelism",
    shortLabel: "Different jobs",
    color: "accent",
    description: "Workers run different, independent tasks at the same time.",
    example: "Parse, index, and compress separate jobs.",
    visual: "jobs",
  },
  {
    id: "pipeline",
    label: "Pipeline parallelism",
    shortLabel: "Stages overlap",
    color: "info",
    description: "A stream moves through stages while different inputs occupy each stage.",
    example: "Read → transform → write many files in flight.",
    visual: "stages",
  },
] as const;

type PatternId = (typeof patterns)[number]["id"];
type WatchStep = 0 | 1 | 2;

type MapLane = {
  worker: string;
  records: string[];
  emits: string[];
};

const mapLanes: MapLane[] = [
  { worker: "worker 1", records: ["green", "blue"], emits: ["green:1", "blue:1"] },
  { worker: "worker 2", records: ["green", "amber"], emits: ["green:1", "amber:1"] },
  { worker: "worker 3", records: ["blue", "green"], emits: ["blue:1", "green:1"] },
  { worker: "worker 4", records: ["amber", "green"], emits: ["amber:1", "green:1"] },
];

const shuffleLanes = [
  { worker: "worker 1", emits: ["green:1", "blue:1"], destination: "reducer A" },
  { worker: "worker 2", emits: ["green:1", "amber:1"], destination: "reducer A / B" },
  { worker: "worker 3", emits: ["blue:1", "green:1"], destination: "reducer A" },
  { worker: "worker 4", emits: ["amber:1", "green:1"], destination: "reducer A / B" },
];

const reduceLanes = [
  { worker: "reducer A", inputs: ["green:1", "green:1", "green:1", "green:1"], result: "green = 4" },
  { worker: "reducer B", inputs: ["blue:1", "blue:1", "amber:1", "amber:1"], result: "blue = 2 · amber = 2" },
];

function clampStage(value: number) {
  return Math.max(0, Math.min(MAX_STAGE, Math.round(value)));
}

function readParallelProgress() {
  if (typeof window === "undefined") return 0;

  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const saved = (raw as Record<string, unknown>)[TOPIC_ID];
      if (typeof saved === "number" && Number.isFinite(saved)) return clampStage(saved);
    }
  } catch {
    // Learning still works when storage is disabled or contains invalid JSON.
  }

  return 0;
}

function writeParallelProgress(progress: number) {
  if (typeof window === "undefined") return;

  try {
    let existing: Record<string, unknown> = {};
    const raw: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      existing = raw as Record<string, unknown>;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, [TOPIC_ID]: clampStage(progress) }));
  } catch {
    // Keep the component usable if persistence is unavailable.
  }
}

function colorClasses(color: "primary" | "accent" | "info") {
  if (color === "accent") return "bg-accent/10 text-accent border-accent/30";
  if (color === "info") return "bg-info/10 text-info border-info/30";
  return "bg-primary/10 text-primary border-primary/30";
}

function StageRail({ stage, progress, onSelect }: { stage: number; progress: number; onSelect: (index: number) => void }) {
  return (
    <nav aria-label="Parallel algorithms lesson stages" className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display font-black text-sm text-ink">Your learning path</p>
        <p className="text-xs text-muted-fg" aria-live="polite">
          {stage + 1} of {LEARNING_STAGES.length}
        </p>
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {LEARNING_STAGES.map((item, index) => {
          const reached = index <= progress;
          const active = index === stage;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={active ? "step" : undefined}
                aria-label={`${item.number} ${stageLabels[index]}${reached ? ", reached" : ""}`}
                onClick={() => onSelect(index)}
                className={`w-full min-h-[70px] rounded-xl border-2 px-2 py-2 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "border-primary bg-primary text-white shadow-clay-sm"
                    : reached
                      ? "border-primary/25 bg-primary/5 text-primary hover:border-primary/60"
                      : "border-line bg-card text-muted-fg hover:border-primary/40"
                }`}
              >
                <span className="flex items-center justify-between gap-1">
                  <span className="font-display font-black text-[10px]">{item.number}</span>
                  {reached && <Check className="h-3.5 w-3.5" aria-hidden />}
                </span>
                <span className="mt-2 block font-display font-bold text-[11px] leading-tight">{stageLabels[index]}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ParallelLoopVisual() {
  const steps = [
    { label: "Divide", copy: "find independent pieces", tone: "bg-primary" },
    { label: "Distribute", copy: "assign them to workers", tone: "bg-secondary" },
    { label: "Process", copy: "run useful work together", tone: "bg-accent" },
    { label: "Combine", copy: "merge partial results", tone: "bg-info" },
  ];

  return (
    <div className="rounded-2xl border-2 border-primary/15 bg-primary/[0.03] p-4 sm:p-5" aria-label="The four-step parallel algorithm loop">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-display font-black text-sm text-ink">The parallel loop</p>
          <p className="mt-1 text-xs text-muted-fg">The combine step must respect dependencies.</p>
        </div>
        <Layers3 className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {steps.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.25 }}
            className="relative rounded-xl border border-line bg-card p-3"
          >
            <span className={`mb-3 block h-2 w-10 rounded-full ${item.tone}`} aria-hidden />
            <p className="font-display font-black text-sm text-ink">{item.label}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-fg">{item.copy}</p>
            {index < steps.length - 1 && <span className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-primary lg:block" aria-hidden>›</span>}
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-fg">
        <span className="rounded-full bg-card px-3 py-1.5">independent work = green light</span>
        <span className="rounded-full bg-card px-3 py-1.5">dependency edge = wait</span>
        <span className="rounded-full bg-card px-3 py-1.5">barrier = synchronize</span>
      </div>
    </div>
  );
}

function PatternDiagram({ pattern }: { pattern: (typeof patterns)[number] }) {
  if (pattern.visual === "slices") {
    return (
      <div className="space-y-1.5" aria-label="Same operation applied to different data slices">
        {["worker 1", "worker 2", "worker 3"].map((worker, index) => (
          <div key={worker} className="flex items-center gap-2 text-[10px]">
            <span className="w-14 shrink-0 font-display font-bold text-muted-fg">{worker}</span>
            <span className="rounded-md bg-primary px-2 py-1 font-mono text-white">map</span>
            <span className="h-2 flex-1 rounded-full bg-primary/15">
              <motion.span
                className="block h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${62 + index * 12}%` }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              />
            </span>
            <span className="font-mono text-primary">slice {index + 1}</span>
          </div>
        ))}
      </div>
    );
  }

  if (pattern.visual === "jobs") {
    return (
      <div className="grid grid-cols-3 gap-1.5" aria-label="Different independent tasks assigned to workers">
        {["parse", "index", "compress"].map((job, index) => (
          <motion.div
            key={job}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.25 }}
            className="rounded-lg border border-accent/25 bg-accent/10 px-1.5 py-3 text-center"
          >
            <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-black text-white">{index + 1}</span>
            <span className="mt-2 block font-mono text-[10px] text-accent">{job}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2" aria-label="Three overlapping pipeline stages">
      <div className="flex items-center gap-1.5 text-[10px] font-display font-bold">
        {[
          ["read", "bg-info"],
          ["transform", "bg-primary"],
          ["write", "bg-accent"],
        ].map(([label, tone], index) => (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className={`flex-1 rounded-md px-1 py-2 text-center text-white ${tone}`}>{label}</span>
            {index < 2 && <span className="text-muted-fg" aria-hidden>→</span>}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-muted-fg">
        {["record A", "record B", "record C"].map((record, index) => (
          <motion.span
            key={record}
            animate={{ y: [0, index === 1 ? -2 : 0, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.3 }}
            className="rounded-md border border-info/20 bg-info/5 px-1 py-1.5 text-center"
          >
            {record}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function PatternComparison() {
  const [active, setActive] = useState<PatternId>("data");
  const selected = patterns.find((pattern) => pattern.id === active) ?? patterns[0];

  return (
    <Card title="Three ways to make work overlap" accent="border-primary/30">
      <div role="tablist" aria-label="Parallelism pattern details" className="grid gap-2 sm:grid-cols-3">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            type="button"
            role="tab"
            aria-selected={active === pattern.id}
            onClick={() => setActive(pattern.id)}
            className={`min-h-12 rounded-xl border-2 px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              active === pattern.id ? colorClasses(pattern.color) : "border-line bg-card text-muted-fg hover:border-primary/40"
            }`}
          >
            <span className="block font-display font-black text-sm">{pattern.shortLabel}</span>
            <span className="mt-0.5 block text-[11px]">{pattern.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3" role="tabpanel" aria-label={`${selected.label} visual comparison`}>
        {patterns.map((pattern) => (
          <div key={pattern.id} className={`rounded-2xl border-2 p-4 ${active === pattern.id ? colorClasses(pattern.color) : "border-line bg-muted/40"}`}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-black text-sm text-ink">{pattern.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-fg">{pattern.description}</p>
              </div>
              <span className="rounded-full bg-card px-2 py-1 font-mono text-[10px] text-muted-fg">{pattern.id}</span>
            </div>
            <PatternDiagram pattern={pattern} />
            <p className="mt-3 border-t border-line/70 pt-3 text-[11px] leading-relaxed text-muted-fg">
              <span className="font-display font-bold text-ink">Example: </span>{pattern.example}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-muted/60 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white" aria-hidden>
          <GitBranch className="h-5 w-5" />
        </div>
        <p className="text-sm leading-relaxed text-ink">
          Choose a split that keeps work independent. If one task depends on another, the dependency creates a synchronization point; the pattern is only useful when the waiting cost is smaller than the work it exposes.
        </p>
      </div>
    </Card>
  );
}

function WorkerSimulator() {
  const [workers, setWorkers] = useState(4);
  const [records, setRecords] = useState(24);

  const lanes = useMemo(
    () =>
      Array.from({ length: workers }, (_, index) => {
        const base = Math.floor(records / workers);
        const remainder = records % workers;
        return { id: index + 1, work: base + (index < remainder ? 1 : 0) };
      }),
    [records, workers],
  );

  const longestLane = Math.max(...lanes.map((lane) => lane.work), 0);
  const shortestLane = Math.min(...lanes.map((lane) => lane.work), 0);
  const imbalance = longestLane - shortestLane;
  const coordinationCost = Math.max(1, Math.ceil(workers / 2));
  const estimatedParallelTime = longestLane + coordinationCost;
  const estimatedSpeedup = records / Math.max(1, estimatedParallelTime);

  const updateWorkers = (value: string) => setWorkers(Math.max(1, Math.min(8, Number(value) || 1)));
  const updateRecords = (value: string) => setRecords(Math.max(1, Math.min(96, Number(value) || 1)));

  return (
    <Card title="Edit the work split" accent="border-ok/30">
      <div className="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-end">
        <Field label="Workers">
          <input className={`${inputCls} w-full sm:w-28`} type="number" min="1" max="8" value={workers} onChange={(event) => updateWorkers(event.currentTarget.value)} />
        </Field>
        <Field label="Records">
          <input className={`${inputCls} w-full sm:w-28`} type="number" min="1" max="96" value={records} onChange={(event) => updateRecords(event.currentTarget.value)} />
        </Field>
        <Button variant="ghost" onClick={() => { setWorkers(4); setRecords(24); }} className="sm:justify-self-start">
          <RotateCcw className="h-4 w-4" aria-hidden /> Reset simulator
        </Button>
      </div>

      <div className="mt-5 rounded-2xl border-2 border-line bg-muted/30 p-4" aria-label={`${records} records distributed across ${workers} workers`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display font-black text-sm text-ink">Data-parallel schedule</p>
            <p className="mt-1 text-xs text-muted-fg">Each lane runs the same operation on its assigned records.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1.5 font-mono text-xs font-bold text-primary">{records} ÷ {workers}</span>
        </div>
        <div className="space-y-2.5" role="list" aria-label="Worker lanes">
          {lanes.map((lane, index) => (
            <div key={lane.id} className="grid grid-cols-[62px_1fr_58px] items-center gap-2" role="listitem">
              <span className="font-display text-xs font-bold text-muted-fg">worker {lane.id}</span>
              <div className="h-7 overflow-hidden rounded-lg bg-card" role="progressbar" aria-label={`Worker ${lane.id} has ${lane.work} records`} aria-valuemin={0} aria-valuemax={longestLane} aria-valuenow={lane.work}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: longestLane ? `${(lane.work / longestLane) * 100}%` : "0%" }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className={`flex h-full min-w-0 items-center rounded-lg px-2 text-[10px] font-bold text-white ${index % 2 === 0 ? "bg-primary" : "bg-secondary text-ink"}`}
                >
                  {lane.work > 0 && <span className="truncate">{lane.work} records</span>}
                </motion.div>
              </div>
              <span className="text-right font-mono text-xs text-ink">{lane.work} units</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <SimulatorMetric label="serial work" value={`${records}`} tone="bg-muted text-ink" />
        <SimulatorMetric label="longest lane" value={`${longestLane}`} tone="bg-primary/10 text-primary" />
        <SimulatorMetric label="load gap" value={`${imbalance}`} tone={imbalance === 0 ? "bg-ok/10 text-ok" : "bg-accent/10 text-accent"} />
        <SimulatorMetric label="teaching estimate" value={`${estimatedSpeedup.toFixed(1)}×`} tone="bg-info/10 text-info" />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <p className="rounded-xl bg-ok/10 p-3 text-xs leading-relaxed text-ink">
          <span className="font-display font-black text-ok">Load balance: </span>
          the slowest lane sets the finish line. A load gap of {imbalance} means some workers wait for the longest lane.
        </p>
        <p className="rounded-xl bg-accent/10 p-3 text-xs leading-relaxed text-ink">
          <span className="font-display font-black text-accent">Coordination overhead: </span>
          the estimate adds {coordinationCost} unit{coordinationCost === 1 ? "" : "s"} for scheduling and synchronization. More workers do not make the barrier free.
        </p>
      </div>
    </Card>
  );
}

function SimulatorMetric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-xl p-3 ${tone}`}>
      <p className="text-[10px] font-display font-bold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 font-display text-xl font-black">{value}</p>
    </div>
  );
}

function MapFrame() {
  return (
    <div className="space-y-3" aria-label="Map stage with four worker lanes">
      <div className="grid gap-2 sm:grid-cols-2">
        {mapLanes.map((lane, index) => (
          <motion.div key={lane.worker} initial={{ opacity: 0, x: index % 2 === 0 ? -8 : 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border-2 border-primary/20 bg-primary/[0.03] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-xs font-black text-primary">{lane.worker}</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary">map</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {lane.records.map((record, itemIndex) => <span key={`${record}-${itemIndex}`} className="rounded-md border border-line bg-card px-2 py-1 font-mono text-[10px] text-ink">{record}</span>)}
              <ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden />
              {lane.emits.map((emit) => <span key={emit} className="rounded-md bg-primary px-2 py-1 font-mono text-[10px] text-white">{emit}</span>)}
            </div>
          </motion.div>
        ))}
      </div>
      <p className="rounded-xl bg-primary/10 p-3 text-xs leading-relaxed text-ink">
        <span className="font-display font-black text-primary">Map means local work: </span>
        each worker turns its records into small key/value contributions. No worker needs the other worker's input yet.
      </p>
    </div>
  );
}

function ShuffleFrame() {
  return (
    <div className="space-y-3" aria-label="Shuffle and partition stage with worker lanes">
      <div className="grid gap-2 sm:grid-cols-2">
        {shuffleLanes.map((lane, index) => (
          <motion.div key={lane.worker} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-xl border-2 border-accent/20 bg-accent/[0.03] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-xs font-black text-accent">{lane.worker}</span>
              <span className="rounded-full bg-accent/10 px-2 py-1 font-mono text-[10px] text-accent">partition</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {lane.emits.map((emit) => <span key={emit} className="rounded-md bg-card px-2 py-1 font-mono text-[10px] text-ink">{emit}</span>)}
              <ArrowRight className="h-3.5 w-3.5 text-accent" aria-hidden />
              <span className="rounded-md bg-accent px-2 py-1 font-mono text-[10px] text-white">{lane.destination}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-3">
          <p className="font-display text-xs font-black text-primary">reducer A · green</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{["green:1", "green:1", "green:1", "green:1"].map((item, index) => <span key={`${item}-${index}`} className="rounded-md bg-card px-2 py-1 font-mono text-[10px]">{item}</span>)}</div>
        </div>
        <div className="rounded-xl border-2 border-info/20 bg-info/5 p-3">
          <p className="font-display text-xs font-black text-info">reducer B · blue + amber</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{["blue:1", "blue:1", "amber:1", "amber:1"].map((item, index) => <span key={`${item}-${index}`} className="rounded-md bg-card px-2 py-1 font-mono text-[10px]">{item}</span>)}</div>
        </div>
      </div>
      <p className="rounded-xl bg-accent/10 p-3 text-xs leading-relaxed text-ink">
        <span className="font-display font-black text-accent">Shuffle is the synchronization point: </span>
        contributions with the same key travel to the same reducer. Workers may wait here, and the partition rule must be deterministic.
      </p>
    </div>
  );
}

function ReduceFrame() {
  return (
    <div className="space-y-3" aria-label="Reduce stage with reducer worker lanes">
      <div className="grid gap-3 sm:grid-cols-2">
        {reduceLanes.map((lane, index) => (
          <motion.div key={lane.worker} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }} className="rounded-2xl border-2 border-info/25 bg-info/[0.04] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-sm font-black text-info">{lane.worker}</span>
              <span className="rounded-full bg-info/10 px-2 py-1 font-mono text-[10px] text-info">reduce</span>
            </div>
            <div className="mt-3 flex min-h-16 flex-wrap items-center gap-1.5 rounded-xl bg-card p-2">
              {lane.inputs.map((item, inputIndex) => <span key={`${item}-${inputIndex}`} className="rounded-md border border-line px-2 py-1 font-mono text-[10px] text-ink">{item}</span>)}
            </div>
            <div className="mt-3 flex items-center gap-2 text-info">
              <ArrowRight className="h-4 w-4" aria-hidden />
              <span className="rounded-lg bg-info px-3 py-2 font-mono text-xs font-black text-white">{lane.result}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-ok/10 p-4">
        <Check className="h-5 w-5 shrink-0 text-ok" aria-hidden />
        <p className="text-sm leading-relaxed text-ink"><span className="font-display font-black text-ok">Combine complete: </span>the partial counts now represent one global result.</p>
      </div>
    </div>
  );
}

function AlgorithmWatch() {
  const [step, setStep] = useState<WatchStep>(0);
  const labels = ["Map", "Shuffle / partition", "Reduce"] as const;
  const descriptions = [
    "Workers transform their local records into key/value contributions.",
    "The partition rule routes equal keys to the same reducer; this is the barrier.",
    "Reducers combine each key's partial values into a final count.",
  ];

  const nextStep = () => setStep((current) => (current === 2 ? 0 : ((current + 1) as WatchStep)));

  return (
    <Card title="Watch · Map → Shuffle → Reduce" accent="border-info/30">
      <div className="flex flex-wrap items-center gap-2" role="list" aria-label="MapReduce execution steps">
        {labels.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-2" role="listitem">
            <button
              type="button"
              onClick={() => setStep(index as WatchStep)}
              aria-current={step === index ? "step" : undefined}
              className={`min-h-11 flex-1 rounded-xl border-2 px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${step === index ? "border-info bg-info text-white" : "border-line bg-card text-muted-fg hover:border-info/50"}`}
            >
              <span className="block font-display text-[10px] font-black">0{index + 1}</span>
              <span className="mt-1 block font-display text-xs font-bold leading-tight">{label}</span>
            </button>
            {index < labels.length - 1 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-fg sm:block" aria-hidden />}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border-2 border-info/15 bg-info/[0.03] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display font-black text-sm text-ink">{labels[step]}</p>
          <p className="text-xs text-muted-fg" aria-live="polite">{descriptions[step]}</p>
        </div>
        <div className="mt-4" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {step === 0 && <MapFrame />}
              {step === 1 && <ShuffleFrame />}
              {step === 2 && <ReduceFrame />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs text-muted-fg"><Cpu className="h-4 w-4 text-info" aria-hidden />Four map workers → two reduce workers</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep(0)} disabled={step === 0}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Restart trace
          </Button>
          <Button variant={step === 2 ? "secondary" : "primary"} onClick={nextStep}>
            {step === 2 ? <><Play className="h-4 w-4" aria-hidden /> Replay Map</> : <>Next step <ArrowRight className="h-4 w-4" aria-hidden /></>}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function KnowledgeCheck({ choice, onChoose }: { choice: number | null; onChoose: (index: number) => void }) {
  const topic = getTopic(TOPIC_ID);
  const answered = choice !== null;
  const correct = choice === topic.check.answer;

  return (
    <Card title="Make a prediction before you move on" accent="border-accent/30">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white" aria-hidden><Target className="h-5 w-5" /></div>
        <div>
          <p className="font-display text-lg font-black text-ink">{topic.check.question}</p>
          <p className="mt-1 text-sm text-muted-fg">Use the pattern definitions, not just the word “parallel.”</p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {topic.check.options.map((option, index) => {
          const isCorrect = answered && index === topic.check.answer;
          const isWrong = answered && choice === index && !isCorrect;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={choice === index}
              onClick={() => onChoose(index)}
              className={`min-h-14 rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isCorrect ? "border-ok bg-ok/10 text-ok" : isWrong ? "border-danger bg-danger/10 text-danger" : choice === index ? "border-primary bg-primary/10 text-primary" : "border-line bg-card text-ink hover:border-primary/50"
              }`}
            >
              <span className="mr-2 font-display font-black">{String.fromCharCode(65 + index)}</span>{option}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`mt-4 flex items-start gap-2 rounded-xl p-4 ${correct ? "bg-ok/10 text-ok" : "bg-amber-50 text-amber-900"}`} role="status">
          {correct ? <Check className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> : <CircleHelp className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />}
          <p className="text-sm leading-relaxed">{topic.check.explanation}</p>
        </div>
      )}
    </Card>
  );
}

function StageCopy({ stageIndex }: { stageIndex: number }) {
  const topic = getTopic(TOPIC_ID);
  const content = topic.stages[stageIndex];
  const meta = LEARNING_STAGES[stageIndex];

  return (
    <Card title={`${meta.number} · ${stageLabels[stageIndex]}`} accent="border-primary/30">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
        <div>
          <p className="font-display text-xl font-black text-ink">{content.title}</p>
          <p className="mt-2 font-display font-bold leading-relaxed text-primary">{content.lead}</p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
            {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {content.bullets && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {content.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-ink"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{bullet}</li>)}
            </ul>
          )}
          {content.formula && <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-ink p-4 font-mono text-xs leading-relaxed text-white">{content.formula}</pre>}
        </div>
        <LessonSignal stageIndex={stageIndex} />
      </div>
    </Card>
  );
}

function LessonSignal({ stageIndex }: { stageIndex: number }) {
  const signals = [
    { label: "Goal", value: "turn idle capacity into useful work", icon: <Zap className="h-5 w-5" aria-hidden /> },
    { label: "Question", value: "what can run without waiting?", icon: <GitBranch className="h-5 w-5" aria-hidden /> },
    { label: "Try it", value: "change workers and records", icon: <RefreshCw className="h-5 w-5" aria-hidden /> },
    { label: "Trace", value: "local work meets a barrier", icon: <Layers3 className="h-5 w-5" aria-hidden /> },
    { label: "Check", value: "same data, same operation", icon: <Target className="h-5 w-5" aria-hidden /> },
    { label: "Carry forward", value: "balance work before adding workers", icon: <Sparkles className="h-5 w-5" aria-hidden /> },
  ];
  const signal = signals[stageIndex];

  return (
    <aside className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-secondary/20 p-4">
      <div className="flex items-center gap-2 text-primary">
        {signal.icon}
        <span className="font-display text-sm font-black">Visual cue · {signal.label}</span>
      </div>
      <p className="mt-4 font-display text-lg font-black leading-tight text-ink">{signal.value}</p>
      <div className="mt-5 space-y-2" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${index === stageIndex % 4 ? "bg-accent" : "bg-primary/30"}`} />
            <span className={`h-2 flex-1 rounded-full ${index <= stageIndex % 4 ? "bg-primary/60" : "bg-primary/10"}`} />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-fg">Parallel speed comes from independent work; correctness comes from respecting dependencies.</p>
    </aside>
  );
}

function ReflectionPanel() {
  const takeaways = [
    ["Divide", "Expose independent records, tasks, or pipeline stages."],
    ["Coordinate", "Distribute fairly, then synchronize only where dependencies require it."],
    ["Combine", "Reduce partial results into one result without losing correctness."],
  ];

  return (
    <Card title="Keep the mental model" accent="border-ok/30">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ok text-white" aria-hidden><Trophy className="h-5 w-5" /></div>
        <div>
          <p className="font-display text-lg font-black text-ink">Parallel algorithms are coordination designs.</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-fg">More workers help only when the work is independent enough, balanced enough, and cheap enough to coordinate.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-3">
        {takeaways.map(([label, copy], index) => (
          <div key={label} className="rounded-2xl border-2 border-line bg-card p-4">
            <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
            <p className="mt-3 font-display font-black text-ink">{label}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-fg">{copy}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-ink p-4 text-white">
        <p className="font-mono text-xs text-secondary">parallel time ≈ longest worker lane + synchronization + coordination overhead</p>
        <p className="mt-2 text-xs leading-relaxed text-white/75">That is a teaching model, not a hardware benchmark—but it explains why load balance and dependencies matter.</p>
      </div>
    </Card>
  );
}

export function ParallelLesson() {
  const topic = getTopic(TOPIC_ID);
  const setLessonProgress = useGameStore((state) => state.setLessonProgress);
  const [stage, setStage] = useState(() => readParallelProgress());
  const [progress, setProgress] = useState(() => readParallelProgress());
  const [testChoice, setTestChoice] = useState<number | null>(null);

  useEffect(() => {
    writeParallelProgress(progress);
  }, [progress]);

  const goToStage = (nextStage: number) => {
    const bounded = Math.max(0, Math.min(MAX_STAGE, nextStage));
    const nextProgress = Math.max(progress, bounded);
    setStage(bounded);
    setProgress(nextProgress);
    setLessonProgress(TOPIC_ID, nextProgress);
  };

  const restart = () => {
    setStage(0);
    setProgress(0);
    setTestChoice(null);
  };

  const canAdvance = stage !== 4 || testChoice !== null;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/20 p-5 shadow-clay-sm sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 font-display text-[10px] font-black tracking-wide text-white">MODULE 6 · PARALLEL ALGORITHMS</span>
              <span className="rounded-full border border-primary/20 bg-card px-3 py-1 font-mono text-[10px] text-primary">11 min</span>
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-black leading-tight text-ink sm:text-4xl">Make one problem move with many workers.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-fg sm:text-base">{topic.summary} Follow the split, watch the lanes, and see exactly where coordination enters the picture.</p>
          </div>
          <div className="rounded-2xl border-2 border-primary/15 bg-card/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-wide text-muted-fg">Progress saved</span>
              <span className="font-display text-2xl font-black text-primary">{Math.round((progress / MAX_STAGE) * 100)}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary/10" role="progressbar" aria-label="Parallel algorithms lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((progress / MAX_STAGE) * 100)}>
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(progress / MAX_STAGE) * 100}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-fg">Stored in <code className="rounded bg-muted px-1">module6:learn-progress</code> under <code className="rounded bg-muted px-1">parallel</code>.</p>
          </div>
        </div>
        <div className="mt-6">
          <StageRail stage={stage} progress={progress} onSelect={goToStage} />
        </div>
      </section>

      <main className="space-y-4" id="parallel-lesson-main" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
            <StageCopy stageIndex={stage} />
            {stage === 0 && <Card title="See the idea before touching the controls" accent="border-primary/30"><ParallelLoopVisual /></Card>}
            {stage === 1 && <PatternComparison />}
            {stage === 2 && <WorkerSimulator />}
            {stage === 3 && <AlgorithmWatch />}
            {stage === 4 && <KnowledgeCheck choice={testChoice} onChoose={setTestChoice} />}
            {stage === 5 && <ReflectionPanel />}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-line pt-4">
          <Button variant="ghost" onClick={() => goToStage(stage - 1)} disabled={stage === 0}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
          </Button>
          <div className="flex flex-wrap justify-end gap-2">
            {stage === 5 && <Button variant="secondary" onClick={restart}><RotateCcw className="h-4 w-4" aria-hidden /> Restart lesson</Button>}
            <Button variant="primary" onClick={() => goToStage(stage + 1)} disabled={stage === MAX_STAGE || !canAdvance}>
              {stage === 4 && testChoice === null ? "Choose an answer" : stage === MAX_STAGE ? "Lesson complete" : <>Continue <ArrowRight className="h-4 w-4" aria-hidden /></>}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ParallelLesson;
