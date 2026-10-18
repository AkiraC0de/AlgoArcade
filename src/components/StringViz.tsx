import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { NaiveStep } from "../engine/strings/naive";
import type { RKStep } from "../engine/strings/rabinKarp";
import type { BMStep } from "../engine/strings/boyerMoore";

type AnyStep = NaiveStep | RKStep | BMStep;

export function StringViz({
  text,
  pattern,
  step,
  algorithm,
}: {
  text: string;
  pattern: string;
  step: AnyStep | null;
  algorithm: "naive" | "rabin-karp" | "boyer-moore";
}) {
  if (!step) {
    return (
      <div className="font-body text-sm text-muted-fg border-2 border-dashed border-line rounded-xl p-6 text-center bg-muted/40">
        Configure inputs and press Run to begin the trace.
      </div>
    );
  }

  const m = pattern.length;
  const shift = "shift" in step ? step.shift : -1;
  const j = "j" in step ? step.j : -1;
  const matches = step.matches;
  const isDone = step.kind === "done";

  return (
    <div className="space-y-3">
      {/* Text row */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-px">
          {text.split("").map((ch, i) => {
            let bg = "bg-muted";
            let fg = "text-ink";
            let border = "border-line";
            if (matches.some((ms) => i >= ms && i < ms + m)) {
              bg = "bg-ok/15";
              fg = "text-ok";
              border = "border-ok";
            }
            if (!isDone && shift >= 0 && i >= shift && i < shift + m) {
              if (i === shift + j && (step.kind === "compare" || step.kind === "mismatch" || step.kind === "verify" || step.kind === "collision")) {
                if (step.kind === "mismatch" || step.kind === "collision") {
                  bg = "bg-danger/10";
                  fg = "text-danger";
                  border = "border-danger";
                } else {
                  bg = "bg-amber-400/25";
                  fg = "text-amber-900";
                  border = "border-amber-500";
                }
              } else {
                bg = "bg-primary/10";
                fg = "text-ink";
                border = "border-primary";
              }
            }
            return (
              <span
                key={i}
                className={`w-7 h-8 flex items-center justify-center border-2 rounded-md text-sm font-body font-bold ${bg} ${fg} ${border}`}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div className="inline-flex gap-px mt-0.5">
          {text.split("").map((_, i) => (
            <span key={i} className="w-7 text-center text-[10px] text-muted-fg font-body">
              {i}
            </span>
          ))}
        </div>
      </div>

      {/* Pattern row (aligned to shift) */}
      {!isDone && shift >= 0 && (
        <div className="overflow-x-auto">
          <motion.div
            className="inline-flex gap-px"
            initial={false}
            animate={{ marginLeft: shift * 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {pattern.split("").map((ch, pi) => {
              let bg = "bg-card";
              let fg = "text-primary";
              let border = "border-primary/40";
              if (pi === j && (step.kind === "compare" || step.kind === "mismatch" || step.kind === "verify" || step.kind === "collision")) {
                if (step.kind === "mismatch" || step.kind === "collision") {
                  bg = "bg-danger/10";
                  fg = "text-danger";
                  border = "border-danger";
                } else {
                  bg = "bg-amber-400/25";
                  fg = "text-amber-900";
                  border = "border-amber-500";
                }
              }
              return (
                <span
                  key={pi}
                  className={`w-7 h-8 flex items-center justify-center border-2 rounded-md text-sm font-body font-bold shadow-clay-sm ${bg} ${fg} ${border}`}
                >
                  {ch}
                </span>
              );
            })}
          </motion.div>
          <motion.div
            className="text-[11px] text-primary font-display font-semibold mt-1"
            initial={false}
            animate={{ marginLeft: shift * 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            ▲ shift {shift}
          </motion.div>
        </div>
      )}

      {/* BM skip info */}
      {algorithm === "boyer-moore" && step.kind === "mismatch" && "shiftAmount" in step && (
        <div className="text-xs text-accent font-body font-bold border-2 border-accent/40 bg-accent/10 rounded-xl px-3 py-2 inline-block">
          Bad character &#39;{("mismatchChar" in step && step.mismatchChar) || "?"}&#39; → skip {("shiftAmount" in step && step.shiftAmount) || 0} position(s)
        </div>
      )}

      {/* RK hash info */}
      {algorithm === "rabin-karp" && "hash" in step && step.hash !== undefined && (
        <div className="text-xs text-muted-fg font-body">
          Window hash: <span className="text-accent font-bold">{step.hash}</span>
          {"patternHash" in step && step.patternHash !== undefined && (
            <> · Pattern hash: <span className="text-primary font-bold">{step.patternHash}</span></>
          )}
          {step.kind === "hash-match" && (
            <span className="text-ok ml-2 font-bold"><CheckCircle2 className="w-3.5 h-3.5 inline -mt-0.5" aria-hidden /> Hash match — verifying characters…</span>
          )}
          {step.kind === "collision" && (
            <span className="text-danger ml-2 font-bold"><XCircle className="w-3.5 h-3.5 inline -mt-0.5" aria-hidden /> Collision — characters differ, skip.</span>
          )}
        </div>
      )}

      {/* Match banner */}
      {step.kind === "match" && (
        <motion.div
          key={`match-${shift}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="text-sm text-ok font-display font-bold border-2 border-ok/40 bg-ok/10 rounded-xl px-4 py-2 inline-block"
        >
          Match found at index {shift}
        </motion.div>
      )}

      {/* Done summary */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-sm text-ink font-body border-2 border-line bg-muted rounded-xl px-4 py-2.5"
        >
          {step.note}
        </motion.div>
      )}
    </div>
  );
}
