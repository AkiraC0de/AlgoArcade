import { describe, expect, it, vi } from "vitest";
import { requestStudyAssistant } from "./api";
import { STUDY_ASSISTANT_MAX_OUTPUT_TOKENS, STUDY_ASSISTANT_RATE_LIMITED } from "./config";

describe("study assistant response policy", () => {
  it("uses the requested output-token budget", () => {
    expect(STUDY_ASSISTANT_MAX_OUTPUT_TOKENS).toBe(700);
  });

  it("provides a Taglish rate-limit fallback", () => {
    expect(STUDY_ASSISTANT_RATE_LIMITED).toContain("Pasensya na");
    expect(STUDY_ASSISTANT_RATE_LIMITED).toContain("request limit");
  });

  it("calls the same-origin server proxy without exposing a provider key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: "Sagot" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestStudyAssistant("Explain naive string matching", [])).resolves.toBe("Sagot");
    expect(fetchMock).toHaveBeenCalledWith("/api/study-assistant", expect.objectContaining({ method: "POST" }));
    expect(JSON.stringify(fetchMock.mock.calls[0][1])).not.toContain("Authorization");
    vi.unstubAllGlobals();
  });
});
