import { useGameStore } from "../state/gameStore";
import { motion } from "motion/react";
import { levelFor, xpIntoLevel, XP_PER_LEVEL } from "../storage/schema";
import { Panel, PixelButton, Stars } from "../components/ui";
import { CHALLENGES } from "../challenges/challenges";

export default function PlayerPage() {
  const data = useGameStore((s) => s.data);
  const resetAll = useGameStore((s) => s.resetAll);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const level = levelFor(data.progress.xp);
  const into = xpIntoLevel(data.progress.xp);
  const totalChallenges = CHALLENGES.length;
  const completed = Object.values(data.challenges).filter((c) => c.stars > 0).length;
  const totalStars = Object.values(data.challenges).reduce((s, c) => s + c.stars, 0);

  return (
    <div className="space-y-4">
      <h1 className="font-pixel text-sm text-neon-yellow neon-text">PROGRESS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progress */}
        <Panel title="PROGRESS" accent="border-neon-yellow">
          <div className="space-y-3 text-sm font-term text-white">
            <div className="flex items-center gap-3">
              <span className="font-pixel text-[10px] text-neon-purple">LV {level}</span>
              <div className="flex-1 h-3 border border-grid bg-crt">
                <motion.div
                  className="h-full bg-neon-purple"
                  initial={false}
                  animate={{ width: `${(into / XP_PER_LEVEL) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="text-dim text-xs">{into}/{XP_PER_LEVEL} XP</span>
            </div>
            <p>Total XP: <span className="text-neon-yellow">{data.progress.xp}</span></p>
            <p>Coins: <span className="text-neon-yellow">⬤ {data.progress.coins}</span></p>
            <p>Exercises: <span className="text-neon-green">{completed}/{totalChallenges}</span></p>
            <p>Total stars: <span className="text-neon-yellow">{totalStars}/{totalChallenges * 3}</span></p>
          </div>
        </Panel>

        {/* Challenge log */}
        <Panel title="EXERCISE LOG" accent="border-neon-cyan">
          {completed === 0 ? (
            <p className="text-sm text-dim font-term">No exercises completed yet. Visit String Matching or Maximum Flow!</p>
          ) : (
            <ul className="space-y-1 text-xs font-term">
              {Object.entries(data.challenges)
                .filter(([, r]) => r.stars > 0)
                .map(([id, r]) => (
                  <li key={id} className="flex items-center justify-between text-white">
                    <span>{id}</span>
                    <Stars n={r.stars} />
                  </li>
                ))}
            </ul>
          )}
        </Panel>

        {/* Settings */}
        <Panel title="SETTINGS" accent="border-neon-purple">
          <div className="space-y-3 text-sm font-term text-white">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.settings.scanlines}
                onChange={(e) => updateSettings({ scanlines: e.target.checked })}
                className="accent-[#a78bfa]"
              />
              CRT Scanlines
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="accent-[#a78bfa]"
              />
              Reduced Motion
            </label>
            <p className="text-[11px] text-dim">
              Progress is stored in this browser only (LocalStorage). It is not synced across devices
              and can be cleared by browser data resets.
            </p>
          </div>
        </Panel>

        {/* Danger zone */}
        <Panel title="DANGER ZONE" accent="border-neon-red">
          <div className="space-y-2">
            <p className="text-xs text-dim font-term">
              This will erase all progress, stars, coins, and settings permanently.
            </p>
            <PixelButton
              variant="dim"
              className="border-neon-red text-neon-red"
              onClick={() => {
                if (window.confirm("Reset ALL progress? This cannot be undone.")) {
                  resetAll();
                }
              }}
            >
              ⚠ RESET ALL PROGRESS
            </PixelButton>
          </div>
        </Panel>
      </div>
    </div>
  );
}