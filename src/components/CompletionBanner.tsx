import { motion } from "motion/react";
import { PartyPopper } from "lucide-react";
import { Button } from "./ui"
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
  const done = list.filter((challenge) => challenges[challenge.id]?.completed === true);
  const allDone = done.length === list.length && list.length > 0;

  if (!allDone) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="clay p-6 text-center space-y-3">
      <PartyPopper className="w-10 h-10 text-accent mx-auto" aria-hidden />
      <p className="font-display font-bold text-xl text-ink">Topic complete!</p>
      <p className="font-body text-sm text-muted-fg">
        You finished {done.length}/{list.length} exercises. Your understanding is getting stronger.
      </p>
      <Button variant="accent" onClick={onNext}>{nextLabel}</Button>
    </motion.div>
  );
}
