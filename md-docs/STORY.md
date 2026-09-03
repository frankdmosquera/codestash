# Codestash — The Story

How this project actually came to be, told as it happened. This is
deliberately kept separate from procedures/instructions (see `CLAUDE.md`
and `md-docs/ROLES-AND-BILLING-PLAN.md` for those) — this file is just the story,
so it stays readable instead of turning into a spec.

## Part One: How It's Born

It didn't start as an app idea. It started as annoyance: having to
remember (or look up) Git/GitHub terminal commands every time, when it's
really just a handful of words you'd rather copy-paste than memorize.
That need — a fast place to grab the command you needed — came first.

From there, the idea generalized: it's not just Git commands you want
quick access to, it's any small thing — a code snippet, a hook, a helper
you wrote once and now can't find. So the scope widened from "my Git
cheat sheet" to "anywhere I stash reusable code" — which is where the
name came from: **Codestash**.

The first real shape of it was small on purpose: a single self-contained
HTML file, inline styles and JS, no build step — with an accordion so you
could expand just the snippet you needed and ignore the rest. Fast,
disposable, zero setup.

Today it's grown past that into an actual web app — Next.js, a real
database, accounts, workspaces. That's the arc: annoyance with Git
commands → generalized into "a stash for any snippet" → a quick
single-file HTML doc → a full web app.

## Part Two: Where the Redesign Came From

It started as UI work — the sidebar category buttons needed
drag-and-drop, and a scrollbar for when a category had too many sub-items
to fit. Small, contained fixes.

But working through those UI questions kept surfacing something
underneath: the problem wasn't really the buttons. Who could drag, who
could invite, how many categories a workspace could have, what a
"member" versus an "owner" was even allowed to do — none of that was
actually decided anywhere. The UI kept asking questions the architecture
didn't have answers for yet.

That's the moment it turned from "fix the sidebar" into "we need to
redesign this." The goal for the redesign: good user experience, first
and foremost — and getting there means going back and rethinking the
architecture underneath it, not just patching the UI on top of what's
already there.

---

More parts to come as the redesign itself takes shape — the actual
architectural plan is its own conversation, not part of this story.
