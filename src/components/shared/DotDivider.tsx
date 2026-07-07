/** Aboriginal dot-art row divider — used between page sections */

const COLOURS = [
  "#8C2D14", // terracotta
  "#C87320", // amber
  "#D4960C", // golden ochre
  "#A63D2F", // earth red
  "#B8860B", // dark gold
  "#8C2D14",
  "#D4960C",
];

type Props = {
  className?: string;
  count?: number;
};

export function DotDivider({ className = "", count = 33 }: Props) {
  const dots = Array.from({ length: count });
  const width = count * 12;

  return (
    <div className={`flex justify-center ${className}`} aria-hidden="true">
      <svg width={width} height="14" viewBox={`0 0 ${width} 14`}>
        {dots.map((_, i) => {
          const cx = 6 + i * 12;
          const isLarge = i % 5 === 2;
          const r = isLarge ? 4 : 2.5;
          const colour = COLOURS[i % COLOURS.length];
          return (
            <circle
              key={i}
              cx={cx}
              cy={7}
              r={r}
              fill={colour}
              opacity={isLarge ? 0.85 : 0.45}
            />
          );
        })}
      </svg>
    </div>
  );
}
