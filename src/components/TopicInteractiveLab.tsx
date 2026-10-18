import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Calculator, CheckCircle2, CircleDot, Play, RotateCcw, Sigma } from "lucide-react";
import { Button, Card, Field, inputCls } from "./ui";
import type { TopicId } from "../data/module6Lessons";

export function TopicInteractiveLab({ topic }: { topic: TopicId }) {
  if (topic === "hashing") return <HashLab />;
  if (topic === "geometry") return <GeometryLab />;
  if (topic === "parallel") return <ParallelLab />;
  return null;
}

function HashLab() {
  const [key, setKey] = useState("8");
  const [size, setSize] = useState("3");
  const k = Number(key) || 0;
  const m = Math.max(1, Number(size) || 1);
  const slot = ((k % m) + m) % m;
  const buckets = Array.from({ length: m }, (_, i) => i);
  return <Card title="Interact · hash a key into a table" accent="border-info/30">
    <div className="grid sm:grid-cols-2 gap-3"><Field label="Key"><input className={inputCls} type="number" value={key} onChange={(e)=>setKey(e.target.value)} /></Field><Field label="Table size (m)"><input className={inputCls} type="number" min="1" value={size} onChange={(e)=>setSize(e.target.value)} /></Field></div>
    <div className="flex items-center justify-center gap-3 py-5 font-display font-bold"><span className="rounded-xl bg-info/10 text-info px-4 py-3">h({k})</span><Sigma className="w-5 h-5 text-muted-fg" aria-hidden/><span className="text-muted-fg">{k} mod {m}</span><span className="text-muted-fg">=</span><span className="rounded-xl bg-primary text-white px-4 py-3">slot {slot}</span></div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{buckets.map((b)=><div key={b} className={`rounded-xl border-2 p-3 text-center font-display font-bold ${b===slot?"border-primary bg-primary/10 text-primary":"border-line bg-muted text-muted-fg"}`}><span className="block text-xs">index {b}</span>{b===slot&&<span className="block text-sm mt-1">key {k}</span>}</div>)}</div>
    <p className="text-xs text-muted-fg mt-3">Try keys 3, 6, and 9 with table size 3 to create the collision described in the lesson.</p>
  </Card>;
}

type GeometryPoint = { x: number; y: number; label: string };
type CoordinateDraft = Record<string, { x: string; y: string }>;

const INITIAL_GEOMETRY_POINTS: GeometryPoint[] = [
  { x: 1, y: 2, label: "A" },
  { x: 4, y: 6, label: "B" },
  { x: 2, y: 3, label: "C" },
];

function makeDrafts(points: GeometryPoint[]): CoordinateDraft {
  return Object.fromEntries(points.map((point) => [point.label, { x: String(point.x), y: String(point.y) }]));
}

function normalizeCoordinateInput(value: string) {
  if (value === "" || value === "-") return value;
  return value.replace(/^(-?)0+(?=\d)/, "$1");
}

function GeometryLab() {
  const [points, setPoints] = useState<GeometryPoint[]>(INITIAL_GEOMETRY_POINTS);
  const [drafts, setDrafts] = useState<CoordinateDraft>(() => makeDrafts(INITIAL_GEOMETRY_POINTS));
  const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const cross = (points[1].x - points[0].x) * (points[2].y - points[0].y) - (points[1].y - points[0].y) * (points[2].x - points[0].x);
  const area = Math.abs(cross) / 2;
  const axisX = 42;
  const axisY = 190;
  const scaleX = 44;
  const scaleY = 20;
  const pointPosition = (point: GeometryPoint) => ({ x: axisX + point.x * scaleX, y: axisY - point.y * scaleY });

  const setPoint = (index: number, axis: "x" | "y", rawValue: string) => {
    const value = normalizeCoordinateInput(rawValue);
    const point = points[index];
    if (!point) return;
    setDrafts((current) => ({ ...current, [point.label]: { ...current[point.label], [axis]: value } }));
    if (value === "" || value === "-") return;
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;
    setPoints((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [axis]: numericValue } : item));
  };

  const commitPoint = (index: number, axis: "x" | "y") => {
    const point = points[index];
    if (!point) return;
    const rawValue = drafts[point.label]?.[axis] ?? "0";
    const numericValue = Number(rawValue);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
    setPoints((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [axis]: safeValue } : item));
    setDrafts((current) => ({ ...current, [point.label]: { ...current[point.label], [axis]: String(safeValue) } }));
  };

  return <Card title="Interact · coordinate geometry lab" accent="border-violet-200">
    <p className="mb-4 text-sm leading-relaxed text-muted-fg">Edit the coordinates of points A, B, and C to explore the plane. The measurements below update as you move each point.</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{points.map((point, index) => <div key={point.label} className="rounded-xl border-2 border-line bg-card p-3"><p className="mb-2 font-display text-sm font-black text-ink">Point {point.label}</p><div className="grid grid-cols-2 gap-2"><Field label="X axis"><input aria-label={`${point.label} x coordinate`} className={`${inputCls} min-w-0 w-full px-2`} type="number" inputMode="decimal" value={drafts[point.label]?.x ?? String(point.x)} onChange={(event) => setPoint(index, "x", event.target.value)} onBlur={() => commitPoint(index, "x")} /></Field><Field label="Y axis"><input aria-label={`${point.label} y coordinate`} className={`${inputCls} min-w-0 w-full px-2`} type="number" inputMode="decimal" value={drafts[point.label]?.y ?? String(point.y)} onChange={(event) => setPoint(index, "y", event.target.value)} onBlur={() => commitPoint(index, "y")} /></Field></div></div>)}</div>
    <div className="mt-5 flex justify-center rounded-xl border-2 border-line bg-slate-50 p-2"><svg viewBox="0 0 360 225" className="block h-auto w-full max-w-[400px]" role="img" aria-label="Interactive coordinate plane with labeled x and y axes"><title>Interactive coordinate plane</title><line x1="42" y1="190" x2="318" y2="190" stroke="#334155" strokeWidth="2"/><line x1="42" y1="198" x2="42" y2="18" stroke="#334155" strokeWidth="2"/><path d="M318,190 l-7,-4 v8 z" fill="#334155"/><path d="M42,18 l-4,7 h8 z" fill="#334155"/><text x="326" y="214" fontSize="11" fontWeight="700" fill="#1e293b">x-axis</text><text x="14" y="20" fontSize="11" fontWeight="700" fill="#1e293b">y-axis</text>{Array.from({ length: 7 }, (_, index) => <line key={`v-${index}`} x1={42 + index * 44} y1="30" x2={42 + index * 44} y2="190" stroke="#dbe4ed" strokeWidth="1"/>)}{Array.from({ length: 9 }, (_, index) => <line key={`h-${index}`} x1="42" y1={190 - index * 20} x2="306" y2={190 - index * 20} stroke="#dbe4ed" strokeWidth="1"/>)}{points.length === 3 && <polygon points={points.map((point) => { const position = pointPosition(point); return `${position.x},${position.y}`; }).join(" ")} fill="#2563eb" fillOpacity=".1" stroke="#047857" strokeWidth="3"/>}{points.map((point) => { const position = pointPosition(point); return <g key={point.label}><circle cx={position.x} cy={position.y} r="9" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2"/><text x={position.x} y={position.y + 4} textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="800">{point.label}</text></g>; })}</svg></div>
    <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-primary/10 p-3"><Calculator className="mx-auto h-4 w-4 text-primary" aria-hidden/><p className="mt-1 text-xs text-muted-fg">distance AB</p><p className="font-display font-black text-primary">{distance.toFixed(2)}</p></div><div className="rounded-xl bg-accent/10 p-3"><CircleDot className="mx-auto h-4 w-4 text-accent" aria-hidden/><p className="mt-1 text-xs text-muted-fg">cross product</p><p className="font-display font-black text-accent">{cross}</p></div><div className="rounded-xl bg-ok/10 p-3"><Sigma className="mx-auto h-4 w-4 text-ok" aria-hidden/><p className="mt-1 text-xs text-muted-fg">triangle area</p><p className="font-display font-black text-ok">{area}</p></div></div>
  </Card>;
}

type ParallelMode = "data" | "task" | "pipeline";
type ParallelLane = { id: number; start: number; end: number; count: number };

const PARALLEL_MODES: Array<{ id: ParallelMode; number: string; title: string; description: string }> = [
  { id: "data", number: "01", title: "Data parallelism", description: "One operation across separate data ranges." },
  { id: "task", number: "02", title: "Task parallelism", description: "Different jobs running at the same time." },
  { id: "pipeline", number: "03", title: "Pipeline parallelism", description: "Different stages overlap across data batches." },
];

const TASKS = [
  { title: "Sales Summary", detail: "totals and trends" },
  { title: "Customer Data", detail: "segments and behavior" },
  { title: "Product Report", detail: "catalog performance" },
  { title: "Charts", detail: "visual report output" },
];

const PIPELINE_STAGES = [
  { title: "Collect Sales Data", detail: "gather records" },
  { title: "Process Data", detail: "clean and aggregate" },
  { title: "Analyze Data", detail: "find patterns" },
  { title: "Generate Report", detail: "publish results" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

function ParallelLab() {
  const [mode, setMode] = useState<ParallelMode>("data");
  const [workers, setWorkers] = useState(4);
  const [records, setRecords] = useState(1_000_000);
  const [runId, setRunId] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const lanes = useMemo<ParallelLane[]>(() => {
    const chunkSize = Math.ceil(records / workers);
    return Array.from({ length: workers }, (_, index) => {
      const start = index * chunkSize + 1;
      const end = Math.min(records, (index + 1) * chunkSize);
      return { id: index + 1, start, end, count: Math.max(0, end - start + 1) };
    });
  }, [records, workers]);

  useEffect(() => {
    if (!isRunning) return;
    const duration = mode === "data" ? 3_200 : mode === "task" ? 4_000 : 5_400;
    const timer = window.setTimeout(() => setIsRunning(false), duration);
    return () => window.clearTimeout(timer);
  }, [isRunning, mode, runId]);

  const selectMode = (nextMode: ParallelMode) => {
    setMode(nextMode);
    setHasRun(false);
    setIsRunning(false);
    setRunId((value) => value + 1);
  };
  const runAnimation = () => { setRunId((value) => value + 1); setHasRun(true); setIsRunning(true); };
  const reset = () => { setWorkers(4); setRecords(1_000_000); setHasRun(false); setIsRunning(false); setRunId((value) => value + 1); };
  const activeMode = PARALLEL_MODES.find((item) => item.id === mode)!;

  return <Card title="Interact · parallel algorithm studio" accent="border-ok/30">
    <div className="mb-5"><p className="text-sm leading-relaxed text-muted-fg">Choose a parallel strategy, then run the animation to see what is shared—and what is different—between processors.</p><div className="mt-4 grid gap-2 md:grid-cols-3" role="tablist" aria-label="Parallel algorithm types">{PARALLEL_MODES.map((item) => <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} onClick={() => selectMode(item.id)} className={`rounded-xl border-2 p-3 text-left transition-colors ${mode === item.id ? "border-primary bg-primary/10 text-primary shadow-clay-sm" : "border-line bg-card text-muted-fg hover:border-primary/40"}`}><span className="font-display text-[11px] font-black tracking-[0.18em]">{item.number}</span><span className="mt-1 block font-display text-sm font-black">{item.title}</span><span className="mt-1 block text-xs leading-relaxed">{item.description}</span></button>)}</div></div>
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-muted/60 p-3">{mode === "data" ? <><Field label="Processors"><input className={`${inputCls} w-28`} type="number" min="1" max="8" value={workers} onChange={(event) => setWorkers(Math.min(8, Math.max(1, Number(event.target.value) || 1)))} /></Field><Field label="Sales records"><input className={`${inputCls} w-36`} type="number" min="1" max="10000000" value={records} onChange={(event) => setRecords(Math.min(10_000_000, Math.max(1, Number(event.target.value) || 1)))} /></Field></> : <div className="min-h-11 flex-1"><p className="text-xs font-display font-black uppercase tracking-wide text-muted-fg">{mode === "task" ? "Fixed work split" : "Fixed stage split"}</p><p className="mt-1 text-sm font-display font-bold text-ink">{mode === "task" ? "4 processors · 4 different report jobs" : "4 stages · 3 report batches in flight"}</p></div>}<Button variant="accent" onClick={runAnimation}><Play className="w-4 h-4" aria-hidden /> {isRunning ? "Running…" : "Run animation"}</Button><Button variant="ghost" onClick={reset}><RotateCcw className="w-4 h-4" aria-hidden /> Reset</Button></div>
    <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border-2 border-line bg-card p-3" aria-live="polite"><div><p className="font-display text-sm font-black text-ink">{activeMode.number} · {activeMode.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-fg">{mode === "data" ? "Every processor performs the same calculation on a different range." : mode === "task" ? "Every processor performs a different report task at the same time." : "Each stage works on a different batch while the next batch enters behind it."}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-display font-black ${isRunning ? "bg-accent/15 text-accent" : hasRun ? "bg-ok/15 text-ok" : "bg-muted text-muted-fg"}`}>{isRunning ? "Animating" : hasRun ? "Complete" : "Ready"}</span></div>
    <motion.div key={`${mode}-${runId}`} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} className="mt-5">{mode === "data" && <DataParallelView lanes={lanes} hasRun={hasRun} runId={runId} reducedMotion={reducedMotion} />}{mode === "task" && <TaskParallelView hasRun={hasRun} runId={runId} reducedMotion={reducedMotion} />}{mode === "pipeline" && <PipelineParallelView hasRun={hasRun} runId={runId} reducedMotion={reducedMotion} />}</motion.div>
  </Card>;
}

function DataParallelView({ lanes, hasRun, runId, reducedMotion }: { lanes: ParallelLane[]; hasRun: boolean; runId: number; reducedMotion: boolean }) {
  return <div><div className="mb-3 flex items-center justify-between"><p className="font-display text-sm font-black text-ink">Calculating total sales</p><span className="text-xs font-mono text-muted-fg">same operation × {lanes.length}</span></div><div className="space-y-2">{lanes.map((lane, index) => <div key={lane.id} className="rounded-xl border-2 border-line bg-card p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="font-display text-sm font-black text-ink">Processor {lane.id}</span><span className="ml-2 text-xs text-muted-fg">records {formatNumber(lane.start)}–{formatNumber(lane.end)}</span></div><span className="text-xs font-mono text-muted-fg">{formatNumber(lane.count)} rows</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-muted"><motion.div key={`data-${runId}-${lane.id}`} initial={{ scaleX: 0 }} animate={{ scaleX: hasRun ? 1 : 0 }} style={{ originX: 0 }} transition={{ duration: reducedMotion ? 0 : 1.7, delay: reducedMotion ? 0 : index * 0.12, ease: "easeInOut" }} className={`h-full rounded-full ${index % 2 === 0 ? "bg-primary" : "bg-secondary"}`} /></div><p className="mt-2 text-[11px] font-display font-bold uppercase tracking-wide text-muted-fg">same instruction · sum this range</p></div>)}</div><div className="mt-3 flex items-center gap-2 text-xs text-muted-fg"><CheckCircle2 className="h-4 w-4 text-ok" aria-hidden /> The data is divided; the operation stays the same.</div></div>;
}

function TaskParallelView({ hasRun, runId, reducedMotion }: { hasRun: boolean; runId: number; reducedMotion: boolean }) {
  return <div><div className="mb-3 flex items-center justify-between"><p className="font-display text-sm font-black text-ink">Business report work queue</p><span className="text-xs font-mono text-muted-fg">different task × 4</span></div><div className="grid gap-2 sm:grid-cols-2">{TASKS.map((task, index) => <div key={task.title} className="rounded-xl border-2 border-line bg-card p-3"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-black text-primary">P{index + 1}</div><div className="min-w-0"><p className="font-display text-sm font-black text-ink">{task.title}</p><p className="mt-0.5 text-xs text-muted-fg">{task.detail}</p></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><motion.div key={`task-${runId}-${index}`} initial={{ scaleX: 0 }} animate={{ scaleX: hasRun ? 1 : 0 }} style={{ originX: 0 }} transition={{ duration: reducedMotion ? 0 : 1.9, delay: reducedMotion ? 0 : index * 0.16, ease: "easeOut" }} className="h-full rounded-full bg-accent" /></div><p className="mt-2 text-[11px] font-display font-bold uppercase tracking-wide text-muted-fg">processor {index + 1} works independently</p></div>)}</div><div className="mt-3 flex items-center gap-2 text-xs text-muted-fg"><CheckCircle2 className="h-4 w-4 text-ok" aria-hidden /> The processors receive different jobs and run them concurrently.</div></div>;
}

function PipelineParallelView({ hasRun, runId, reducedMotion }: { hasRun: boolean; runId: number; reducedMotion: boolean }) {
  const batches = [1, 2, 3];
  return <div><div className="mb-3 flex items-center justify-between"><p className="font-display text-sm font-black text-ink">Sales report pipeline</p><span className="text-xs font-mono text-muted-fg">stages overlap</span></div><div className="grid gap-2 md:grid-cols-4">{PIPELINE_STAGES.map((stage, index) => <div key={stage.title} className="relative rounded-xl border-2 border-line bg-card p-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-display font-black text-white">{index + 1}</span><p className="font-display text-sm font-black leading-tight text-ink">{stage.title}</p></div><p className="mt-2 text-xs text-muted-fg">{stage.detail}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><motion.div key={`stage-${runId}-${index}`} initial={{ scaleX: 0 }} animate={{ scaleX: hasRun ? 1 : 0 }} style={{ originX: 0 }} transition={{ duration: reducedMotion ? 0 : 1.35, delay: reducedMotion ? 0 : index * 0.32, ease: "easeInOut" }} className="h-full rounded-full bg-primary" /></div>{index < PIPELINE_STAGES.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-accent md:block" aria-hidden />}</div>)}</div><div className="mt-4 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-3"><div className="mb-2 flex items-center justify-between"><p className="font-display text-xs font-black uppercase tracking-wide text-accent">Batches moving through the stages</p><span className="text-xs text-muted-fg">collect → process → analyze → report</span></div><div className="relative h-9 overflow-hidden rounded-lg bg-card"><div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 text-[10px] font-display font-black uppercase tracking-wide text-muted-fg"><span>input</span><span>output</span></div>{batches.map((batch, index) => <motion.div key={`batch-${runId}-${batch}`} initial={{ left: "-12%", opacity: 0 }} animate={hasRun ? { left: "92%", opacity: [0, 1, 1, 0] } : { left: "-12%", opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 3.4, delay: reducedMotion ? 0 : index * 0.65, ease: "linear" }} className="absolute top-1/2 z-10 flex h-6 w-16 -translate-y-1/2 items-center justify-center rounded-md bg-secondary text-[10px] font-display font-black text-white">batch {batch}</motion.div>)}</div></div><div className="mt-3 flex items-center gap-2 text-xs text-muted-fg"><CheckCircle2 className="h-4 w-4 text-ok" aria-hidden /> Multiple batches can occupy different stages at the same time.</div></div>;
}
