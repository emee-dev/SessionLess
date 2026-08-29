import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { callLlm } from "./llm";

export interface GitCommit {
  sha: string;
  shortSha: string;
  date: string;
  message: string;
}

export interface ChangedFile {
  path: string;
  status: string;
  diff: string;
}

export interface LlmResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export const ROOT: string = process.cwd();
export const LOG_FILE: string = join(ROOT, "hackathon.md");
export const LOG_FORMAT_FILE: string = join(ROOT, "scripts", "log-format.md");

function runGit(args: string[]): string {
  const result: ReturnType<typeof Bun.spawnSync> = Bun.spawnSync(
    ["git", ...args],
    {
      cwd: ROOT,
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  const stdout: string = new TextDecoder().decode(result.stdout);

  const stderr: string = new TextDecoder().decode(result.stderr);

  if (!result.success) {
    throw new Error(`git ${args.join(" ")} failed:\n${stderr}`);
  }

  return stdout.trim();
}

export function getLatestProjectCommit(): GitCommit | null {
  /*
   * Find the latest commit that changed something other
   * than hackathon.md.
   *
   * This prevents the workflow's own generated commit
   * from becoming the next commit that gets summarized.
   */
  const commits: string = runGit([
    "log",
    "--format=%H%x09%h%x09%cI%x09%s",
    "--no-merges",
    "--",
  ]);

  const lines: string[] = commits.split("\n").filter(Boolean);

  for (const line of lines) {
    const [sha, shortSha, date, ...messageParts]: string[] = line.split("\t");

    if (!sha || !shortSha || !date) {
      continue;
    }

    const message: string = messageParts.join("\t");

    const files: string = runGit([
      "diff-tree",
      "--no-commit-id",
      "--name-only",
      "-r",
      sha,
    ]);

    const changedFiles: string[] = files
      .split("\n")
      .map((file: string) => file.trim())
      .filter(Boolean);

    const onlyHackathonLog: boolean =
      changedFiles.length > 0 &&
      changedFiles.every((file: string) => file === "hackathon.md");

    if (!onlyHackathonLog) {
      return {
        sha,
        shortSha,
        date,
        message,
      };
    }
  }

  return null;
}

export function getChangedFiles(commit: GitCommit): ChangedFile[] {
  const output: string = runGit([
    "diff-tree",
    "--no-commit-id",
    "--name-status",
    "-r",
    commit.sha,
  ]);

  const files: ChangedFile[] = [];

  for (const line of output.split("\n")) {
    if (!line.trim()) {
      continue;
    }

    const parts: string[] = line.split("\t");
    const status: string | undefined = parts[0];
    const path: string | undefined = parts.at(-1);

    if (!status || !path) {
      continue;
    }

    const diff: string = getFileDiff(commit.sha, path);

    files.push({
      path,
      status,
      diff,
    });
  }

  return files;
}

function getFileDiff(commitSha: string, filePath: string): string {
  try {
    return runGit(["diff", `${commitSha}^`, commitSha, "--", filePath]);
  } catch {
    return "";
  }
}

function isSensitivePath(filePath: string): boolean {
  const normalized: string = filePath.replaceAll("\\", "/").toLowerCase();

  const filename: string = normalized.split("/").at(-1) ?? "";

  if (
    filename === ".env" ||
    filename.startsWith(".env.") ||
    filename.endsWith(".pem") ||
    filename.endsWith(".key") ||
    filename.endsWith(".crt") ||
    filename.endsWith(".p12") ||
    filename.endsWith(".pfx")
  ) {
    return true;
  }

  return (
    normalized.startsWith(".git/") ||
    normalized.includes("/node_modules/") ||
    normalized.includes("/.next/") ||
    normalized.includes("/dist/") ||
    normalized.includes("/build/")
  );
}

function isUsefulFile(filePath: string): boolean {
  const normalized: string = filePath.replaceAll("\\", "/").toLowerCase();

  if (isSensitivePath(normalized)) {
    return false;
  }

  const filename: string = normalized.split("/").at(-1) ?? "";

  const extension: string = filename.includes(".")
    ? `.${filename.split(".").at(-1)}`
    : "";

  const usefulExtensions: Set<string> = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".md",
    ".mdx",
    ".yaml",
    ".yml",
    ".toml",
    ".sql",
    ".html",
    ".css",
  ]);

  const importantFiles: Set<string> = new Set([
    "package.json",
    "convex.config.ts",
    "tsconfig.json",
    "README",
    "README.md",
  ]);

  return usefulExtensions.has(extension) || importantFiles.has(filename);
}

export function filterChangedFiles(files: ChangedFile[]): ChangedFile[] {
  return files.filter((file: ChangedFile): boolean => isUsefulFile(file.path));
}

export function readExistingLog(): string {
  if (!existsSync(LOG_FILE)) {
    return "";
  }

  return readFileSync(LOG_FILE, "utf8");
}

export function readLogFormat(): string {
  if (!existsSync(LOG_FORMAT_FILE)) {
    throw new Error("scripts/log-format.md does not exist");
  }

  return readFileSync(LOG_FORMAT_FILE, "utf8");
}

export function isAlreadyLogged(log: string, commit: GitCommit): boolean {
  return (
    log.includes(` - ${commit.shortSha}`) || log.includes(` - ${commit.sha}`)
  );
}

export function buildEvidence(commit: GitCommit, files: ChangedFile[]): string {
  const sections: string[] = [];

  sections.push(
    [
      "## Commit",
      `SHA: ${commit.sha}`,
      `Short SHA: ${commit.shortSha}`,
      `Date: ${commit.date}`,
      `Message: ${commit.message}`,
    ].join("\n"),
  );

  for (const file of files) {
    if (!file.diff) {
      continue;
    }

    /*
     * A diff is more useful than the complete file because
     * it tells the model exactly what this commit changed.
     */
    const limitedDiff: string =
      file.diff.length > 20_000
        ? `${file.diff.slice(0, 20_000)}\n[diff truncated]`
        : file.diff;

    sections.push(
      [
        `## Changed file: ${file.path}`,
        `Status: ${file.status}`,
        "```diff",
        limitedDiff,
        "```",
      ].join("\n"),
    );
  }

  return sections.join("\n\n");
}

export function buildPrompt(
  commit: GitCommit,
  existingLog: string,
  evidence: string,
): string {
  return `Update hackathon.md using ONLY the repository evidence below.

Return ONLY the complete hackathon.md contents. No code fences.

Rules:
- Preserve existing history and header values unless evidence proves they changed.
- Add an entry only for meaningful behavioral/product changes; otherwise return the existing file unchanged.
- Entry heading: ### ${formatCommitHeading(commit)}
- Describe user/product impact, not the commit message.
- Include the main affected files in parentheses.
- Include Convex features only when proven by code/configuration.
- Never invent features, deployments, URLs, integrations, models, components, auth, or database behavior.
- Never output secrets, credentials, tokens, passwords, private data, or environment variable values.
- Dependency presence alone does not prove a feature; require source/config evidence.
- Keep entries concise and chronological.
- Update "Last updated" only when a meaningful change is added.
- Preserve the existing log format and field rules.

CURRENT HACKATHON.MD:
${existingLog || "(does not exist)"}

COMMIT:
${commit.sha} | ${commit.date} | ${commit.message}

REPOSITORY EVIDENCE:
${evidence}

OUTPUT:
Complete hackathon.md only.`;
}

function formatCommitHeading(commit: GitCommit): string {
  const date: string = commit.date.slice(0, 10);

  return `${date} - ${commit.shortSha}`;
}

export function stripCodeFence(text: string): string {
  if (!text.startsWith("```")) {
    return text;
  }

  const lines: string[] = text.split("\n");

  if (
    lines.length >= 3 &&
    lines[0]?.startsWith("```") &&
    lines.at(-1)?.trim() === "```"
  ) {
    return lines.slice(1, -1).join("\n").trim();
  }

  return text;
}

export function validateHackathonLog(log: string, commit: GitCommit): void {
  if (!log.startsWith("# Hackathon log")) {
    throw new Error("Generated log must start with '# Hackathon log'");
  }

  if (!log.includes("## Log")) {
    throw new Error("Generated log is missing '## Log'");
  }

  if (log.includes("TODO")) {
    throw new Error("Generated log contains TODO");
  }

  if (log.includes("```")) {
    throw new Error("Generated log contains an unexpected code fence");
  }

  const shortShaPattern: RegExp = new RegExp(
    `###\\s+\\d{4}-\\d{2}-\\d{2}\\s+-\\s+${escapeRegExp(commit.shortSha)}`,
  );

  /*
   * It is acceptable for the LLM to determine that the commit
   * is mechanical/no-op and therefore not add an entry.
   *
   * In that case the caller handles the unchanged output.
   */
  if (log !== readExistingLog() && !shortShaPattern.test(log)) {
    throw new Error(
      `Generated log changed but does not contain entry for ${commit.shortSha}`,
    );
  }

  assertNoSecrets(log);
  assertHeaderIsValid(log);
}

export function assertNoSecrets(log: string): void {
  const forbiddenPatterns: RegExp[] = [
    /-----BEGIN [^-]+ PRIVATE KEY-----/i,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/i,
    /\b(password|passwd|secret|token|api[_-]?key)\s*[:=]\s*["']?[^\s"']+/i,
    /\b[A-Za-z_]*(API_KEY|SECRET_KEY|ACCESS_TOKEN|PRIVATE_KEY)\s*[:=]\s*["']?[^\s"']+/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(log)) {
      throw new Error("Generated hackathon.md contains secret-shaped data");
    }
  }
}

export function assertHeaderIsValid(log: string): void {
  const requiredFields: string[] = [
    "**Project:**",
    "**What it does:**",
    "**Live app:**",
    "**Repo:**",
    "**Frontend:**",
    "**Convex deployment:**",
    "**Components:**",
    "**Convex features:**",
    "**Auth:**",
    "**AI models:**",
    "**Started:**",
    "**Last updated:**",
  ];

  for (const field of requiredFields) {
    if (!log.includes(field)) {
      throw new Error(`Generated hackathon.md is missing ${field}`);
    }
  }
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function updateLog(
  commit: GitCommit,
  existingLog: string,
  prompt: string,
): Promise<void> {
  const generatedLog: string = await callLlm(prompt);

  if (generatedLog === existingLog) {
    console.log("No meaningful change detected. hackathon.md unchanged.");

    return;
  }

  validateHackathonLog(generatedLog, commit);

  writeFileSync(LOG_FILE, `${generatedLog.trim()}\n`, "utf8");

  console.log(`hackathon.md updated for ${commit.shortSha}.`);
}
