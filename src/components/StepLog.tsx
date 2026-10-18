import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ListChecks } from "lucide-react";

export function StepLog({ notes, current }: { notes: string[]; current: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    const activeItem = container?.querySelector<HTMLElement>("[data-current]");
    if (!container || !activeItem) return;

    // Scroll only the log viewport. scrollIntoView() also scrolls ancestor
    // containers, which pulls the page away from the visualization above.
    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const itemBottom = itemRect.bottom - containerRect.top + container.scrollTop;
    const targetTop = itemBottom - container.clientHeight + 12;
    const targetBottom = itemRect.top - containerRect.top + container.scrollTop - 12;
    const nextTop = itemRect.bottom > containerRect.bottom - 12
      ? targetTop
      : itemRect.top < containerRect.top + 12
        ? targetBottom
        : container.scrollTop;

    if (nextTop !== container.scrollTop) {
      container.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    }
  }, [current]);

  if (notes.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-56 rounded-xl border-2 border-dashed border-line bg-muted/40 text-muted-fg font-body text-sm">
        <ListChecks className="w-6 h-6" aria-hidden />
        Press Run to start the execution trace…
      </div>
    );

  return (
    <div
      ref={ref}
      role="log"
      aria-label="Execution log"
      className="font-body text-sm bg-muted/50 rounded-xl p-3 h-56 overflow-y-auto space-y-1"
    >
      {notes.slice(0, current + 1).map((n, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          data-current={i === current ? true : undefined}
          className={`rounded-lg px-2 py-1 ${i === current ? "bg-card text-ok font-bold shadow-clay-sm" : "text-muted-fg"}`}
        >
          <span className="text-primary font-bold">{String(i).padStart(2, "0")}</span> · {n}
        </motion.p>
      ))}
    </div>
  );
}
