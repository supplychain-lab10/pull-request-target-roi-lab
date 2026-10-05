function assertStringArray(value, field) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new TypeError(`${field} must be an array of strings.`);
  }
}

export function validatePolicy(policy) {
  if (!policy || typeof policy !== "object") {
    throw new TypeError("The triage policy must be an object.");
  }
  if (!policy.labels || typeof policy.labels !== "object") {
    throw new TypeError("The triage policy must define labels.");
  }
  if (!Array.isArray(policy.rules)) {
    throw new TypeError("The triage policy must define rules.");
  }
  if (!policy.labels[policy.fallbackLabel]) {
    throw new Error(`Fallback label is not defined: ${policy.fallbackLabel}`);
  }
  if (!Number.isInteger(policy.largeChangeThreshold) || policy.largeChangeThreshold < 1) {
    throw new TypeError("largeChangeThreshold must be a positive integer.");
  }

  for (const rule of policy.rules) {
    if (!policy.labels[rule.label]) {
      throw new Error(`Rule refers to an undefined label: ${rule.label}`);
    }
    assertStringArray(rule.prefixes ?? [], `${rule.label}.prefixes`);
    assertStringArray(rule.suffixes ?? [], `${rule.label}.suffixes`);
  }

  return policy;
}

function ruleMatches(filename, rule) {
  const prefixes = rule.prefixes ?? [];
  const suffixes = rule.suffixes ?? [];
  return prefixes.some((prefix) => filename.startsWith(prefix)) ||
    suffixes.some((suffix) => filename.endsWith(suffix));
}

export function classifyFiles(files, unvalidatedPolicy) {
  assertStringArray(files, "files");
  const policy = validatePolicy(unvalidatedPolicy);
  const labels = new Set();

  for (const rule of policy.rules) {
    if (files.some((filename) => ruleMatches(filename, rule))) {
      labels.add(rule.label);
    }
  }

  if (labels.size === 0) labels.add(policy.fallbackLabel);
  if (files.length >= policy.largeChangeThreshold) labels.add("size: large");
  return [...labels];
}

export function buildComment({ author, files, labels, sourceMarker, isFork }) {
  if (typeof author !== "string" || !/^[A-Za-z0-9-]+(?:\[bot\])?$/.test(author)) {
    throw new TypeError("author must be a GitHub login.");
  }
  assertStringArray(files, "files");
  assertStringArray(labels, "labels");
  if (typeof sourceMarker !== "string" || !/^[A-Z0-9_]+$/.test(sourceMarker)) {
    throw new TypeError("sourceMarker must be a trusted marker value.");
  }
  if (typeof isFork !== "boolean") {
    throw new TypeError("isFork must be a boolean.");
  }

  return [
    "<!-- pull-request-target-roi-lab -->",
    `Thanks @${author}! The maintainer’s PR triage is already done.`,
    "",
    "## 2. The bot handled the paperwork",
    "",
    `**Applied labels:** ${labels.map((label) => `\`${label}\``).join(", ")}.`,
    `**Reviewed file names:** ${files.length}. The bot classified names from GitHub’s API; it did not open or execute the changed source files.`,
    "",
    `This PR came from ${isFork ? "an external fork" : "a branch in the base repository"}.`,
    "**What the audience should see:** a contributor’s broken calculation can fail CI while the trusted bot still completes useful PR triage.",
    "",
    "| Job | Whose code does it run? | What does it do? |",
    "| --- | --- | --- |",
    "| `01` — Test the contribution (`pull_request`) | The proposed contribution | Test whether three $20 tickets cost $60 |",
    "| `02` — Triage (`pull_request_target`) | Our trusted base-branch bot | Apply labels and post this comment |",
    "",
    "This comment proves the metadata write. It does not claim that CI has completed or passed: open the **01 - Test the contributor’s code** check for its actual result. A fork check may first need maintainer approval.",
    "",
    "**Why two workflows?** Testing needs the contributor’s code. Writing PR metadata needs our repository’s permission. We keep those jobs separate.",
    "",
    "<details><summary>Technical evidence</summary>",
    "",
    `Trusted checkout marker: \`${sourceMarker}\`.`,
    "The test workflow requests `contents: read`. The trusted bot requests `contents: read`, `issues: write` and `pull-requests: write`. Neither workflow passes repository secrets.",
    "",
    "</details>",
  ].join("\n");
}
