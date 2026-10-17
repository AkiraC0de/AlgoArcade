import { motion } from "motion/react";

interface BarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function Bar({ label, value, max, color }: BarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-pixel text-dim w-20 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-crt border border-grid">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] font-term text-white w-8 text-right">{value}</span>
    </div>
  );
}

export function ComplexityBars({ actual, worst, best }: { actual: number; worst: number; best: number }) {
  return (
    <div className="space-y-2">
      <h4 className="font-pixel text-[9px] text-neon-magenta">COMPARISON COUNT</h4>
      <Bar label="THIS RUN" value={actual} max={worst} color="bg-neon-green" />
      <Bar label="BEST CASE" value={best} max={worst} color="bg-neon-cyan" />
      <Bar label="WORST CASE" value={worst} max={worst} color="bg-neon-red" />
    </div>
  );
}
