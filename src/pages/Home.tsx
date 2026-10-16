import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { GraduationCap, Hash, Lock, Network, ScanSearch, Shapes } from "lucide-react";

const MotionLink = motion(Link);
import { useGameStore } from "../state/gameStore";
import { levelFor } from "../storage/schema";

function PlayableCabinet({
  to,
  name,
  topic,
  desc,
  accent,
  Icon,
  delay = 0,
}: {
  to: string;
  name: string;
  topic: string;
  desc: string;
  accent: string;
  Icon: typeof Network;
  delay?: number;
}) {
  return (
    <MotionLink
      to={to}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={`pixel-border bg-panel p-4 flex flex-col gap-2 border-2 ${accent} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-yellow`}
    >
      <div className="flex items-center justify-between">
        <Icon className="w-6 h-6" aria-hidden />
        <span className="font-pixel text-[8px] text-neon-green blink">● READY</span>
      </div>
      <h2 className="font-pixel text-[12px] leading-relaxed">{name}</h2>
      <p className="font-pixel text-[8px] text-dim">{topic}</p>
      <p className="text-xs leading-relaxed text-dim">{desc}</p>
      <span className="mt-auto font-pixel text-[9px] text-neon-yellow">OPEN ▶</span>
    </MotionLink>
  );
}

function LockedCabinet({
  name,
  topic,
  Icon,
  delay = 0,
}: {
  name: string;
  topic: string;
  Icon: typeof Lock;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 0.7, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="pixel-border bg-panel p-4 flex flex-col gap-2 border-2 border-grid"
    >
      <div className="flex items-center justify-between text-dim">
        <Icon className="w-6 h-6" aria-hidden />
        <Lock className="w-4 h-4" aria-hidden />
      </div>
      <h2 className="font-pixel text-[12px] leading-relaxed text-dim">{name}</h2>
      <p className="font-pixel text-[8px] text-dim">{topic}</p>
      <p className="text-xs leading-relaxed text-dim">
        NOT COVERED — this topic is not in the Module 6 course document, so it remains
        unavailable until course material is provided.
      </p>
    </motion.div>
  );
}

export default function Home() {
  const data = useGameStore((s) => s.data);
  const solved = Object.values(data.challenges).filter((c) => c.stars > 0).length;

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="text-center py-8 border-2 border-grid pixel-border bg-panel"
      >
        <p className="font-pixel text-[9px] text-neon-cyan tracking-widest">ALGORITHM &amp; COMPLEXITY · MODULE 6</p>
        <h1 className="font-pixel text-2xl sm:text-3xl text-neon-magenta neon-text mt-4 leading-relaxed">
          ADVANCED ALGORITHMS
        </h1>
        <p className="font-pixel text-[9px] text-neon-yellow mt-4 blink">SELECT A TOPIC TO BEGIN</p>
        <p className="text-sm text-dim mt-4 max-w-xl mx-auto leading-relaxed">
          Learn by experimenting: feed your own inputs to real algorithm executions, step through every
          intermediate operation, and complete exercises to earn XP. Level {levelFor(data.progress.xp)} ·{" "}
          {solved} exercise{solved === 1 ? "" : "s"} completed.
        </p>
      </motion.section>

      <section aria-label="Playable cabinets" className="grid sm:grid-cols-2 gap-4">
        <PlayableCabinet
          delay={0.1}
          to="/maxflow"
          name="MAXIMUM FLOW"
          topic="FORD–FULKERSON METHOD"
          desc="Build flow networks, find augmenting paths, push bottleneck flow, and watch residual + reverse edges update until the max flow is reached."
          accent="border-neon-cyan text-neon-cyan"
          Icon={Network}
        />
        <PlayableCabinet
          delay={0.18}
          to="/strings"
          name="STRING MATCHING"
          topic="NAIVE · RABIN-KARP · BOYER-MOORE"
          desc="Run Naive, Rabin-Karp, or Boyer-Moore to search a pattern inside a text — then compare their comparison counts head-to-head."
          accent="border-neon-magenta text-neon-magenta"
          Icon={ScanSearch}
        />
      </section>

      <section aria-label="Locked cabinets" className="grid sm:grid-cols-3 gap-4">
        <LockedCabinet name="HASHING" topic="HASHING" Icon={Hash} delay={0.26} />
        <LockedCabinet name="COMPUTATIONAL GEOMETRY" topic="COMPUTATIONAL GEOMETRY" Icon={Shapes} delay={0.32} />
        <LockedCabinet name="PARALLEL ALGORITHMS" topic="PARALLEL ALGORITHMS" Icon={Lock} delay={0.38} />
      </section>

      <section className="grid sm:grid-cols-1 gap-4">
        <div className="pixel-border bg-panel p-4 border-2 border-grid flex items-center gap-3 text-dim">
          <GraduationCap className="w-5 h-5 shrink-0" aria-hidden />
          <p className="text-xs leading-relaxed">
            <span className="font-pixel text-[9px] text-dim">RECAP — COMING SOON. </span>
            A quiz cabinet covering the previous module (BFS, DFS, Topological Sort, Dijkstra,
            Bellman-Ford, Floyd-Warshall, Prim, Kruskal). Planned as a later phase.
          </p>
        </div>
      </section>

      <p className="text-center text-[11px] text-dim">
        Progress is saved in this browser only (LocalStorage) — not synced across devices.
      </p>
    </div>
  );
}