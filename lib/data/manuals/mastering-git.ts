import type { Manual } from "../types";

export const masteringGit: Manual = {
  slug: "mastering-git",
  title: "Mastering Git",
  subtitle:
    "Search or expand a section. Nested items (1.1, 1.2 ...) open inside their parent.",
  createdAt: "2026-08-20",
  sections: [
    // ============================================================
    // 1. GIT BASICS
    // ============================================================
    {
      id: "basics",
      number: "1",
      title: "Git Basics",
      blocks: [
        {
          type: "p",
          text: "Git is a version control system that allows you to track changes in your code and collaborate with others efficiently.",
        },
        { type: "p", text: "**Great for:**" },
        {
          type: "list",
          items: [
            "Staging Area",
            "Undoing Mistakes",
            "Integration with Other Tools",
            "Community and Support",
            "Standard in the Industry",
            "Version Control",
            "Collaboration",
            "Branching & Merging",
            "Distributed System",
            "Tracking Changes",
          ],
        },
      ],
    },

    // ============================================================
    // 2. GIT CONFIG
    // ============================================================
    {
      id: "config",
      number: "2",
      title: "Git Config",
      children: [
        // 2.1 git --version
        {
          id: "config-version",
          number: "2.1",
          title: "git --version",
          blocks: [
            { type: "p", text: "Checks the installed Git version." },
            { type: "code", code: "git --version" },
          ],
        },
        // 2.2 git config --global user.name
        {
          id: "config-username",
          number: "2.2",
          title: "git config --global user.name",
          blocks: [
            {
              type: "p",
              text: "Checks the configured name. To change it, add the name:",
            },
            { type: "code", code: 'git config --global user.name "heguer"' },
          ],
        },
        // 2.3 git config --global user.email
        {
          id: "config-email",
          number: "2.3",
          title: "git config --global user.email",
          blocks: [
            {
              type: "p",
              text: "Checks the configured email. To change it, add the email:",
            },
            {
              type: "code",
              code: 'git config --global user.email "heguer76@gmail.com"',
            },
          ],
        },
      ],
    },

    // ============================================================
    // 3. START A REPO
    // ============================================================
    {
      id: "start-repo",
      number: "3",
      title: "Start a Repo",
      children: [
        // 3.1 git init
        {
          id: "git-init",
          number: "3.1",
          title: "git init",
          blocks: [
            {
              type: "p",
              text: "Initializes a new Git repository. This command creates a new Git repository in the current directory and sets up the basic files and directories needed to start tracking changes.",
            },
            {
              type: "note",
              text: "Running `git init` again in the same folder doesn't create a new repo — it reinitializes the existing one. Multiple repos require separate folders, each with its own `git init`.",
            },
            {
              type: "p",
              text: "`git init` and `git init .` do the same thing (`.` is the default target). `git init <path>` creates and initializes a new folder instead.",
            },
          ],
        },
        // 3.2 git config --global init.defaultBranch main
        {
          id: "default-branch",
          number: "3.2",
          title: "git config --global init.defaultBranch main",
          blocks: [
            {
              type: "p",
              text: "Sets the default branch name for new repositories you create — so now the new name should be `main`.",
            },
            { type: "code", code: "git config --global init.defaultBranch main" },
            {
              type: "p",
              text: "**What it does:** Sets the name Git uses for the initial branch whenever you run `git init` on a new repo — instead of Git's older default (`master`), new repos will start with a branch called `main`.",
            },
            {
              type: "p",
              text: "**Why it matters:** GitHub, GitLab, and most modern tooling default to `main` now, so this keeps your local setup consistent with what you'll push to.",
            },
            {
              type: "p",
              text: "**Scope:** `--global` means it applies to every new repo you init on this machine going forward — it does not rename branches in repos you already created.",
            },
            { type: "p", text: "**To check branch name:**" },
            { type: "code", code: "git config --global init.defaultBranch" },
            { type: "p", text: "**To change name (master → main):**" },
            { type: "code", code: "git branch -m master main" },
          ],
        },
      ],
    },

    // ============================================================
    // 4. WORK ON THE REPO
    // ============================================================
    {
      id: "work-on-repo",
      number: "4",
      title: "Work on the Repo",
      children: [
        // 4.1 git status
        {
          id: "git-status",
          number: "4.1",
          title: "git status",
          blocks: [
            { type: "code", code: "git status" },
            {
              type: "p",
              text: "Say we create a couple files in the tracked folder — it will show them as untracked files and ask if you want to include them.",
            },
          ],
        },
        // 4.2 git add [file/directory]
        {
          id: "git-add-path",
          number: "4.2",
          title: "git add [file/directory]",
          blocks: [
            { type: "code", code: "git add <file-or-directory>" },
            {
              type: "p",
              text: "Prepares the changes for the next commit. This starts tracking a file or directory.",
            },
          ],
        },
        // 4.3 git add .
        {
          id: "git-add-dot",
          number: "4.3",
          title: "git add .",
          blocks: [
            { type: "code", code: "git add ." },
            {
              type: "p",
              text: "Adds everything in the repository (new files, modified files, and deletions). The command used most often.",
            },
          ],
        },
        // 4.4 git add -A
        {
          id: "git-add-a",
          number: "4.4",
          title: "git add -A",
          blocks: [
            { type: "code", code: "git add -A" },
            {
              type: "p",
              text: "Adds everything in the repository (new files, modified files, and deletions).",
            },
          ],
        },
        // 4.5 git commit -m "commit message"
        {
          id: "git-commit",
          number: "4.5",
          title: 'git commit -m "commit message"',
          blocks: [
            { type: "code", code: 'git commit -m "commit message"' },
            {
              type: "p",
              text: "Creates a new commit with a message describing the changes made, capturing the changes made to your local repository.",
            },
          ],
        },
        // 4.6 git log
        {
          id: "git-log",
          number: "4.6",
          title: "git log",
          blocks: [
            { type: "code", code: "git log" },
            {
              type: "p",
              text: "Shows a list of all commits in the repository — displaying the author, date, and commit message for each.",
            },
            {
              type: "p",
              text: "At the very bottom you'll see something like this:",
            },
            {
              type: "code",
              code: `~

(END)
commit e36ad272b950404daa3e38fee01c0343d53119cb (HEAD -> master)
Author: heguerack <heguer76@gmail.com>
Date: Tue Aug 4 16:50:13 2026 -0600

    add all files at once, to be tracked

~`,
            },
            {
              type: "p",
              text: "From here we can get the commit id. Using the commit id from `git log`, we can jump to that snapshot — basically going back to that point in time.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 5. GIT ADVANCED
    // ============================================================
    {
      id: "advanced",
      number: "5",
      title: "Git Advanced",
      children: [
        // 5.1 Moving to a different commit
        {
          id: "checkout-commit",
          number: "5.1",
          title: "Moving to a different commit (DOM)",
          blocks: [
            {
              type: "code",
              code: "git checkout e36ad272b950404daa3e38fee01c0343d53119cb",
            },
            {
              type: "p",
              text: "This takes us to that point in time — the snapshot.",
            },
          ],
        },
        // 5.2 git checkout .
        {
          id: "checkout-dot",
          number: "5.2",
          title: "git checkout .",
          blocks: [
            { type: "code", code: "git checkout ." },
            {
              type: "p",
              text: "Say you're working on the project and don't want those changes. Instead of going back to a specific commit, use `git checkout .` to discard changes and start over.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 6. GITHUB
    // ============================================================
    {
      id: "github",
      number: "6",
      title: "GitHub",
      blocks: [
        {
          type: "p",
          text: "To work with others remotely. So far it's been local dev — when you run `git init`, you initialize locally.",
        },
      ],
      children: [
        // 6.1 Start a repo on GitHub
        {
          id: "github-start-repo",
          number: "6.1",
          title: "Start a repo on GitHub",
          blocks: [
            {
              type: "p",
              text: "Make sure your local repo is on `main` or `master` first.",
            },
          ],
        },
        // 6.2 git remote add origin
        {
          id: "github-remote-add",
          number: "6.2",
          title: "git remote add origin",
          blocks: [
            {
              type: "code",
              code: `git remote add origin https://github.com/frankdmosquera/mastering-git.git

git branch -M main
git push -u origin main`,
            },
            {
              type: "p",
              text: "This is the first block GitHub gives you when pushing an existing repo from the command line — you can run all three at once.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 7. BRANCHING
    // ============================================================
    {
      id: "branching",
      number: "7",
      title: "Branching",
      children: [
        // 7.1 git branch
        {
          id: "git-branch",
          number: "7.1",
          title: "git branch",
          blocks: [
            { type: "code", code: "git branch" },
            {
              type: "p",
              text: "Lists all the branches in the current repository. Shows the current branch you're on, highlighted with an asterisk.",
            },
          ],
        },
        // 7.2 git branch new-branch
        {
          id: "git-branch-new",
          number: "7.2",
          title: "git branch new-branch",
          blocks: [
            { type: "code", code: "git branch new-branch" },
            {
              type: "p",
              text: "Creates a new branch, but doesn't switch you to it.",
            },
          ],
        },
        // 7.3 git checkout new-branch
        {
          id: "git-checkout-new",
          number: "7.3",
          title: "git checkout new-branch",
          blocks: [
            { type: "code", code: "git checkout new-branch" },
            { type: "p", text: "Switches you to the newly created branch." },
          ],
        },
        // 7.4 git checkout -b new-branch-name
        {
          id: "git-checkout-b",
          number: "7.4",
          title: "git checkout -b new-branch-name",
          blocks: [
            { type: "code", code: "git checkout -b new-branch-name" },
            {
              type: "p",
              text: "Creates the branch and switches you to it in one step. Note: it branches off whatever branch you're currently on — not necessarily main — so be careful depending on what you're doing.",
            },
          ],
        },
        // 7.5 git branch new-branch-name some-other-branch
        {
          id: "git-branch-from",
          number: "7.5",
          title: "git branch new-branch-name some-other-branch",
          blocks: [
            {
              type: "code",
              code: "git branch new-branch-name some-other-branch",
            },
            {
              type: "p",
              text: "Creates a branch from a selected branch — no need to checkout first.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 8. LOCAL COMMITS VS (CLOUD) GITHUB
    // ============================================================
    {
      id: "local-vs-cloud",
      number: "8",
      title: "Local Commits vs (Cloud) GitHub",
      children: [
        // 8.1 git push --set-upstream origin feature-branch
        {
          id: "push-upstream",
          number: "8.1",
          title: "git push --set-upstream origin feature-branch",
          blocks: [
            { type: "code", code: "git push --set-upstream origin feature-branch" },
            {
              type: "p",
              text: "Pushes to GitHub and keeps things in sync. `git push -u origin feature-branch` is an alternative shorthand.",
            },
            { type: "code", code: "git push -u origin feature-branch" },
          ],
        },
        // 8.2 git push
        {
          id: "git-push",
          number: "8.2",
          title: "git push",
          blocks: [
            { type: "code", code: "git push" },
            { type: "p", text: "Once linked, you can just run `git push`." },
          ],
        },
        // 8.3 git pull
        {
          id: "git-pull",
          number: "8.3",
          title: "git pull",
          blocks: [
            { type: "code", code: "git pull" },
            {
              type: "p",
              text: "Fetches changes from the remote repo. If someone makes changes on GitHub, this brings you up to date.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 9. MERGING BACK TO MAIN
    // ============================================================
    {
      id: "merging-main",
      number: "9",
      title: "Merging Back to Main",
      blocks: [
        {
          type: "p",
          text: "The idea: sync main so it gets the changes from feature-branch, once the feature is tested and confirmed good.",
        },
        {
          type: "list",
          items: [
            'Go to "Compare and pull requests" or "Pull requests" in the nav menu',
            'Click "New"',
            "Compare: feature-branch (from) → base: main",
            'It will show something like: "Showing 1 changed file with 11 additions and 0 deletions"',
            "If everything looks good, click Create pull request",
            "The team lead or senior dev reviews and clicks Merge pull request",
            "Confirm merge",
            "At this point, the feature-branch can be deleted — everything is in main on GitHub",
          ],
        },
        {
          type: "note",
          text: "But here's the catch: locally, you still have that extra branch, and main hasn't been merged locally either! Just run `git pull` — all the GitHub changes become active locally.",
        },
      ],
    },

    // ============================================================
    // 10. TYPICAL WORKFLOW
    // ============================================================
    {
      id: "workflow",
      number: "10",
      title: "Typical Workflow",
      blocks: [
        {
          type: "list",
          items: [
            "Clone the repo",
            "Create a new branch from main (or another branch)",
            "Make your changes",
            "Push the branch to the remote repo",
            "Open a pull request",
            "Merge the changes",
            "Pull the merged changes into your local main branch",
          ],
        },
      ],
    },
  ],
};
