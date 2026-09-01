import type { Manual } from "../types";

export const understandingRsc: Manual = {
  slug: "understanding-rsc",
  title: "Understanding React Server Components",
  subtitle:
    "Search or expand a section. Nested items (1.1, 1.2 ...) open inside their parent.",
  sections: [
    // ============================================================
    // 1. WHAT RSC ACTUALLY IS
    // ============================================================
    {
      id: "what-is-rsc",
      number: "1",
      title: "What RSC Actually Is",
      blocks: [
        {
          type: "p",
          text: "A **Server Component** is a component that renders entirely on the server and never ships its own code to the browser. What the client receives isn't HTML and isn't the component's JavaScript — it's a special serialized format (the **React Server Component payload**, sometimes called the \"flight\" format) describing the rendered tree, which React uses to build/update the DOM.",
        },
        {
          type: "p",
          text: "This is a different axis from **client vs server rendering (SSR)**. SSR is about *where the first render happens* — a fully client-side app can still be server-rendered once for the initial HTML, then the same component code re-runs (\"hydrates\") in the browser. RSC is about *where a component's code runs, period*. A Server Component's code never ships to the client at all — not for the first render, not ever.",
        },
        {
          type: "p",
          text: "In the Next.js App Router, **every component is a Server Component by default.** You opt in to client-side behavior per file with the `\"use client\"` directive — you don't opt in to server rendering, it's the default.",
        },
      ],
    },

    // ============================================================
    // 2. RSC vs SSR: THE ACTUAL DIFFERENCE
    // ============================================================
    {
      id: "rsc-vs-ssr",
      number: "2",
      title: "RSC vs SSR: The Actual Difference",
      children: [
        // 2.1 Traditional SSR
        {
          id: "traditional-ssr",
          number: "2.1",
          title: "Traditional SSR (pre-RSC)",
          blocks: [
            {
              type: "p",
              text: "In classic SSR (Next.js Pages Router, Create React App + a server renderer, etc.), the server renders your component tree to an HTML string once, sends it down, and then the browser downloads the **full JavaScript for every one of those components** and re-runs them client-side to attach event handlers — this is hydration. Every component's code exists in the client bundle, whether or not it needs interactivity.",
            },
          ],
        },
        // 2.2 RSC
        {
          id: "rsc-model",
          number: "2.2",
          title: "RSC",
          blocks: [
            {
              type: "p",
              text: "With RSC, Server Components render on the server and their code is simply **never sent to the client** — not as HTML-to-be-hydrated, not as a JS bundle. Only Client Components (and their dependencies) end up in the browser bundle. A page built mostly from Server Components with one small interactive island ships dramatically less JavaScript than the same page built the traditional way.",
            },
          ],
        },
        // 2.3 They compose together
        {
          id: "rsc-and-ssr-together",
          number: "2.3",
          title: "They compose together",
          blocks: [
            {
              type: "p",
              text: "Next.js still does an initial HTML render (server-side rendering) of the whole tree — Server *and* Client Components — so the first paint doesn't need JavaScript to show content. Client Components then hydrate in the browser as usual, while Server Components stay server-only forever. RSC and SSR aren't competing techniques; RSC reduces how much of that traditionally-hydrated tree needs to ship as JS in the first place.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 3. THE SERVER/CLIENT BOUNDARY
    // ============================================================
    {
      id: "boundary",
      number: "3",
      title: "The Server/Client Boundary",
      blocks: [
        {
          type: "p",
          text: "`\"use client\"` at the top of a file doesn't mean \"this component only runs on the client\" — it means **this is the boundary where server-rendered output hands off to client-rendered/hydrated code**. Everything that file imports is pulled into the client bundle too.",
        },
        {
          type: "note",
          text: "A Client Component is still rendered to HTML on the server for the first paint (that's the SSR part), then hydrated in the browser. \"Client Component\" describes where its code *can* run (both), not where it *only* runs.",
        },
        {
          type: "p",
          text: "The boundary is a one-way door in terms of imports: once you cross into `\"use client\"`, everything downstream is part of the client tree by default — you can't import a Server Component's *code* into a Client Component. (You can still render a Server Component *inside* a Client Component's markup — see the composition section below — you just can't `import` one client-side.)",
        },
      ],
    },

    // ============================================================
    // 4. "use client": WHEN YOU ACTUALLY NEED IT
    // ============================================================
    {
      id: "use-client",
      number: "4",
      title: '"use client": When You Actually Need It',
      children: [
        // 4.1 The directive
        {
          id: "the-directive",
          number: "4.1",
          title: "The directive itself",
          blocks: [
            {
              type: "p",
              text: "Placed at the very top of a file, before any imports:",
            },
            {
              type: "code",
              code: `"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
            },
            {
              type: "p",
              text: "It marks the module — and everything it imports that isn't already marked — as part of the client bundle.",
            },
          ],
        },
        // 4.2 When you need it
        {
          id: "when-needed",
          number: "4.2",
          title: "When you need it",
          blocks: [
            {
              type: "list",
              items: [
                "React state or effect hooks — `useState`, `useEffect`, `useReducer`, `useRef`, etc.",
                "Event handlers — `onClick`, `onChange`, `onSubmit`, and so on",
                "Browser-only APIs — `window`, `document`, `localStorage`, `navigator`, `IntersectionObserver`",
                "Custom hooks that themselves use any of the above",
                "Third-party libraries that rely on hooks, effects, or browser APIs internally (many UI/animation libraries)",
                "Context providers/consumers — `useContext`, and the components that provide that context",
              ],
            },
          ],
        },
        // 4.3 When you don't
        {
          id: "when-not-needed",
          number: "4.3",
          title: "When you don't need it",
          blocks: [
            {
              type: "list",
              items: [
                "Static markup, layout, and presentational components with no state or handlers",
                "Fetching and rendering data — do this in a Server Component instead",
                "Reading environment variables, hitting a database, or calling a private API with a secret key",
                "Anything that's just \"render props into JSX\" with no interactivity",
              ],
            },
            {
              type: "note",
              text: "A common mistake: slapping `\"use client\"` on a whole page just because *one* piece of it needs interactivity. Push the directive down to the smallest component that actually needs it, and keep everything around it as Server Components — see the composition section below.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 5. DATA FETCHING IN SERVER COMPONENTS
    // ============================================================
    {
      id: "data-fetching",
      number: "5",
      title: "Data Fetching in Server Components",
      blocks: [
        {
          type: "p",
          text: "Server Components can be `async` functions directly — you `await` your data source right in the component body. No `useEffect`, no loading-state juggling, no client-side request waterfall for data the server already has.",
        },
        {
          type: "code",
          code: `// app/posts/page.tsx — a Server Component
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map((post: { id: string; title: string }) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}`,
        },
        {
          type: "p",
          text: "Because this runs on the server, you can also query a database or ORM directly, no API route required in between:",
        },
        {
          type: "code",
          code: `export default async function DashboardPage() {
  const users = await db.user.findMany();
  return <UserTable users={users} />;
}`,
        },
        {
          type: "p",
          text: "Sibling Server Components that each fetch their own data run their `fetch` calls **in parallel** automatically when they don't depend on one another — Next.js dedupes identical `fetch` requests within a render pass, too, so multiple components requesting the same URL only trigger one network call.",
        },
      ],
    },

    // ============================================================
    // 6. WHAT YOU CAN'T DO IN A SERVER COMPONENT
    // ============================================================
    {
      id: "cant-do",
      number: "6",
      title: "What You Can't Do in a Server Component",
      blocks: [
        {
          type: "list",
          items: [
            "**No state or effect hooks** — `useState`, `useEffect`, `useReducer`, `useRef` all require the component to run on the client, so they simply aren't available",
            "**No event handlers** — you can't pass `onClick` or similar directly on a Server Component's own elements, because there's no client-side JS instance to attach the listener to",
            "**No browser APIs** — `window`, `document`, `localStorage`; the server has none of these",
            "**No React Context** — `useContext` (and defining a Context provider) needs to run on the client",
            "**No imperative DOM access** — refs to real DOM nodes don't apply; there's no DOM on the server",
          ],
        },
        {
          type: "note",
          text: "Trying any of these in a Server Component isn't a style problem — it's a build/runtime error. The framework will tell you a hook or browser API isn't available in a Server Component; the fix is almost always to extract just the interactive part into its own small Client Component.",
        },
      ],
    },

    // ============================================================
    // 7. COMPOSITION PATTERNS
    // ============================================================
    {
      id: "composition",
      number: "7",
      title: "Composition Patterns",
      children: [
        // 7.1 Server Components as children of Client Components
        {
          id: "server-as-children",
          number: "7.1",
          title: "Server Components as children of Client Components",
          blocks: [
            {
              type: "p",
              text: "You can't `import` a Server Component into a Client Component's module — but you *can* pass a Server Component in as `children` (or any prop) from a parent Server Component. The Client Component just renders whatever it was handed; it never needs to know how that content was produced.",
            },
            {
              type: "code",
              code: `// app/page.tsx — Server Component (no directive needed)
import { ExpandableCard } from "./expandable-card"; // Client Component
import { PostBody } from "./post-body"; // Server Component

export default async function Page() {
  return (
    <ExpandableCard>
      <PostBody /> {/* rendered on the server, passed in as children */}
    </ExpandableCard>
  );
}`,
            },
            {
              type: "code",
              code: `// expandable-card.tsx
"use client";

import { useState } from "react";

export function ExpandableCard({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && children}
    </div>
  );
}`,
            },
            {
              type: "p",
              text: "`ExpandableCard` owns the interactive open/close state, but `PostBody` — whatever data-fetching or server-only work it does — never becomes part of the client bundle. This is the pattern for keeping expensive or server-only components out of client JS while still nesting them inside interactive UI.",
            },
          ],
        },
        // 7.2 Push "use client" to the leaves
        {
          id: "push-to-leaves",
          number: "7.2",
          title: "Push \"use client\" to the leaves",
          blocks: [
            {
              type: "p",
              text: "Instead of marking a whole page or layout as a Client Component because one button needs `onClick`, extract that button into its own file and mark only *that* file `\"use client\"`. Everything else in the tree — layout, data fetching, static content — stays server-only.",
            },
          ],
        },
        // 7.3 Passing data down, not functions
        {
          id: "serializable-props",
          number: "7.3",
          title: "Props crossing the boundary must be serializable",
          blocks: [
            {
              type: "p",
              text: "Props passed from a Server Component into a Client Component have to survive serialization into the RSC payload — plain objects, arrays, strings, numbers, and JSX (like the `children` example above) are fine. Functions, class instances, and things like database clients or `Date`-adjacent values with methods generally are not, because there's no way to send a live server-side closure over the wire to the browser.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 8. STREAMING & SUSPENSE
    // ============================================================
    {
      id: "streaming-suspense",
      number: "8",
      title: "Streaming & Suspense",
      blocks: [
        {
          type: "p",
          text: "Without streaming, the server has to finish rendering the *entire* page — including the slowest data fetch — before sending anything. Streaming lets the server send parts of the page as they become ready, instead of waiting on the slowest one.",
        },
        {
          type: "p",
          text: "Wrap a slow, `async` Server Component in `<Suspense>` with a fallback. The rest of the page streams in immediately; the wrapped section's fallback shows until its data resolves, then swaps in.",
        },
        {
          type: "code",
          code: `import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews /> {/* slow async Server Component */}
      </Suspense>
    </div>
  );
}

async function Reviews() {
  const reviews = await getReviews(); // slow fetch
  return <ReviewList reviews={reviews} />;
}`,
        },
        {
          type: "p",
          text: "In the Next.js App Router, `loading.tsx` files are sugar for wrapping an entire route segment in `Suspense` automatically while its data loads.",
        },
        {
          type: "note",
          text: "Suspense boundaries can be nested — fast content streams in first, slower sections resolve and swap in independently, and a slow section never blocks the ones around it from showing.",
        },
      ],
    },

    // ============================================================
    // 9. MENTAL MODEL RECAP
    // ============================================================
    {
      id: "recap",
      number: "9",
      title: "Mental Model Recap",
      blocks: [
        {
          type: "list",
          items: [
            "Server Components are the default in the App Router; opt in to client behavior per file",
            "`\"use client\"` marks a boundary, not a location — the component still gets server-rendered for first paint, then hydrates",
            "Server Components can be `async` and fetch data directly, no `useEffect` needed",
            "Server Components can't use hooks, browser APIs, or event handlers — that's what Client Components are for",
            "You can nest Server Components inside Client Components via `children`/props, just not `import` them into a client file",
            "Suspense + streaming let fast parts of a page render immediately while slow parts catch up",
          ],
        },
      ],
    },
  ],
};
