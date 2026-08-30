import { formatCommitHeading, GitCommit, stripCodeFence } from "./utils";

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
  "You are a helpful hackathon build logger. You help with summarizing build changes." +
  "Never invent facts or expose secrets.";

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
        enabled: false,
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

export function buildPrompt(
  commit: GitCommit,
  lastLog: string | null,
  evidence: string,
): string {
  return `Summarize meaningful product/behavioral changes from the evidence.

FORMAT:
**### ${formatCommitHeading(commit)}**

<one concise paragraph ending with (\`file1\`, \`file2\`) Convex features: ...>

Example:
**### 2026-08-26 - a81c2f4**

Created the initial event model with events, speakers, submissions, sessions, and rooms. Added event-scoped indexes and queries/mutations for managing event data (\`convex/schema.ts\`, \`convex/events.ts\`, \`convex/submissions.ts\`). Convex features: schema, tables, indexes, queries, mutations.

RULES:
- Output only the entry or \`null\`.
- Return \`null\` for insignificant or duplicate changes compared with the latest log entry.
- Describe user/product impact, not the commit message.
- Use only evidence; never infer functionality from dependencies alone.
- List affected files at the end of the paragraph, never in the heading.
- Include only proven Convex features; use \`Convex features: none.\` otherwise.
- No secrets, credentials, tokens, passwords, or environment values.
- No extra text, bullets, or code fences.

LATEST LOG:
${lastLog || "(none)"}

COMMIT:
${commit.sha} | ${commit.date} | ${commit.message}

EVIDENCE:
${evidence}`;
}
