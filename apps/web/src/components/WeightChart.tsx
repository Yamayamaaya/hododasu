interface Participant {
  name: string;
  weight: number;
}

interface WeightChartProps {
  participants: Participant[];
  totalAmount: number;
}

const COLORS = [
  '#f87171', // red
  '#60a5fa', // blue
  '#34d399', // emerald
  '#fbbf24', // amber
  '#a78bfa', // violet
  '#fb7185', // rose
  '#22d3ee', // cyan
  '#fb923c', // orange
];

export function WeightChart({ participants, totalAmount }: WeightChartProps) {
  const validParticipants = participants.filter((p) => p.name.trim());
  if (validParticipants.length === 0) return null;

  const totalWeight = validParticipants.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return null;

  const items = validParticipants.map((p, i) => {
    const ratio = p.weight / totalWeight;
    const amount = totalAmount * ratio;
    return {
      name: p.name,
      percent: Math.round(ratio * 100),
      amount: Math.round(amount),
      color: COLORS[i % COLORS.length],
    };
  });

  // SVG円グラフのパス生成
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 48;

  let cumulativePercent = 0;
  const slices = items.map((item) => {
    const startAngle = cumulativePercent * 3.6 * (Math.PI / 180);
    cumulativePercent += item.percent;
    const endAngle = cumulativePercent * 3.6 * (Math.PI / 180);

    if (item.percent >= 100) {
      return {
        ...item,
        d: `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx},${cy + r} A ${r},${r} 0 1,1 ${cx},${cy - r} Z`,
      };
    }

    const x1 = cx + r * Math.sin(startAngle);
    const y1 = cy - r * Math.cos(startAngle);
    const x2 = cx + r * Math.sin(endAngle);
    const y2 = cy - r * Math.cos(endAngle);
    const largeArc = item.percent > 50 ? 1 : 0;

    return {
      ...item,
      d: `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`,
    };
  });

  return (
    <div className="flex items-center gap-4 pt-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={slice.color} opacity={0.4} />
        ))}
      </svg>
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground min-w-0">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color, opacity: 0.4 }}
            />
            <span className="truncate">{item.name}</span>
            <span className="tabular-nums shrink-0">{item.percent}%</span>
            {totalAmount > 0 && (
              <span className="text-foreground font-medium tabular-nums shrink-0">
                {item.amount.toLocaleString()}円
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
