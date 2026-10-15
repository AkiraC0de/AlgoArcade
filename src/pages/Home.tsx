import { Link } from "react-router-dom";
import { GraduationCap, Hash, Lock, Network, ScanSearch, Shapes } from "lucide-react";
import { useGameStore } from "../state/gameStore";
import { levelFor } from "../storage/schema";

function PlayableCabinet({
  to,
  name,
  topic,
  desc,
  accent,
  Icon,
}: {
  to: string;
  name: string;
  topic: string;
  desc: string;
  accent: string;
  Icon: typeof Network;
}) {
  return (
    <Link
      to={to}
      className={`pixel-border bg-panel p-4 flex flex-col gap-2 border-2 ${accent} hover:-translate-y-0.5 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-yellow`}
    >
      <div className="flex items-center justify-between">
        <Icon className="w-6 h-6" aria-hidden />
        <span className="font-pixel text-[8px] text-neon-green blink">● READY</span>
      </div>
      <h2 className="font-pixel text-[12px] leading-relaxed">{name}</h2>
      <p className="font-pixel text-[8px] text-dim">{topic}</p>
      <p className="text-xs leading-relaxed text-dim">{desc}</p>
      <span className="mt-auto font-pixel text-[9px] text-neon-yellow">INSERT COIN ▶</span>
    </Link>
  );
}

function LockedCabinet({
  name,
  topic,
  Icon,
}: {
  name: string;
  topic: string;
  Icon: typeof Lock;
}) {
  return (
    <div className="pixel-border bg-panel p-4 flex flex-col gap-2 border-2 border-grid opacity-70">
      <div className="flex items-center justify-between text-dim">
        <Icon className="w-6 h-6" aria-hidden />
        <Lock className="w-4 h-4" aria-hidden />
      </div>
      <h2 className="font-pixel text-[12px] leading-relaxed text-dim">{name}</h2>
      <p className="font-pixel text-[8px] text-dim">{topic}</p>
      <p className="text-xs leading-relaxed text-dim">
        NEW CARTRIDGE REQUIRED — this topic is not covered by the Module 6 course document, so its
        cabinet stays locked until real course material arrives (see PLAN.md §K).
      </p>
    </div>
  );
}

export default function Home() {
  const data = useGameStore((s) => s.data);
  const solved = Object.values(data.challenges).filter((c) => c.stars > 0).length;

  return (
    <div className="space-y-6">
      <section className="text-center py-8 border-2 border-grid pixel-border bg-panel">
        <p className="font-pixel text-[9px] text-neon-cyan tracking-widest">ALGORITHM &amp; COMPLEXITY · MODULE 6</p>
        <h1 className="font-pixel text-2xl sm:text-3xl text-neon-magenta neon-text mt-4 leading-relaxed">
          ADVANCED ALGORITHMS ARCADE
        </h1>
        <p className="font-pixel text-[9px] text-neon-yellow mt-4 blink">INSERT COIN TO START</p>
        <p className="text-sm text-dim mt-4 max-w-xl mx-auto leading-relaxed">
          Learn by playing: feed your own inputs to real algorithm executions, step through every
          intermediate operation, and close case files to earn XP. Level {levelFor(data.progress.xp)} ·{" "}
          {solved} challenge{solved === 1 ? "" : "s"} cleared.
        </p>
      </section>

      <section aria-label="Playable cabinets" className="grid sm:grid-cols-2 gap-4">
        <PlayableCabinet
          to="/maxflow"
          name="PIPE WORKS"
          topic="MAXIMUM FLOW · FORD–FULKERSON"
          desc="Build flow networks, hunt augmenting paths, push bottleneck flow, and watch residual + reverse edges update until the max flow is reached."
          accent="border-neon-cyan text-neon-cyan"
          Icon={Network}
        />
        <PlayableCabinet
          to="/strings"
          name="TEXT HUNTERS"
          topic="STRING MATCHING · 3 DETECTIVES"
          desc="Deploy the Clumsy Rookie (Naive), the Digital Fingerprint (Rabin-Karp), or Detective #3 (Boyer-Moore) to hunt a pattern inside a text — then race them head-to-head."
          accent="border-neon-magenta text-neon-magenta"
          Icon={ScanSearch}
        />
      </section>

      <section aria-label="Locked cabinets" className="grid sm:grid-cols-3 gap-4">
        <LockedCabinet name="HASH LAB" topic="HASHING" Icon={Hash} />
        <LockedCabinet name="GEO GRID" topic="COMPUTATIONAL GEOMETRY" Icon={Shapes} />
        <LockedCabinet name="PARALLEL BAY" topic="PARALLEL ALGORITHMS" Icon={Lock} />
      </section>

      <section className="grid sm:grid-cols-1 gap-4">
        <div className="pixel-border bg-panel p-4 border-2 border-grid flex items-center gap-3 text-dim">
          <GraduationCap className="w-5 h-5 shrink-0" aria-hidden />
          <p className="text-xs leading-relaxed">
            <span className="font-pixel text-[9px] text-dim">RECAP ROOM — COMING SOON. </span>
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