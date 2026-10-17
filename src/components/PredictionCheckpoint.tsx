import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Panel, PixelButton } from "./ui";

interface CheckpointProps {
  question: string;
  options?: string[];
  answer: string;
  onCorrect: () => void;
  onWrong: () => void;
  xpBonus: number;
}

export function PredictionCheckpoint({ question, options, answer, onCorrect, onWrong, xpBonus }: CheckpointProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  const check = (val: string) => {
    const ok = val.trim().toLowerCase() === answer.toLowerCase();
    setResult(ok ? "correct" : "wrong");
    if (ok) onCorrect(); else onWrong();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      >
        <Panel title="PREDICTION CHECKPOINT" accent="border-neon-yellow" className="max-w-md w-full space-y-3">
          <p className="text-sm font-term text-white">{question}</p>
          {options ? (
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt) => (
                <PixelButton key={opt} variant="dim" onClick={() => check(opt)}>{opt}</PixelButton>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                className="flex-1 bg-crt border border-grid text-white font-term text-sm px-2 py-1 focus:border-neon-cyan outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && check(input)}
                placeholder="Your prediction..."
                autoFocus
              />
              <PixelButton variant="green" onClick={() => check(input)}>CHECK</PixelButton>
            </div>
          )}
          {result === "correct" && (
            <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-neon-green font-pixel text-[10px]">
              CORRECT! +{xpBonus} XP
            </motion.p>
          )}
          {result === "wrong" && (
            <motion.p initial={{ x: -4 }} animate={{ x: 0 }} className="text-neon-red font-pixel text-[10px]">
              Answer was: {answer}. Continuing...
            </motion.p>
          )}
          {result !== "idle" && (
            <PixelButton variant="cyan" onClick={() => {}} className="w-full mt-2">CONTINUE</PixelButton>
          )}
        </Panel>
      </motion.div>
    </AnimatePresence>
  );
}
