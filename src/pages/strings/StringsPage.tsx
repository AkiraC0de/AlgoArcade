import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, FlaskConical, ListChecks, Trophy } from "lucide-react";
import { StringsLearn } from "./StringsLearn";
import { StringsPlayground } from "./StringsPlayground";
import { StringsChallenges } from "./StringsChallenges";
import { RaceMode } from "./RaceMode";
import { CHALLENGES } from "../../challenges/challenges";
import { useGameStore } from "../../state/gameStore";
import { Badge } from "../../components/ui";

type Tab = "learn" | "playground" | "race" | "challenges";

const TABS: { id: Tab; label: string; Icon: typeof BookOpen }[] = [
  { id: "learn", label: "Learn", Icon: BookOpen },
  { id: "playground", label: "Playground", Icon: FlaskConical },
  { id: "race", label: "Compare", Icon: Trophy },
  { id: "challenges", label: "Exercises", Icon: ListChecks },
];

export default function StringsPage() {
  const [tab, setTab] = useState<Tab>("playground");
  const challenges = useGameStore((s) => s.data.challenges);
  const list = CHALLENGES.filter((c) => c.world === "strings");
  const done = list.filter((c) => (challenges[c.id]?.stars ?? 0) > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display font-bold text-2xl text-ink">String Matching</h1>
        <Badge tone="text-primary bg-primary/10">Module 6</Badge>
        {done > 0 && <Badge tone="text-ok bg-ok/10">{done}/{list.length} exercises done</Badge>}
      </div>
      <p className="text-muted-fg font-body text-sm max-w-2xl -mt-2">
        Search a pattern inside a text three ways — then compare how much work each algorithm does.
      </p>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="String matching sections">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 min-h-11 px-4 rounded-xl font-display font-semibold text-sm transition-colors duration-200 cursor-pointer
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
              ${tab === id ? "bg-primary text-primary-fg shadow-clay-sm" : "bg-card text-muted-fg border-2 border-line hover:text-ink hover:bg-muted"}`}
          >
            <Icon className="w-4 h-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {tab === "learn" && <StringsLearn />}
          {tab === "playground" && <StringsPlayground />}
          {tab === "race" && <RaceMode />}
          {tab === "challenges" && <StringsChallenges />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
