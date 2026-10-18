import { useState } from "react";
import { motion } from "motion/react";
import { Flag, Trophy } from "lucide-react";
import { runNaive } from "../../engine/strings/naive";
import { runRabinKarp } from "../../engine/strings/rabinKarp";
import { runBoyerMoore } from "../../engine/strings/boyerMoore";
import { DOC_PATTERN, DOC_TEXT } from "../../engine/strings/presets";
import { Button, Card, Field, inputCls } from "../../components/ui";

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
    if (!text || !pattern) { setError("Both text and pattern are required."); return; }
    if (pattern.length > text.length) { setError("Pattern is longer than text."); return; }

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
      <Card title="Set up the comparison" accent="border-amber-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Text">
            <input className={inputCls} value={text} onChange={(e) => setText(e.target.value.toUpperCase())} maxLength={40} aria-label="Text to search in" />
          </Field>
          <Field label="Pattern">
            <input className={inputCls} value={pattern} onChange={(e) => setPattern(e.target.value.toUpperCase())} maxLength={12} aria-label="Pattern to search for" />
          </Field>
        </div>
        <div className="mt-3">
          <Button variant="accent" onClick={race}>
            <Flag className="w-4 h-4" aria-hidden /> Run all three
          </Button>
        </div>
        {error && <p className="text-danger text-sm mt-2 font-body font-bold" role="alert">{error}</p>}
      </Card>

      {results && (
        <Card title="Results — lower comparisons wins" accent="border-ok/40">
          <div className="space-y-3">
            {results.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <span className={`flex items-center gap-1.5 font-display font-bold text-sm w-36 shrink-0 ${winner?.name === r.name ? "text-ok" : "text-muted-fg"}`}>
                  {winner?.name === r.name && <Trophy className="w-4 h-4" aria-hidden />}
                  {r.name}
                </span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${winner?.name === r.name ? "bg-ok" : "bg-primary"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.comparisons / maxComp) * 100}%` }}
                    transition={{ delay: i * 0.15 + 0.2, duration: 0.5 }}
                  />
                </div>
                <span className="text-xs font-body text-muted-fg w-28 text-right">
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
              className="mt-4 text-sm font-body font-bold text-ok"
            >
              {winner.name} wins with {winner.comparisons} comparisons
              {results.every((r) => r.matches.join(",") === winner.matches.join(","))
                ? " — all algorithms found the same matches."
                : " — warning: match disagreement detected!"}
            </motion.p>
          )}
        </Card>
      )}
    </div>
  );
}
