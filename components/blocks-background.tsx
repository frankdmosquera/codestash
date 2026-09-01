// blocks-background.tsx
// → components/blocks-background.tsx

export function BlocksBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-green-950 to-neutral-950" />
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="brick-blocks"
            width="160"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="0"
              y="0"
              width="70"
              height="40"
              fill="none"
              stroke="#86efac"
              strokeOpacity="0.14"
              strokeWidth="1.5"
            />
            <rect
              x="80"
              y="0"
              width="70"
              height="40"
              fill="none"
              stroke="#86efac"
              strokeOpacity="0.14"
              strokeWidth="1.5"
            />
            <rect
              x="-40"
              y="50"
              width="70"
              height="40"
              fill="none"
              stroke="#86efac"
              strokeOpacity="0.1"
              strokeWidth="1.5"
            />
            <rect
              x="40"
              y="50"
              width="70"
              height="40"
              fill="none"
              stroke="#86efac"
              strokeOpacity="0.1"
              strokeWidth="1.5"
            />
            <rect
              x="120"
              y="50"
              width="70"
              height="40"
              fill="none"
              stroke="#86efac"
              strokeOpacity="0.1"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#brick-blocks)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
    </div>
  );
}
