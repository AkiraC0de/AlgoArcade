import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const topicBase = `/${topic}`;
  const currentTab = useMemo<TopicPageTab>(() => {
    const suffix = location.pathname.slice(topicBase.length).replace(/^\//, "");
    return suffix === "playground" || suffix === "exercise" ? suffix === "exercise" ? "exercises" : "playground" : "learn";
  }, [location.pathname, topicBase]);
  const tabs = [
    { id: "learn" as const, label: "Learn", Icon: BookOpen, route: `${topicBase}/learn` },
    { id: "playground" as const, label: "Playground", Icon: FlaskConical, route: `${topicBase}/playground` },
    { id: "exercises" as const, label: "Exercises", Icon: ListChecks, route: `${topicBase}/exercise` },
  ];
  const content = currentTab === "learn"
    ? topic === "maxflow" ? <MaxFlowLesson /> : topic === "strings" ? <StringLesson /> : topic === "hashing" ? <HashingLesson /> : topic === "geometry" ? <GeometryLesson /> : topic === "parallel" ? <ParallelLesson /> : <TopicLesson topic={topic}/>
    : currentTab === "playground" ? playground : <TopicExercises topic={topic}/>;
  return <div className="space-y-5">
    <div><div className="flex flex-wrap items-center gap-3"><h1 className="font-display font-black text-2xl text-ink">{title}</h1><Badge tone="text-primary bg-primary/10">Module 6</Badge></div><p className="text-muted-fg font-body text-sm max-w-2xl mt-2">{description}</p></div>
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={`${title} sections`}>{tabs.map(({id,label,Icon,route})=><Link key={id} to={route} role="tab" aria-selected={currentTab===id} className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-xl font-display font-bold text-sm cursor-pointer border-2 transition-colors ${currentTab===id?"bg-primary text-white border-primary shadow-clay-sm":"bg-card text-muted-fg border-line hover:border-primary/40"}`}><Icon className="w-4 h-4" aria-hidden/>{label}</Link>)}</div>
    <motion.div key={location.pathname} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.16}} role="tabpanel">{content}</motion.div>
  </div>;
}
