import { motion } from "motion/react";

/** Compare the actual comparison count against best/worst theoretical bounds. */
export function ComplexityBars({ actual, worst, best }: { actual: number; worst: number; best: number }) {
  const max = Math.max(actual, worst, best, 1);
  const rows = [
    { label: "Best case", value: best, tone: "bg-ok", note: "theoretical minimum" },
    { label: "Your run", value: actual, tone: "bg-primary", note: "comparisons counted" },
    { label: "Worst case", value: worst, tone: "bg-danger", note: "theoretical maximum" },
  ];
  return (
    <section className="clay p-5" aria-label="Complexity comparison">
      <h2 className="font-display font-bold text-base text-ink mb-3">Where does this run sit?</h2>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.label}>
            <div className="flex justify-between text-sm font-display font-semibold text-muted-fg mb-1">
              <span>{r.label}</span>
              <span className="text-ink">{r.value}</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${r.tone}`}
                initial={{ width: 0 }}
                animate={{ width: `${(r.value / max) * 100}%` }}
                transition={{ delay: i * 0.12 + 0.1, duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-[11px] text-muted-fg font-body mt-0.5">{r.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
