import { useState } from "react";
import { PixelButton } from "../../components/ui";
import { StringsLearn } from "./StringsLearn";
import { StringsPlayground } from "./StringsPlayground";
import { StringsChallenges } from "./StringsChallenges";

type Tab = "learn" | "playground" | "challenges";

export default function StringsPage() {
  const [tab, setTab] = useState<Tab>("playground");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-pixel text-sm text-neon-cyan neon-text">TEXT HUNTERS</h1>
        <span className="text-[10px] text-dim font-term">String Matching · Module 6</span>
      </div>

      <div className="flex gap-1" role="tablist" aria-label="String matching sections">
        {(["learn", "playground", "challenges"] as Tab[]).map((t) => (
          <PixelButton
            key={t}
            variant={tab === t ? "cyan" : "dim"}
            active={tab === t}
            onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
          >
            {t === "learn" ? "📖 LEARN" : t === "playground" ? "🕹 PLAYGROUND" : "📋 CASE FILES"}
          </PixelButton>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "learn" && <StringsLearn />}
        {tab === "playground" && <StringsPlayground />}
        {tab === "challenges" && <StringsChallenges />}
      </div>
    </div>
  );
}