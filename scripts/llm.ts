import { stripCodeFence } from "./utils";

type LlmResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const OPENROUTER_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const GROQ_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT: string =
  "You are an evidence-based software project historian. " +
  "Never invent facts and never expose secrets.";

export async function callLlm(prompt: string): Promise<string> {
  const openRouterApiKey: string | undefined = process.env.OPENROUTER_API_KEY;
  const groqApiKey: string | undefined = process.env.GROQ_API_KEY;

  if (!openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  try {
    return await callOpenRouter(prompt, openRouterApiKey);
  } catch (openRouterError: unknown) {
    try {
      return await callGroq(prompt, groqApiKey);
    } catch (groqError: unknown) {
      throw new Error(
        [
          "Both LLM providers failed.",
          `OpenRouter: ${
            openRouterError instanceof Error
              ? openRouterError.message
              : String(openRouterError)
          }`,
          `Groq: ${
            groqError instanceof Error ? groqError.message : String(groqError)
          }`,
        ].join("\n"),
      );
    }
  }
}

async function callOpenRouter(prompt: string, apiKey: string): Promise<string> {
  const response: Response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      reasoning: {
        enabled: true,
      },
    }),
  });

  return parseLlmResponse(response, "OpenRouter");
}

async function callGroq(prompt: string, apiKey: string): Promise<string> {
  const response: Response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 2048,
      top_p: 1,
      reasoning_effort: "medium",
    }),
  });

  return parseLlmResponse(response, "Groq");
}

async function parseLlmResponse(
  response: Response,
  provider: string,
): Promise<string> {
  const body: string = await response.text();

  if (!response.ok) {
    throw new Error(
      `${provider} request failed with ${response.status}: ${body}`,
    );
  }

  let data: LlmResponse;

  try {
    data = JSON.parse(body) as LlmResponse;
  } catch {
    throw new Error(`${provider} returned invalid JSON`);
  }

  const content: string | undefined = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`${provider} returned no message content`);
  }

  return stripCodeFence(content.trim());
}
