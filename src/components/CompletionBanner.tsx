import { motion } from "motion/react";
import { Panel, PixelButton } from "./ui";
import { useGameStore } from "../state/gameStore";
import { CHALLENGES } from "../challenges/challenges";

interface Props { world: "strings" | "maxflow"; onNext: () => void; nextLabel: string }

export function CompletionBanner({ world, onNext, nextLabel }: Props) {
  const challenges = useGameStore((s) => s.data.challenges);
  const list = CHALLENGES.filter((c) => c.world === world);
  const done = list.filter((c) => (challenges[c.id]?.stars ?? 0) > 0);
  const totalStars = done.reduce((sum, c) => sum + (challenges[c.id]?.stars ?? 0), 0);
  const allDone = done.length === list.length && list.length > 0;

  if (!allDone) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Panel title="TOPIC COMPLETE" accent="border-neon-green">
        <div className="text-center space-y-3">
          <p className="font-pixel text-[10px] text-neon-green">
            You completed {done.length}/{list.length} exercises
          </p>
          <p className="text-sm font-term text-white">
            Total stars earned: <span className="text-neon-yellow font-bold">{totalStars}</span>
          </p>
          <PixelButton variant="cyan" onClick={onNext}>{nextLabel}</PixelButton>
        </div>
      </Panel>
    </motion.div>
  );
}
