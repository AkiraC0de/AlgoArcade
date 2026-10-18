import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calculator, CircleDot, Cpu, GitBranch, RotateCcw, Sigma } from "lucide-react";
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

function ParallelLab() {
  const [workers, setWorkers] = useState(4);
  const [records, setRecords] = useState(1000);
  const lanes = useMemo(()=>Array.from({length:workers},(_,i)=>({id:i+1, work:Math.ceil(records/workers)+(i<records%workers?1:0)})),[workers,records]);
  const serial = records;
  const parallel = Math.max(...lanes.map((l)=>l.work));
  return <Card title="Interact · parallel work simulator" accent="border-ok/30">
    <div className="flex flex-wrap gap-3 items-end"><Field label="Workers"><input className={`${inputCls} w-28`} type="number" min="1" max="8" value={workers} onChange={(e)=>setWorkers(Math.min(8,Math.max(1,Number(e.target.value)||1)))}/></Field><Field label="Records"><input className={`${inputCls} w-32`} type="number" min="1" max="10000" value={records} onChange={(e)=>setRecords(Math.min(10000,Math.max(1,Number(e.target.value)||1)))}/></Field><Button variant="ghost" onClick={()=>{setWorkers(4);setRecords(1000)}}><RotateCcw className="w-4 h-4" aria-hidden/> Reset</Button></div>
    <div className="space-y-2 mt-5">{lanes.map((lane,i)=><div key={lane.id} className="flex items-center gap-3"><span className="w-20 text-xs font-display font-bold text-muted-fg">worker {lane.id}</span><div className="h-6 flex-1 bg-muted rounded-lg overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${(lane.work/serial)*100}%`}} className={`h-full rounded-lg ${i%2===0?"bg-primary":"bg-secondary"}`}/></div><span className="w-20 text-xs font-mono text-right">{lane.work}</span></div>)}</div>
    <div className="grid grid-cols-2 gap-3 mt-5"><div className="rounded-xl bg-muted p-4"><Cpu className="w-4 h-4 text-muted-fg" aria-hidden/><p className="text-xs text-muted-fg mt-1">sequential units</p><p className="font-display font-black text-xl text-ink">{serial}</p></div><div className="rounded-xl bg-primary/10 p-4"><GitBranch className="w-4 h-4 text-primary" aria-hidden/><p className="text-xs text-muted-fg mt-1">longest parallel lane</p><p className="font-display font-black text-xl text-primary">{parallel}</p></div></div>
    <p className="text-xs text-muted-fg mt-3">This is a scheduling simulation for learning—not a measurement of real hardware performance.</p>
  </Card>;
}
