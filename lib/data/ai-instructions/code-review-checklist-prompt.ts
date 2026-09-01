import type { Snippet } from "../types";

export const codeReviewChecklistPrompt: Snippet = {
  slug: "code-review-checklist-prompt",
  title: "Code Review Checklist Prompt",
  description:
    "Reviews a diff against correctness, security, test coverage, readability, and complexity — findings ranked by severity.",
  createdAt: "2026-08-29",
  code: `Review the following diff as a thorough, skeptical senior engineer. Go
through each checklist category below, then report findings ranked by
severity. Do not just summarize the diff — actively look for problems.

## Checklist

### 1. Correctness
- Does the code do what it claims to do? Trace the logic, don't skim it.
- Off-by-one errors, incorrect boundary conditions, wrong operator
  (\`&&\` vs \`||\`, \`<\` vs \`<=\`).
- Unhandled null/undefined/empty-array cases.
- Race conditions in async code; missing \`await\`; unhandled promise
  rejections.
- Error handling that swallows failures silently or catches too broadly.

### 2. Security
- Injection: SQL/NoSQL/command injection from unsanitized input reaching
  a query or shell call.
- XSS: unescaped user input rendered as HTML, \`dangerouslySetInnerHTML\`
  without sanitization, unsafe \`eval\`/\`new Function\`.
- Auth/authorization: missing permission checks, trusting client-supplied
  IDs/roles, broken object-level authorization (one user reading/editing
  another's data).
- Secrets: hardcoded API keys/tokens/passwords, secrets logged or sent to
  the client.
- Unvalidated redirects, SSRF-prone outbound requests, insecure
  deserialization.

### 3. Test Coverage
- Are new code paths covered by tests, including error/edge cases — not
  just the happy path?
- Do existing tests still meaningfully cover the changed behavior, or did
  the diff silently break an assertion's intent?
- Is anything untestable as written (tightly coupled to I/O, hidden
  globals) that should be restructured?

### 4. Readability
- Can a new engineer understand this without asking the author?
- Naming: are variables/functions named for what they represent, not
  abbreviated or misleading?
- Is control flow easy to follow, or buried in deep nesting / early
  mutation of shared state?
- Are comments explaining *why*, not restating *what* the code already
  says?

### 5. Unnecessary Complexity
- Is there a simpler way to achieve the same result with less code or
  fewer moving parts?
- Speculative abstraction: generic/configurable code built for a
  flexibility nothing currently needs.
- Duplicated logic that should be extracted, or premature extraction that
  fragments a simple flow across too many files/functions.

## Output format

Report findings grouped by severity, most severe first:

**Critical** — bugs that break functionality, security vulnerabilities,
data loss/corruption risks. These block merging.

**Major** — real problems that should be fixed before merge but aren't
actively dangerous (missing error handling, meaningful test gaps).

**Minor** — worth fixing, not blocking (naming, readability, minor
duplication).

**Nit** — optional polish.

For each finding: cite the file and line/function, explain the problem
concretely (not just "this could be better"), and suggest a fix. If a
category has no findings, say so briefly instead of omitting it — that
confirms it was actually checked. End with a one-line overall verdict:
approve, approve with comments, or request changes.
`,
};
