import { CHALLENGES } from "../../challenges/challenges";
import { ChallengeRunner } from "../../components/ChallengeRunner";

export function StringsChallenges() {
  const stringChallenges = CHALLENGES.filter((c) => c.world === "strings");
  return (
    <div className="space-y-4">
      <p className="text-sm text-dim font-term">
        Complete the exercises to earn stars and XP. Fewer attempts = more stars.
      </p>
      {stringChallenges.map((c) => (
        <ChallengeRunner key={c.id} challenge={c} />
      ))}
    </div>
  );
}