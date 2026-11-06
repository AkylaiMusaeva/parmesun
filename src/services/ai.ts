import { createServerFn } from "@tanstack/react-start";
import { chatWithAI, getAIConfig, type AIChatMessage } from "@/server/ai";

export interface AIStatus {
  configured: boolean;
  message: string;
  model: string | null;
}

export interface AIReplyResult {
  ok: boolean;
  message: string;
}

export const getAIStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<AIStatus> => {
    const config = getAIConfig();
    return config
      ? { configured: true, message: "AI service configured", model: config.model }
      : { configured: false, message: "Groq API key is not configured", model: null };
  },
);

export const getAIReply = createServerFn({ method: "POST" }).handler(
  async (input: { messages: AIChatMessage[] }): Promise<AIReplyResult> => {
    const config = getAIConfig();
    if (!config) {
      return { ok: false, message: "OpenAI API key is not configured" };
    }

    const messages = Array.isArray(input?.messages) ? input.messages.slice(-12) : [];
    if (!messages.length) {
      return { ok: false, message: "No chat messages supplied" };
    }

    try {
      const reply = await chatWithAI(config, messages);
      return { ok: true, message: reply };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "AI request failed",
      };
    }
  },
);
