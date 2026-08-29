import {
  buildEvidence,
  buildPrompt,
  ChangedFile,
  filterChangedFiles,
  GitCommit,
  getChangedFiles,
  getLatestProjectCommit,
  isAlreadyLogged,
  readExistingLog,
  readLogFormat,
  updateLog,
} from "./utils";

export const LLM_MODEL: string = process.env.LLM_MODEL ?? "gpt-5.6";

function main(): void {
  console.log("Updating hackathon.md...");

  const commit: GitCommit | null = getLatestProjectCommit();

  if (!commit) {
    console.log("No project commit was found.");

    return;
  }

  console.log(`Latest project commit: ${commit.shortSha} ${commit.message}`);

  const existingLog: string = readExistingLog();

  if (isAlreadyLogged(existingLog, commit)) {
    console.log(`Commit ${commit.shortSha} is already logged.`);

    return;
  }

  const allChangedFiles: ChangedFile[] = getChangedFiles(commit);

  const changedFiles: ChangedFile[] = filterChangedFiles(allChangedFiles);

  console.log(`Changed files: ${allChangedFiles.length}`);

  console.log(`Relevant files: ${changedFiles.length}`);

  if (changedFiles.length === 0) {
    console.log("No relevant source/configuration files changed.");

    return;
  }

  const logFormat: string = readLogFormat();

  const evidence: string = buildEvidence(commit, changedFiles);

  // console.log(evidence);

  const prompt: string = buildPrompt(commit, existingLog, evidence);

  console.log(`Calling ${LLM_MODEL}...`);

  /*
   * main() is synchronous so we cannot await the API here.
   * The actual asynchronous entry point is below.
   */
  void updateLog(commit, existingLog, prompt);
}

main();
