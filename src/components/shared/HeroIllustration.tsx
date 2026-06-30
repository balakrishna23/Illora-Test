export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 480"
      role="img"
      aria-label="Abstract illustration of connected nodes representing people and recruitment networks"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-node" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      <circle cx="240" cy="220" r="190" fill="url(#hero-glow)" />

      {/* connecting lines */}
      <g stroke="var(--primary-foreground)" strokeOpacity="0.25" strokeWidth="1.5">
        <line x1="240" y1="220" x2="120" y2="120" />
        <line x1="240" y1="220" x2="360" y2="110" />
        <line x1="240" y1="220" x2="100" y2="300" />
        <line x1="240" y1="220" x2="370" y2="310" />
        <line x1="240" y1="220" x2="240" y2="80" />
        <line x1="120" y1="120" x2="80" y2="60" />
        <line x1="360" y1="110" x2="410" y2="70" />
        <line x1="100" y1="300" x2="60" y2="360" />
        <line x1="370" y1="310" x2="400" y2="390" />
      </g>

      {/* satellite nodes */}
      <g fill="var(--primary-foreground)" fillOpacity="0.5">
        <circle cx="80" cy="60" r="8" />
        <circle cx="410" cy="70" r="6" />
        <circle cx="60" cy="360" r="7" />
        <circle cx="400" cy="390" r="9" />
        <circle cx="240" cy="80" r="6" />
      </g>

      {/* mid nodes */}
      <g fill="url(#hero-node)">
        <circle cx="120" cy="120" r="16" />
        <circle cx="360" cy="110" r="14" />
        <circle cx="100" cy="300" r="13" />
        <circle cx="370" cy="310" r="17" />
      </g>

      {/* central node */}
      <circle cx="240" cy="220" r="34" fill="url(#hero-node)" />
      <circle cx="240" cy="220" r="34" fill="none" stroke="var(--primary-foreground)" strokeOpacity="0.4" strokeWidth="2" />
    </svg>
  );
}
