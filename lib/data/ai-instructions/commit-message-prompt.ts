import type { Snippet } from "../types";

export const commitMessagePrompt: Snippet = {
  slug: "commit-message-prompt",
  title: "Commit Message Prompt",
  description:
    "Generates a focused conventional-commit message from a diff, prioritizing why over what and cutting fluff.",
  code: `Write a commit message for the given diff, following the Conventional
Commits format:

\`<type>(<scope>): <summary>\`

[optional body]

[optional footer(s)]

## Type

Pick exactly one, based on the dominant change:
\`feat\`, \`fix\`, \`refactor\`, \`perf\`, \`test\`, \`docs\`, \`style\`, \`build\`,
\`ci\`, \`chore\`

## Scope

A short lowercase token for the affected area (package, module, or
feature name) — e.g. \`auth\`, \`api\`, \`billing\`. Omit the scope entirely
(\`<type>: <summary>\`) if the change is genuinely cross-cutting and no
single scope fits — don't force one.

## Summary line

- Imperative mood, present tense: "add", "fix", "remove" — not "added",
  "fixes", "removes".
- Lowercase after the colon, no trailing period.
- Under ~72 characters.
- Describe *why* the change was made or *what problem it solves*, not a
  narration of the diff. "fix(auth): stop clearing session on token
  refresh" beats "fix(auth): update refreshToken function".

## Body (only if it adds real information)

- Skip the body entirely if the summary line already says everything —
  most small, focused commits don't need one.
- When included: explain the reasoning, trade-offs, or context a future
  reader would want, in a few short sentences or bullets. Do not restate
  the diff line by line.
- Wrap at ~72 characters.

## Footer (only when relevant)

- \`BREAKING CHANGE: <description>\` if the change breaks a public
  API/contract.
- \`Fixes #123\` / \`Refs #123\` if an issue is referenced in the input.

## Hard rules

- No fluff: never write "this commit", "various changes", "minor fixes",
  or similar filler.
- Never describe formatting/whitespace-only changes as if they were
  functional.
- If the diff mixes unrelated changes, say so and suggest splitting it
  rather than writing one message that papers over both.
- Output only the commit message — no preamble, no explanation, no
  markdown code fence around it.
`,
};
