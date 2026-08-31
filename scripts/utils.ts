import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

const MAX_EVIDENCE_CHARS: number = 100_000;
const MIN_FILE_EVIDENCE_CHARS: number = 1_000;
export const ROOT: string = process.cwd();
export const LOG_FILE: string = join(ROOT, "hackathon.md");

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
    normalized.startsWith("scripts/") ||
    normalized.includes("/scripts/") ||
    normalized.startsWith("convex/_generated/") ||
    normalized.includes("/convex/_generated/") ||
    normalized.startsWith("dsl/generated/") ||
    normalized.includes("/dsl/generated/") ||
    normalized.includes("/build/") ||
    normalized.includes("hackathon.md") ||
    normalized.startsWith("components/ui/") ||
    normalized.includes("/components/ui/") ||
    normalized.startsWith("out/") ||
    normalized.includes("/out/")
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

  const usefulExtensions: Set<string> = new Set([".ts", ".tsx", ".md", ".mdx"]);

  const importantFiles: Set<string> = new Set([
    "package.json",
    "convex.config.ts",
    "readme",
    "readme.md",
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

export function isAlreadyLogged(log: string, commit: GitCommit): boolean {
  return (
    log.includes(` - ${commit.shortSha}`) || log.includes(` - ${commit.sha}`)
  );
}

function truncateInParts(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  if (maxChars <= 100) {
    return `${text.slice(0, maxChars)}\n[truncated]`;
  }

  const marker: string = "\n\n... [diff truncated] ...\n\n";
  const available: number = maxChars - marker.length;

  if (available <= 0) {
    return text.slice(0, maxChars);
  }

  // Give the beginning and end more weight than the middle.
  const firstSize: number = Math.ceil(available * 0.4);
  const middleSize: number = Math.floor(available * 0.2);
  const lastSize: number = available - firstSize - middleSize;

  const first: string = text.slice(0, firstSize);
  const middleStart: number = Math.max(
    0,
    Math.floor((text.length - middleSize) / 2),
  );
  const middle: string = text.slice(middleStart, middleStart + middleSize);
  const last: string = text.slice(-lastSize);

  return [
    first,
    "\n\n... [middle truncated] ...\n\n",
    middle,
    "\n\n... [middle truncated] ...\n\n",
    last,
  ].join("");
}

function truncateToLineBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  const truncated: string = text.slice(0, maxChars);
  const lastNewline: number = truncated.lastIndexOf("\n");

  return lastNewline > 0 ? truncated.slice(0, lastNewline) : truncated;
}

function allocateEvidenceBudget(
  files: ChangedFile[],
  maxChars: number,
): Map<string, number> {
  const budgets: Map<string, number> = new Map();

  if (files.length === 0) {
    return budgets;
  }

  const totalDiffSize: number = files.reduce(
    (total: number, file: ChangedFile): number => total + file.diff.length,
    0,
  );

  const minimumBudget: number = Math.min(
    MIN_FILE_EVIDENCE_CHARS,
    Math.floor(maxChars / files.length),
  );

  const minimumTotal: number = minimumBudget * files.length;

  // If there are so many files that even the minimum allocation
  // cannot fit, distribute the budget evenly.
  if (minimumTotal >= maxChars) {
    const baseBudget: number = Math.floor(maxChars / files.length);

    for (const file of files) {
      budgets.set(file.path, baseBudget);
    }

    return budgets;
  }

  let remaining: number = maxChars - minimumTotal;

  for (const file of files) {
    const proportionalBudget: number =
      totalDiffSize > 0
        ? Math.floor((file.diff.length / totalDiffSize) * remaining)
        : 0;

    budgets.set(
      file.path,
      Math.min(file.diff.length, minimumBudget + proportionalBudget),
    );
  }

  return budgets;
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

  const filesWithDiff: ChangedFile[] = files.filter(
    (file: ChangedFile): boolean => Boolean(file.diff),
  );

  const budgets: Map<string, number> = allocateEvidenceBudget(
    filesWithDiff,
    MAX_EVIDENCE_CHARS,
  );

  for (const file of filesWithDiff) {
    const budget: number = budgets.get(file.path) ?? 0;

    if (budget <= 0) {
      continue;
    }

    const diff: string = truncateInParts(file.diff, budget);

    sections.push(
      [
        `## Changed file: ${file.path}`,
        `Status: ${file.status}`,
        "```diff",
        truncateToLineBoundary(diff, budget),
        "```",
      ].join("\n"),
    );
  }

  return sections.join("\n\n");
}

export function formatCommitHeading(commit: GitCommit): string {
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
