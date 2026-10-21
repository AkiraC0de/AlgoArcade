import { type StudyChatMessage, type StudyLessonContext } from "./config";

export type { StudyChatMessage };

const API_URL = "/api/study-assistant";

export async function requestStudyAssistant(
  message: string,
  history: StudyChatMessage[],
  context?: StudyLessonContext,
  signal?: AbortSignal,
) {
  const response = await fetch(API_URL, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, context }),
  });

  let payload: { content?: string; error?: string } = {};
  try {
    payload = await response.json() as { content?: string; error?: string };
  } catch {
    // Keep the status-based message below for non-JSON proxy failures.
  }

  if (!response.ok) {
    throw new Error(payload.error || `Study assistant request failed (${response.status}).`);
  }

  const content = payload.content?.trim();
  if (!content) throw new Error(payload.error || "The study assistant returned an empty response.");
  return content;
}
