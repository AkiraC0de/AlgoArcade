import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import type { Challenge } from "../challenges/challenges";
import { starsForAttempts, useGameStore } from "../state/gameStore";
import { Button, Card, inputCls, Stars } from "./ui";

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
    const raw = Number(value);
    if (value === "" || Number.isNaN(raw)) return;
    if (raw === challenge.answer) {
      const stars = starsForAttempts(attemptsThisSession + 1);
      complete(challenge.id, stars);
      setFeedback("right");
    } else {
      addAttempt(challenge.id);
      setFeedback("wrong");
      setShowHint(true);
    }
  };

  return (
    <Card
      title={
        <span className="flex items-center justify-between gap-2">
          <span>{challenge.title}</span>
          <Stars n={record?.stars ?? 0} />
        </span>
      }
      accent={solved ? "border-ok/50" : ""}
    >
      <p className="text-sm font-body text-ink leading-relaxed">{challenge.prompt}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {challenge.kind === "choice" ? (
          challenge.options!.map((opt, i) => (
            <Button
              key={i}
              variant={feedback === "right" && i === challenge.answer ? "primary" : "ghost"}
              active={value === String(i)}
              disabled={solved || feedback === "right"}
              onClick={() => setValue(String(i))}
              aria-pressed={value === String(i)}
            >
              {opt}
            </Button>
          ))
        ) : (
          <input
            className={`${inputCls} w-28`}
            inputMode="numeric"
            aria-label="Your numeric answer"
            value={value}
            disabled={solved || feedback === "right"}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="?"
          />
        )}
        <Button variant="accent" onClick={submit} disabled={value === "" || solved || feedback === "right"}>
          Submit
        </Button>
      </div>

      <div aria-live="polite" className="mt-3 min-h-6 font-display font-bold text-sm">
        <AnimatePresence mode="wait">
          {solved || feedback === "right" ? (
            <motion.span
              key="right"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center gap-1.5 text-ok"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden /> Correct — exercise complete
            </motion.span>
          ) : feedback === "wrong" ? (
            <motion.span
              key={`wrong-${attemptsThisSession}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              transition={{ x: { duration: 0.35 }, opacity: { duration: 0.1 } }}
              className="inline-flex items-center gap-1.5 text-danger"
            >
              <XCircle className="w-4 h-4" aria-hidden /> Incorrect — check the hint and retry
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      {showHint && !(solved || feedback === "right") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-2 flex items-start gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 p-3"
        >
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-amber-900 font-body">{challenge.hint}</p>
        </motion.div>
      )}

      {attemptsThisSession > 0 && !solved && feedback !== "right" && (
        <p className="mt-2 text-xs text-muted-fg font-body">
          Attempts: {attemptsThisSession} — fewer attempts earn more stars.
        </p>
      )}
    </Card>
  );
}
