import { useGameStore } from "../state/gameStore";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { AlertTriangle, BookOpen, Network, ScanSearch, Settings, Trophy, Zap } from "lucide-react";
import { levelFor, xpIntoLevel, XP_PER_LEVEL } from "../storage/schema";
import { Button, Card, ProgressBar, Stars } from "../components/ui";
import { CHALLENGES } from "../challenges/challenges";

export default function PlayerPage() {
  const data = useGameStore((s) => s.data);
  const resetAll = useGameStore((s) => s.resetAll);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const nav = useNavigate();

  const level = levelFor(data.progress.xp);
  const into = xpIntoLevel(data.progress.xp);
  const totalChallenges = CHALLENGES.length;
  const completed = Object.values(data.challenges).filter((c) => c.stars > 0).length;
  const totalStars = Object.values(data.challenges).reduce((s, c) => s + c.stars, 0);

  const moduleStats = (world: "strings" | "maxflow") => {
    const list = CHALLENGES.filter((c) => c.world === world);
    const done = list.filter((c) => (data.challenges[c.id]?.stars ?? 0) > 0);
    return { total: list.length, done: done.length, stars: done.reduce((s, c) => s + (data.challenges[c.id]?.stars ?? 0), 0) };
  };
  const mf = moduleStats("maxflow");
  const st = moduleStats("strings");

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl text-ink">Your progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Level / XP card — adapted from 21st.dev "Progress Card" pattern */}
        <Card title="Level & XP" accent="border-primary/40">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display font-bold text-primary text-lg">
                <Zap className="w-5 h-5" aria-hidden /> Level {level}
              </span>
              <span className="font-body text-sm text-muted-fg">{into}/{XP_PER_LEVEL} XP to next level</span>
            </div>
            <ProgressBar value={into} max={XP_PER_LEVEL} label="XP progress to next level" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="clay-sm p-3">
                <p className="font-display font-bold text-xl text-primary">{data.progress.xp}</p>
                <p className="text-xs text-muted-fg font-body">Total XP</p>
              </div>
              <div className="clay-sm p-3">
                <p className="font-display font-bold text-xl text-ok">{completed}/{totalChallenges}</p>
                <p className="text-xs text-muted-fg font-body">Exercises</p>
              </div>
              <div className="clay-sm p-3">
                <p className="font-display font-bold text-xl text-amber-500">{totalStars}</p>
                <p className="text-xs text-muted-fg font-body">Stars earned</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Module breakdown */}
        <Card title="Module breakdown" accent="border-ok/40">
          <div className="space-y-4">
            {[
              { name: "Maximum Flow", Icon: Network, to: "/maxflow", stats: mf },
              { name: "String Matching", Icon: ScanSearch, to: "/strings", stats: st },
            ].map(({ name, Icon, to, stats }) => (
              <div key={name} className="clay-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 font-display font-bold text-sm text-ink">
                    <Icon className="w-4 h-4 text-primary" aria-hidden /> {name}
                  </span>
                  <span className="text-xs font-body text-muted-fg">{stats.done}/{stats.total} · {stats.stars} stars</span>
                </div>
                <ProgressBar value={stats.done} max={stats.total} label={`${name} exercises completed`} />
                <button
                  onClick={() => nav(to)}
                  className="mt-2.5 inline-flex items-center gap-1 text-sm font-display font-bold text-primary hover:underline cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" aria-hidden /> Continue
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Exercise log */}
        <Card title="Exercise log" accent="border-amber-300">
          {completed === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Trophy className="w-8 h-8 text-line" aria-hidden />
              <p className="text-sm text-muted-fg font-body max-w-xs">
                No exercises completed yet. Open Maximum Flow or String Matching and start with the
                Exercises tab — your results will show up here.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5 text-sm font-body">
              {Object.entries(data.challenges)
                .filter(([, r]) => r.stars > 0)
                .map(([id, r]) => (
                  <li key={id} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                    <span className="text-ink font-bold">{id}</span>
                    <Stars n={r.stars} />
                  </li>
                ))}
            </ul>
          )}
        </Card>

        {/* Settings */}
        <Card title="Settings" accent="border-secondary/50">
          <div className="space-y-3 text-sm font-body text-ink">
            <label className="flex items-center gap-2.5 min-h-11 cursor-pointer">
              <input
                type="checkbox"
                checked={data.settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="w-5 h-5 accent-[#4f46e5] rounded"
              />
              Reduced motion
            </label>
            <p className="text-xs text-muted-fg leading-relaxed">
              Progress is stored in this browser only (LocalStorage). It is not synced across devices
              and can be cleared by browser data resets.
            </p>
          </div>
        </Card>
      </div>

      {/* Danger zone */}
      <Card title="Danger zone" accent="border-danger/40">
        <div className="space-y-3">
          <p className="text-sm text-muted-fg font-body">
            This will erase all progress, stars, and settings permanently.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("Reset ALL progress? This cannot be undone.")) {
                resetAll();
              }
            }}
          >
            <AlertTriangle className="w-4 h-4" aria-hidden /> Reset all progress
          </Button>
        </div>
      </Card>
    </div>
  );
}
