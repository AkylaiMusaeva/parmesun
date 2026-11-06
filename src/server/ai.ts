export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export function getAIConfig(): AIConfig | null {
  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (env("OPENAI_BASE_URL") || "https://api.groq.com/openai/v1").replace(/\/+$/, ""),
    model: env("OPENAI_MODEL") || "openai/gpt-oss-120b",
  };
}

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatWithAI(config: AIConfig, messages: AIChatMessage[]): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI provider returned HTTP ${response.status}${body ? `: ${body.slice(0, 300)}` : ""}`);
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };
  if (payload.error?.message) throw new Error(payload.error.message);

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("AI provider returned an empty response");
  return content;
}
