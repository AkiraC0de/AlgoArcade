import { motion } from "motion/react";
import { ArrowRight, Lightbulb } from "lucide-react";

interface InsightProps {
  rows: { label: string; value: number }[];
  tip: string;
  nextAction?: { label: string; onClick: () => void };
}

export function InsightCard({ rows, tip, nextAction }: InsightProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="clay p-5 space-y-4"
      aria-label="Run summary"
    >
      <h2 className="font-display font-bold text-base text-ok">Run Summary</h2>
      <div className="grid grid-cols-3 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="clay-sm p-3 text-center">
            <p className="font-display font-bold text-2xl text-primary">{r.value}</p>
            <p className="text-xs text-muted-fg font-body mt-0.5">{r.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
        <p className="text-sm text-amber-900 font-body leading-relaxed">{tip}</p>
      </div>
      {nextAction && (
        <button
          onClick={nextAction.onClick}
          className="inline-flex items-center gap-2 font-display font-bold text-sm text-primary border-2 border-primary rounded-xl px-4 py-2.5 min-h-11 hover:bg-primary hover:text-primary-fg transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {nextAction.label} <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      )}
    </motion.section>
  );
}
