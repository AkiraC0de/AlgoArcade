import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, FlaskConical, ListChecks } from "lucide-react";
import { Badge } from "./ui";
import { TopicLesson } from "./TopicLesson";
import { MaxFlowLesson } from "./MaxFlowLesson";
import { StringLesson } from "./StringLesson";
import { HashingLesson } from "./HashingLesson";
import { GeometryLesson } from "./GeometryLesson";
import { ParallelLesson } from "./ParallelLesson";
import { TopicExercises } from "./TopicExercises";
import type { TopicId } from "../data/module6Lessons";

export type TopicPageTab = "learn" | "playground" | "exercises";

export function TopicPageShell({ topic, title, description, playground }: { topic: TopicId; title: string; description: string; playground: React.ReactNode }) {
  const [tab, setTab] = useState<TopicPageTab>("learn");
  const tabs = [
    { id: "learn" as const, label: "Learn", Icon: BookOpen },
    { id: "playground" as const, label: "Playground", Icon: FlaskConical },
    { id: "exercises" as const, label: "Exercises", Icon: ListChecks },
  ];
  return <div className="space-y-5">
    <div><div className="flex flex-wrap items-center gap-3"><h1 className="font-display font-black text-2xl text-ink">{title}</h1><Badge tone="text-primary bg-primary/10">Module 6</Badge></div><p className="text-muted-fg font-body text-sm max-w-2xl mt-2">{description}</p></div>
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={`${title} sections`}>{tabs.map(({id,label,Icon})=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>setTab(id)} className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-xl font-display font-bold text-sm cursor-pointer border-2 transition-colors ${tab===id?"bg-primary text-white border-primary shadow-clay-sm":"bg-card text-muted-fg border-line hover:border-primary/40"}`}><Icon className="w-4 h-4" aria-hidden/>{label}</button>)}</div>
    <motion.div key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.16}} role="tabpanel">{tab === "learn" ? (topic === "maxflow" ? <MaxFlowLesson /> : topic === "strings" ? <StringLesson /> : topic === "hashing" ? <HashingLesson /> : topic === "geometry" ? <GeometryLesson /> : topic === "parallel" ? <ParallelLesson /> : <TopicLesson topic={topic}/>) : tab === "playground" ? playground : <TopicExercises topic={topic}/>}</motion.div>
  </div>;
}
