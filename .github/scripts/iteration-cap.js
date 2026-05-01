#!/usr/bin/env node

const { Octokit } = require("@octokit/rest");

const token = process.env.GITHUB_TOKEN;
const prNumber = Number(process.env.PR_NUMBER || "0");
const fallbackUser = process.env.HUMAN_FALLBACK_USER || "";
const maxRounds = Number(process.env.AI_REVIEW_MAX_ROUNDS || "5");

if (!token || !prNumber) {
  process.stderr.write("Missing required env vars: GITHUB_TOKEN and PR_NUMBER\n");
  process.exit(1);
}

const [owner, repo] = (process.env.GITHUB_REPOSITORY || "/").split("/");
if (!owner || !repo) {
  process.stderr.write("Missing or invalid GITHUB_REPOSITORY\n");
  process.exit(1);
}

function writeOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    process.stdout.write(`${name}=${value}\n`);
    return;
  }

  const fs = require("node:fs");
  fs.appendFileSync(outputPath, `${name}=${value}\n`, "utf8");
}

async function run() {
  const octokit = new Octokit({ auth: token });

  const reviews = await octokit.paginate(octokit.pulls.listReviews, {
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });

  const aiReviews = reviews.filter((review) => {
    const body = (review.body || "").toLowerCase();
    return body.includes("<!-- ai-reviewer-marker -->");
  });

  const comments = await octokit.paginate(octokit.issues.listComments, {
    owner,
    repo,
    issue_number: prNumber,
    per_page: 100,
  });

  const aiReviewComments = comments.filter((comment) => {
    const body = (comment.body || "").toLowerCase();
    return body.includes("<!-- ai-reviewer-marker -->");
  });

  const totalAiReviewRounds = aiReviews.length + aiReviewComments.length;
  const exceeded = totalAiReviewRounds >= maxRounds;

  if (exceeded && fallbackUser) {
    try {
      await octokit.issues.addAssignees({
        owner,
        repo,
        issue_number: prNumber,
        assignees: [fallbackUser],
      });
    } catch (error) {
      process.stderr.write(`Failed to assign fallback reviewer: ${error.message}\n`);
    }
  }

  writeOutput("skip_review", exceeded ? "true" : "false");
}

run().catch((error) => {
  process.stderr.write(`iteration-cap failure: ${error.message}\n`);
  process.exit(1);
});