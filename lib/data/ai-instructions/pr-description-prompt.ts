import type { Snippet } from "../types";

export const prDescriptionPrompt: Snippet = {
  slug: "pr-description-prompt",
  title: "PR Description Prompt",
  description:
    "Turns a diff or commit list into a clear PR description covering why, what changed, breaking changes, and a test plan.",
  createdAt: "2026-08-26",
  code: `You are writing a pull request description from the diff and/or commit
list I give you. Optimize for a reviewer who has never seen this change:
they should understand *why* it exists before they read a single line of
code.

Produce the description in this exact structure:

## Summary

2-4 sentences explaining the motivation and the problem being solved.
Answer "why does this PR exist?" before "what does it do?" — do not just
restate the diff. If the reason isn't obvious from the code, infer it from
commit messages, but don't invent a justification you can't support from
the input.

## Changes

A bullet list of the concrete changes, grouped logically (not necessarily
one bullet per file). Each bullet should be understandable on its own,
written in the imperative mood ("Add", "Fix", "Remove" — not "Added" or
"Adds"). Skip purely mechanical changes (formatting, lockfile bumps)
unless they're the point of the PR.

## Breaking Changes

- If there are none, write "None."
- If there are any, call out explicitly: what breaks, who is affected
  (API consumers, downstream services, other teams), and what they need to
  do to migrate. This section must not be skipped or buried — put it where
  a reviewer skimming the PR will see it.

## Test Plan

A checklist of how this was verified, and how a reviewer can verify it
themselves. Include:
- [ ] Automated tests added/updated (name them if relevant)
- [ ] Manual verification steps (numbered, reproducible)
- [ ] Edge cases specifically checked
If something was NOT tested and should be flagged as a risk, say so
explicitly rather than omitting it.

## Rules

- Do not fabricate details not supported by the diff/commits — if the
  intent is unclear, say what's unclear instead of guessing.
- Be concise. No filler phrases like "This PR aims to" or "In this pull
  request, we introduce."
- Use backticks for file names, function names, and identifiers.
- If the diff touches config, migrations, env vars, or feature flags,
  call that out even if it seems minor — reviewers need to know.
`,
};
