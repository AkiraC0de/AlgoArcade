import { motion } from "motion/react";

interface InsightProps {
  rows: { label: string; value: number }[];
  tip: string;
  nextAction?: { label: string; onClick: () => void };
}

export function InsightCard({ rows, tip, nextAction }: InsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="pixel-border bg-panel border-2 border-neon-green p-4 space-y-3"
    >
      <h2 className="font-pixel text-[10px] text-neon-green">RUN SUMMARY</h2>
      <ul className="flex flex-wrap gap-4">
        {rows.map((r) => (
          <li key={r.label} className="font-term text-sm">
            <span className="text-dim">{r.label}: </span>
            <span className="text-neon-yellow font-bold">{r.value}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-dim leading-relaxed">{tip}</p>
      {nextAction && (
        <button
          onClick={nextAction.onClick}
          className="font-pixel text-[9px] text-neon-cyan border-2 border-neon-cyan px-3 py-2 hover:bg-neon-cyan/10 focus-visible:outline-2 focus-visible:outline-neon-yellow"
        >
          {nextAction.label}
        </button>
      )}
    </motion.div>
  );
}
