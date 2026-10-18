import { useNavigate } from "react-router-dom";
import { CHALLENGES } from "../../challenges/challenges";
import { ChallengeRunner } from "../../components/ChallengeRunner";
import { CompletionBanner } from "../../components/CompletionBanner";

export function MaxFlowChallenges() {
  const nav = useNavigate();
  const mfChallenges = CHALLENGES.filter((c) => c.world === "maxflow");
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-fg font-body">
        Work through each exercise to build understanding. Mistakes are part of the process.
      </p>
      {mfChallenges.map((c) => (
        <ChallengeRunner key={c.id} challenge={c} />
      ))}
      <CompletionBanner
        world="maxflow"
        onNext={() => nav("/strings")}
        nextLabel="Continue to String Matching"
      />
    </div>
  );
}
