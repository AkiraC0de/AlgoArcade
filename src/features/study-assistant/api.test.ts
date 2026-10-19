import { describe, expect, it } from "vitest";
import { STUDY_ASSISTANT_MAX_OUTPUT_TOKENS, STUDY_ASSISTANT_RATE_LIMITED } from "./config";

describe("study assistant response policy", () => {
  it("uses the requested output-token budget", () => {
    expect(STUDY_ASSISTANT_MAX_OUTPUT_TOKENS).toBe(700);
  });

  it("provides a Taglish rate-limit fallback", () => {
    expect(STUDY_ASSISTANT_RATE_LIMITED).toContain("Pasensya na");
    expect(STUDY_ASSISTANT_RATE_LIMITED).toContain("request limit");
  });
});
