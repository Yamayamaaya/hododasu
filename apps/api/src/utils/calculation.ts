/**
 * 重み方式で各参加者の負担額を計算
 * 端数処理：切り捨て後、余りを小数部が大きい順に +1 円配布
 */
export function calculateShareAmounts(
  totalAmount: number,
  participants: Array<{ name: string; weight: number }>
): Array<{ name: string; weight: number; shareAmount: number }> {
  if (participants.length === 0) {
    return [];
  }

  // 重みの合計を計算
  const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) {
    throw new Error('Total weight must be greater than 0');
  }

  // 各参加者の基本負担額を計算（小数部を含む）
  const baseAmounts = participants.map((p) => {
    const baseAmount = (totalAmount * p.weight) / totalWeight;
    return {
      name: p.name,
      weight: p.weight,
      baseAmount,
      shareAmount: Math.floor(baseAmount), // 切り捨て
      decimalPart: baseAmount - Math.floor(baseAmount), // 小数部
    };
  });

  // 切り捨て後の合計を計算
  const flooredTotal = baseAmounts.reduce((sum, p) => sum + p.shareAmount, 0);
  const remainder = totalAmount - flooredTotal;

  // 余りを小数部が大きい順に +1 円配布
  const sortedByDecimal = [...baseAmounts].sort(
    (a, b) => b.decimalPart - a.decimalPart
  );

  for (let i = 0; i < remainder; i++) {
    sortedByDecimal[i].shareAmount += 1;
  }

  // 結果を返す（元の順序を保持）
  return participants.map((p) => {
    const calculated = baseAmounts.find((calc) => calc.name === p.name);
    return {
      name: p.name,
      weight: p.weight,
      shareAmount: calculated?.shareAmount ?? 0,
    };
  });
}

