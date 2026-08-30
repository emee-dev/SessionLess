import { updateLog } from "@/scripts/parse_markdown";
import {
  buildEvidence,
  ChangedFile,
  filterChangedFiles,
  GitCommit,
  getChangedFiles,
  getLatestProjectCommit,
  isAlreadyLogged,
  readExistingLog,
} from "./utils";

async function main() {
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

  const evidence: string = buildEvidence(commit, changedFiles);

  // console.log(evidence)
  await updateLog(commit, evidence);
}

main();
