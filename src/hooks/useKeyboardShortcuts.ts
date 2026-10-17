import { useEffect } from "react";
import type { Playback } from "./usePlayback";

export function useKeyboardShortcuts<T>(pb: Playback<T>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          pb.toggle();
          break;
        case "ArrowRight":
          e.preventDefault();
          pb.stepFwd();
          break;
        case "ArrowLeft":
          e.preventDefault();
          pb.stepBack();
          break;
        case "r":
        case "R":
          e.preventDefault();
          pb.reset();
          break;
        case "1":
          pb.setSpeed(0.5);
          break;
        case "2":
          pb.setSpeed(1);
          break;
        case "3":
          pb.setSpeed(2);
          break;
        case "4":
          pb.setSpeed(4);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pb, enabled]);
}
