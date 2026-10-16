import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PixelButton } from "../../components/ui";
import { MaxFlowLearn } from "./MaxFlowLearn";
import { MaxFlowPlayground } from "./MaxFlowPlayground";
import { MaxFlowChallenges } from "./MaxFlowChallenges";

type Tab = "learn" | "playground" | "challenges";

export default function MaxFlowPage() {
  const [tab, setTab] = useState<Tab>("playground");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-pixel text-sm text-neon-magenta neon-text">MAXIMUM FLOW</h1>
        <span className="text-[10px] text-dim font-term">Maximum Flow · Module 6</span>
      </div>

      <div className="flex gap-1" role="tablist" aria-label="Maximum flow sections">
        {(["learn", "playground", "challenges"] as Tab[]).map((t) => (
          <PixelButton
            key={t}
            variant={tab === t ? "magenta" : "dim"}
            active={tab === t}
            onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
          >
            {t === "learn" ? "📖 LEARN" : t === "playground" ? "🕹 PLAYGROUND" : "📋 EXERCISES"}
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
          {tab === "learn" && <MaxFlowLearn />}
          {tab === "playground" && <MaxFlowPlayground />}
          {tab === "challenges" && <MaxFlowChallenges />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}