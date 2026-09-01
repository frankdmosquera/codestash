import type { Manual } from "../types";

export const cicdBasics: Manual = {
  slug: "cicd-basics",
  title: "CI/CD Basics",
  subtitle:
    "Search or expand a section. Nested items (1.1, 1.2 ...) open inside their parent.",
  createdAt: "2026-08-27",
  sections: [
    // ============================================================
    // 1. WHAT CI AND CD ACTUALLY MEAN
    // ============================================================
    {
      id: "what-is-cicd",
      number: "1",
      title: "What CI and CD Actually Mean",
      children: [
        // 1.1 Continuous Integration
        {
          id: "what-is-ci",
          number: "1.1",
          title: "Continuous Integration (CI)",
          blocks: [
            {
              type: "p",
              text: "CI is the practice of automatically building and testing every change — usually on every push or pull request — instead of finding out something's broken after it's merged. The goal is to catch problems (failing tests, type errors, lint issues, a build that doesn't compile) as early and as automatically as possible.",
            },
          ],
        },
        // 1.2 Continuous Delivery vs Continuous Deployment
        {
          id: "what-is-cd",
          number: "1.2",
          title: "Continuous Delivery vs Continuous Deployment (CD)",
          blocks: [
            {
              type: "p",
              text: "Both get shortened to \"CD,\" but they're not quite the same thing:",
            },
            {
              type: "list",
              items: [
                "**Continuous Delivery** — every change that passes CI is automatically packaged and ready to release, but a human still clicks the button to actually ship it",
                "**Continuous Deployment** — every change that passes CI is automatically released to production, no manual approval step",
              ],
            },
            {
              type: "note",
              text: "Most teams land somewhere in between: automatic deploys to a staging/preview environment on every merge, but a manual approval (or at least a deliberate merge-to-main) gating production.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 2. THE TYPICAL PIPELINE SHAPE
    // ============================================================
    {
      id: "pipeline-shape",
      number: "2",
      title: "The Typical Pipeline Shape",
      blocks: [
        {
          type: "p",
          text: "For a frontend/Next.js project, a pipeline usually runs on two triggers:",
        },
        {
          type: "list",
          items: [
            "**On pull request** — lint, typecheck, test, build. Nothing gets deployed; this is purely \"does this change break anything.\"",
            "**On merge to main** — the same checks, plus an actual deploy to staging or production",
          ],
        },
        {
          type: "p",
          text: "GitHub Actions is the most common place to define this for a project already hosted on GitHub — workflows live as YAML files in `.github/workflows/`.",
        },
      ],
    },

    // ============================================================
    // 3. A REAL GITHUB ACTIONS WORKFLOW
    // ============================================================
    {
      id: "github-actions-workflow",
      number: "3",
      title: "A Real GitHub Actions Workflow",
      children: [
        // 3.1 Lint, typecheck, build on PR
        {
          id: "pr-checks-workflow",
          number: "3.1",
          title: "Lint + typecheck + build on every PR",
          blocks: [
            {
              type: "p",
              text: "Save this as `.github/workflows/ci.yml`. It runs on every pull request targeting `main`, and on pushes to `main` itself:",
            },
            {
              type: "code",
              code: `name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Build
        run: npm run build`,
            },
            {
              type: "note",
              text: "`cache: \"npm\"` on `setup-node` caches `~/.npm` between runs keyed on your lockfile, so `npm ci` is much faster on subsequent runs. `npm ci` (not `npm install`) is what you want in CI — it installs exactly what's in `package-lock.json` and fails if the lockfile is out of sync with `package.json`.",
            },
          ],
        },
        // 3.2 Splitting into parallel jobs
        {
          id: "parallel-jobs",
          number: "3.2",
          title: "Splitting into parallel jobs",
          blocks: [
            {
              type: "p",
              text: "As a project grows, running lint/typecheck/test/build as separate jobs (instead of sequential steps in one job) lets them run in parallel and gives you a clearer pass/fail per check in the PR UI:",
            },
            {
              type: "code",
              code: `name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run build`,
            },
            {
              type: "p",
              text: "Each job gets its own fresh runner and its own `npm ci`, so there's some duplicated setup cost — the tradeoff is speed (parallel) and clarity (three distinct checks) versus one longer sequential job.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 4. BRANCH PROTECTION BASICS
    // ============================================================
    {
      id: "branch-protection",
      number: "4",
      title: "Branch Protection Basics",
      blocks: [
        {
          type: "p",
          text: "CI checks are only useful if they can actually block a bad merge. On GitHub: **Settings → Branches → Add branch protection rule** for `main`.",
        },
        {
          type: "p",
          text: "**Rules worth turning on:**",
        },
        {
          type: "list",
          items: [
            "Require a pull request before merging — no direct pushes to `main`",
            "Require status checks to pass before merging — select the job names from your workflow (e.g. `lint`, `typecheck`, `build`)",
            "Require branches to be up to date before merging — forces a PR to re-run CI against the latest `main`, not a stale base",
            "Require at least one approving review",
            "Do not allow bypassing the above settings — otherwise admins can quietly skip the rules",
          ],
        },
        {
          type: "note",
          text: "The status checks you require have to match a workflow **job's** name (or a `name:` you set on it), not the workflow file's name. If you rename a job, update the required check in branch protection too, or the rule silently stops matching anything.",
        },
      ],
    },

    // ============================================================
    // 5. ENVIRONMENTS & SECRETS
    // ============================================================
    {
      id: "environments-secrets",
      number: "5",
      title: "Environments & Secrets",
      children: [
        // 5.1 Repo secrets
        {
          id: "repo-secrets",
          number: "5.1",
          title: "Repository secrets",
          blocks: [
            {
              type: "p",
              text: "**Settings → Secrets and variables → Actions** is where you store values a workflow needs but that shouldn't live in the repo — API keys, deploy tokens, database URLs. Reference them in a workflow with `${{ secrets.NAME }}`; GitHub masks their value in logs automatically.",
            },
            {
              type: "code",
              code: `      - name: Deploy
        run: npm run deploy
        env:
          DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}`,
            },
          ],
        },
        // 5.2 GitHub Environments
        {
          id: "github-environments",
          number: "5.2",
          title: "GitHub Environments",
          blocks: [
            {
              type: "p",
              text: "An **Environment** (Settings → Environments) is a named deploy target — `staging`, `production` — that can have its own secrets, its own required reviewers before a job targeting it can run, and its own deployment history/log. A job opts in with `environment: production`; if that environment requires approval, the job pauses until someone approves it.",
            },
            {
              type: "code",
              code: `jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: npm run deploy
        env:
          DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}`,
            },
            {
              type: "note",
              text: "This is the standard way to get \"CI runs automatically, but production deploys need a human to approve\" — Continuous Delivery rather than full Continuous Deployment — without hand-rolling an approval step yourself.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 6. A SIMPLE DEPLOY STEP
    // ============================================================
    {
      id: "deploy-step",
      number: "6",
      title: "A Simple Deploy Step",
      children: [
        // 6.1 Vercel: often nothing to configure
        {
          id: "vercel-deploy",
          number: "6.1",
          title: "Deploying to Vercel",
          blocks: [
            {
              type: "p",
              text: "If your project is imported into Vercel and connected to the GitHub repo, Vercel deploys automatically on every push — a preview deployment per PR, and a production deployment on merges to `main` — with no GitHub Actions workflow required at all. GitHub Actions in that setup is typically just for the lint/typecheck/test gate, run independently of the deploy.",
            },
            {
              type: "p",
              text: "If you want the deploy triggered explicitly from a workflow instead (e.g. to control ordering, or deploy only after other checks pass), use the Vercel CLI with a token:",
            },
            {
              type: "code",
              code: `      - name: Deploy to Vercel
        run: |
          npm install --global vercel
          vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=\${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --prod --token=\${{ secrets.VERCEL_TOKEN }}`,
            },
          ],
        },
        // 6.2 Deploy hook (any host)
        {
          id: "deploy-hook",
          number: "6.2",
          title: "A generic deploy hook",
          blocks: [
            {
              type: "p",
              text: "Many hosts (Vercel, Netlify, Render, Railway) expose a **deploy hook** — a unique URL that triggers a new deploy when you `POST` to it. This is the simplest possible \"deploy from CI\" step, and it doesn't require any deploy-provider CLI or auth token beyond the URL itself (treat the URL as a secret — anyone with it can trigger a deploy):",
            },
            {
              type: "code",
              code: `      - name: Trigger deploy
        run: curl -X POST "\${{ secrets.DEPLOY_HOOK_URL }}"`,
            },
            {
              type: "p",
              text: "Put this step in a job that only runs after your lint/typecheck/build jobs succeed, and only on pushes to `main`:",
            },
            {
              type: "code",
              code: `jobs:
  build:
    # ...lint/typecheck/build steps

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Trigger deploy
        run: curl -X POST "\${{ secrets.DEPLOY_HOOK_URL }}"`,
            },
            {
              type: "note",
              text: "`needs: build` makes the `deploy` job wait for `build` to succeed first — if the build job fails, `deploy` never runs. The `if:` condition restricts the deploy to `main`, so it doesn't fire on every PR branch.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 7. CACHING TO SPEED UP CI
    // ============================================================
    {
      id: "caching",
      number: "7",
      title: "Caching to Speed Up CI",
      blocks: [
        {
          type: "p",
          text: "`actions/setup-node`'s built-in `cache: \"npm\"` covers most projects — it caches the npm download cache keyed on your lockfile. For Next.js specifically, caching the `.next/cache` directory between runs can meaningfully speed up rebuilds:",
        },
        {
          type: "code",
          code: `      - name: Cache Next.js build cache
        uses: actions/cache@v4
        with:
          path: .next/cache
          key: nextjs-\${{ runner.os }}-\${{ hashFiles('package-lock.json') }}-\${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
          restore-keys: |
            nextjs-\${{ runner.os }}-\${{ hashFiles('package-lock.json') }}-`,
        },
        {
          type: "note",
          text: "Cache keys need to be specific enough that a stale cache never gets reused across incompatible builds, but general enough (via `restore-keys`) to still get a partial cache hit when nothing matches exactly.",
        },
      ],
    },

    // ============================================================
    // 8. READING A FAILED CHECK
    // ============================================================
    {
      id: "reading-failures",
      number: "8",
      title: "Reading a Failed Check",
      blocks: [
        {
          type: "list",
          items: [
            "Open the PR's \"Checks\" tab (or the red X next to a commit) and click into the failing job",
            "GitHub Actions logs are step-by-step — expand the specific step that failed rather than scrolling the whole log",
            "A failure in `npm ci` almost always means `package-lock.json` is out of sync with `package.json` — regenerate it locally and commit",
            "A failure only in CI and not locally often means an environment difference: a missing env var/secret, a different Node version, or a case-sensitivity issue (CI runners are Linux; imports that only differ by case can pass on macOS/Windows locally and fail in CI)",
            "Re-run a single failed job from the Actions UI once you believe the fix landed, instead of pushing an empty commit just to retrigger everything",
          ],
        },
      ],
    },

    // ============================================================
    // 9. A MINIMAL CHECKLIST
    // ============================================================
    {
      id: "checklist",
      number: "9",
      title: "A Minimal Checklist",
      blocks: [
        {
          type: "list",
          items: [
            "A workflow that runs lint + typecheck + build on every PR",
            "Branch protection on `main` requiring that workflow to pass before merge",
            "Secrets stored in GitHub, never committed to the repo",
            "A `production` environment with required reviewers if deploys should be manually gated",
            "A deploy step (platform-native, CLI, or a deploy hook) that only runs after checks pass and only on `main`",
          ],
        },
      ],
    },
  ],
};
