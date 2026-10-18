import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Play, RotateCcw, Trophy } from "lucide-react";
import { Button, Card } from "./ui";
import { getTopic, LEARNING_STAGES } from "../data/module6Lessons";
import { MaxFlowConceptVisual, MaxFlowPathLab } from "./MaxFlowVisual";
import { usePlayback } from "../hooks/usePlayback";
import { runFordFulkerson, type MaxFlowStep } from "../engine/maxflow/fordFulkerson";
import { SIMPLE_17 } from "../engine/maxflow/presets";
import { FlowGraphViz } from "./FlowGraphViz";
import { StepLog } from "./StepLog";
import { TimelineScrubber } from "./TimelineScrubber";
import { PlaybackControls } from "./PlaybackControls";
import { useGameStore } from "../state/gameStore";

const KEY = "module6:learn-progress";

function readProgress(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function persist(progress: Record<string, number>) {
  try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* learning continues without storage */ }
}

function WatchTrace() {
  const pb = usePlayback<MaxFlowStep>(2200);
  const [started, setStarted] = useState(false);
  const steps = runFordFulkerson(SIMPLE_17, "bfs").steps;
  useEffect(() => {
    if (started && pb.count === 0) pb.setSteps(steps);
  }, [started, pb.count, pb.setSteps, steps]);
  useEffect(() => {
    if (started && pb.count > 0 && !pb.playing && pb.index === 0) pb.play();
  }, [started, pb.count, pb.playing, pb.index, pb.play]);
  const start = () => setStarted(true);
  const reset = () => { pb.reset(); setStarted(false); };
  return <Card title="Watch · Find → Push → Update" accent="border-info/40">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-display font-black text-lg text-ink">Simple 17 network</p><p className="text-sm text-muted-fg mt-1">This is the real Ford–Fulkerson trace, not an illustrative animation.</p></div><Button variant={started ? "secondary" : "primary"} onClick={started ? reset : start}>{started ? <><RotateCcw className="w-4 h-4" aria-hidden /> Restart trace</> : <><Play className="w-4 h-4" aria-hidden /> Start trace</>}</Button></div>
    {!started ? <div className="mt-4 rounded-xl bg-muted/60 p-4"><p className="text-sm text-ink leading-relaxed">Press Start trace to watch the engine find a path, calculate its bottleneck, push flow, update residual capacity, and repeat until the maximum flow is reached.</p><div className="mt-4 pointer-events-none"><FlowGraphViz graph={SIMPLE_17} step={null} layoutId="simple17" /></div></div> : <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4"><div className="lg:col-span-3 space-y-3"><div className="rounded-xl border-2 border-line bg-muted/30 p-2"><FlowGraphViz graph={SIMPLE_17} step={pb.step} layoutId="simple17" /></div><PlaybackControls pb={pb}/><TimelineScrubber pb={pb}/></div><div className="lg:col-span-2"><p className="text-xs uppercase tracking-wide text-primary font-display font-black mb-2">What happened</p><StepLog notes={pb.steps.map((step) => step.note)} current={pb.index}/></div></div>}
  </Card>;
}

export function MaxFlowLesson() {
  const topic = getTopic("maxflow");
  const setLessonProgress = useGameStore((state) => state.setLessonProgress);
  const [stage, setStage] = useState(() => Math.min(readProgress().maxflow ?? 0, 5));
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const setStageAndSave = (next: number) => { const bounded = Math.max(0, Math.min(5, next)); setStage(bounded); const previous = readProgress(); const nextProgress = Math.max(previous.maxflow ?? 0, bounded); persist({ ...previous, maxflow: nextProgress }); setLessonProgress("maxflow", nextProgress); setSelected(null); setChecked(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const current = topic.stages[stage];
  const answerCorrect = selected === topic.check.answer;

  return <div className="space-y-4">
    <Card accent="border-primary/30"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-primary font-display font-black">Guided lesson · visual edition</p><h2 className="font-display font-black text-2xl text-ink mt-1">Maximum Flow</h2><p className="text-sm text-muted-fg mt-1">Follow capacity through a network, then watch Ford–Fulkerson change the graph one step at a time.</p></div><div className="rounded-xl bg-primary/10 px-3 py-2 text-center"><p className="text-xs text-muted-fg">Stage</p><p className="font-display font-black text-primary">{stage + 1}/6</p></div></div><div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-5">{LEARNING_STAGES.map((item, i) => <button key={item.id} onClick={() => setStageAndSave(i)} className={`min-h-14 rounded-xl border-2 px-1 py-2 text-center cursor-pointer ${stage === i ? "bg-primary text-white border-primary" : stage > i ? "bg-ok/10 text-ok border-ok/30" : "bg-card text-muted-fg border-line hover:border-primary/40"}`}><span className="block text-[10px] font-display font-black">{item.number}</span><span className="block text-[10px] font-display font-bold mt-1 leading-tight">{item.title}</span></button>)}</div></Card>

    <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card title={`${LEARNING_STAGES[stage].number} · ${current.title}`} accent="border-primary/30"><p className="text-primary font-display font-bold">{current.lead}</p><div className="space-y-3 mt-4 text-sm text-ink leading-relaxed">{current.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>{current.bullets && <ul className="grid sm:grid-cols-2 gap-2 mt-4">{current.bullets.map((b) => <li key={b} className="flex gap-2 p-3 rounded-xl bg-muted/60 text-sm"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />{b}</li>)}</ul>}{current.formula && <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-ink text-white p-4 font-mono text-sm overflow-x-auto">{current.formula}</pre>}</Card>
      {stage === 0 && <Card title="Visual model · a network with limits" accent="border-primary/40"><MaxFlowConceptVisual kind="overview"/><p className="text-xs text-muted-fg mt-2">The source sends flow, the sink receives it, and every labeled edge limits how much can pass.</p></Card>}
      {stage === 1 && <Card title="Visual model · the three rules" accent="border-ok/40"><MaxFlowConceptVisual kind="rules"/></Card>}
      {stage === 2 && <MaxFlowPathLab/>}
      {stage === 3 && <WatchTrace/>}
      {stage === 4 && <Card title="Quick knowledge check" accent="border-accent/30"><div className="flex gap-3"><CircleHelp className="w-5 h-5 text-accent shrink-0" aria-hidden/><div className="flex-1"><p className="font-display font-black text-lg text-ink">{topic.check.question}</p><div className="grid sm:grid-cols-2 gap-2 mt-4">{topic.check.options.map((option, i) => <button key={option} disabled={checked} onClick={() => setSelected(i)} className={`min-h-12 text-left px-4 rounded-xl border-2 cursor-pointer ${selected === i ? (checked ? (i === topic.check.answer ? "border-ok bg-ok/10 text-ok" : "border-danger bg-danger/10 text-danger") : "border-primary bg-primary/10") : "border-line bg-card hover:border-primary/40"}`}><b className="font-display mr-2">{String.fromCharCode(65 + i)}</b>{option}</button>)}</div>{!checked ? <Button className="mt-4" variant="accent" disabled={selected === null} onClick={() => setChecked(true)}>Check answer</Button> : <div className={`mt-4 rounded-xl p-4 ${answerCorrect ? "bg-ok/10 text-ok" : "bg-amber-50 text-amber-900"}`}><p className="font-display font-bold">{answerCorrect ? "Correct." : "Use the explanation and try the idea again."}</p><p className="text-sm mt-1">{topic.check.explanation}</p></div>}</div></div></Card>}
      {stage === 5 && <><Card title="Visual model · when the algorithm stops" accent="border-accent/40"><MaxFlowConceptVisual kind="cut"/><p className="text-xs text-muted-fg mt-2">When no residual path crosses the cut, the reachable source side and sink side form a minimum cut.</p></Card><Card title="Reflect and continue" accent="border-ok/30"><div className="flex gap-3"><Trophy className="w-6 h-6 text-ok shrink-0" aria-hidden/><div><p className="font-display font-black text-xl text-ink">{topic.takeaway}</p><p className="text-sm text-muted-fg mt-2">You can revisit any stage, open the full Playground, or continue to Exercises.</p></div></div></Card></>}
    </motion.div>
    <div className="flex flex-wrap justify-between gap-2"><Button variant="ghost" disabled={stage === 0} onClick={() => setStageAndSave(stage - 1)}><ArrowLeft className="w-4 h-4" aria-hidden/> Previous</Button><div className="flex gap-2">{stage === 5 && <Button variant="ghost" onClick={() => setStageAndSave(0)}><RotateCcw className="w-4 h-4" aria-hidden/> Restart</Button>}{stage < 5 && <Button variant="primary" disabled={stage === 4 && !checked} onClick={() => setStageAndSave(stage + 1)}>Continue <ArrowRight className="w-4 h-4" aria-hidden/></Button>}</div></div>
  </div>;
}
