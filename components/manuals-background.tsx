// manuals-background.tsx
// → components/manuals-background.tsx

export function ManualsBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-emerald-950 to-neutral-950" />
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="manuscript-lines"
            width="260"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="10"
              y1="0"
              x2="10"
              y2="200"
              stroke="#6ee7b7"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
            <line
              x1="28"
              y1="24"
              x2="150"
              y2="24"
              stroke="#6ee7b7"
              strokeOpacity="0.22"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="48"
              x2="228"
              y2="48"
              stroke="#6ee7b7"
              strokeOpacity="0.13"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="68"
              x2="208"
              y2="68"
              stroke="#6ee7b7"
              strokeOpacity="0.13"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="88"
              x2="236"
              y2="88"
              stroke="#6ee7b7"
              strokeOpacity="0.13"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="108"
              x2="180"
              y2="108"
              stroke="#6ee7b7"
              strokeOpacity="0.13"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="128"
              x2="216"
              y2="128"
              stroke="#6ee7b7"
              strokeOpacity="0.13"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#manuscript-lines)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
    </div>
  );
}
