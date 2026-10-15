import { useCallback, useEffect, useState } from "react";

export interface Playback<T> {
  steps: T[];
  step: T | null;
  index: number;
  count: number;
  playing: boolean;
  done: boolean;
  speed: number;
  setSpeed: (v: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stepFwd: () => void;
  stepBack: () => void;
  reset: () => void;
  setSteps: (steps: T[]) => void;
}

/**
 * Trace playback: an immutable step array plus a cursor.
 * Step-back is free because every step is a full snapshot.
 */
export function usePlayback<T>(baseDelayMs = 900): Playback<T> {
  const [steps, setStepsState] = useState<T[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const count = steps.length;
  const done = count > 0 && index >= count - 1;

  const setSteps = useCallback((next: T[]) => {
    setStepsState(next);
    setIndex(next.length > 0 ? 0 : 0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (index >= count - 1) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => {
      setIndex((i) => Math.min(i + 1, count - 1));
    }, baseDelayMs / speed);
    return () => window.clearTimeout(id);
  }, [playing, index, count, speed, baseDelayMs]);

  const play = useCallback(() => {
    if (count === 0) return;
    if (index >= count - 1) setIndex(0);
    setPlaying(true);
  }, [count, index]);

  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && count > 0 && index >= count - 1) setIndex(0);
      return !p;
    });
  }, [count, index]);

  const stepFwd = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, Math.max(count - 1, 0)));
  }, [count]);

  const stepBack = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  return {
    steps,
    step: steps[index] ?? null,
    index,
    count,
    playing,
    done,
    speed,
    setSpeed,
    play,
    pause,
    toggle,
    stepFwd,
    stepBack,
    reset,
    setSteps,
  };
}
