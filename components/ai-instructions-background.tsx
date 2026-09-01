// ai-instructions-background.tsx
// → components/ai-instructions-background.tsx

export function AiInstructionsBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-teal-950 to-neutral-950" />
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="snippet-fragments"
            width="180"
            height="180"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="10"
              y1="20"
              x2="45"
              y2="20"
              stroke="#99f6e4"
              strokeOpacity="0.2"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <line
              x1="90"
              y1="15"
              x2="140"
              y2="15"
              stroke="#99f6e4"
              strokeOpacity="0.14"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              strokeLinecap="round"
              transform="rotate(-6 115 15)"
            />
            <line
              x1="30"
              y1="80"
              x2="70"
              y2="80"
              stroke="#99f6e4"
              strokeOpacity="0.16"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeLinecap="round"
              transform="rotate(4 50 80)"
            />
            <line
              x1="120"
              y1="90"
              x2="150"
              y2="90"
              stroke="#99f6e4"
              strokeOpacity="0.12"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="140"
              x2="60"
              y2="140"
              stroke="#99f6e4"
              strokeOpacity="0.14"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              strokeLinecap="round"
              transform="rotate(-3 40 140)"
            />
            <line
              x1="100"
              y1="150"
              x2="145"
              y2="150"
              stroke="#99f6e4"
              strokeOpacity="0.2"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#snippet-fragments)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
    </div>
  );
}
