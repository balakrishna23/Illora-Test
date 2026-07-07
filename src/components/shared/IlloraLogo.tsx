type Props = {
  className?: string;
};

export function IlloraLogo({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      aria-label="Illoura Services logo"
      role="img"
    >
      {/* Cream background disc */}
      <circle cx="50" cy="50" r="49" fill="#FBF6EE" />

      {/* Top arc */}
      <path
        d="M 10.53 35.64 A 42 42 0 0 1 89.47 35.64"
        stroke="#8C2D14"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom arc */}
      <path
        d="M 89.47 64.36 A 42 42 0 0 1 10.53 64.36"
        stroke="#8C2D14"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Large terracotta dots inside arcs */}
      <circle cx="72.94" cy="66.06" r="3.8" fill="#8C2D14" />
      <circle cx="59.58" cy="76.31" r="3.8" fill="#8C2D14" />
      <circle cx="50"    cy="78"    r="3.8" fill="#8C2D14" />
      <circle cx="40.42" cy="76.31" r="3.8" fill="#8C2D14" />
      <circle cx="27.06" cy="66.06" r="3.8" fill="#8C2D14" />
      <circle cx="27.06" cy="33.94" r="3.8" fill="#8C2D14" />
      <circle cx="40.42" cy="23.69" r="3.8" fill="#8C2D14" />
      <circle cx="50"    cy="22"    r="3.8" fill="#8C2D14" />
      <circle cx="59.58" cy="23.69" r="3.8" fill="#8C2D14" />
      <circle cx="72.94" cy="33.94" r="3.8" fill="#8C2D14" />

      {/* Wavy amber line through centre */}
      <path
        d="M 5 50 C 20 43 35 57 50 50 C 65 43 80 57 95 50"
        stroke="#C87320"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small gold dots ring around sun (radius 13) */}
      <circle cx="63"    cy="50"    r="1.6" fill="#D4960C" />
      <circle cx="61.26" cy="56.5"  r="1.6" fill="#D4960C" />
      <circle cx="56.5"  cy="61.26" r="1.6" fill="#D4960C" />
      <circle cx="50"    cy="63"    r="1.6" fill="#D4960C" />
      <circle cx="43.5"  cy="61.26" r="1.6" fill="#D4960C" />
      <circle cx="38.74" cy="56.5"  r="1.6" fill="#D4960C" />
      <circle cx="37"    cy="50"    r="1.6" fill="#D4960C" />
      <circle cx="38.74" cy="43.5"  r="1.6" fill="#D4960C" />
      <circle cx="43.5"  cy="38.74" r="1.6" fill="#D4960C" />
      <circle cx="50"    cy="37"    r="1.6" fill="#D4960C" />
      <circle cx="56.5"  cy="38.74" r="1.6" fill="#D4960C" />
      <circle cx="61.26" cy="43.5"  r="1.6" fill="#D4960C" />

      {/* Central golden sun */}
      <circle cx="50" cy="50" r="9" fill="#D4960C" />
    </svg>
  );
}
