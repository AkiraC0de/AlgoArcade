import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PixelButton } from "../../components/ui";
import { StringsLearn } from "./StringsLearn";
import { StringsPlayground } from "./StringsPlayground";
import { StringsChallenges } from "./StringsChallenges";
import { RaceMode } from "./RaceMode";

type Tab = "learn" | "playground" | "race" | "challenges";

export default function StringsPage() {
  const [tab, setTab] = useState<Tab>("playground");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-pixel text-sm text-neon-cyan neon-text">STRING MATCHING</h1>
        <span className="text-[10px] text-dim font-term">String Matching · Module 6</span>
      </div>

      <div className="flex gap-1" role="tablist" aria-label="String matching sections">
        {(["learn", "playground", "race", "challenges"] as Tab[]).map((t) => (
          <PixelButton
            key={t}
            variant={tab === t ? "cyan" : "dim"}
            active={tab === t}
            onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
          >
            {t === "learn" ? "📖 LEARN" : t === "playground" ? "🕹 PLAYGROUND" : t === "race" ? "🏁 RACE" : "📋 EXERCISES"}
          </PixelButton>
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