import type { Manual } from "../types";

export const debuggingNextjs: Manual = {
  slug: "debugging-nextjs",
  title: "Debugging Next.js Apps",
  subtitle:
    "Search or expand a section. Nested items (1.1, 1.2 ...) open inside their parent.",
  sections: [
    // ============================================================
    // 1. READING THE ERROR OVERLAY
    // ============================================================
    {
      id: "error-overlay",
      number: "1",
      title: "Reading the Error Overlay",
      children: [
        // 1.1 What it is
        {
          id: "overlay-what",
          number: "1.1",
          title: "What it is",
          blocks: [
            {
              type: "p",
              text: "In `next dev`, an unhandled error in a Client Component render shows a full-screen overlay in the browser with the error message, a component stack, and a source-mapped stack trace pointing at your actual TypeScript/JSX source — not the compiled output. It only appears in development; in production the same error just fails silently or shows your `error.tsx` boundary.",
            },
          ],
        },
        // 1.2 Server-side render errors
        {
          id: "overlay-server-errors",
          number: "1.2",
          title: "Errors thrown during a server render",
          blocks: [
            {
              type: "p",
              text: "An error thrown while rendering a Server Component (or during `generateMetadata`, a Server Action, etc.) shows up two places: the **full stack trace in your terminal**, where `next dev` is running, and a **redacted overlay in the browser** that omits implementation details on purpose — server errors can leak sensitive information (stack traces referencing internal paths, env values, query text), so the client-visible version is intentionally generic. Always check the terminal for the real message.",
            },
          ],
        },
        // 1.3 The build-time error overlay
        {
          id: "overlay-build",
          number: "1.3",
          title: "Type and lint errors in the overlay",
          blocks: [
            {
              type: "p",
              text: "`next dev` also surfaces TypeScript type errors and (depending on config) ESLint errors as an overlay, separate from runtime errors — these come from the compiler/type-checker, not from code actually executing. Fixing the reported file/line clears the overlay on the next save; unlike runtime errors, nothing in your code needs to *run* to trigger this class.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 2. SERVER vs CLIENT: WHERE console.log ACTUALLY GOES
    // ============================================================
    {
      id: "console-log-location",
      number: "2",
      title: "Server vs Client: Where console.log Actually Goes",
      blocks: [
        {
          type: "p",
          text: "This trips up almost everyone the first time: a `console.log` inside a Server Component does **not** print to the browser console — it prints to the **terminal** where `next dev` (or your server process) is running, because that's where the code actually executed.",
        },
        {
          type: "list",
          items: [
            "**Server Component / server-only code (`page.tsx`, `layout.tsx` without `\"use client\"`, Server Actions, Route Handlers)** → logs appear in the terminal running `next dev`, never in the browser devtools console",
            "**Client Component (`\"use client\"`) code, including its initial server-rendered pass** → logs appear in **both** places: once in the terminal (from the SSR pass that ran the component on the server for the initial HTML) and again in the browser console (from hydration/re-renders running the same code client-side)",
            "**Code that only runs after user interaction in a Client Component** (an `onClick` handler, an effect that only fires after mount) → browser console only, since that code never executes on the server",
          ],
        },
        {
          type: "note",
          text: "If a log you expect \"in the browser\" isn't showing up there, the first question to ask is whether that code is actually running on the server. Moving the `console.log` doesn't help — check *where the component executes*.",
        },
      ],
    },

    // ============================================================
    // 3. THE NODE INSPECTOR
    // ============================================================
    {
      id: "node-inspector",
      number: "3",
      title: "The Node Inspector",
      children: [
        // 3.1 Attaching the debugger
        {
          id: "inspect-attach",
          number: "3.1",
          title: "Attaching the debugger to next dev",
          blocks: [
            {
              type: "p",
              text: "Since server-side code runs in Node, you can attach Node's built-in inspector to it — this gets you real breakpoints, step-through, and variable inspection for anything that runs server-side (Server Components, Route Handlers, Server Actions, middleware to a point).",
            },
            {
              type: "code",
              code: "NODE_OPTIONS='--inspect' next dev" },
            {
              type: "p",
              text: "On Windows (PowerShell):",
            },
            {
              type: "code",
              code: '$env:NODE_OPTIONS="--inspect"; next dev',
            },
            {
              type: "p",
              text: "The terminal prints a `Debugger listening on ws://...` line along with a `devtools://` URL. Two ways to connect:",
            },
            {
              type: "list",
              items: [
                "Open `chrome://inspect` in Chrome, and the Next.js server process should show up under \"Remote Target\" — click **inspect**",
                "Or add a matching launch config in your editor (VS Code's `Node.js: Attach` works directly against the default port `9229`)",
              ],
            },
          ],
        },
        // 3.2 npm script convenience
        {
          id: "inspect-npm-script",
          number: "3.2",
          title: "Wiring it into package.json",
          blocks: [
            {
              type: "p",
              text: "Add a dedicated script instead of retyping the env var:",
            },
            {
              type: "code",
              code: `{
  "scripts": {
    "dev": "next dev",
    "dev:debug": "NODE_OPTIONS='--inspect' next dev"
  }
}`,
            },
            {
              type: "note",
              text: "This only debugs code that runs **in the Node process** — Server Components, Route Handlers, middleware, Server Actions. It has no effect on Client Component code running in the browser; use the browser's own devtools (Sources panel) for that instead, exactly like any other frontend JS.",
            },
          ],
        },
        // 3.3 Breakpoints via debugger statement
        {
          id: "debugger-statement",
          number: "3.3",
          title: "The debugger statement",
          blocks: [
            {
              type: "p",
              text: "Dropping a `debugger;` line directly in server-side code pauses execution there once the inspector is attached — no need to click line numbers in a Sources panel that may not even show your file yet:",
            },
            { type: "code", code: `export default async function Page() {\n  const data = await getData();\n  debugger;\n  return <View data={data} />;\n}` },
          ],
        },
      ],
    },

    // ============================================================
    // 4. REACT DEVTOOLS
    // ============================================================
    {
      id: "react-devtools",
      number: "4",
      title: "React DevTools for Component State",
      blocks: [
        {
          type: "p",
          text: "The React DevTools browser extension shows the **client-rendered component tree** — props, hooks, and state — for Client Components. Because Server Components never run in the browser, they don't have client-side state to inspect, and DevTools shows them differently (often collapsed/greyed, without hooks) from Client Components in the same tree.",
        },
        {
          type: "list",
          items: [
            "**Components tab** — select any Client Component in the tree to see its current props and hook state (`useState` values, `useReducer` state, etc.) in the right-hand panel, and edit them live to test edge cases without changing code",
            "**Profiler tab** — records a render pass and shows which components re-rendered and why, useful for chasing down unnecessary re-renders",
            "Searching the tree by component name is often faster than expanding nested folders manually, especially in a deeply nested App Router layout",
          ],
        },
        {
          type: "note",
          text: "If a component you expect to see is missing entirely from the DevTools tree, check whether it's a Server Component — those simply won't appear as an inspectable node with props/state the way Client Components do.",
        },
      ],
    },

    // ============================================================
    // 5. HYDRATION MISMATCHES
    // ============================================================
    {
      id: "hydration-mismatches",
      number: "5",
      title: "Hydration Mismatches",
      children: [
        // 5.1 What it means
        {
          id: "hydration-what",
          number: "5.1",
          title: "What the error means",
          blocks: [
            {
              type: "p",
              text: "React renders the app once on the server to produce HTML, then \"hydrates\" it in the browser by re-running the same component tree and attaching event listeners to the existing DOM. A **hydration mismatch** means the HTML React generated on the client during hydration doesn't match the HTML that was actually sent from the server — React has to decide whether to trust the server markup or patch it, and warns you either way.",
            },
          ],
        },
        // 5.2 Common causes
        {
          id: "hydration-causes",
          number: "5.2",
          title: "Common causes",
          blocks: [
            {
              type: "list",
              items: [
                "**`Date`/time formatting** — `new Date().toLocaleString()` or similar produces different output depending on the server's timezone/locale versus the browser's",
                "**Randomness** — `Math.random()` or a generated id used directly in rendered output produces a different value each time it runs",
                "**Browser-only checks in shared code** — `typeof window !== \"undefined\"` branches that render different markup on the server vs. the client",
                "**Reading `localStorage`/cookies during render** to decide what to show, when that value isn't available (or differs) at server-render time",
                "**Browser extensions** that inject attributes/elements into the DOM before React hydrates (a common false alarm — the mismatch is caused by the extension, not your code)",
                "**Invalid HTML nesting** — e.g. a `<div>` inside a `<p>`, which the browser silently \"fixes\" by restructuring the DOM before React gets to hydrate it, so the DOM no longer matches what React expects",
                "**Non-deterministic list ordering** from a data source that isn't consistently sorted between the server request and the client's re-render",
              ],
            },
          ],
        },
        // 5.3 Fixes
        {
          id: "hydration-fixes",
          number: "5.3",
          title: "Fixes",
          blocks: [
            {
              type: "list",
              items: [
                "Compute date/time/locale-dependent values consistently — format on the server and pass the formatted string down, or format only after mount in an effect",
                "Move anything nondeterministic (random ids, `Date.now()`) into a `useEffect` so it only runs client-side, after the initial matching render, or generate it once and pass it down as a prop instead of recomputing it",
                "Guard browser-only logic behind a `mounted` state set in `useEffect`, so the first client render matches the server render, and the browser-only branch only applies after that",
                "Fix invalid HTML nesting — `<p>` cannot contain block-level elements; check what the actual rendered DOM looks like against what your JSX assumes",
                "As a last resort for content that's genuinely expected to differ (e.g. a `formatDistanceToNow`-style relative timestamp), wrap just that element in `suppressHydrationWarning` — this silences the warning for that one node's text content only, it doesn't fix a real structural mismatch",
              ],
            },
            {
              type: "code",
              code: `// only the text content is allowed to differ between server and client
<span suppressHydrationWarning>{formattedRelativeTime}</span>`,
            },
            {
              type: "note",
              text: "`suppressHydrationWarning` is not a general-purpose fix — it only suppresses the warning for that element's direct text/attribute mismatch, one level deep. It doesn't fix mismatches in children, and it doesn't fix structural (element type/count) mismatches at all.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 6. DEBUGGING BUILD-ONLY ERRORS
    // ============================================================
    {
      id: "build-only-errors",
      number: "6",
      title: "Debugging Build-Only Errors",
      children: [
        // 6.1 Why next build can fail when next dev doesn't
        {
          id: "why-build-differs",
          number: "6.1",
          title: "Why next build can fail when next dev doesn't",
          blocks: [
            {
              type: "p",
              text: "`next dev` compiles routes lazily, on demand, as you visit them, and it's generally more forgiving about certain checks to keep iteration fast. `next build` compiles and type-checks **every** route up front, statically generates every page it can, and runs with production optimizations — so it can surface problems `next dev` never triggers.",
            },
          ],
        },
        // 6.2 Common categories
        {
          id: "build-only-causes",
          number: "6.2",
          title: "Common causes",
          blocks: [
            {
              type: "list",
              items: [
                "**Static generation touching request-time data** — a page that calls something requiring the incoming request (cookies, headers) but is otherwise eligible for static generation can fail or behave unexpectedly only when `next build` actually attempts to prerender it",
                "**A type error in a route `next dev` never compiled** — if you never visited a given page locally, `next dev`'s lazy compilation may never have type-checked it, while `next build` checks everything",
                "**Environment variables missing in the build environment** — a `.env.local` value you have locally but forgot to set in CI/production; the build (or the prerendering it does) fails or produces wrong output where `next dev` \"worked\" only because your local env had it",
                "**Import of a Node-only module into code that ends up in the client bundle** — dev's more lenient bundling can let this slide in some cases, while production bundling/tree-shaking surfaces it",
                "**Case-sensitive file paths** — a working local import on a case-insensitive filesystem (macOS/Windows) that's actually wrong-cased can fail in CI/production builds running on a case-sensitive Linux filesystem",
              ],
            },
          ],
        },
        // 6.3 How to reproduce locally
        {
          id: "reproduce-build-locally",
          number: "6.3",
          title: "Reproducing it locally instead of guessing from CI logs",
          blocks: [
            {
              type: "p",
              text: "Always try to reproduce a build-only failure with a local production build first — it's faster to iterate on than pushing and waiting on CI:",
            },
            { type: "code", code: "npm run build" },
            {
              type: "p",
              text: "If it only fails in CI/hosting and not locally, the difference is almost always the environment — compare Node versions, environment variables, and the filesystem's case sensitivity between the two.",
            },
            {
              type: "code",
              code: `node --version           # compare against the version CI/host uses
npm run build             # reproduce locally with the exact same script CI runs
NODE_ENV=production npm run build   # rule out dev-only env branches masking the issue`,
            },
            {
              type: "note",
              text: "If a page's build/prerender error message is too generic to act on, temporarily comment out sections of that page (or its data fetching) and rebuild to bisect which part is actually failing — the production build's error output is sometimes less specific than what `next dev` would have shown for the same underlying bug.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 7. DEBUGGING SERVER ACTIONS & ROUTE HANDLERS
    // ============================================================
    {
      id: "debugging-actions",
      number: "7",
      title: "Debugging Server Actions & Route Handlers",
      blocks: [
        {
          type: "p",
          text: "Both run entirely server-side, so the same rule from the console.log section applies: their logs and thrown errors show up in the terminal, not the browser console. A few extra things worth knowing:",
        },
        {
          type: "list",
          items: [
            "A Server Action called from a form/`onClick` shows a generic \"An error occurred\" toast/message client-side by default in production — the real error and stack are in the server terminal/logs, same as any other server render error",
            "Route Handlers (`route.ts`) behave like any Node HTTP handler — `console.log` inside one appears in the terminal, and you can attach the same `--inspect` debugger and set breakpoints in them",
            "Network tab is still useful here: a Route Handler's request/response — status code, response body, headers — is visible exactly like any other fetch, even though the handler code itself ran server-side",
          ],
        },
      ],
    },

    // ============================================================
    // 8. A QUICK TRIAGE CHECKLIST
    // ============================================================
    {
      id: "triage-checklist",
      number: "8",
      title: "A Quick Triage Checklist",
      blocks: [
        {
          type: "list",
          items: [
            "Is the error in the browser overlay, or only in the terminal? Check both before assuming which one you're missing.",
            "Does the failing code run on the server or the client? That decides whether you're looking in the terminal, the browser console, or both.",
            "Does it fail in `next dev` too, or only in `next build`/production? If only in build, compare env vars and Node version before diving into the code.",
            "Is it a hydration warning? Check for `Date`/random values, browser-only branches, and invalid HTML nesting first — in that order, they're the most common causes.",
            "For anything server-side, attach the Node inspector (`NODE_OPTIONS=--inspect`) instead of guessing from logs alone — a real breakpoint is faster than another `console.log` + reload cycle.",
          ],
        },
      ],
    },
  ],
};
