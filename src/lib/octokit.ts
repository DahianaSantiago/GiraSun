// GitHub commit helpers. The admin "Publicar" flow writes the new MDX file
// (and any image binaries) to the repo via Octokit, and Vercel auto-deploys
// the resulting push.
//
// Auth: a fine-grained personal access token with Contents:Write on
// DahianaSantiago/GiraSun, set as GITHUB_TOKEN in Vercel + .env.local.
// Phase 10 swaps this for a GitHub App for proper attribution and
// non-personal scoping.

import "server-only";
import { Octokit } from "@octokit/rest";

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "DahianaSantiago";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "GiraSun";
const DEFAULT_BRANCH = process.env.GITHUB_DEFAULT_BRANCH || "main";

let _octokit: Octokit | null = null;

function octo(): Octokit {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error(
      "GITHUB_TOKEN env var missing. Create a fine-grained PAT with Contents:Write on the GiraSun repo and set it in Vercel + .env.local.",
    );
  }
  if (!_octokit) _octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  return _octokit;
}

export type CommitFile = {
  path: string;
  /** UTF-8 string content. Use base64-encoded content via the github API
   *  if you ever need to commit binaries. */
  content: string;
};

/**
 * Commit one or more files to a single branch. If a file already exists,
 * it's overwritten with the new content. Files that don't change are
 * skipped silently (no commit if all paths already match).
 */
export async function commitFiles({
  files,
  message,
  branch = DEFAULT_BRANCH,
}: {
  files: CommitFile[];
  message: string;
  branch?: string;
}): Promise<{ commit: string; html_url: string }> {
  const o = octo();

  // Resolve current branch tip.
  const { data: ref } = await o.git.getRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `heads/${branch}`,
  });
  const baseSha = ref.object.sha;

  const { data: baseCommit } = await o.git.getCommit({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    commit_sha: baseSha,
  });
  const baseTree = baseCommit.tree.sha;

  // Create blobs for each file.
  const blobs = await Promise.all(
    files.map(async (f) => {
      const { data } = await o.git.createBlob({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        content: f.content,
        encoding: "utf-8",
      });
      return { path: f.path, sha: data.sha };
    }),
  );

  // New tree pointing at the base tree + the new/updated blobs.
  const { data: newTree } = await o.git.createTree({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    base_tree: baseTree,
    tree: blobs.map((b) => ({
      path: b.path,
      mode: "100644",
      type: "blob",
      sha: b.sha,
    })),
  });

  // If the new tree equals the base tree (nothing changed), skip the commit.
  if (newTree.sha === baseTree) {
    return {
      commit: baseSha,
      html_url: `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${baseSha}`,
    };
  }

  const { data: newCommit } = await o.git.createCommit({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    message,
    tree: newTree.sha,
    parents: [baseSha],
  });

  await o.git.updateRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `heads/${branch}`,
    sha: newCommit.sha,
  });

  return { commit: newCommit.sha, html_url: newCommit.html_url };
}

/** Read a file's content from a branch (or null if it doesn't exist). */
export async function readFileFromRepo(
  path: string,
  branch = DEFAULT_BRANCH,
): Promise<string | null> {
  const o = octo();
  try {
    const { data } = await o.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      ref: branch,
    });
    if (Array.isArray(data) || data.type !== "file") return null;
    return Buffer.from(data.content, data.encoding as BufferEncoding).toString("utf-8");
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}
