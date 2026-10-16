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
      <div className="font-term text-sm text-dim border-2 border-dashed border-grid p-4 text-center">
        Configure inputs and press RUN to begin the trace.
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
            let bg = "bg-panel2";
            let fg = "text-neon-green";
            let border = "border-grid";
            // Highlight matched positions
            if (matches.some((ms) => i >= ms && i < ms + m)) {
              bg = "bg-neon-green/20";
              fg = "text-neon-green";
              border = "border-neon-green";
            }
            // Highlight current window
            if (!isDone && shift >= 0 && i >= shift && i < shift + m) {
              if (i === shift + j && (step.kind === "compare" || step.kind === "mismatch" || step.kind === "verify" || step.kind === "collision")) {
                // Active comparison character
                if (step.kind === "mismatch" || step.kind === "collision") {
                  bg = "bg-neon-red/30";
                  fg = "text-neon-red";
                  border = "border-neon-red";
                } else {
                  bg = "bg-neon-yellow/25";
                  fg = "text-neon-yellow";
                  border = "border-neon-yellow";
                }
              } else {
                bg = "bg-arc-blue/20";
                fg = "text-white";
                border = "border-arc-blue";
              }
            }
            return (
              <span
                key={i}
                className={`w-7 h-8 flex items-center justify-center border text-sm font-term font-bold ${bg} ${fg} ${border}`}
              >
                {ch}
              </span>
            );
          })}
        </div>
        {/* Index labels */}
        <div className="inline-flex gap-px mt-0.5">
          {text.split("").map((_, i) => (
            <span key={i} className="w-7 text-center text-[9px] text-dim font-term">
              {i}
            </span>
          ))}
        </div>
      </div>

      {/* Pattern row (aligned to shift) */}
      {!isDone && shift >= 0 && (
        <div className="overflow-x-auto">
          <div className="inline-flex gap-px" style={{ marginLeft: `${shift * 29}px` }}>
            {pattern.split("").map((ch, pi) => {
              let bg = "bg-panel";
              let fg = "text-neon-cyan";
              let border = "border-neon-cyan/40";
              if (pi === j && (step.kind === "compare" || step.kind === "mismatch" || step.kind === "verify" || step.kind === "collision")) {
                if (step.kind === "mismatch" || step.kind === "collision") {
                  bg = "bg-neon-red/30";
                  fg = "text-neon-red";
                  border = "border-neon-red";
                } else {
                  bg = "bg-neon-yellow/25";
                  fg = "text-neon-yellow";
                  border = "border-neon-yellow";
                }
              }
              return (
                <span
                  key={pi}
                  className={`w-7 h-8 flex items-center justify-center border-2 text-sm font-term font-bold ${bg} ${fg} ${border}`}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          <div className="text-[10px] text-neon-cyan font-pixel mt-1" style={{ marginLeft: `${shift * 29}px` }}>
            ▲ shift {shift}
          </div>
        </div>
      )}

      {/* BM: show skip info */}
      {algorithm === "boyer-moore" && step.kind === "mismatch" && "shiftAmount" in step && (
        <div className="text-xs text-neon-magenta font-term border border-neon-magenta/40 bg-neon-magenta/10 px-2 py-1 inline-block">
          Bad character '{("mismatchChar" in step && step.mismatchChar) || "?"}' → skip {("shiftAmount" in step && step.shiftAmount) || 0} position(s)
        </div>
      )}

      {/* RK: show hash info */}
      {algorithm === "rabin-karp" && "hash" in step && step.hash !== undefined && (
        <div className="text-xs text-neon-purple font-term">
          Window hash: <span className="text-neon-yellow font-bold">{step.hash}</span>
          {"patternHash" in step && step.patternHash !== undefined && (
            <> · Pattern hash: <span className="text-neon-cyan font-bold">{step.patternHash}</span></>
          )}
          {step.kind === "hash-match" && <span className="text-neon-green ml-2">✓ Hash match — verifying characters…</span>}
          {step.kind === "collision" && <span className="text-neon-red ml-2">✗ Collision — characters differ, skip.</span>}
        </div>
      )}

      {/* Match celebration */}
      {step.kind === "match" && (
        <div className="text-sm text-neon-green font-pixel pop-in border border-neon-green/50 bg-neon-green/10 px-3 py-1.5 inline-block">
          ★ MATCH FOUND AT INDEX {shift} ★
        </div>
      )}

      {/* Done summary */}
      {isDone && (
        <div className="text-sm text-neon-yellow font-term border border-neon-yellow/40 bg-neon-yellow/10 px-3 py-2">
          {step.note}
        </div>
      )}
    </div>
  );
}