interface Participant {
  name: string;
  weight: number;
}

interface WeightChartProps {
  participants: Participant[];
  totalAmount: number;
}

export function WeightChart({ participants, totalAmount }: WeightChartProps) {
  const validParticipants = participants.filter((p) => p.name.trim());
  if (validParticipants.length === 0) return null;

  const totalWeight = validParticipants.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return null;

  const items = validParticipants.map((p) => {
    const ratio = p.weight / totalWeight;
    const amount = totalAmount * ratio;
    return {
      name: p.name,
      percent: Math.round(ratio * 100),
      amount: Math.round(amount),
    };
  });

  return (
    <div className="space-y-1.5 pt-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-16 truncate text-muted-foreground shrink-0">{item.name}</span>
          <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/20 rounded-full transition-all duration-300"
              style={{ width: `${item.percent}%` }}
            />
          </div>
          <span className="w-24 text-right tabular-nums text-muted-foreground shrink-0">
            {item.percent}%
            {totalAmount > 0 && (
              <span className="text-foreground font-medium"> {item.amount.toLocaleString()}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
