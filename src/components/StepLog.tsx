import { useEffect, useRef } from "react";

export function StepLog({ notes, current }: { notes: string[]; current: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[data-current]")?.scrollIntoView({ block: "nearest" });
  }, [current]);

  if (notes.length === 0)
    return (
      <div className="font-term text-sm text-dim border-2 border-dashed border-grid p-3">
        PRESS RUN TO START THE EXECUTION TRACE…
      </div>
    );

  return (
    <div
      ref={ref}
      role="log"
      aria-label="Execution log"
      className="font-term text-sm bg-crt border-2 border-grid p-3 max-h-56 overflow-y-auto space-y-1"
    >
      {notes.slice(0, current + 1).map((n, i) => (
        <p
          key={i}
          data-current={i === current ? true : undefined}
          className={i === current ? "text-neon-green" : "text-dim"}
        >
          <span className="text-neon-purple">[{String(i).padStart(2, "0")}]</span> {n}
        </p>
      ))}
    </div>
  );
}