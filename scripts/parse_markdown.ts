import { writeFileSync } from "node:fs";
import { buildPrompt, callLlm } from "./llm";
import { GitCommit, LOG_FILE } from "./utils";

export async function updateLog(commit: GitCommit, evidence: string) {
  const markdown = await Bun.file(LOG_FILE).text();

  const existingLog = getLastLog(markdown);

  const prompt: string = buildPrompt(commit, existingLog, evidence);

  const newLog = await callLlm(prompt);

  if (!newLog) {
    console.log("No meaningful change detected. hackathon.md unchanged.");
    return;
  }

  const appendedLog = appendLog(markdown, newLog);

  const updated = lastUpdatedAt(appendedLog);

  writeFileSync(LOG_FILE, `${updated.trim()}\n`, "utf8");

  console.log(`hackathon.md updated for ${commit.shortSha}.`);
}

function getLastLog(markdown: string) {
  const logSectionMatch = markdown.match(/## Log\s*([\s\S]*?)(?=\n## |$)/);
  if (!logSectionMatch) return null;

  const logSection = logSectionMatch[1].trim();
  if (!logSection) return null;

  // Split on entry headers, keeping the header attached to its body
  const entries = logSection
    .split(/(?=\*\*### )/)
    .map((e) => e.trim())
    .filter(Boolean);

  if (entries.length === 0) return null;

  return entries[entries.length - 1];
}

function appendLog(markdown: string, log: string): string {
  const normalizedLog = log.trim();

  if (!normalizedLog) {
    return markdown;
  }

  const logHeader = "## Log";

  const index = markdown.indexOf(logHeader);

  if (index === -1) {
    return `${markdown.trimEnd()}\n\n${logHeader}\n\n${normalizedLog}\n`;
  }

  const before = markdown.slice(0, index).trimEnd();
  const after = markdown.slice(index + logHeader.length).trim();

  return `${before}\n\n${logHeader}\n\n${after}\n\n${normalizedLog}\n`;
}

function lastUpdatedAt(
  markdown: string,
  newValue: string = new Date().toISOString(),
) {
  return markdown.replace(/(\*\*Last updated:\*\*\s*).*/, `$1${newValue}`);
}
