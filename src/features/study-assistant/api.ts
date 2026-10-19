import { STUDY_ASSISTANT_INSTRUCTIONS, STUDY_ASSISTANT_MAX_OUTPUT_TOKENS, STUDY_ASSISTANT_RATE_LIMITED, STUDY_ASSISTANT_REFUSAL, contextPrompt, isStudyAssistantTopicQuestion, type StudyLessonContext } from "./config";

export type StudyChatMessage = { role: "user" | "assistant"; content: string };

const API_URL = "https://api.xkiro.com/v1/chat/completions";
const MODEL = import.meta.env.VITE_XKIRO_MODEL || "mistralai/mistral-large-4-0";

export async function requestStudyAssistant(
  message: string,
  history: StudyChatMessage[],
  context?: StudyLessonContext,
  signal?: AbortSignal,
) {
  if (!isStudyAssistantTopicQuestion(message, Boolean(context))) return STUDY_ASSISTANT_REFUSAL;
  const apiKey = import.meta.env.VITE_XKIRO_API_KEY;
  if (!apiKey) throw new Error("Study assistant is not configured. Add XKIRO_API_KEY to your local .env file.");

  const recentHistory = history.slice(-8);
  let response: Response;
  try {
    console.log("STARTED")
    response = await fetch(API_URL, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          { role: "system", content: `${STUDY_ASSISTANT_INSTRUCTIONS}\n\n${contextPrompt(context)}` },
          ...recentHistory,
          { role: "user", content: message.slice(0, 1600) },
        ],
      }),
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
      throw new Error("The browser blocked the XKIRO request. XKIRO is not allowing this static site origin through CORS. A server-side proxy is required for production; no proxy is configured in this static app.");
    }
    throw error;
  }
  if (!response.ok) throw new Error(`Study assistant request failed (${response.status}).`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("The study assistant returned an empty response.");
  return content;
}
