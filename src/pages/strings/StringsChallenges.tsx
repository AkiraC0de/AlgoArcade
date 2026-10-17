import { useNavigate } from "react-router-dom";
import { CHALLENGES } from "../../challenges/challenges";
import { ChallengeRunner } from "../../components/ChallengeRunner";
import { CompletionBanner } from "../../components/CompletionBanner";

export function StringsChallenges() {
  const navigate = useNavigate();
  const stringChallenges = CHALLENGES.filter((c) => c.world === "strings");
  return (
    <div className="space-y-4">
      <p className="text-sm text-dim font-term">
        Complete the exercises to earn stars and XP. Fewer attempts = more stars.
      </p>
      {stringChallenges.map((c) => (
        <ChallengeRunner key={c.id} challenge={c} />
      ))}
      <CompletionBanner world="strings" onNext={() => navigate("/maxflow")} nextLabel="Go to Maximum Flow →" />
    </div>
  );
}