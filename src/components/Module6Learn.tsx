import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, FlaskConical, Lightbulb, Play, RotateCcw, Sparkles, Target, Trophy } from "lucide-react";
import { Button, Card, Badge } from "./ui";
import { getTopic, LEARNING_STAGES, MODULE6_TOPICS, type TopicId } from "../data/module6Lessons";
import { TopicInteractiveLab } from "./TopicInteractiveLab";
import { useGameStore } from "../state/gameStore";
import module6Mark from "../assets/module6-mark.svg";

const KEY = "module6:learn-progress";

type SavedProgress = Record<TopicId, number>;

function loadProgress(): SavedProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { maxflow: 0, strings: 0, hashing: 0, geometry: 0, parallel: 0, ...parsed };
  } catch {
    return { maxflow: 0, strings: 0, hashing: 0, geometry: 0, parallel: 0 };
  }
}

function saveProgress(progress: SavedProgress) {
  try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* keep learning if storage is unavailable */ }
}

const accentClasses = {
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/10 text-accent border-accent/20",
  info: "bg-info/10 text-info border-info/20",
  ok: "bg-ok/10 text-ok border-ok/20",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
};

function TopicIcon({ id }: { id: TopicId }) {
  const common = "w-6 h-6";
  if (id === "maxflow") return <span className="text-2xl">↗</span>;
  if (id === "strings") return <span className="font-display font-black text-xl">Aa</span>;
  if (id === "hashing") return <span className="text-2xl">#</span>;
  if (id === "geometry") return <span className="text-2xl">△</span>;
  return <span className="text-2xl">∥</span>;
}

function FlowMiniVisual() {
  return <svg viewBox="0 0 300 120" className="w-full h-28" role="img" aria-label="Animated maximum flow preview">
    <defs><marker id="learn-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" fill="#047857" /></marker></defs>
    <path d="M35 60 H115 L185 30 H265" fill="none" stroke="#9cc8ab" strokeWidth="3" markerEnd="url(#learn-arrow)" />
    <path d="M35 60 H115 L185 90 H265" fill="none" stroke="#047857" strokeWidth="5" markerEnd="url(#learn-arrow)" />
    {[{x:35,y:60,t:"S"},{x:115,y:60,t:"A"},{x:185,y:30,t:"B"},{x:185,y:90,t:"C"},{x:265,y:60,t:"T"}].map((n) => <g key={n.t}><circle cx={n.x} cy={n.y} r="15" fill="white" stroke="#047857" strokeWidth="2"/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#16281d">{n.t}</text></g>)}
    <text x="150" y="116" textAnchor="middle" fontSize="10" fill="#4d5c50">flow follows capacity</text>
  </svg>;
}

function StringMiniVisual() {
  return <div className="font-mono text-sm space-y-2 overflow-hidden">
    <div className="flex gap-1 text-muted-fg">{[..."FLOODCONTROL"].map((c, i) => <span key={i} className="w-5 text-center">{c}</span>)}</div>
    <motion.div animate={{ x: [0, 10, 20, 30, 40] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse" }} className="flex gap-1 text-primary font-bold">
      {[..."CONT"].map((c, i) => <span key={i} className="w-5 h-6 rounded bg-primary/15 text-center">{c}</span>)}
    </motion.div>
    <p className="text-xs text-muted-fg">compare → shift → compare again</p>
  </div>;
}

function HashMiniVisual() {
  return <div className="flex items-center justify-center gap-2 py-2 text-sm font-display font-bold"><span className="rounded-lg bg-info/10 text-info px-3 py-2">key 8</span><span className="text-muted-fg">mod 3</span><span className="rounded-lg bg-primary text-white px-3 py-2">slot 2</span></div>;
}

function GeometryMiniVisual() {
  return <svg viewBox="0 0 260 120" className="w-full h-28" role="img" aria-label="Coordinate plane with three points"><path d="M28 100H238M38 110V12" stroke="#c9dcc6" strokeWidth="2"/><path d="M65 82 L195 82 L130 28 Z" fill="#047857" fillOpacity=".12" stroke="#047857" strokeWidth="3"/><circle cx="65" cy="82" r="5" fill="#b45309"/><circle cx="195" cy="82" r="5" fill="#b45309"/><circle cx="130" cy="28" r="5" fill="#b45309"/><text x="130" y="114" textAnchor="middle" fontSize="10" fill="#4d5c50">distance · orientation · area</text></svg>;
}

function ParallelMiniVisual() {
  return <div className="space-y-2 py-1"><div className="flex gap-2 items-center text-xs"><span className="w-14 text-muted-fg">worker 1</span><span className="h-3 flex-1 rounded bg-primary/70"/><span>25%</span></div><div className="flex gap-2 items-center text-xs"><span className="w-14 text-muted-fg">worker 2</span><span className="h-3 flex-1 rounded bg-primary"/><span>25%</span></div><div className="flex gap-2 items-center text-xs"><span className="w-14 text-muted-fg">worker 3</span><span className="h-3 flex-1 rounded bg-secondary"/><span>25%</span></div><div className="flex gap-2 items-center text-xs"><span className="w-14 text-muted-fg">worker 4</span><span className="h-3 flex-1 rounded bg-secondary/70"/><span>25%</span></div></div>;
}

function TopicPreview({ id }: { id: TopicId }) {
  if (id === "maxflow") return <FlowMiniVisual />;
  if (id === "strings") return <StringMiniVisual />;
  if (id === "hashing") return <HashMiniVisual />;
  if (id === "geometry") return <GeometryMiniVisual />;
  return <ParallelMiniVisual />;
}

export function Module6Learn() {
  const [progress, setProgress] = useState<SavedProgress>(loadProgress);
  const [selected, setSelected] = useState<TopicId>("maxflow");
  const [stage, setStage] = useState(0);
  const [checked, setChecked] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filter, setFilter] = useState<"all" | "started" | "new">("all");
  const [showOutline, setShowOutline] = useState(false);
  const data = useGameStore((s) => s.data);
  const topic = getTopic(selected);
  const selectedProgress = progress[selected];
  const completedTopics = MODULE6_TOPICS.filter((t) => progress[t.id] >= LEARNING_STAGES.length).length;
  const visibleTopics = useMemo(() => MODULE6_TOPICS.filter((t) => filter === "all" || (filter === "started" ? progress[t.id] > 0 : progress[t.id] === 0)), [filter, progress]);

  const updateProgress = (nextStage: number) => {
    const next = { ...progress, [selected]: Math.max(progress[selected], nextStage) };
    setProgress(next);
    saveProgress(next);
  };

  const selectTopic = (id: TopicId) => { setSelected(id); setStage(Math.min(progress[id], LEARNING_STAGES.length - 1)); setChecked(null); setShowAnswer(false); };
  const move = (next: number) => { const bounded = Math.max(0, Math.min(next, LEARNING_STAGES.length - 1)); setStage(bounded); updateProgress(bounded); setChecked(null); setShowAnswer(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <div className="space-y-6">
    <section className="clay overflow-hidden">
      <div className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-card to-secondary/15">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge tone="text-primary bg-primary/10">MODULE 6 · ADVANCED ALGORITHMS</Badge>
            <div className="flex items-center gap-3 mt-3"><img src={module6Mark} alt="" width="56" height="56" className="w-14 h-14 rounded-2xl shadow-clay-sm" /><h1 className="font-display font-black text-3xl sm:text-4xl text-ink">Learn by making the algorithm move</h1></div>
            <p className="text-muted-fg text-base max-w-2xl mt-3 leading-relaxed">A guided lesson studio for the five topics in Module 6. Discover the problem, manipulate the model, watch the real state changes, and test what you understood.</p>
          </div>
          <div className="clay-sm p-4 min-w-[170px]">
            <p className="text-xs font-display font-bold text-muted-fg uppercase">Module progress</p>
            <p className="font-display font-black text-3xl text-primary mt-1">{completedTopics}/5</p>
            <p className="text-xs text-muted-fg">topic paths complete</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
          {[{Icon:Lightbulb,t:"Discover"},{Icon:BookOpen,t:"Understand"},{Icon:FlaskConical,t:"Explore"},{Icon:Target,t:"Prove it"}].map(({Icon,t}, i) => <div key={t} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-display font-bold ${i <= stage ? "bg-primary text-white" : "bg-card text-muted-fg border border-line"}`}><Icon className="w-4 h-4" aria-hidden />{t}</div>)}
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
      <aside className="space-y-3 lg:sticky lg:top-24">
        <Card title="Module 6 topics" accent="border-primary/30">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(["all","new","started"] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-9 px-3 rounded-full text-xs font-display font-bold cursor-pointer ${filter === item ? "bg-primary text-white" : "bg-muted text-muted-fg"}`}>{item === "all" ? "All topics" : item === "new" ? "Not started" : "In progress"}</button>)}
          </div>
          <div className="space-y-2">
            {visibleTopics.map((item) => <button key={item.id} onClick={() => selectTopic(item.id)} className={`w-full text-left rounded-xl p-3 transition-all cursor-pointer border-2 ${selected === item.id ? "border-primary bg-primary/10" : "border-transparent hover:border-line hover:bg-muted"}`}><div className="flex items-center gap-3"><span className={`w-10 h-10 rounded-xl flex items-center justify-center border ${accentClasses[item.accent]}`}><TopicIcon id={item.id}/></span><span className="min-w-0 flex-1"><span className="block font-display font-bold text-sm text-ink">{item.title}</span><span className="block text-xs text-muted-fg mt-0.5">{item.lessonLength} · {item.complexity}</span></span>{progress[item.id] >= LEARNING_STAGES.length && <Check className="w-4 h-4 text-ok" aria-label="complete"/>}</div><div className="h-1.5 bg-muted rounded-full mt-3 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{width:`${(progress[item.id]/(LEARNING_STAGES.length-1))*100}%`}}/></div></button>)}
          </div>
        </Card>
        <div className="rounded-2xl border-2 border-dashed border-line bg-muted/50 p-4"><p className="font-display font-bold text-sm text-ink">Learning loop</p><p className="text-xs text-muted-fg mt-1 leading-relaxed">Open a topic, complete the six stages, answer its knowledge check, then jump into the matching playground or exercises.</p></div>
      </aside>

      <main className="space-y-4" id="lesson-main" tabIndex={-1}>
        <Card accent="border-primary/30">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="font-display font-black text-2xl text-ink">{topic.title}</h2><Badge tone={accentClasses[topic.accent]}>{topic.lessonLength}</Badge></div><p className="text-sm text-muted-fg mt-1">{topic.objective}</p></div><button onClick={() => setShowOutline((v)=>!v)} className="inline-flex items-center gap-2 min-h-11 px-3 rounded-xl bg-muted text-muted-fg font-display font-bold text-sm cursor-pointer">Lesson outline <ChevronDown className={`w-4 h-4 transition-transform ${showOutline ? "rotate-180" : ""}`} aria-hidden/></button></div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-6" aria-label="Lesson stages">{LEARNING_STAGES.map((s,i)=><button key={s.id} onClick={()=>move(i)} aria-current={stage===i?"step":undefined} className={`group min-h-16 rounded-xl px-1.5 py-2 text-center cursor-pointer border-2 transition-colors ${stage===i?"bg-primary text-white border-primary":"bg-card border-line text-muted-fg hover:border-primary/50"}`}><span className="block text-[10px] font-display font-black">{s.number}</span><span className="block text-[10px] font-display font-bold mt-1 leading-tight">{s.title}</span></button>)}</div>
          {showOutline && <div className="mt-4 p-4 rounded-xl bg-muted/60 text-sm text-muted-fg"><p className="font-display font-bold text-ink mb-2">{LEARNING_STAGES.length} short stages</p><ol className="grid sm:grid-cols-2 gap-2">{LEARNING_STAGES.map((s,i)=><li key={s.id}><button className="text-left hover:text-primary cursor-pointer" onClick={()=>move(i)}><span className="font-display font-bold text-primary mr-2">{s.number}</span>{s.title} — {s.hint}</button></li>)}</ol></div>}
        </Card>

        <AnimatePresence mode="wait"><motion.div key={`${selected}-${stage}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.2}} className="space-y-4">
          <Card title={`${LEARNING_STAGES[stage].number} · ${LEARNING_STAGES[stage].title}`} accent="border-primary/30">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6"><div><p className="font-display font-black text-xl text-ink">{topic.stages[stage].title}</p><p className="text-primary font-display font-bold mt-2">{topic.stages[stage].lead}</p><div className="space-y-3 mt-4 text-sm text-ink leading-relaxed">{topic.stages[stage].paragraphs.map((p,i)=><p key={i}>{p}</p>)}</div>{topic.stages[stage].bullets && <ul className="mt-4 grid sm:grid-cols-2 gap-2">{topic.stages[stage].bullets.map((b)=><li key={b} className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-ink"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden/>{b}</li>)}</ul>}{topic.stages[stage].formula && <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-ink text-white p-4 font-mono text-sm overflow-x-auto">{topic.stages[stage].formula}</pre>}</div><div className="clay-sm p-4 bg-gradient-to-br from-primary/5 to-secondary/15"><div className="flex items-center gap-2 text-primary font-display font-bold text-sm"><Sparkles className="w-4 h-4" aria-hidden/>Visual model</div><div className="mt-4">{selected === "maxflow" ? <FlowMiniVisual/> : selected === "strings" ? <StringMiniVisual/> : selected === "hashing" ? <HashMiniVisual/> : selected === "geometry" ? <GeometryMiniVisual/> : <ParallelMiniVisual/>}</div><p className="text-xs text-muted-fg mt-3 leading-relaxed">This visual is tied to the concept. Open the playground when you want the full execution trace.</p></div></div>
          </Card>

          {stage === 2 && <><TopicInteractiveLab topic={selected} /><Card title="Continue with the execution trace" accent="border-info/30"><div className="flex flex-wrap items-center gap-3"><div className="flex-1 min-w-[220px]"><p className="text-sm text-ink leading-relaxed">The lab builds intuition. Use the full Playground when you want every algorithm step, pause control, and execution log.</p></div><Button variant="primary" onClick={()=>{ if(selected === "strings") window.location.hash="playground"; }}>{selected === "strings" || selected === "maxflow" ? <><Play className="w-4 h-4" aria-hidden/> Open playground</> : <><FlaskConical className="w-4 h-4" aria-hidden/> Explore the model</>}</Button></div></Card></>}

          {stage === 4 && <Card title="Quick knowledge check" accent="border-accent/30"><p className="font-display font-bold text-lg text-ink">{topic.check.question}</p><div className="grid sm:grid-cols-2 gap-2 mt-4">{topic.check.options.map((option,i)=><button key={option} onClick={()=>{setChecked(i);setShowAnswer(true);}} className={`min-h-12 text-left px-4 rounded-xl border-2 font-body cursor-pointer transition-colors ${checked===i ? (i===topic.check.answer?"border-ok bg-ok/10 text-ok":"border-danger bg-danger/10 text-danger") : "border-line bg-card hover:border-primary/50"}`}><span className="font-display font-black mr-2">{String.fromCharCode(65+i)}</span>{option}</button>)}</div>{showAnswer && <div className={`mt-4 p-4 rounded-xl ${checked===topic.check.answer?"bg-ok/10 text-ok":"bg-amber-50 text-amber-900"}`}><div className="flex items-start gap-2"><CircleHelp className="w-5 h-5 shrink-0 mt-0.5" aria-hidden/><p className="text-sm leading-relaxed">{topic.check.explanation}</p></div></div>}</Card>}

          {stage === 5 && <Card title="Keep this idea" accent="border-ok/30"><div className="flex items-start gap-3"><Trophy className="w-6 h-6 text-ok shrink-0" aria-hidden/><div><p className="font-display font-bold text-lg text-ink">{topic.takeaway}</p><p className="text-sm text-muted-fg mt-2">Next: choose another Module 6 topic or open the topic's Playground / Exercises tab.</p></div></div></Card>}
        </motion.div></AnimatePresence>

        <div className="flex flex-wrap justify-between gap-2"><Button variant="ghost" onClick={()=>move(stage-1)} disabled={stage===0}><ArrowLeft className="w-4 h-4" aria-hidden/> Previous</Button><div className="flex gap-2">{stage===5 && <Button variant="secondary" onClick={()=>{setStage(0);setChecked(null);}}><RotateCcw className="w-4 h-4" aria-hidden/> Restart topic</Button>}<Button variant="primary" onClick={()=>move(stage+1)} disabled={stage===5}>{stage===4 && !showAnswer ? "Answer to continue" : stage===5 ? "Topic complete" : <>Continue <ArrowRight className="w-4 h-4" aria-hidden/></>}</Button></div></div>
      </main>
    </section>
  </div>;
}
