import type { Playback } from "../hooks/usePlayback";

const KIND_COLORS: Record<string, string> = {
  compare: "bg-neon-yellow",
  verify: "bg-neon-yellow",
  mismatch: "bg-neon-red",
  collision: "bg-neon-red",
  match: "bg-neon-green",
  done: "bg-white",
  path: "bg-neon-yellow",
  push: "bg-neon-cyan",
  "no-path": "bg-neon-red",
  init: "bg-neon-purple",
  table: "bg-neon-purple",
  "hash-pattern": "bg-neon-purple",
  roll: "bg-neon-purple",
  "hash-match": "bg-neon-yellow",
};

export function TimelineScrubber<T extends { kind: string }>({ pb }: { pb: Playback<T> }) {
  const { steps, index, count } = pb;
  if (count === 0) return null;

  return (
    <div className="mt-2" role="slider" aria-label="Timeline scrubber" aria-valuemin={0} aria-valuemax={count - 1} aria-valuenow={index}>
      <div className="flex gap-px h-4 items-end">
        {steps.map((s, i) => {
          const color = KIND_COLORS[s.kind] ?? "bg-grid";
          const isCurrent = i === index;
          const isPast = i < index;
          return (
            <button
              key={i}
              onClick={() => pb.seek(i)}
              className={`flex-1 min-w-[3px] max-w-[12px] transition-all cursor-pointer
                ${isCurrent ? "h-4 opacity-100 ring-1 ring-white" : isPast ? "h-3 opacity-80" : "h-2 opacity-40"}
                ${color}`}
              aria-label={`Step ${i + 1}: ${s.kind}`}
              title={`Step ${i + 1}: ${s.kind}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-dim font-term">START</span>
        <span className="text-[9px] text-dim font-term">END</span>
      </div>
    </div>
  );
}
