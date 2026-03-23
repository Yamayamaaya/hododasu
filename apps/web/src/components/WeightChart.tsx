interface Participant {
  name: string;
  weight: number;
}

interface WeightChartProps {
  participants: Participant[];
  totalAmount: number;
}

const COLORS = [
  'bg-primary/30',
  'bg-blue-300/40',
  'bg-emerald-300/40',
  'bg-amber-300/40',
  'bg-violet-300/40',
  'bg-rose-300/40',
  'bg-cyan-300/40',
  'bg-orange-300/40',
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

  return (
    <div className="space-y-2 pt-1">
      <div className="flex h-6 rounded-full overflow-hidden bg-muted/50">
        {items.map((item, i) => (
          <div
            key={i}
            className={`${item.color} transition-all duration-300`}
            style={{ width: `${item.percent}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${item.color}`} />
            {item.name} {item.percent}%
            {totalAmount > 0 && (
              <span className="text-foreground font-medium">{item.amount.toLocaleString()}円</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
