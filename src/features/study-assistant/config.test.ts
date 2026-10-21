import { describe, expect, it } from "vitest";
import { STUDY_ASSISTANT_REFUSAL, contextPrompt } from "./config";

describe("study assistant scope", () => {
  it("documents model-led scope decisions instead of a client keyword gate", () => {
    expect(STUDY_ASSISTANT_REFUSAL).toContain("study the topics covered");
    expect(contextPrompt({ topicTitle: "String Matching", objective: "Explain the naive approach" })).toContain("Current topic: String Matching");
  });

  it("builds compact lesson context", () => {
    expect(contextPrompt({ topicTitle: "Hashing", objective: "Explain collisions" })).toContain("Current topic: Hashing");
    expect(contextPrompt()).toContain("approved Module 6 algorithm questions");
  });
});
