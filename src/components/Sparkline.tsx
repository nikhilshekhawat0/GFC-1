interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  activeIndex?: number;
  unit?: string;
  showArea?: boolean;
}

export function Sparkline({
  data,
  color = '#3b82f6',
  height = 36,
  activeIndex,
  showArea = true,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const width = 180;
  const padY = 4;
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 10);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padY - ((val - min) / range) * (height - padY * 2);
    return { x, y, val };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const activePt =
    activeIndex !== undefined && activeIndex >= 0 && activeIndex < points.length
      ? points[activeIndex]
      : points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full overflow-visible"
      style={{ height }}
      aria-hidden="true"
    >
      {showArea && (
        <path
          d={areaPath}
          fill={color}
          fillOpacity={0.14}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {activePt && (
        <>
          <line
            x1={activePt.x}
            y1={0}
            x2={activePt.x}
            y2={height}
            stroke={color}
            strokeOpacity={0.35}
            strokeDasharray="2 2"
            strokeWidth={1}
          />
          <circle
            cx={activePt.x}
            cy={activePt.y}
            r={3}
            fill={color}
            stroke="#ffffff"
            strokeWidth={1.25}
          />
        </>
      )}
    </svg>
  );
}
