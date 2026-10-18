import { useNavigate } from "react-router-dom";
import { CHALLENGES } from "../../challenges/challenges";
import { ChallengeRunner } from "../../components/ChallengeRunner";
import { CompletionBanner } from "../../components/CompletionBanner";

export function StringsChallenges() {
  const nav = useNavigate();
  const stringChallenges = CHALLENGES.filter((c) => c.world === "strings");
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-fg font-body">
        Answer each exercise to earn stars — fewer attempts means more stars.
      </p>
      {stringChallenges.map((c) => (
        <ChallengeRunner key={c.id} challenge={c} />
      ))}
      <CompletionBanner
        world="strings"
        onNext={() => nav("/maxflow")}
        nextLabel="Continue to Maximum Flow"
      />
    </div>
  );
}
