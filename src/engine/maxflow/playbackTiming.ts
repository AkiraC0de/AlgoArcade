import type { MaxFlowStep } from "./fordFulkerson";

/** Minimum time each revealed path edge remains visible. */
export const MAX_FLOW_EDGE_DISPLAY_MS = 2000;

/**
 * Keeps the trace cursor behind the visual path animation.
 *
 * A push snapshot with E edges gets E × 2 seconds: edge 0 is visible
 * immediately, each next edge appears after two seconds, and the final edge
 * remains visible for two seconds before the next trace step appears.
 */
export function getMaxFlowStepDelay(
  step: MaxFlowStep,
  _index: number,
  speed: number,
  baseDelayMs: number,
): number {
  if (step.kind === "push" && step.path && step.path.length > 1) {
    const edgeCount = step.path.length - 1;
    const animationDuration = edgeCount * MAX_FLOW_EDGE_DISPLAY_MS;
    return Math.max(animationDuration, baseDelayMs / speed);
  }

  return baseDelayMs / speed;
}
