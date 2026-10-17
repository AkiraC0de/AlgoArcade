import { useState } from "react";
import { motion } from "motion/react";
import { runNaive } from "../../engine/strings/naive";
import { runRabinKarp } from "../../engine/strings/rabinKarp";
import { runBoyerMoore } from "../../engine/strings/boyerMoore";
import { DOC_PATTERN, DOC_TEXT } from "../../engine/strings/presets";
import { Field, inputCls, Panel, PixelButton } from "../../components/ui";

interface AlgoResult {
  name: string;
  comparisons: number;
  matches: number[];
  steps: number;
}

export function RaceMode() {
  const [text, setText] = useState(DOC_TEXT);
  const [pattern, setPattern] = useState(DOC_PATTERN);
  const [results, setResults] = useState<AlgoResult[] | null>(null);
  const [error, setError] = useState("");

  const race = () => {
    setError("");
    if (!text || !pattern) { setError("Both text and pattern required."); return; }
    if (pattern.length > text.length) { setError("Pattern longer than text."); return; }

    const naive = runNaive(text, pattern);
    const rk = runRabinKarp(text, pattern);
    const bm = runBoyerMoore(text, pattern);

    setResults([
      { name: "Naive", comparisons: naive.comparisons, matches: naive.matches, steps: naive.steps.length },
      { name: "Rabin-Karp", comparisons: rk.comparisons, matches: rk.matches, steps: rk.steps.length },
      { name: "Boyer-Moore", comparisons: bm.comparisons, matches: bm.matches, steps: bm.steps.length },
    ]);
  };

  const maxComp = results ? Math.max(...results.map((r) => r.comparisons), 1) : 1;
  const winner = results ? results.reduce((a, b) => (a.comparisons <= b.comparisons ? a : b)) : null;

  return (
    <div className="space-y-4">
      <Panel title="RACE SETUP" accent="border-neon-yellow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="TEXT">
            <input className={inputCls} value={text} onChange={(e) => setText(e.target.value.toUpperCase())} maxLength={40} />
          </Field>
          <Field label="PATTERN">
            <input className={inputCls} value={pattern} onChange={(e) => setPattern(e.target.value.toUpperCase())} maxLength={12} />
          </Field>
        </div>
        <div className="mt-3">
          <PixelButton variant="green" onClick={race}>🏁 START RACE</PixelButton>
        </div>
        {error && <p className="text-neon-red text-xs mt-2 font-term" role="alert">{error}</p>}
      </Panel>

      {results && (
        <Panel title="RESULTS" accent="border-neon-green">
          <div className="space-y-3">
            {results.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <span className={`font-pixel text-[9px] w-28 shrink-0 ${winner?.name === r.name ? "text-neon-green" : "text-dim"}`}>
                  {winner?.name === r.name ? "🏆 " : ""}{r.name}
                </span>
                <div className="flex-1 h-5 bg-crt border border-grid">
                  <motion.div
                    className={`h-full ${winner?.name === r.name ? "bg-neon-green" : "bg-neon-cyan"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.comparisons / maxComp) * 100}%` }}
                    transition={{ delay: i * 0.15 + 0.2, duration: 0.5 }}
                  />
                </div>
                <span className="text-xs font-term text-white w-20 text-right">
                  {r.comparisons} comp · {r.matches.length} match
                </span>
              </motion.div>
            ))}
          </div>
          {winner && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-3 text-sm font-term text-neon-yellow"
            >
              🏆 {winner.name} wins with {winner.comparisons} comparisons
              {results.every((r) => r.matches.join(",") === winner.matches.join(","))
                ? " — all algorithms found the same matches."
                : " — WARNING: match disagreement detected!"}
            </motion.p>
          )}
        </Panel>
      )}
    </div>
  );
}
