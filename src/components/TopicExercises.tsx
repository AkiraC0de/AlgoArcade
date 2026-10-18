import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import { Button, Card } from "./ui";
import { TOPIC_CHALLENGES } from "../data/topicChallenges";
import type { TopicId } from "../data/module6Lessons";

const PROGRESS_KEY = "module6:exercise-progress";

function loadDone(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}"); } catch { return {}; }
}

export function TopicExercises({ topic }: { topic: TopicId }) {
  const items = TOPIC_CHALLENGES.filter((item) => item.topic === topic);
  const [done, setDone] = useState<Record<string, boolean>>(loadDone);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [evaluated, setEvaluated] = useState(false);
  const item = items[index];
  const completeCount = useMemo(() => items.filter((i) => done[i.id]).length, [done, items]);

  if (!item) return null;
  const correct = selected === item.answer;
  const evaluate = () => { if (selected === null) return; setEvaluated(true); if (selected === item.answer) { const next = { ...done, [item.id]: true }; setDone(next); localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } };
  const next = () => { setIndex((index + 1) % items.length); setSelected(null); setEvaluated(false); };
  const reset = () => { setDone({}); localStorage.removeItem(PROGRESS_KEY); setIndex(0); setSelected(null); setEvaluated(false); };

  return <Card title={<span className="flex items-center justify-between gap-3"><span>Practice · {completeCount}/{items.length} understood</span><span className="text-xs font-body text-muted-fg">Question {index + 1} of {items.length}</span></span>} accent="border-accent/30">
    <div className="h-2 rounded-full bg-muted overflow-hidden mb-5"><div className="h-full bg-primary rounded-full transition-all" style={{width:`${(completeCount/items.length)*100}%`}}/></div>
    <p className="font-display font-black text-lg text-ink leading-relaxed">{item.prompt}</p>
    <div className="grid sm:grid-cols-2 gap-2 mt-4">{item.options.map((option, i) => <button key={option} disabled={evaluated} onClick={()=>setSelected(i)} className={`min-h-12 text-left px-4 rounded-xl border-2 font-body cursor-pointer transition-colors ${selected===i ? (evaluated ? (i===item.answer?"border-ok bg-ok/10 text-ok":"border-danger bg-danger/10 text-danger") : "border-primary bg-primary/10") : "border-line bg-card hover:border-primary/50"}`}><span className="font-display font-black mr-2">{String.fromCharCode(65+i)}</span>{option}</button>)}</div>
    {evaluated && <div className={`mt-4 rounded-xl p-4 ${correct ? "bg-ok/10 text-ok" : "bg-amber-50 text-amber-900"}`}><div className="flex items-start gap-2">{correct ? <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden/> : <XCircle className="w-5 h-5 shrink-0" aria-hidden/>}<div><p className="font-display font-bold">{correct ? "Correct — keep going." : "Not quite — use the explanation."}</p><p className="text-sm mt-1 leading-relaxed">{item.explanation}</p>{!correct && <p className="text-sm mt-2 inline-flex items-start gap-1"><Lightbulb className="w-4 h-4 mt-0.5 shrink-0" aria-hidden/>{item.hint}</p>}</div></div></div>}
    <div className="flex flex-wrap justify-between gap-2 mt-5"><Button variant="ghost" onClick={reset}><RotateCcw className="w-4 h-4" aria-hidden/> Reset practice</Button><div className="flex gap-2">{!evaluated ? <Button variant="accent" disabled={selected===null} onClick={evaluate}>Check answer</Button> : <Button variant="primary" onClick={next}>Next <ChevronRight className="w-4 h-4" aria-hidden/></Button>}</div></div>
  </Card>;
}
