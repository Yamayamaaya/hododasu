/**
 * 指定の位で切り上げる関数
 * roundingDigit は「丸める位」を表す（例: 10の位で丸めたい場合は 10 を指定）
 * - 0.1 -> 0.1の位を処理（結果は 1円単位）
 * - 1   -> 1の位を処理（結果は 10円単位）
 * - 10  -> 10の位を処理（結果は 100円単位）
 * - 100 -> 100の位を処理（結果は 1000円単位）
 */
function digitToStep(roundingDigit: number): number {
  // 浮動小数の誤差対策のため丸める（選択肢は 0.1/1/10/100 を想定）
  return Math.round(roundingDigit * 10);
}

function roundUp(amount: number, roundingDigit: number): number {
  const step = digitToStep(roundingDigit);
  return Math.ceil(amount / step) * step;
}

/**
 * 指定の位で切り下げる関数
 */
function roundDown(amount: number, roundingDigit: number): number {
  const step = digitToStep(roundingDigit);
  return Math.floor(amount / step) * step;
}

/**
 * 指定の位で四捨五入する関数
 */
function roundHalfUp(amount: number, roundingDigit: number): number {
  const step = digitToStep(roundingDigit);
  return Math.round(amount / step) * step;
}

/**
 * 傾斜方式で各参加者の負担額を計算
 * 端数処理：切り捨て後、余りを小数部が大きい順に +1 円配布（デフォルト）
 * または、指定の位で切り上げ/切り下げ/四捨五入（端数処理オプション使用時）
 */
export function calculateShareAmounts(
  totalAmount: number,
  participants: Array<{ name: string; weight: number }>,
  roundingMethod: 'round_up' | 'round_down' | 'round_half_up' | null = 'round_half_up',
  roundingUnit: number | null = 0.1
): Array<{ name: string; weight: number; shareAmount: number }> {
  if (participants.length === 0) {
    return [];
  }

  // 傾斜の合計を計算
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

  // 端数処理を実行（デフォルト: 四捨五入、0.1の位）
  const method = roundingMethod || 'round_half_up';
  const unit = roundingUnit || 0.1;
  
  if (unit > 0) {
    // 各参加者の負担額を指定の位で切り上げ/切り下げ/四捨五入
    baseAmounts.forEach((p) => {
      if (method === 'round_up') {
        p.shareAmount = roundUp(p.baseAmount, unit);
      } else if (method === 'round_down') {
        p.shareAmount = roundDown(p.baseAmount, unit);
      } else if (method === 'round_half_up') {
        p.shareAmount = roundHalfUp(p.baseAmount, unit);
      }
    });

    // 端数処理後の合計を計算
    const roundedTotal = baseAmounts.reduce((sum, p) => sum + p.shareAmount, 0);
    const difference = totalAmount - roundedTotal;

    // 差額がある場合、「幹事」として追加
    if (difference !== 0) {
      baseAmounts.push({
        name: '幹事',
        weight: 0,
        baseAmount: 0,
        shareAmount: difference,
        decimalPart: 0,
      });
    }
  }

  // 結果を返す（元の順序を保持し、幹事があれば最後に追加）
  const result = participants.map((p) => {
    const calculated = baseAmounts.find((calc) => calc.name === p.name);
    return {
      name: p.name,
      weight: p.weight,
      shareAmount: calculated?.shareAmount ?? 0,
    };
  });

  // 幹事が追加されている場合は結果に含める
  const organizer = baseAmounts.find((p) => p.name === '幹事');
  if (organizer) {
    result.push({
      name: '幹事',
      weight: 0,
      shareAmount: organizer.shareAmount,
    });
  }

  return result;
}

