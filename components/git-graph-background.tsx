// git-graph-background.tsx
// → components/git-graph-background.tsx

export function GitGraphBackground() {
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
            id="git-graph"
            width="120"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="20"
              y1="0"
              x2="20"
              y2="160"
              stroke="#5eead4"
              strokeOpacity="0.15"
              strokeWidth="1.5"
            />
            <line
              x1="70"
              y1="40"
              x2="70"
              y2="160"
              stroke="#5eead4"
              strokeOpacity="0.15"
              strokeWidth="1.5"
            />
            <path
              d="M20 60 C 45 60, 45 90, 70 90"
              stroke="#5eead4"
              strokeOpacity="0.15"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="20" cy="20" r="4" fill="#5eead4" fillOpacity="0.35" />
            <circle cx="20" cy="60" r="4" fill="#5eead4" fillOpacity="0.35" />
            <circle cx="70" cy="90" r="4" fill="#5eead4" fillOpacity="0.35" />
            <circle cx="70" cy="140" r="4" fill="#5eead4" fillOpacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#git-graph)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
    </div>
  );
}
