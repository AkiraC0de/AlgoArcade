import { useState, useCallback } from "react";

export interface WalkthroughStep {
  atStep: number;
  title: string;
  text: string;
  highlight?: string;
}

export function useGuidedWalkthrough(steps: WalkthroughStep[], currentIndex: number, isPlaying: boolean) {
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const current = active ? steps.find((s) => s.atStep <= currentIndex && !dismissed.has(s.atStep)) : undefined;

  const start = useCallback(() => { setActive(true); setDismissed(new Set()); }, []);
  const stop = useCallback(() => setActive(false), []);
  const dismiss = useCallback((atStep: number) => {
    setDismissed((prev) => new Set(prev).add(atStep));
  }, []);

  return { active, current, start, stop, dismiss };
}
