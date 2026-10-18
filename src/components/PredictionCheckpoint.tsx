import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, inputCls } from "./ui";

interface CheckpointProps {
  question: string;
  options?: string[];
  answer: string;
  onCorrect: () => void;
  onWrong: () => void;
  xpBonus: number;
}

/** Pause-and-predict: the learner guesses the next outcome before the trace reveals it. */
export function PredictionCheckpoint({ question, options, answer, onCorrect, onWrong, xpBonus }: CheckpointProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  const check = (val: string) => {
    const ok = val.trim().toLowerCase() === answer.toLowerCase();
    setResult(ok ? "correct" : "wrong");
    if (ok) onCorrect();
    else onWrong();
  };

  return (
    <Card title={`Checkpoint · predict before the trace reveals (+${xpBonus} XP)`} accent="border-accent">
      <p className="text-sm font-body text-ink mb-3">{question}</p>
      {options ? (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <Button key={o} variant="ghost" disabled={result !== "idle"} onClick={() => check(o)}>
              {o}
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={input}
            disabled={result !== "idle"}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input && check(input)}
            aria-label="Your prediction"
            placeholder="Type your prediction…"
          />
          <Button variant="primary" disabled={!input || result !== "idle"} onClick={() => check(input)}>
            Check
          </Button>
        </div>
      )}
      <div aria-live="polite" className="min-h-6 mt-2">
        <AnimatePresence mode="wait">
          {result === "correct" && (
            <motion.p key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 text-ok font-display font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" aria-hidden /> Correct — nice prediction!
            </motion.p>
          )}
          {result === "wrong" && (
            <motion.p key="no" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-danger font-display font-bold text-sm">
              <XCircle className="w-4 h-4" aria-hidden /> Not quite — watch the trace to see what actually happens.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
