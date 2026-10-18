import { useState } from "react";
import { motion } from "motion/react";
import { useGameStore } from "../state/gameStore";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Lightbulb, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Button, Card } from "./ui";
import { getTopic, LEARNING_STAGES, type TopicId } from "../data/module6Lessons";
import { TopicInteractiveLab } from "./TopicInteractiveLab";

const KEY = "module6:learn-progress";

function readProgress(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function persist(progress: Record<string, number>) {
  try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* learning continues without storage */ }
}

export function TopicLesson({ topic: topicId }: { topic: TopicId }) {
  const topic = getTopic(topicId);
  const setLessonProgress = useGameStore((state) => state.setLessonProgress);
  const [stage, setStage] = useState(() => Math.min(readProgress()[topicId] ?? 0, 5));
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const setStageAndSave = (next: number) => {
    const bounded = Math.max(0, Math.min(5, next));
    setStage(bounded);
    const nextProgress = Math.max(readProgress()[topicId] ?? 0, bounded);
    persist({ ...readProgress(), [topicId]: nextProgress });
    setLessonProgress(topicId, nextProgress);
    setSelected(null);
    setChecked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const current = topic.stages[stage];
  const answerCorrect = selected === topic.check.answer;

  return <div className="space-y-4">
    <Card accent="border-primary/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-wide text-primary font-display font-black">Guided lesson</p><h2 className="font-display font-black text-2xl text-ink mt-1">{topic.title}</h2><p className="text-sm text-muted-fg mt-1">{topic.objective}</p></div>
        <div className="rounded-xl bg-primary/10 px-3 py-2 text-center"><p className="text-xs text-muted-fg">Stage</p><p className="font-display font-black text-primary">{stage + 1}/6</p></div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-5">{LEARNING_STAGES.map((item, i) => <button key={item.id} onClick={() => setStageAndSave(i)} className={`min-h-14 rounded-xl border-2 px-1 py-2 text-center cursor-pointer ${stage === i ? "bg-primary text-white border-primary" : stage > i ? "bg-ok/10 text-ok border-ok/30" : "bg-card text-muted-fg border-line hover:border-primary/40"}`}><span className="block text-[10px] font-display font-black">{item.number}</span><span className="block text-[10px] font-display font-bold mt-1 leading-tight">{item.title}</span></button>)}</div>
    </Card>

    <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card title={`${LEARNING_STAGES[stage].number} · ${current.title}`} accent="border-primary/30">
        <p className="text-primary font-display font-bold">{current.lead}</p>
        <div className="space-y-3 mt-4 text-sm text-ink leading-relaxed">{current.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>
        {current.bullets && <ul className="grid sm:grid-cols-2 gap-2 mt-4">{current.bullets.map((b) => <li key={b} className="flex gap-2 p-3 rounded-xl bg-muted/60 text-sm"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />{b}</li>)}</ul>}
        {current.formula && <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-ink text-white p-4 font-mono text-sm overflow-x-auto">{current.formula}</pre>}
      </Card>

      {stage === 2 && <TopicInteractiveLab topic={topicId} />}
      {stage === 3 && <Card title="What to observe" accent="border-info/30"><div className="flex gap-3"><Sparkles className="w-5 h-5 text-info shrink-0" aria-hidden /><p className="text-sm text-ink leading-relaxed">Look for the state change that matters: flow and residual capacity, comparison and shift, bucket placement, orientation and area, or worker allocation. The matching Playground shows the full execution trace for algorithms that already have one.</p></div></Card>}
      {stage === 4 && <Card title="Quick knowledge check" accent="border-accent/30"><div className="flex gap-3"><CircleHelp className="w-5 h-5 text-accent shrink-0" aria-hidden /><div className="flex-1"><p className="font-display font-black text-lg text-ink">{topic.check.question}</p><div className="grid sm:grid-cols-2 gap-2 mt-4">{topic.check.options.map((option, i) => <button key={option} disabled={checked} onClick={() => setSelected(i)} className={`min-h-12 text-left px-4 rounded-xl border-2 cursor-pointer ${selected === i ? (checked ? (i === topic.check.answer ? "border-ok bg-ok/10 text-ok" : "border-danger bg-danger/10 text-danger") : "border-primary bg-primary/10") : "border-line bg-card hover:border-primary/40"}`}><b className="font-display mr-2">{String.fromCharCode(65 + i)}</b>{option}</button>)}</div>{!checked ? <Button className="mt-4" variant="accent" disabled={selected === null} onClick={() => setChecked(true)}>Check answer</Button> : <div className={`mt-4 rounded-xl p-4 ${answerCorrect ? "bg-ok/10 text-ok" : "bg-amber-50 text-amber-900"}`}><p className="font-display font-bold">{answerCorrect ? "Correct." : "Use the explanation and try the idea again."}</p><p className="text-sm mt-1">{topic.check.explanation}</p></div>}</div></div></Card>}
      {stage === 5 && <Card title="Reflect and continue" accent="border-ok/30"><div className="flex gap-3"><Trophy className="w-6 h-6 text-ok shrink-0" aria-hidden /><div><p className="font-display font-black text-xl text-ink">{topic.takeaway}</p><p className="text-sm text-muted-fg mt-2">You can revisit any stage, open the Playground, or continue to Exercises.</p></div></div></Card>}
    </motion.div>

    <div className="flex flex-wrap justify-between gap-2"><Button variant="ghost" disabled={stage===0} onClick={() => setStageAndSave(stage - 1)}><ArrowLeft className="w-4 h-4" aria-hidden /> Previous</Button><div className="flex gap-2">{stage === 5 && <Button variant="ghost" onClick={() => setStageAndSave(0)}><RotateCcw className="w-4 h-4" aria-hidden /> Restart</Button>}{stage < 5 && <Button variant="primary" disabled={stage === 4 && !checked} onClick={() => setStageAndSave(stage + 1)}>Continue <ArrowRight className="w-4 h-4" aria-hidden /></Button>}</div></div>
  </div>;
}
