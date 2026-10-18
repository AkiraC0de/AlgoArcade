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
        Work through each exercise to build understanding. Mistakes are part of the process.
      </p>
      {stringChallenges.map((c) => (
        <ChallengeRunner key={c.id} challenge={c} />
      ))}
      <CompletionBanner
        world="strings"
        onNext={() => nav("/maxflow/learn")}
        nextLabel="Continue to Maximum Flow"
      />
    </div>
  );
}
