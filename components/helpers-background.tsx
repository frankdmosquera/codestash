// helpers-background.tsx
// → components/helpers-background.tsx

export function HelpersBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-lime-950 to-neutral-950" />
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="pegboard-dots"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="2.5" fill="#bef264" fillOpacity="0.28" />
            <circle cx="60" cy="20" r="2.5" fill="#bef264" fillOpacity="0.14" />
            <circle
              cx="100"
              cy="20"
              r="2.5"
              fill="#bef264"
              fillOpacity="0.14"
            />
            <circle cx="20" cy="60" r="2.5" fill="#bef264" fillOpacity="0.14" />
            <circle cx="60" cy="60" r="2.5" fill="#bef264" fillOpacity="0.28" />
            <circle
              cx="100"
              cy="60"
              r="2.5"
              fill="#bef264"
              fillOpacity="0.14"
            />
            <circle
              cx="20"
              cy="100"
              r="2.5"
              fill="#bef264"
              fillOpacity="0.14"
            />
            <circle
              cx="60"
              cy="100"
              r="2.5"
              fill="#bef264"
              fillOpacity="0.14"
            />
            <circle
              cx="100"
              cy="100"
              r="2.5"
              fill="#bef264"
              fillOpacity="0.28"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pegboard-dots)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
    </div>
  );
}
