import { CodeBlockCopy } from "./code-block-copy";

// Server Component — the <pre><code> markup renders server-side; only the
// copy button/click behavior (CodeBlockCopy) needs to be client.
export function CodeBlock({ code }: { code: string }) {
  return (
    <CodeBlockCopy code={code}>
      <pre className="overflow-x-auto p-3 pr-14 font-mono text-[0.85rem] leading-relaxed text-code-foreground">
        <code>{code}</code>
      </pre>
    </CodeBlockCopy>
  );
}
