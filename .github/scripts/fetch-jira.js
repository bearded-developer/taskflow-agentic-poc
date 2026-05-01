#!/usr/bin/env node

const required = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN", "JIRA_ISSUE_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    process.stderr.write(`Missing required env var: ${key}\n`);
    process.exit(1);
  }
}

const baseUrl = process.env.JIRA_BASE_URL.replace(/\/$/, "");
const issueKey = process.env.JIRA_ISSUE_KEY;

function toMarkdownText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map(toMarkdownText).join("\n");
  }

  if (typeof value === "object") {
    if (value.type === "text" && typeof value.text === "string") {
      return value.text;
    }

    if (Array.isArray(value.content)) {
      return value.content.map(toMarkdownText).join("\n");
    }
  }

  return "";
}

function normalizeDescription(description) {
  if (!description) return "";

  if (typeof description === "string") {
    return description.trim();
  }

  if (description.type === "doc" && Array.isArray(description.content)) {
    return description.content
      .map((block) => toMarkdownText(block).trim())
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
}

function normalizeAcceptanceCriteria(fields) {
  const candidateFields = [
    fields.customfield_10037,
    fields.customfield_10126,
    fields.acceptanceCriteria,
  ];

  for (const candidate of candidateFields) {
    if (!candidate) continue;

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    const richText = toMarkdownText(candidate).trim();
    if (richText) return richText;
  }

  return "";
}

async function fetchIssue() {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString("base64");
  const url = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jira request failed (${response.status}): ${body}`);
  }

  return response.json();
}

function asOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  const serialized = typeof value === "string" ? value : JSON.stringify(value);

  if (outputPath) {
    const fs = require("node:fs");
    fs.appendFileSync(outputPath, `${name}<<EOF\n${serialized}\nEOF\n`, "utf8");
    return;
  }

  process.stdout.write(`${name}=${serialized}\n`);
}

(async () => {
  try {
    const payload = await fetchIssue();
    const fields = payload.fields || {};

    const issue = {
      key: payload.key || issueKey,
      url: `${baseUrl}/browse/${payload.key || issueKey}`,
      summary: fields.summary || "",
      description: normalizeDescription(fields.description),
      acceptanceCriteria: normalizeAcceptanceCriteria(fields),
      storyPoints: fields.customfield_10016 ?? null,
      labels: fields.labels || [],
      issueType: fields.issuetype?.name || "",
      priority: fields.priority?.name || "",
      status: fields.status?.name || "",
    };

    asOutput("jira_json", JSON.stringify(issue));
    asOutput("jira_key", issue.key);
    asOutput("jira_url", issue.url);
  } catch (error) {
    process.stderr.write(`Failed to fetch Jira issue: ${error.message}\n`);
    process.exit(1);
  }
})();
