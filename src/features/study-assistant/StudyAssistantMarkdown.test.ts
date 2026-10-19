import { describe, expect, it } from "vitest";
import { parseStudyAssistantInlineMarkdown } from "./StudyAssistantMarkdown";

describe("study assistant Markdown", () => {
  it("turns double-asterisk text into a bold token", () => {
    expect(parseStudyAssistantInlineMarkdown("Use **BFS** to find a path")).toEqual([
      { kind: "text", value: "Use " },
      { kind: "bold", value: "BFS" },
      { kind: "text", value: " to find a path" },
    ]);
  });

  it("removes Markdown markers instead of displaying them", () => {
    const tokens = parseStudyAssistantInlineMarkdown("**Text**");
    expect(tokens).toEqual([{ kind: "bold", value: "Text" }]);
    expect(tokens.some((token) => token.value.includes("**"))).toBe(false);
  });

  it("keeps inline code and italic text distinct", () => {
    expect(parseStudyAssistantInlineMarkdown("Use `capacity` and *carefully*")).toEqual([
      { kind: "text", value: "Use " },
      { kind: "code", value: "capacity" },
      { kind: "text", value: " and " },
      { kind: "italic", value: "carefully" },
    ]);
  });
});
