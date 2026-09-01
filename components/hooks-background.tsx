// hooks-background.tsx
// → components/hooks-background.tsx

export function HooksBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-cyan-950 to-neutral-950" />
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="hook-curves"
            width="140"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M35 10 L35 70 C35 95 60 95 60 75"
              stroke="#67e8f9"
              strokeOpacity="0.18"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="35" cy="10" r="4" fill="#67e8f9" fillOpacity="0.3" />
            <path
              d="M105 40 L105 100 C105 125 130 125 130 105"
              stroke="#67e8f9"
              strokeOpacity="0.13"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="105" cy="40" r="3" fill="#67e8f9" fillOpacity="0.22" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hook-curves)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
    </div>
  );
}
