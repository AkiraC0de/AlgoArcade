const KIND_COLORS: Record<string, string> = {
  compare: "bg-amber-500",
  verify: "bg-amber-500",
  mismatch: "bg-red-500",
  collision: "bg-red-500",
  match: "bg-ok",
  done: "bg-ink",
  path: "bg-accent",
  push: "bg-primary",
  "no-path": "bg-red-500",
  init: "bg-secondary",
  table: "bg-secondary",
  "hash-pattern": "bg-secondary",
  roll: "bg-secondary",
  "hash-match": "bg-amber-500",
};

interface ScrubberInput {
  count: number;
  index: number;
  steps: { kind: string }[];
  seek: (i: number) => void;
}

/** Color-coded step timeline — click a tick to jump to that step. */
export function TimelineScrubber({ pb }: { pb: ScrubberInput }) {
  const { count, index } = pb;
  if (count === 0) return null;

  return (
    <div className="mt-3">
      <div
        className="flex items-end gap-[2px] h-8"
        role="slider"
        aria-label="Execution timeline"
        aria-valuemin={0}
        aria-valuemax={count - 1}
        aria-valuenow={index}
      >
        {pb.steps.map((s, i) => (
          <button
            key={i}
            onClick={() => pb.seek(i)}
            title={`Step ${i}: ${s.kind}`}
            aria-label={`Jump to step ${i} (${s.kind})`}
            className={`flex-1 min-w-[3px] rounded-full transition-all duration-150 cursor-pointer
              ${KIND_COLORS[s.kind] ?? "bg-line"}
              ${i === index ? "h-8 ring-2 ring-primary ring-offset-1" : i < index ? "h-6 opacity-90" : "h-4 opacity-45 hover:opacity-80"}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px] font-display font-semibold text-muted-fg mt-1">
        <span>Start</span>
        <span>Step {index + 1} of {count}</span>
        <span>End</span>
      </div>
    </div>
  );
}
