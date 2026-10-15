import { useState } from "react";
import type { Challenge } from "../challenges/challenges";
import { starsForAttempts, useGameStore } from "../state/gameStore";
import { inputCls, Panel, PixelButton, Stars } from "./ui";

export function ChallengeRunner({ challenge }: { challenge: Challenge }) {
  const record = useGameStore((s) => s.data.challenges[challenge.id]);
  const complete = useGameStore((s) => s.completeChallenge);
  const addAttempt = useGameStore((s) => s.addAttempt);

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "wrong" | "right">("idle");
  const [showHint, setShowHint] = useState(false);

  const attemptsThisSession = record?.attempts ?? 0;
  const solved = (record?.stars ?? 0) > 0;

  const submit = () => {
    if (solved || feedback === "right") return;
    const raw = challenge.kind === "number" ? Number(value) : Number(value);
    if (value === "" || Number.isNaN(raw)) return;
    const attemptsSoFar = attemptsThisSession;
    if (raw === challenge.answer) {
      const stars = starsForAttempts(attemptsSoFar + 1);
      complete(challenge.id, stars);
      setFeedback("right");
    } else {
      addAttempt(challenge.id);
      setFeedback("wrong");
      setShowHint(true);
    }
  };

  return (
    <Panel
      title={
        <span className="flex items-center justify-between gap-2">
          <span>{challenge.title}</span>
          <Stars n={record?.stars ?? 0} />
        </span>
      }
      accent={solved ? "border-neon-green" : "border-grid"}
    >
      <p className="text-sm leading-relaxed">{challenge.prompt}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {challenge.kind === "choice" ? (
          challenge.options!.map((opt, i) => (
            <PixelButton
              key={i}
              variant={feedback === "right" && i === challenge.answer ? "green" : "dim"}
              disabled={solved || feedback === "right"}
              onClick={() => {
                setValue(String(i));
              }}
              active={value === String(i)}
              aria-pressed={value === String(i)}
            >
              {opt}
            </PixelButton>
          ))
        ) : (
          <input
            className={`${inputCls} w-28`}
            inputMode="numeric"
            aria-label="Your numeric answer"
            value={value}
            disabled={solved || feedback === "right"}
            onChange={(e) => setValue(e.target.value)}
            placeholder="?"
          />
        )}
        <PixelButton
          variant="yellow"
          onClick={submit}
          disabled={value === "" || solved || feedback === "right"}
        >
          SUBMIT
        </PixelButton>
      </div>

      <div aria-live="polite" className="mt-2 min-h-5 font-pixel text-[9px]">
        {solved || feedback === "right" ? (
          <span className="text-neon-green">✓ CASE CLOSED — REWARD BANKED</span>
        ) : feedback === "wrong" ? (
          <span className="text-neon-red">✗ NOT QUITE — STUDY THE HINT AND RETRY</span>
        ) : null}
      </div>
      {showHint && !(solved || feedback === "right") && (
        <p className="mt-1 text-xs text-neon-yellow font-term">HINT: {challenge.hint}</p>
      )}
      {attemptsThisSession > 0 && !solved && feedback !== "right" && (
        <p className="mt-1 text-[11px] text-dim">Attempts: {attemptsThisSession} — fewer attempts = more stars.</p>
      )}
    </Panel>
  );
}