import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calculator, CircleDot, Cpu, GitBranch, Minus, Plus, RotateCcw, Sigma } from "lucide-react";
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

function GeometryLab() {
  const [points, setPoints] = useState([{ x: 1, y: 2, label: "A" }, { x: 4, y: 6, label: "B" }, { x: 2, y: 3, label: "C" }]);
  const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const cross = (points[1].x-points[0].x)*(points[2].y-points[0].y)-(points[1].y-points[0].y)*(points[2].x-points[0].x);
  const area = Math.abs(cross) / 2;
  const setPoint = (index: number, axis: "x"|"y", value: string) => setPoints((p)=>p.map((point,i)=>i===index?{...point,[axis]:Number(value)||0}:point));
  return <Card title="Interact · coordinate geometry lab" accent="border-violet-200">
    <div className="grid grid-cols-3 gap-2 mb-4">{points.map((p,i)=><div key={p.label} className="clay-sm p-2"><p className="font-display font-bold text-sm text-ink mb-1">Point {p.label}</p><div className="flex gap-1"><input aria-label={`${p.label} x`} className={`${inputCls} min-w-0 w-1/2 px-2`} type="number" value={p.x} onChange={(e)=>setPoint(i,"x",e.target.value)}/><input aria-label={`${p.label} y`} className={`${inputCls} min-w-0 w-1/2 px-2`} type="number" value={p.y} onChange={(e)=>setPoint(i,"y",e.target.value)}/></div></div>)}</div>
    <svg viewBox="0 0 320 180" className="w-full h-48 rounded-xl bg-muted/50" role="img" aria-label="Interactive coordinate triangle"><path d="M30 150H300M40 165V15" stroke="#c9dcc6" strokeWidth="2"/><polygon points={points.map((p)=>`${40+p.x*45},${150-p.y*20}`).join(" ")} fill="#047857" fillOpacity=".12" stroke="#047857" strokeWidth="3"/><line x1={40+points[0].x*45} y1={150-points[0].y*20} x2={40+points[1].x*45} y2={150-points[1].y*20} stroke="#b45309" strokeDasharray="4 4"/><line x1={40+points[0].x*45} y1={150-points[0].y*20} x2={40+points[2].x*45} y2={150-points[2].y*20} stroke="#b45309" strokeDasharray="4 4"/>{points.map((p)=><g key={p.label}><circle cx={40+p.x*45} cy={150-p.y*20} r="7" fill="#b45309"/><text x={40+p.x*45} y={145-p.y*20} textAnchor="middle" fontSize="10" fill="white" fontWeight="700">{p.label}</text></g>)}</svg>
    <div className="grid grid-cols-3 gap-2 mt-4 text-center"><div className="rounded-xl bg-primary/10 p-3"><Calculator className="w-4 h-4 mx-auto text-primary" aria-hidden/><p className="text-xs text-muted-fg mt-1">distance AB</p><p className="font-display font-black text-primary">{distance.toFixed(2)}</p></div><div className="rounded-xl bg-accent/10 p-3"><CircleDot className="w-4 h-4 mx-auto text-accent" aria-hidden/><p className="text-xs text-muted-fg mt-1">cross product</p><p className="font-display font-black text-accent">{cross}</p></div><div className="rounded-xl bg-ok/10 p-3"><Sigma className="w-4 h-4 mx-auto text-ok" aria-hidden/><p className="text-xs text-muted-fg mt-1">triangle area</p><p className="font-display font-black text-ok">{area}</p></div></div>
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
