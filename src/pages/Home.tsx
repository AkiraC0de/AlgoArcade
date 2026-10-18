import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Beaker,
  BookOpen,
  GraduationCap,
  Lock,
  Network,
  PlayCircle,
  Repeat,
  ScanSearch,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useGameStore } from "../state/gameStore";
import { CHALLENGES } from "../challenges/challenges";
import { Badge, ProgressBar } from "../components/ui";

const MotionLink = motion(Link);

function moduleProgress(world: "strings" | "maxflow", challenges: Record<string, { stars: number }>) {
  const list = CHALLENGES.filter((c) => c.world === world);
  const done = list.filter((c) => (challenges[c.id]?.stars ?? 0) > 0).length;
  return { done, total: list.length };
}

const LEARNING_LOOP = [
  { Icon: Search, label: "Discover", text: "See what each topic covers and where to start" },
  { Icon: BookOpen, label: "Learn", text: "Read short, clear explanations with examples" },
  { Icon: Beaker, label: "Explore", text: "Run the algorithm on your own inputs" },
  { Icon: Repeat, label: "Practice", text: "Check understanding with exercises and feedback" },
  { Icon: Trophy, label: "Master", text: "Review progress and revisit hard concepts" },
];

export default function Home() {
  const data = useGameStore((s) => s.data);
  const mf = moduleProgress("maxflow", data.challenges);
  const st = moduleProgress("strings", data.challenges);
  const started = mf.done + st.done > 0;
  const recommended = "/module6";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="clay px-6 py-10 sm:px-10 sm:py-12 text-center"
      >
        <Badge tone="text-accent bg-accent/10">
          <Sparkles className="w-3.5 h-3.5 inline mr-1" aria-hidden />
          Algorithm &amp; Complexity · Module 6
        </Badge>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink mt-4 leading-tight">
          Learn Advanced Algorithms <span className="text-primary">by Running Them</span>
        </h1>
        <p className="text-muted-fg text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
          Feed your own inputs into real algorithm executions, step through every intermediate
          operation, and check your understanding with exercises. No slides — live traces.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
          <Link
            to={recommended}
            className="flex items-center gap-2 min-h-12 px-6 py-3 rounded-xl bg-accent text-accent-fg font-display font-bold text-base shadow-clay-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-transform duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <PlayCircle className="w-5 h-5" aria-hidden />
            {started ? "Continue Learning" : "Start Learning"}
          </Link>
          <Link
            to="/player"
            className="flex items-center gap-2 min-h-12 px-6 py-3 rounded-xl bg-card text-primary border-2 border-primary font-display font-bold text-base shadow-clay-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-transform duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <GraduationCap className="w-5 h-5" aria-hidden />
            My Progress
          </Link>
        </div>
      </motion.section>

      {/* Available modules */}
      <section aria-label="Learning modules">
        <h2 className="font-display font-bold text-xl text-ink mb-4">Topics in this module</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <MotionLink
            to="/maxflow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="clay clay-pressable p-6 flex flex-col gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Network className="w-6 h-6" aria-hidden />
              </span>
              {mf.done > 0 ? (
                <Badge tone="text-ok bg-ok/10">In progress</Badge>
              ) : (
                <Badge tone="text-primary bg-primary/10">Recommended start</Badge>
              )}
            </div>
            <h3 className="font-display font-bold text-xl text-ink">Maximum Flow</h3>
            <p className="text-sm text-muted-fg leading-relaxed">
              Ford–Fulkerson method: find augmenting paths, push bottleneck flow, and watch
              residual edges update until the network saturates.
            </p>
            <div className="mt-auto space-y-1.5">
              <div className="flex justify-between text-xs font-display font-semibold text-muted-fg">
                <span>Exercises</span>
                <span>{mf.done}/{mf.total}</span>
              </div>
              <ProgressBar value={mf.done} max={mf.total} label="Maximum flow exercises completed" />
            </div>
            <span className="inline-flex items-center gap-1.5 font-display font-bold text-sm text-primary">
              Open topic <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </MotionLink>

          <MotionLink
            to="/strings"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3, delay: 0.16 }}
            className="clay clay-pressable p-6 flex flex-col gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <ScanSearch className="w-6 h-6" aria-hidden />
              </span>
              {st.done > 0 ? (
                <Badge tone="text-ok bg-ok/10">In progress</Badge>
              ) : (
                <Badge tone="text-muted-fg bg-muted">Available</Badge>
              )}
            </div>
            <h3 className="font-display font-bold text-xl text-ink">String Matching</h3>
            <p className="text-sm text-muted-fg leading-relaxed">
              Naive, Rabin-Karp, and Boyer-Moore search a pattern inside a text — then compare
              their comparison counts head-to-head.
            </p>
            <div className="mt-auto space-y-1.5">
              <div className="flex justify-between text-xs font-display font-semibold text-muted-fg">
                <span>Exercises</span>
                <span>{st.done}/{st.total}</span>
              </div>
              <ProgressBar value={st.done} max={st.total} tone="bg-accent" label="String matching exercises completed" />
            </div>
            <span className="inline-flex items-center gap-1.5 font-display font-bold text-sm text-accent">
              Open topic <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </MotionLink>
        </div>
      </section>

      {/* How learning works */}
      <section aria-label="How learning works" className="clay p-6">
        <h2 className="font-display font-bold text-xl text-ink mb-4">Your learning path</h2>
        <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {LEARNING_LOOP.map(({ Icon, label, text }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.3 }}
              className="clay-sm p-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-primary mb-2">
                <Icon className="w-5 h-5" aria-hidden />
              </span>
              <p className="font-display font-bold text-sm text-ink">{i + 1}. {label}</p>
              <p className="text-xs text-muted-fg mt-1 leading-relaxed">{text}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Full Module 6 learning path */}
      <section aria-label="Module 6 learning path" className="clay p-6">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-display font-bold uppercase tracking-wide text-primary">Module 6 learning path</p>
            <h2 className="font-display font-bold text-xl text-ink mt-1">Five topics. One visual-first route.</h2>
          </div>
          <Link to="/module6" className="inline-flex items-center gap-2 text-sm font-display font-bold text-primary hover:underline cursor-pointer">Open Learn studio <ArrowRight className="w-4 h-4" aria-hidden /></Link>
        </div>
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            ["Maximum Flow", "Paths and residual capacity"],
            ["String Matching", "Compare windows and shifts"],
            ["Hashing", "Map keys to slots"],
            ["Computational Geometry", "Turn coordinates into decisions"],
            ["Parallel Algorithms", "Coordinate many workers"],
          ].map(([name, desc], i) => <div key={name} className="clay-sm p-4"><span className="font-display font-black text-primary text-sm">0{i + 1}</span><p className="font-display font-bold text-sm text-ink mt-2">{name}</p><p className="text-xs text-muted-fg mt-1 leading-relaxed">{desc}</p></div>)}
        </div>
      </section>

      <p className="text-center text-xs text-muted-fg">
        Progress is saved in this browser only (LocalStorage) — not synced across devices.
      </p>
    </div>
  );
}
