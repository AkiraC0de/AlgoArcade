import { motion } from "motion/react";
import { PartyPopper } from "lucide-react";
import { Button, Stars } from "./ui";
import { useGameStore } from "../state/gameStore";
import { CHALLENGES } from "../challenges/challenges";

interface Props {
  world: "strings" | "maxflow";
  onNext: () => void;
  nextLabel: string;
}

export function CompletionBanner({ world, onNext, nextLabel }: Props) {
  const challenges = useGameStore((s) => s.data.challenges);
  const list = CHALLENGES.filter((c) => c.world === world);
  const done = list.filter((c) => (challenges[c.id]?.stars ?? 0) > 0);
  const totalStars = done.reduce((sum, c) => sum + (challenges[c.id]?.stars ?? 0), 0);
  const allDone = done.length === list.length && list.length > 0;

  if (!allDone) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="clay p-6 text-center space-y-3">
      <PartyPopper className="w-10 h-10 text-accent mx-auto" aria-hidden />
      <p className="font-display font-bold text-xl text-ink">Topic complete!</p>
      <p className="font-body text-sm text-muted-fg">
        You finished {done.length}/{list.length} exercises · <Stars n={Math.min(3, Math.round(totalStars / Math.max(1, list.length)))} /> average
      </p>
      <Button variant="accent" onClick={onNext}>{nextLabel}</Button>
    </motion.div>
  );
}
