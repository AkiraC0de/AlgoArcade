import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import type { Playback } from "../hooks/usePlayback";
import { Badge, Button } from "./ui";

export function PlaybackControls<T>({ pb }: { pb: Playback<T> }) {
  const { count } = pb;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" onClick={pb.reset} disabled={count === 0} aria-label="Reset to first step">
        <RotateCcw className="w-4 h-4" aria-hidden />
      </Button>
      <Button variant="ghost" onClick={pb.stepBack} disabled={count === 0 || pb.index === 0} aria-label="Step backward">
        <ChevronLeft className="w-4 h-4" aria-hidden /> Back
      </Button>
      <Button
        variant={pb.playing ? "accent" : "primary"}
        onClick={pb.toggle}
        disabled={count === 0}
        aria-label={pb.playing ? "Pause" : "Play"}
      >
        {pb.playing ? (
          <><Pause className="w-4 h-4" aria-hidden /> Pause</>
        ) : (
          <><Play className="w-4 h-4" aria-hidden /> Play</>
        )}
      </Button>
      <Button variant="ghost" onClick={pb.stepFwd} disabled={count === 0 || pb.index >= count - 1} aria-label="Step forward">
        Step <ChevronRight className="w-4 h-4" aria-hidden />
      </Button>
      <label className="flex items-center gap-1.5 font-display font-semibold text-sm text-muted-fg">
        Speed
        <select
          value={pb.speed}
          onChange={(e) => pb.setSpeed(Number(e.target.value))}
          className="bg-card border-2 border-line rounded-lg text-primary px-2 py-1.5 text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Playback speed"
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
          <option value={4}>4×</option>
        </select>
      </label>
      <span className="ml-auto" aria-live="polite">
        <Badge tone="text-primary bg-primary/10">
          {count === 0 ? "Ready" : `Step ${pb.index + 1} / ${count}`}
          {pb.done && count > 1 ? " · Done" : ""}
        </Badge>
      </span>
    </div>
  );
}
