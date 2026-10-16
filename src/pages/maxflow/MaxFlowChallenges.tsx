import { CHALLENGES } from "../../challenges/challenges";
import { ChallengeRunner } from "../../components/ChallengeRunner";

export function MaxFlowChallenges() {
  const mfChallenges = CHALLENGES.filter((c) => c.world === "maxflow");
  return (
    <div className="space-y-4">
      <p className="text-sm text-dim font-term">
        Complete the exercises to earn stars and XP. Fewer attempts = more stars.
      </p>
      {mfChallenges.map((c) => (
        <ChallengeRunner key={c.id} challenge={c} />
      ))}
    </div>
  );
}