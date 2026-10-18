import { ArrowRight, Compass, PlayCircle, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui";

export function HomeHero({ started, nextTopic, nextStage }: { started: boolean; nextTopic: { name: string; to: string }; nextStage: string }) {
  return <section className="relative overflow-hidden rounded-[28px] border-2 border-primary/25 bg-gradient-to-br from-primary/10 via-card to-secondary/15 p-6 shadow-clay-sm sm:p-9">
    <div className="pointer-events-none absolute -right-14 -top-20 h-60 w-60 rounded-full bg-secondary/20 blur-3xl" aria-hidden />
    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-primary/10 blur-3xl" aria-hidden />
    <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
      <div>
        <Badge tone="text-primary bg-primary/10"><Sparkles className="h-3.5 w-3.5" aria-hidden /> Advanced Algorithms · Module 6</Badge>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-black tracking-tight text-ink sm:text-5xl">Turn hard algorithms into something you can see.</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-fg sm:text-lg">Build the idea, move the model, watch the real execution, and prove what you understand. Your next breakthrough starts with one small step.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link to={nextTopic.to} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-display font-black text-accent-fg shadow-clay-sm transition-transform hover:-translate-y-0.5"><PlayCircle className="h-5 w-5" aria-hidden />{started ? `Resume ${nextTopic.name}` : "Start your first lesson"}</Link><Link to="/player" className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-primary bg-card px-5 py-3 font-display font-black text-primary shadow-clay-sm transition-transform hover:-translate-y-0.5"><Trophy className="h-5 w-5" aria-hidden />View your level</Link></div>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-display font-bold text-muted-fg"><span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5"><Compass className="h-3.5 w-3.5 text-primary" aria-hidden /> {started ? `Next up: ${nextStage}` : "No prerequisites—start anywhere"}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5"><ArrowRight className="h-3.5 w-3.5 text-accent" aria-hidden /> Learn by doing</span></div>
      </div>
      <div className="rounded-2xl border-2 border-primary/20 bg-card/80 p-5 shadow-clay-sm backdrop-blur-sm"><p className="text-xs font-display font-black uppercase tracking-[0.14em] text-primary">The learning loop</p><div className="mt-4 space-y-3">{[{ n:"01", label:"See the idea", copy:"A short visual model" },{ n:"02", label:"Move the model", copy:"Change an input" },{ n:"03", label:"Watch it run", copy:"Follow each state" },{ n:"04", label:"Prove it", copy:"Answer with confidence" }].map((item, index) => <div key={item.n} className="flex items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${index === 0 ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>{item.n}</span><span><span className="block font-display text-sm font-black text-ink">{item.label}</span><span className="block text-xs text-muted-fg">{item.copy}</span></span></div>)}</div></div>
    </div>
  </section>;
}
