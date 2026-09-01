import type { Snippet } from "@/lib/data/types";
import { CodeBlock } from "@/components/code-block";

export function SnippetPage({ snippet }: { snippet: Snippet }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {snippet.title}
      </h1>
      {snippet.description && (
        <p className="mt-2 max-w-xl text-neutral-300">{snippet.description}</p>
      )}
      <div className="mt-8">
        <CodeBlock code={snippet.code} />
      </div>
    </div>
  );
}
