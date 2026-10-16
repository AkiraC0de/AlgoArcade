import type { Playback } from "../hooks/usePlayback";
import { PixelButton } from "./ui";

export function PlaybackControls<T>({ pb }: { pb: Playback<T> }) {
  const { count } = pb;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixelButton variant="dim" onClick={pb.reset} disabled={count === 0} aria-label="Reset to first step">
        ⏮ RST
      </PixelButton>
      <PixelButton variant="dim" onClick={pb.stepBack} disabled={count === 0 || pb.index === 0} aria-label="Step backward">
        ◀ STEP
      </PixelButton>
      <PixelButton
        variant={pb.playing ? "yellow" : "green"}
        onClick={pb.toggle}
        disabled={count === 0}
        aria-label={pb.playing ? "Pause" : "Play"}
      >
        {pb.playing ? "⏸ PAUSE" : "▶ PLAY"}
      </PixelButton>
      <PixelButton variant="dim" onClick={pb.stepFwd} disabled={count === 0 || pb.index >= count - 1} aria-label="Step forward">
        STEP ▶
      </PixelButton>
      <label className="flex items-center gap-1 font-pixel text-[8px] text-dim">
        SPD
        <select
          value={pb.speed}
          onChange={(e) => pb.setSpeed(Number(e.target.value))}
          className="bg-crt border border-grid text-neon-cyan px-1 py-0.5"
          aria-label="Playback speed"
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
          <option value={4}>4×</option>
        </select>
      </label>
      <span className="font-pixel text-[9px] text-neon-cyan ml-auto" aria-live="polite">
        {count === 0 ? "READY" : `STEP ${pb.index + 1}/${count}`}
        {pb.done && count > 1 ? " · DONE" : ""}
      </span>
    </div>
  );
}