# Project Rules

Conventions agreed on for this project specifically, on top of the global rules in `coding/CLAUDE.md`. Appended as new ones come up — newest at the bottom.

## Rule 1 — Server Components first

Default every component to a Server Component. Only mark something `"use client"` when it genuinely needs client-side behavior (state, effects, event handlers, browser-only APIs, or a library that requires it, like `motion`'s `whileInView`).

When a section needs a client-only piece (e.g. a scroll-triggered animation), don't promote the whole section to `"use client"`. Push the boundary down to the smallest possible wrapper, and pass the static server-rendered markup into it via `children` (or props) — the client wrapper owns only the interactive behavior, everything else still renders on the server.
