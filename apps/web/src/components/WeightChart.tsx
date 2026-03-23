type WeightChartProps =
  | {
      participants: { name: string; weight: number }[];
      totalAmount: number;
      mode?: 'weight';
    }
  | {
      participants: { name: string; amount: number }[];
      mode: 'amount';
    };

const COLORS = [
  '#f87171',
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#a78bfa',
  '#fb7185',
  '#22d3ee',
  '#fb923c',
];

const ORGANIZER_COLOR = '#9ca3af';
const ORGANIZER_NAME = '幹事';

interface ChartItem {
  name: string;
  ratio: number;
  percent: number;
  amount: number;
  color: string;
  legendOnly?: boolean;
}

function buildItems(props: WeightChartProps): ChartItem[] | null {
  if (props.mode === 'amount') {
    const all = props.participants.filter((p) => p.name.trim() && p.amount !== 0);
    if (all.length === 0) return null;
    const positiveTotal = all.filter((p) => p.amount > 0).reduce((sum, p) => sum + p.amount, 0);
    if (positiveTotal === 0) return null;
    let colorIndex = 0;
    return all.map((p) => {
      const isOrganizer = p.name === ORGANIZER_NAME;
      const color = isOrganizer ? ORGANIZER_COLOR : COLORS[colorIndex++ % COLORS.length];
      const ratio = p.amount > 0 ? p.amount / positiveTotal : 0;
      return {
        name: p.name,
        ratio,
        percent: Math.round(ratio * 1000) / 10,
        amount: p.amount,
        color,
        legendOnly: p.amount <= 0,
      };
    });
  }

  const valid = props.participants.filter((p) => p.name.trim());
  if (valid.length === 0) return null;
  const totalWeight = valid.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return null;
  let colorIndex = 0;
  return valid.map((p) => {
    const ratio = p.weight / totalWeight;
    const isOrganizer = p.name === ORGANIZER_NAME;
    const color = isOrganizer ? ORGANIZER_COLOR : COLORS[colorIndex++ % COLORS.length];
    return {
      name: p.name,
      ratio,
      percent: Math.round(ratio * 1000) / 10,
      amount: Math.round(props.totalAmount * ratio),
      color,
    };
  });
}

export function WeightChart(props: WeightChartProps) {
  const items = buildItems(props);
  if (!items) return null;

  const showAmount = props.mode === 'amount' || ('totalAmount' in props && props.totalAmount > 0);
  const sliceItems = items.filter((item) => !item.legendOnly);

  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 48;

  let cumulativeRatio = 0;
  const slices = sliceItems.map((item) => {
    const startAngle = cumulativeRatio * 2 * Math.PI;
    cumulativeRatio += item.ratio;
    const endAngle = cumulativeRatio * 2 * Math.PI;

    if (item.ratio >= 1) {
      return {
        ...item,
        d: `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx},${cy + r} A ${r},${r} 0 1,1 ${cx},${cy - r} Z`,
      };
    }

    const x1 = cx + r * Math.sin(startAngle);
    const y1 = cy - r * Math.cos(startAngle);
    const x2 = cx + r * Math.sin(endAngle);
    const y2 = cy - r * Math.cos(endAngle);
    const largeArc = item.ratio > 0.5 ? 1 : 0;

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
            {!item.legendOnly && (
              <span className="tabular-nums shrink-0">{item.percent.toFixed(1)}%</span>
            )}
            {showAmount && (
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
